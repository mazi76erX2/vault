import os

# import pandas as pd # Has linter error for missing stubs, address if/when pandas is actively used here
import logging

# import datetime # Not used in the modified section
# import json # Not used in the modified section
# import mysql.connector # Commenting out MySQL - pending user clarification
# from sqlalchemy import update # Not used in modified section
# from mysql.connector import Error # Commenting out MySQL - pending user clarification
# from app.email_utils import send_email_graph # Assuming this path needs to be vault.app.email_utils if it exists

from pathlib import Path
from dotenv import load_dotenv
from supabase import (
    create_client,
    Client,
)  # For Supabase client (PostgREST, auth, storage etc)

from sqlalchemy import create_engine  # For SQLAlchemy engine (direct DB connection)
from sqlalchemy.orm import sessionmaker  # For SQLAlchemy sessions

# from vault.app.db.base_class import Base # Base is for model definitions, not directly used in this file after removing create_all

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Load .env from current directory
# Using .resolve() for better path reliability
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(env_path)


# --- SQLAlchemy Setup (for direct DB interaction via ORM) ---
# This URL should be the same as in alembic.ini for consistency
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://postgres:postgres@localhost:54322/postgres"
)
# It's good practice to get this from .env if possible, with a fallback for local dev.
# Ensure DATABASE_URL is set in your .env for local Supabase:
# DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# --- Supabase Client Setup (for Supabase-specific services like auth, storage, PostgREST API) ---
SUPABASE_API_URL = os.getenv("SUPABASE_URL")  # Use a distinct name from the DB URL
SUPABASE_ANON_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Initialize with None, then assign the client object
supabase: Client | None = None
supabase_admin: Client | None = None

if SUPABASE_API_URL and SUPABASE_ANON_KEY:
    supabase = create_client(SUPABASE_API_URL, SUPABASE_ANON_KEY)
    if SUPABASE_SERVICE_KEY:
        supabase_admin = create_client(SUPABASE_API_URL, SUPABASE_SERVICE_KEY)
    else:
        logger.warning(
            "SUPABASE_SERVICE_ROLE_KEY is not set. Supabase admin client will not be available."
        )
else:
    logger.warning(
        "SUPABASE_URL or SUPABASE_KEY environment variables are not set. Supabase client might not work."
    )


# The old create_tables function is removed/commented as Alembic handles schema.
# def create_tables():
#     """
#     Create all tables if they do not exist in the database.
#     THIS FUNCTION IS DEPRECATED. ALEMBIC MANAGES SCHEMA.
#     """
#     # from app.models import user_model, document_model # These would be your SQLAlchemy models
#     # try:
#     # Base.metadata.create_all(bind=engine) # Alembic handles this.
#     #     print("Database tables checked/created successfully.")
#     # except Exception as e:
#     #     print(f"Error creating tables: {e}")


def get_db():
    """
    Dependency to get a DB session.
    Ensures the database session is always closed after the request.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def generate_file_dict_from_db(db):
    """
    Generates dictionaries for manager and verifier documents.

    Args:
        db (Session): SQLAlchemy session.

    Returns:
        tuple: file_dict_manager and file_dict_verifier.
    """
    documents = db.query(Document).all()

    file_dict_manager = []
    file_dict_verifier = []

    for record in documents:
        file_info = {
            "doc_id": record.doc_id,
            "mng_id": record.responsible,
            "path": record.link,
            "title": record.title,
            "status": record.status,
            "tags": record.tags,
            "employee_contact": record.employee_contact,
            "summary": record.summary,
            "level": record.level,
            "comment": record.comment,
        }
        if record.Reviewer:
            # Verifier document
            file_info["user_id"] = record.Reviewer
            file_dict_verifier.append(file_info)
        else:
            # Manager document
            file_dict_manager.append(file_info)

    return file_dict_manager, file_dict_verifier


def refresh_displayed_docs():
    global glb_username

    # refresh needs first to update the docs
    doc_list_manager, doc_list_verifier = generate_file_dict_from_mysql()
    mng_id = str(managers_dict[glb_username]["Manager_id"])
    mng_id = str(managers_dict[glb_username]["Manager_id"])
    user_id = str(glb_user["id"])

    global mng_doc_list, verifier_doc_list
    mng_doc_list = [doc for doc in doc_list_manager if doc["mng_id"] == mng_id]
    mng_doc_ids_data = pd.DataFrame(
        {
            "Documents": [
                f"Document ID: {doc['doc_id']} | {doc['title']} | {doc['status']}"
                for doc in doc_list_manager
                if doc["mng_id"] == mng_id
            ]
        }
    )
    mng_doc_list = [doc for doc in doc_list_manager if doc["mng_id"] == mng_id]
    mng_doc_ids_data = pd.DataFrame(
        {
            "Documents": [
                f"Document ID: {doc['doc_id']} | {doc['title']} | {doc['status']}"
                for doc in doc_list_manager
                if doc["mng_id"] == mng_id
            ]
        }
    )

    verifier_doc_list = [doc for doc in doc_list_verifier if doc["user_id"] == user_id]
    verifier_doc_ids_data = pd.DataFrame(
        {
            "Documents": [
                f"Document ID: {doc['doc_id']} | {doc['title']} | {doc['status']}"
                for doc in doc_list_verifier
                if doc["user_id"] == user_id
            ]
        }
    )
    verifier_doc_list = [doc for doc in doc_list_verifier if doc["user_id"] == user_id]
    verifier_doc_ids_data = pd.DataFrame(
        {
            "Documents": [
                f"Document ID: {doc['doc_id']} | {doc['title']} | {doc['status']}"
                for doc in doc_list_verifier
                if doc["user_id"] == user_id
            ]
        }
    )

    return mng_doc_ids_data, verifier_doc_ids_data


def store_in_kb(chat, tags, reference, link, title, responsible, levels):
    if tags == "":
        tags = "[]"
    # store the doc in DB MySQL
    doc_id = store_unstructured_doc_in_db(
        chat,
        eval(tags),
        reference,
        link,
        title,
        managers_dict[responsible]["Manager_id"],
        levels,
    )

    doc_id = store_unstructured_doc_in_db(
        chat,
        eval(tags),
        reference,
        link,
        title,
        managers_dict[responsible]["Manager_id"],
        levels,
    )

    # doc_to_store = generate_unstructured_doc(chat, eval(tags), reference, link, title, managers_dict[responsible]["Manager_id"], levels)

    # store the conversation in db
    session_info = update_session(
        current_session["id"],
        severity_levels=levels,
        tags=tags,
        designated_employee=reference,
        url_reference=link,
        document_title=title,
        validation_responsible=responsible,
    )
    session_info = update_session(
        current_session["id"],
        severity_levels=levels,
        tags=tags,
        designated_employee=reference,
        url_reference=link,
        document_title=title,
        validation_responsible=responsible,
    )
    gr.Info(session_info, duration=1)

    # folder_path = args.kb_folder_path
    # id_doc = f"doc_{doc_id}_mng_{managers_dict[responsible]["Manager_id"]}.txt"
    # doc_path = os.path.join(folder_path, id_doc)
    # with open(doc_path, 'w', encoding='utf-8') as f:
    #     f.write(doc_to_store)
    global conversation_history
    conversation_history = conversation_history[:2]

    send_email_graph(
        CLIENT_ID,
        CLIENT_SECRET,
        TENANT_ID,
        args.sender_email,
        managers_dict[responsible]["manager_mail"],
        "HICO Vault Validation Process",
        "You have a new document to validate",
    )
    return (
        gr.Tabs(selected="tab_projects"),
        gr.Chatbot(value=[]),
        gr.Markdown(value=" ".join([f"`{tag}`" for tag in []])),
        gr.Textbox(value=""),
        gr.Textbox(value=""),
        gr.Textbox(value=""),
        gr.Textbox(value=""),
        gr.Textbox(value=""),
        gr.Textbox(value="", interactive=True),
        gr.Dropdown(choices=list(managers_dict.keys())),
        gr.Dropdown(value="Low"),
        gr.Dropdown(value=""),
    )

    send_email_graph(
        CLIENT_ID,
        CLIENT_SECRET,
        TENANT_ID,
        args.sender_email,
        managers_dict[responsible]["manager_mail"],
        "HICO Vault Validation Process",
        "You have a new document to validate",
    )
    return (
        gr.Tabs(selected="tab_projects"),
        gr.Chatbot(value=[]),
        gr.Markdown(value=" ".join([f"`{tag}`" for tag in []])),
        gr.Textbox(value=""),
        gr.Textbox(value=""),
        gr.Textbox(value=""),
        gr.Textbox(value=""),
        gr.Textbox(value=""),
        gr.Textbox(value="", interactive=True),
        gr.Dropdown(choices=list(managers_dict.keys())),
        gr.Dropdown(value="Low"),
        gr.Dropdown(value=""),
    )


def get_user_session_by_id(id):
    try:
        connection = mysql.connector.connect(**CONFIG)
        cursor = connection.cursor()

        # Execute the query
        cursor.execute(f"SELECT * FROM sessions WHERE id={id}")

        # Fetch all rows
        rows = cursor.fetchall()

        # Get column names
        column_names = [desc[0] for desc in cursor.description]

        # Convert each row to a dictionary keyed by column name
        user_sessions = []
        for row in rows:
            row_dict = {}
            for col_name, value in zip(column_names, row):
                row_dict[col_name] = value
            user_sessions.append(row_dict)

        return user_sessions  # This will be a list of dictionaries

    finally:
        # Close the cursor and connection (even if there's an error)
        cursor.close()
        connection.close()


def get_user_session_by_user_id(id):
    try:
        connection = mysql.connector.connect(**CONFIG)
        cursor = connection.cursor()

        # Execute the query
        cursor.execute(f"SELECT * FROM sessions WHERE user_id={id}")

        # Fetch all rows
        rows = cursor.fetchall()

        # Get column names
        column_names = [desc[0] for desc in cursor.description]

        # Convert each row to a dictionary keyed by column name
        user_sessions = []
        for row in rows:
            row_dict = {}
            for col_name, value in zip(column_names, row):
                row_dict[col_name] = value
            user_sessions.append(row_dict)

        return user_sessions  # This will be a list of dictionaries

    finally:
        # Close the cursor and connection (even if there's an error)
        cursor.close()
        connection.close()


def get_all_users():
    try:
        connection = mysql.connector.connect(**CONFIG)
        cursor = connection.cursor()

        # Execute the query
        cursor.execute("SELECT * FROM users")

        # Fetch all rows
        rows = cursor.fetchall()

        # Get column names
        column_names = [desc[0] for desc in cursor.description]

        # Convert each row to a dictionary keyed by column name
        users = []
        for row in rows:
            row_dict = {}
            for col_name, value in zip(column_names, row):
                row_dict[col_name] = value
            users.append(row_dict)

        return users  # This will be a list of dictionaries

    finally:
        # Close the cursor and connection (even if there's an error)
        cursor.close()
        connection.close()


def get_user_by_id(id):
    try:
        connection = mysql.connector.connect(**CONFIG)
        cursor = connection.cursor()

        # Execute the query
        cursor.execute(f"SELECT * FROM users WHERE id={id}")

        # Fetch all rows
        rows = cursor.fetchall()

        # Get column names
        column_names = [desc[0] for desc in cursor.description]

        # Convert each row to a dictionary keyed by column name
        users = []
        for row in rows:
            row_dict = {}
            for col_name, value in zip(column_names, row):
                row_dict[col_name] = value
            users.append(row_dict)

        return users  # This will be a list of dictionaries

    finally:
        # Close the cursor and connection (even if there's an error)
        cursor.close()
        connection.close()


def update_user(
    user_id,
    new_name=None,
    current_role=None,
    expertise_domain=None,
    experience_years=None,
    cv_content=None,
    questions=None,
):
    """
    Updates a user record in the 'users' table.
    Passing None for any field means 'no change' for that field.
    """

    # Build the UPDATE query dynamically based on which fields are not None
    # We'll store fragments in a list and then join them for the final query.
    fields_to_update = []
    data_values = []

    if new_name is not None:
        fields_to_update.append("name = %s")
        data_values.append(new_name)

    if current_role is not None:
        fields_to_update.append("current_role = %s")
        data_values.append(current_role)

    if expertise_domain is not None:
        fields_to_update.append("expertise_domain = %s")
        data_values.append(expertise_domain)

    if experience_years is not None:
        fields_to_update.append("experience_years = %s")
        data_values.append(experience_years)
    if cv_content is not None:
        fields_to_update.append("cv = %s")
        data_values.append(cv_content)

    if questions is not None:
        fields_to_update.append("suggested_questions = %s")
        data_values.append(questions)

    # If nothing to update, just return
    if not fields_to_update:
        return "No fields to update."

    # Finalize the query: UPDATE users SET col1=?, col2=? WHERE id=?
    query_base = "UPDATE users SET "
    query_set = ", ".join(fields_to_update)
    query_where = " WHERE id = %s"
    final_query = query_base + query_set + query_where

    # Add user_id as the last parameter
    data_values.append(user_id)

    # Connect to the database and execute
    try:
        cnx = mysql.connector.connect(**CONFIG)
        cursor = cnx.cursor()

        cursor.execute(final_query, tuple(data_values))
        cnx.commit()

        rows_affected = cursor.rowcount
        cursor.close()
        cnx.close()

        if rows_affected == 0:
            return f"No user found with id = {user_id}"
        else:
            return f"User with id = {user_id} updated successfully."

    except mysql.connector.Error as err:
        return f"Error: {err}"


def update_document(
    doc_id, comment=None, summary=None, responsible=None, status=None, Reviewer=None
):
    """
    Updates a document record in the 'documents' table.
    Passing None for any field means 'no change' for that field.

    Parameters:
    - doc_id (int): The ID of the document to update.
    - summary (str, optional): The new summary of the document.
    - responsible (str, optional): The new responsible manager's name.
    - status (str, optional): The new status of the document.
    - Reviewer (str, optional): The new reviewer's name or identifier.
    - comment (str, optional): The new comment

    Returns:
    - str: A message indicating the result of the update operation.
    """

    # Build the UPDATE query dynamically based on which fields are not None
    # We'll store fragments in a list and then join them for the final query.
    fields_to_update = []
    data_values = []

    if summary is not None:
        fields_to_update.append("summary = %s")
        data_values.append(summary)

    if responsible is not None:
        fields_to_update.append("responsible = %s")
        data_values.append(responsible)

    if status is not None:
        fields_to_update.append("status = %s")
        data_values.append(status)
        if status == "Validated - Awaiting Approval":
            fields_to_update.append("Reviewer = %s")
            data_values.append(Reviewer)

    if Reviewer is not None:
        fields_to_update.append("Reviewer = %s")
        data_values.append(Reviewer)

    if comment is not None:
        fields_to_update.append("comment = %s")
        data_values.append(comment)

    # If nothing to update, just return
    if not fields_to_update:
        return "No fields to update."

    # Finalize the query: UPDATE documents SET col1=?, col2=? WHERE doc_id=?
    query_base = "UPDATE documents SET "
    query_set = ", ".join(fields_to_update)
    query_where = " WHERE doc_id = %s"
    final_query = query_base + query_set + query_where

    # Add doc_id as the last parameter
    data_values.append(doc_id)

    # Connect to the database and execute
    try:
        cnx = mysql.connector.connect(**CONFIG)
        cursor = cnx.cursor()

        cursor.execute(final_query, tuple(data_values))
        cnx.commit()

        rows_affected = cursor.rowcount
        cursor.close()
        cnx.close()

        if rows_affected == 0:
            return f"No document found with doc_id = {doc_id}."
        else:
            return f"Document with doc_id = {doc_id} updated successfully."

    except mysql.connector.Error as err:
        return f"Error: {err}"


def get_all_managers():
    try:
        connection = mysql.connector.connect(**CONFIG)
        cursor = connection.cursor()

        # Execute the query
        cursor.execute("SELECT * FROM managers")

        # Fetch all rows
        rows = cursor.fetchall()

        # Get column names
        column_names = [desc[0] for desc in cursor.description]

        # Convert each row to a dictionary keyed by column name
        managers = []
        for row in rows:
            row_dict = {}
            for col_name, value in zip(column_names, row):
                row_dict[col_name] = value
            managers.append(row_dict)

        return managers  # This will be a list of dictionaries

    finally:
        # Close the cursor and connection (even if there's an error)
        cursor.close()
        connection.close()


def get_manager_by_id(id):
    try:
        connection = mysql.connector.connect(**CONFIG)
        cursor = connection.cursor()

        # Execute the query
        cursor.execute(f"SELECT * FROM users WHERE id={id}")

        # Fetch all rows
        rows = cursor.fetchall()

        # Get column names
        column_names = [desc[0] for desc in cursor.description]

        # Convert each row to a dictionary keyed by column name
        manager = []
        for row in rows:
            row_dict = {}
            for col_name, value in zip(column_names, row):
                row_dict[col_name] = value
            manager.append(row_dict)

        return manager  # This will be a list of dictionaries

    finally:
        # Close the cursor and connection (even if there's an error)
        cursor.close()
        connection.close()
