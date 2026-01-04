from pathlib import Path

import PyPDF2
from docx import Document
from docx2python import docx2python


def extract_text(filepath: Path) -> str:
    """
    Extract text from a file based on its extension.
    """
    filepath = Path(filepath)
    extension = filepath.suffix.lower()

    if extension == ".pdf":
        return read_pdf(str(filepath))
    elif extension in [".docx", ".doc"]:
        return read_docx(str(filepath))
    elif extension == ".txt":
        return read_txt(str(filepath))
    else:
        raise ValueError(f"Unsupported file type: {extension}")


def read_docx(filepath: str) -> str:
    """Extract text from a .docx file."""
    try:
        document = Document(filepath)
        fulltext = []
        for para in document.paragraphs:
            fulltext.append(para.text)
        extracted_text = "\n".join(fulltext)
        return extracted_text
    except Exception as e:
        raise ValueError(f"Error reading .docx file at {filepath}: {e}") from e


def read_pdf(filepath: str) -> str:
    """Extract text from a PDF file."""
    try:
        with open(filepath, "rb") as file:
            pdf_reader = PyPDF2.PdfReader(file)
            num_pages = len(pdf_reader.pages)
            text_content = ""

            for page_number in range(num_pages):
                page = pdf_reader.pages[page_number]
                text_content += page.extract_text()

        return text_content
    except Exception as e:
        print(f"Error occurred: {e}")
        return ""


def read_txt(filepath: str) -> str:
    """Extract text from a .txt file."""
    try:
        with open(filepath, encoding="utf-8") as file:
            text_content = file.read()
        return text_content
    except Exception as e:
        print(f"Error occurred: {e}")
        return ""


def extract_text_with_docx2python(filepath: str) -> str:
    """
    Extract text using docx2python library (alternative method).
    """
    try:
        content = docx2python(filepath)
        paragraphs = []

        for section in content.body:
            for page in section:
                for column in page:
                    for paragraph in column:
                        paragraphs.append(paragraph)

        text_content = "\n".join(paragraphs)
        return text_content
    except IndexError:
        print("Error processing the file: The file is a form")
        return ""
    except Exception as e:
        print(f"An error occurred: {e}")
        return ""
