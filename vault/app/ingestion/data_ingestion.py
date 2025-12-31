import os
import argparse
import logging
import re
from datetime import datetime
from langchain.text_splitter import CharacterTextSplitter
from pathlib import Path
from dotenv import load_dotenv
import uuid

# Qdrant / Ollama utilities
from app.connectors.qdrant_utils import upsert_documents, recreate_collection

# Load .env from current directory
env_path = Path(__file__).parent / ".env"
load_dotenv(env_path)


def load_text_files_from_folder(folder_path):
    """
    Loads all .txt files from the specified folder and returns their content.
    """
    docs = []
    for file_name in os.listdir(folder_path):
        if file_name.endswith(".txt"):
            file_path = os.path.join(folder_path, file_name)
            with open(file_path, "r", encoding="utf-8") as file:
                content = file.read()
                title_match = re.search(r"- Title:\s*(.*)", content)

                if title_match:
                    title = title_match.group(1).strip()
                else:
                    title = "Title not provided"

                level_match = re.search(r"- Level:\s*(.*)", content)

                if level_match:
                    level = level_match.group(1).strip()
                else:
                    level = "Level not provided"

                docs.append(
                    {
                        "file_name": file_path,
                        "content": content,
                        "file_title": title,
                        "level": level,
                    }
                )
    return docs


def main(args):
    logging.info("Data Ingestion Process Started ... (using Ollama + Qdrant)")

    folder_path = args.folder_path
    recreate = args.recreate

    text_docs = load_text_files_from_folder(folder_path)
    logging.info(f"Loading {len(text_docs)} text files from {folder_path} ...")

    splitter = CharacterTextSplitter(
        separator="\n",
        chunk_size=1000,
        chunk_overlap=50,
    )

    docs_to_upsert = []
    counter = 0
    for doc in text_docs:
        chunks = splitter.split_text(doc["content"])
        for chunk in chunks:
            counter += 1
            doc_id = str(uuid.uuid4())
            item = {
                "id": doc_id,
                "content": chunk,
                "metadata": {
                    "sourcefile": doc["file_name"],
                    "title": doc["file_title"],
                    "date": datetime.now().isoformat(),
                    "access_level": doc["level"],
                },
            }
            docs_to_upsert.append(item)

    logging.info(f"Prepared {len(docs_to_upsert)} chunks for upsert into Qdrant.")

    # Optionally recreate collection (use with caution - drops existing data)
    collection_name = os.getenv("QDRANT_COLLECTION", "vault")
    if recreate:
        logging.info(
            f"Recreating Qdrant collection '{collection_name}' as requested..."
        )
        recreate_collection(collection_name)

    # Upsert in batches to avoid large payloads
    batch_size = 200
    for i in range(0, len(docs_to_upsert), batch_size):
        batch = docs_to_upsert[i : i + batch_size]
        upsert_documents(collection_name, batch)

    logging.info("Data Ingestion Process Completed.")
    print("Data Ingestion Process Completed.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--folder_path",
        type=str,
        default=r"./kb_docs",
        help="Path to the folder containing .txt files.",
    )
    parser.add_argument(
        "--recreate",
        action="store_true",
        help="If set, recreate the Qdrant collection before upserting (DANGEROUS: will drop existing data).",
    )
    args = parser.parse_args()
    main(args)
