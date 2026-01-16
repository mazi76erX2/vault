"""
Knowledge Base API - File upload and management
"""
import logging
import os
import shutil
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_async_db
from app.middleware.auth import verify_token_with_tenant
from app.models import Profile
from app.connectors.store_data_in_kb import (
    store_in_kb,
    store_bulk_in_kb,
    delete_from_kb,
    list_documents,
    get_document_count,
    search_kb,
)
from app.services.file_processor import process_file, chunk_text

router = APIRouter(prefix="/api/v1/kb", tags=["knowledge-base"])
logger = logging.getLogger(__name__)

# Upload directory
UPLOAD_DIR = Path("./uploads/kb")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def get_user_id(current_user: dict) -> str:
    """Extract user_id from current_user dict."""
    user_id = (
        current_user.get("user_id")
        or current_user.get("user", {}).get("id")
        or current_user.get("profile", {}).get("id")
    )
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not extract user ID from token",
        )
    return str(user_id)


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    title: str | None = Form(None),
    access_level: int = Form(1),
    department: str | None = Form(None),
    tags: str | None = Form(None),
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """
    Upload a document to the knowledge base.
    
    Supports: PDF, DOCX, PPTX, TXT, MD, CSV, XLSX
    """
    try:
        user_id = get_user_id(current_user)
        
        # Get user's company info
        stmt = select(Profile.company_id, Profile.company_reg_no, Profile.fullname).where(
            Profile.id == user_id
        )
        result = await db.execute(stmt)
        profile_data = result.first()
        
        company_id = profile_data.company_id if profile_data else None
        company_reg_no = profile_data.company_reg_no if profile_data else None
        author = profile_data.fullname if profile_data else "Unknown"
        
        # Validate file
        if not file.filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No filename provided",
            )
        
        # Save file temporarily
        file_ext = Path(file.filename).suffix.lower()
        temp_filename = f"{uuid.uuid4()}{file_ext}"
        temp_path = UPLOAD_DIR / temp_filename
        
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        logger.info(f"Processing file: {file.filename} ({file_ext})")
        
        # Extract text from file
        try:
            extracted_text = process_file(temp_path, file_ext)
            
            if not extracted_text or not extracted_text.strip():
                raise ValueError("No text could be extracted from the file")
            
            # Chunk the text for better retrieval
            chunks = chunk_text(extracted_text, chunk_size=1000, overlap=100)
            
            logger.info(f"Extracted {len(extracted_text)} chars, split into {len(chunks)} chunks")
            
            # Store chunks in KB
            if len(chunks) == 1:
                # Single chunk - store directly
                result = store_in_kb({
                    "content": chunks[0],
                    "file_name": file.filename,
                    "file_title": title or file.filename,
                    "level": access_level,
                    "company_id": company_id,
                    "company_reg_no": company_reg_no,
                    "department": department,
                    "tags": tags,
                    "author": author,
                    "doc_type": file_ext.replace(".", ""),
                })
                
                doc_ids = [result.get("doc_id")]
            else:
                # Multiple chunks - bulk store
                docs_to_store = [
                    {
                        "content": chunk,
                        "file_name": file.filename,
                        "file_title": f"{title or file.filename} (Part {i+1}/{len(chunks)})",
                        "level": access_level,
                        "company_id": company_id,
                        "company_reg_no": company_reg_no,
                        "department": department,
                        "tags": tags,
                        "author": author,
                        "doc_type": file_ext.replace(".", ""),
                    }
                    for i, chunk in enumerate(chunks)
                ]
                
                result = store_bulk_in_kb(docs_to_store)
                doc_ids = result.get("doc_ids", [])
            
            return {
                "status": "success",
                "message": f"Document uploaded and indexed successfully",
                "filename": file.filename,
                "chunks": len(chunks),
                "doc_ids": doc_ids,
                "char_count": len(extracted_text),
            }
            
        finally:
            # Cleanup temp file
            if temp_path.exists():
                temp_path.unlink()
                
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading document: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading document: {str(e)}",
        )


@router.get("/documents")
async def get_documents(
    limit: int = 50,
    offset: int = 0,
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """List documents in the knowledge base."""
    try:
        user_id = get_user_id(current_user)
        
        # Get user's access level and company
        stmt = select(Profile.user_access, Profile.company_id).where(Profile.id == user_id)
        result = await db.execute(stmt)
        profile_data = result.first()
        
        access_level = profile_data.user_access if profile_data else 1
        company_id = profile_data.company_id if profile_data else None
        
        # List documents
        docs = list_documents(
            limit=limit,
            offset=offset,
            access_level=access_level,
            company_id=company_id,
        )
        
        total = get_document_count(
            access_level=access_level,
            company_id=company_id,
        )
        
        return {
            "documents": docs,
            "total": total,
            "limit": limit,
            "offset": offset,
        }
        
    except Exception as e:
        logger.error(f"Error listing documents: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error listing documents: {str(e)}",
        )


@router.delete("/documents/{doc_id}")
async def delete_document(
    doc_id: str,
    current_user: dict = Depends(verify_token_with_tenant),
) -> dict[str, Any]:
    """Delete a document from the knowledge base."""
    try:
        result = delete_from_kb(doc_id)
        return result
        
    except Exception as e:
        logger.error(f"Error deleting document: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting document: {str(e)}",
        )


@router.post("/search")
async def search_documents(
    query: str = Form(...),
    limit: int = Form(5),
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """Search documents in the knowledge base."""
    try:
        user_id = get_user_id(current_user)
        
        # Get user's access level and company
        stmt = select(
            Profile.user_access, 
            Profile.company_id, 
            Profile.company_reg_no
        ).where(Profile.id == user_id)
        result = await db.execute(stmt)
        profile_data = result.first()
        
        access_level = profile_data.user_access if profile_data else 1
        company_id = profile_data.company_id if profile_data else None
        company_reg_no = profile_data.company_reg_no if profile_data else None
        
        # Search
        results = search_kb(
            query=query,
            limit=limit,
            access_level=access_level,
            company_id=company_id,
            company_reg_no=company_reg_no,
        )
        
        return {
            "results": results,
            "query": query,
            "count": len(results),
        }
        
    except Exception as e:
        logger.error(f"Error searching documents: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error searching documents: {str(e)}",
        )


@router.get("/stats")
async def get_kb_stats(
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """Get knowledge base statistics."""
    try:
        user_id = get_user_id(current_user)
        
        # Get user's company
        stmt = select(Profile.company_id).where(Profile.id == user_id)
        result = await db.execute(stmt)
        profile_data = result.first()
        company_id = profile_data.company_id if profile_data else None
        
        # Get counts
        total_docs = get_document_count(company_id=company_id)
        
        return {
            "total_documents": total_docs,
            "company_id": company_id,
        }
        
    except Exception as e:
        logger.error(f"Error getting stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting stats: {str(e)}",
        )


@router.post("/scrape")
async def scrape_website_endpoint(
    url: str = Form(...),
    title: str | None = Form(None),
    access_level: int = Form(1),
    department: str | None = Form(None),
    tags: str | None = Form(None),
    current_user: dict = Depends(verify_token_with_tenant),
    db: AsyncSession = Depends(get_async_db),
) -> dict[str, Any]:
    """Scrape a website and add to knowledge base."""
    try:
        from app.services.file_processor import scrape_website
        
        user_id = get_user_id(current_user)
        
        stmt = select(Profile.company_id, Profile.company_reg_no, Profile.fullname).where(
            Profile.id == user_id
        )
        result = await db.execute(stmt)
        profile_data = result.first()
        
        company_id = profile_data.company_id if profile_data else None
        company_reg_no = profile_data.company_reg_no if profile_data else None
        author = profile_data.fullname if profile_data else "Unknown"
        
        logger.info(f"Scraping website: {url}")
        
        scraped_text = scrape_website(url)
        
        if not scraped_text.strip():
            raise ValueError("No text extracted from website")
        
        chunks = chunk_text(scraped_text, chunk_size=1000, overlap=100)
        
        docs_to_store = [
            {
                "content": chunk,
                "file_name": url,
                "file_title": f"{title or url} (Part {i+1}/{len(chunks)})",
                "level": access_level,
                "company_id": company_id,
                "company_reg_no": company_reg_no,
                "department": department,
                "tags": tags,
                "author": author,
                "doc_type": "website",
            }
            for i, chunk in enumerate(chunks)
        ]
        
        result = store_bulk_in_kb(docs_to_store)
        
        return {
            "status": "success",
            "message": "Website scraped and indexed",
            "url": url,
            "chunks": len(chunks),
            "doc_ids": result.get("doc_ids", []),
        }
        
    except Exception as e:
        logger.error(f"Error scraping website: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error scraping website: {str(e)}",
        )
