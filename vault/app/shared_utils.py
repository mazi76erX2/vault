from datetime import datetime

import PyPDF2
from docx import Document

RETRIEVAL_SIMILARITY_THRESHOLD = 0.1
# Max input length (language-agnostic)
MAX_INPUT_LENGTH = 200


def process_session(s: dict) -> dict:
    # Default topic message
    first_assistant_message = "No topic found"

    # If there is an associated chat_messages_id, then fetch the chat messages
    if s.get("chat_messages_id"):
        response = (
            supabase.table("chat_messages_collector")
            .select("messages")
            .eq("id", s["chat_messages_id"])
            .execute()
        )

        # Check that the query succeeded and data is available
        if not response.error and response.data:
            # Assuming response.data is a list with a single record
            messages = response.data[0].get("messages", [])
            # Find the first message with role 'assistant'
            for msg in messages:
                if msg.get("role") == "assistant":
                    first_assistant_message = msg.get("content", "No topic found")
                    break

    # Format the created_at date into the 'en-GB' format (dd/mm/yyyy)
    created_at_formatted = datetime.fromisoformat(s["created_at"]).strftime("%d/%m/%Y")

    return {
        "id": s["id"],
        "createdAt": created_at_formatted,
        "topic": first_assistant_message,
        "status": s.get("status", "Started"),
    }


def get_session_rows(data: list[dict]) -> list[dict]:
    # Process all session records in a synchronous manner
    session_rows = [process_session(s) for s in data]
    return session_rows


def filter_by_severity(user_role, query_results):
    # Define role-based access
    access_levels = {
        "admin": [1, 2, 3, 4],
        "manager": [1, 2, 3],
        "employee": [1, 2],
        "guest": [1],
    }

    allowed_levels = access_levels.get(user_role, [])
    filtered_results = [
        result for result in query_results if result["access_level"] in allowed_levels
    ]

    return filtered_results


def read_docx(file_path):
    try:
        # Load the .docx file
        document = Document(file_path)

        # Extract and join all paragraphs into a single string
        full_text = []
        for para in document.paragraphs:
            full_text.append(para.text)

        # Join all paragraphs with a new line
        extracted_text = "\n".join(full_text)
        return extracted_text

    except Exception as e:
        raise ValueError(f"Error reading .docx file at {file_path}: {e}")


def readpdf(file_path):
    try:
        # Open the PDF file in binary read mode
        with open(file_path, "rb") as file:
            # Create a PDF reader object
            pdf_reader = PyPDF2.PdfReader(file)

            # Get the number of pages
            num_pages = len(pdf_reader.pages)

            # Initialize a variable to store the extracted text
            text_content = ""

            # Iterate over all the pages and extract text
            for page_number in range(num_pages):
                page = pdf_reader.pages[page_number]
                text_content += page.extract_text()

    except Exception as e:
        print(f"Error occurred: {e}")
        text_content = ""

    return text_content


def readtxt(file_path):
    # Open the file in read mode ('r') and read the content
    try:
        with open(file_path, encoding="utf-8") as file:
            text_content = file.read()
    except Exception as e:
        print(f"Error occurred: {e}")
        text_content = ""

    return text_content
