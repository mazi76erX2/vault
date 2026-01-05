"""
Knowledge base endpoints.
"""

import logging

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.connectors.store_data_in_kb import store_in_kb
from app.constants.constants import SEVERITY_LEVEL_MAP
from app.database import get_async_db
from app.models import Document

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/store")
async def store_knowledge(data: dict, db: AsyncSession = Depends(get_async_db)):
    """Store validated document in knowledge base."""
    document_id = data.get("doc_id")
    logger.info(f"Received document id: {document_id}")

    # Query document using SQLAlchemy
    stmt = select(Document).where(Document.doc_id == document_id)
    result = await db.execute(stmt)
    document = result.scalar_one_or_none()

    if not document:
        logger.info("No documents found.")
        return {"response": "No documents found."}

    severity_level_int = SEVERITY_LEVEL_MAP.get(document.severity_levels, 1)
    doc_to_store = {
        "file_name": document.link,
        "content": document.summary or "N/A",
        "file_title": document.title,
        "level": severity_level_int,
    }
    store_in_kb(doc_to_store)

    logger.info("Document validated and stored in the Knowledge Base")
    return {"response": "Document validated and stored in the Knowledge Base"}
