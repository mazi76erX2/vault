"""
Shared utility functions for the Vault application.
Migrated from Supabase to SQLAlchemy.
"""

from datetime import datetime
from typing import Any

import PyPDF2
from docx import Document
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import ChatMessageCollector

# Constants
RETRIEVAL_SIMILARITY_THRESHOLD = 0.1
MAX_INPUT_LENGTH = 200


async def process_session(s: dict[str, Any], db: AsyncSession) -> dict[str, Any]:
    """
    Process a single session record and fetch associated chat messages.

    Args:
        s: Session dictionary with keys: id, created_at, status, chat_messages_id
        db: Async database session

    Returns:
        Processed session dict with id, createdAt, topic, status
    """
    # Default topic message
    first_assistant_message = "No topic found"

    # If there is an associated chat_messages_id, fetch the chat messages
    chat_messages_id = s.get("chat_messages_id")
    if chat_messages_id:
        try:
            stmt = select(ChatMessageCollector.messages).where(
                ChatMessageCollector.id == chat_messages_id
            )
            result = await db.execute(stmt)
            messages = result.scalar_one_or_none()

            # Find the first message with role 'assistant'
            if messages:
                for msg in messages:
                    if msg.get("role") == "assistant":
                        first_assistant_message = msg.get("content", "No topic found")
                        break
        except Exception as e:
            # Log error but continue with default message
            print(f"Error fetching chat messages: {e}")

    # Format the created_at date into 'en-GB' format (dd/mm/yyyy)
    created_at = s.get("created_at")
    if isinstance(created_at, datetime):
        created_at_formatted = created_at.strftime("%d/%m/%Y")
    elif isinstance(created_at, str):
        created_at_formatted = datetime.fromisoformat(created_at).strftime("%d/%m/%Y")
    else:
        created_at_formatted = "N/A"

    return {
        "id": s["id"],
        "createdAt": created_at_formatted,
        "topic": first_assistant_message,
        "status": s.get("status", "Started"),
    }


async def get_session_rows(data: list[dict[str, Any]], db: AsyncSession) -> list[dict[str, Any]]:
    """
    Process all session records asynchronously.

    Args:
        data: List of session dictionaries
        db: Async database session

    Returns:
        List of processed session dictionaries
    """
    session_rows = []
    for s in data:
        processed = await process_session(s, db)
        session_rows.append(processed)
    return session_rows


def filter_by_severity(user_role: str, query_results: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """
    Filter query results by user role and severity level.

    Args:
        user_role: User role (admin, manager, employee, guest)
        query_results: List of results with 'access_level' key

    Returns:
        Filtered list of results based on role permissions
    """
    # Define role-based access levels
    access_levels = {
        "admin": [1, 2, 3, 4],
        "manager": [1, 2, 3],
        "employee": [1, 2],
        "guest": [1],
    }

    allowed_levels = access_levels.get(user_role, [])
    filtered_results = [
        result for result in query_results if result.get("access_level") in allowed_levels
    ]

    return filtered_results


def read_docx(file_path: str) -> str:
    """
    Read and extract text from a .docx file.

    Args:
        file_path: Path to the .docx file

    Returns:
        Extracted text content

    Raises:
        ValueError: If file cannot be read
    """
    try:
        # Load the .docx file
        document = Document(file_path)

        # Extract all paragraphs
        full_text = [para.text for para in document.paragraphs]

        # Join all paragraphs with newlines
        extracted_text = "\n".join(full_text)
        return extracted_text

    except Exception as e:
        raise ValueError(f"Error reading .docx file at {file_path}: {e}") from e


def read_pdf(file_path: str) -> str:
    """
    Read and extract text from a PDF file.

    Args:
        file_path: Path to the PDF file

    Returns:
        Extracted text content (empty string on error)
    """
    try:
        # Open the PDF file in binary read mode
        with open(file_path, "rb") as file:
            # Create a PDF reader object
            pdf_reader = PyPDF2.PdfReader(file)

            # Get the number of pages
            num_pages = len(pdf_reader.pages)

            # Initialize text content
            text_content = ""

            # Iterate over all pages and extract text
            for page_number in range(num_pages):
                page = pdf_reader.pages[page_number]
                text_content += page.extract_text()

        return text_content

    except Exception as e:
        print(f"Error reading PDF file {file_path}: {e}")
        return ""


def read_txt(file_path: str) -> str:
    """
    Read text content from a .txt file.

    Args:
        file_path: Path to the .txt file

    Returns:
        Text content (empty string on error)
    """
    try:
        with open(file_path, encoding="utf-8") as file:
            return file.read()
    except Exception as e:
        print(f"Error reading text file {file_path}: {e}")
        return ""


# Legacy aliases for backwards compatibility
readpdf = read_pdf
readtxt = read_txt
