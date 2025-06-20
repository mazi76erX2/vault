import json
import logging
import os
import shutil
from datetime import datetime

from fastapi import HTTPException, APIRouter, File, UploadFile
from fastapi.params import Depends
from gotrue import UserResponse

from app.chat import (
    generate_initial_questions,
    generate_response_collector,
    generate_summary_chat,
    generate_tags_chat,
    get_cv_text,
    generate_topic_from_question,
)
from app.database import supabase
from app.dto.collector import (
    ProfileUpdateRequest,
    CollectorSummaryUpdateSummaryRequest,
    CollectorSummaryContinueRequest,
    CollectorSummaryContinueResponse,
    StartChatRequest,
)
from app.middleware.auth import verify_token

router = APIRouter(prefix="/api/v1/collector", tags=["collector"])
logger = logging.getLogger(__name__)

UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# Collector - update CV text
@router.post("/update_cv_text")
def update_cv(file: UploadFile = File(...), user: UserResponse = Depends(verify_token)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    try:
        # Save the uploaded file to the server
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        logger.info(f"Received file: {file.filename}")

        # Extract text from the uploaded document
        cv_text = get_cv_text(file_path)
        logger.info(f"Extracted CV Text: {cv_text}")

        # Step 1: Check the response data
        if not cv_text:
            raise HTTPException(
                status_code=400, detail="Invalid response from the server."
            )

        # Step 2: Update the CV_text in the profiles table
        response = (
            supabase.table("profiles")
            .update({"CV_text": cv_text})
            .eq("id", user.user.id)
            .execute()
        )

        # Step 2: Check if update was successful
        if not response.data:
            raise HTTPException(
                status_code=404, detail="User not found or no changes made."
            )

        # Return the cv_text
        return {"cv_text": cv_text}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/fetch_resume_sessions")
def fetch_resume_sessions(user: UserResponse = Depends(verify_token)):
    logger.info("Received user response: " + str(user.user.id))
    user_id = user.user.id
    resume_sessions = (
        supabase.table("sessions")
        .select("*")
        .eq("user_id", user_id)
        .eq("status", "Started")
        .execute()
    )
    logger.info(f"Resume sessions: {resume_sessions}")
    return {"sessions": resume_sessions.data}


# Collector start - profile
@router.post("/fetch_user_profile")
async def fetch_user_profile(user: UserResponse = Depends(verify_token)):
    user_id = user.user.id

    if not user_id:
        raise HTTPException(status_code=400, detail="Missing user_id or auth_token")
    try:
        # Query Supabase to fetch the profile for the user
        response = (
            supabase.table("profiles")
            .select(
                "full_name, years_of_experience, field_of_expertise, department, CV_text"
            )
            .eq("id", user_id)
            .execute()
        )

        if not response.data or len(response.data) == 0:
            raise HTTPException(status_code=404, detail="No profile found.")

        data = response.data

        # Check if data exists
        if not data:
            raise HTTPException(status_code=404, detail="User profile not found")

        # Return the user profile data directly without Pydantic
        return {
            "full_name": data[0].get("full_name", ""),
            "years_of_experience": data[0].get("years_of_experience", None),
            "field_of_expertise": data[0].get("field_of_expertise", ""),
            "department": data[0].get("department", ""),
            "CV_text": data[0].get("CV_text", None),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Collector - start page submit
@router.post("/update_profile")
def update_profile(
    request: ProfileUpdateRequest, user: UserResponse = Depends(verify_token)
):
    try:
        # Step 1: Perform the upsert operation
        response = (
            supabase.table("profiles")
            .upsert(
                {
                    "id": request.user_id,
                    "full_name": request.full_name,
                    "years_of_experience": request.years_of_experience,
                    "field_of_expertise": request.field_of_expertise,
                    "department": request.department,
                },
                on_conflict=["id"],
            )
            .execute()
        )

        return {"message": "Profile updated successfully", "data": response}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# collector fetch chat conversion (messages)
@router.post("/fetch_chat_conversation")
def fetch_chat_conversation(data: dict, user: UserResponse = Depends(verify_token)):
    logger.info(
        f"Fetching chat conversation for session: {data.get('session_id')} and chat_message_id: {data.get('chat_messages_id')}"
    )

    session_id = data.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="Missing session_id")

    try:
        chat_messages_id = data.get("chat_messages_id")

        # Step 1: If `chat_id` is not provided, fetch from `sessions`
        if not chat_messages_id:
            session_response = (
                supabase.table("sessions")
                .select("chat_messages_id")
                .eq("id", session_id)
                .maybe_single()
                .execute()
            )

            session_data = session_response.data
            if session_data and session_data.get("chat_messages_id") is not None:
                chat_messages_id = session_data["chat_messages_id"]
                logger.info(
                    f"Found chat_messages_id: {chat_messages_id} from session table for session_id: {session_id}"
                )
            else:
                logger.warning(
                    f"No chat_messages_id found in sessions table for session_id: {session_id}. session_data: {session_data}"
                )
                return {"chat_messages_id": None, "messages": None}

        # Step 2: Fetch the conversation from `chat_messages_collector`
        if (
            not chat_messages_id
        ):  # This covers if chat_messages_id was None from session table
            logger.warning(
                f"chat_messages_id is None or empty for session_id: {session_id} after attempting to fetch. Cannot retrieve messages."
            )
            return {"chat_messages_id": None, "messages": None}

        chat_response = (
            supabase.table("chat_messages_collector")
            .select("messages")
            .eq("id", chat_messages_id)
            .maybe_single()
            .execute()
        )

        chat_data = chat_response.data
        if not chat_data or "messages" not in chat_data:
            logger.info("No stored messages found.")
            return {"chat_messages_id": chat_messages_id, "messages": None}

        return {"chat_messages_id": chat_messages_id, "messages": chat_data["messages"]}

    except Exception as e:
        logger.error(f"Error fetching chat conversation: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch chat conversation")


# Collector Document Status
@router.get("/fetch_documents_status")
def fetch_documents_status(user: UserResponse = Depends(verify_token)):
    user_id = user.user.id
    logger.info(f"Fetching document status for user_id: {user_id}")

    # TODO figure out how error responses should look and update all instances of errors being returned

    # TODO add better validation of input e.g. check that the user id presented actually exists and can perform this operation

    if not user_id:
        raise HTTPException(400, "Missing user_id")

    # Step 1: Fetch all profiles and create a user_id → full_name map
    profile_response = supabase.table("profiles").select("id, full_name").execute()
    profiles = profile_response.data or []

    user_map = {profile["id"]: profile["full_name"] for profile in profiles}

    # Step 2: Query "documents" table for completed documents (status NOT "Draft")
    document_response = (
        supabase.table("documents")
        .select("doc_id, title, responsible, status")
        .neq("status", "Draft")
        .eq("author_id", user_id)
        .execute()
    )
    documents = document_response.data or []

    if not documents:
        raise HTTPException(404, "No completed documents found")

    # Step 3: Format data for frontend
    document_rows = [
        {
            "id": doc["doc_id"],
            "title": doc.get("title", "Untitled"),
            "responsible": user_map.get(doc["responsible"], "N/A"),
            "status": doc.get("status", "Pending"),
        }
        for doc in documents
    ]

    return {"documents": document_rows}


# Collector start chat
@router.post("/start-chat")
async def create_session(
    request: StartChatRequest, user: UserResponse = Depends(verify_token)
):
    user_id = user.user.id
    try:
        # 0️⃣ Get company_id from user profile
        profile_response = (
            supabase.table("profiles").select("company_id").eq("id", user_id).execute()
        )
        if not profile_response.data or not profile_response.data[0].get("company_id"):
            raise HTTPException(
                status_code=400,
                detail="User does not have a company associated with their profile",
            )
        company_id = profile_response.data[0]["company_id"]

        # Step 1: Insert document into the 'documents' table
        doc_response = (
            supabase.from_("documents")
            .insert(
                [
                    {
                        "author_id": user_id,
                        "title": f"Draft Document - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
                        "severity_levels": "Low",
                        "status": "Draft",
                        "company_id": company_id,  # Add company_id
                    }
                ]
            )
            .execute()
        )
        print(request)
        # Robust check for document insertion success
        if not doc_response.data or not doc_response.data[0].get("doc_id"):
            error_details_doc = "Unknown error during document insert"
            if hasattr(doc_response, "error") and doc_response.error:
                error_details_doc = str(doc_response.error)
            elif hasattr(doc_response, "text"):
                error_details_doc = doc_response.text
            logger.error(
                f"Failed to insert document for user {user_id}. Response status: {getattr(doc_response, 'status_code', 'N/A')}, Error: {error_details_doc}, Response: {doc_response}"
            )
            raise HTTPException(
                status_code=500,
                detail=f"Failed to create initial document record. Details: {error_details_doc}",
            )

        doc_id = doc_response.data[0]["doc_id"]

        # Generate topic from the initial question
        topic = generate_topic_from_question(request.question)

        # Step 2: Insert session into the 'sessions' table
        session_response = (
            supabase.from_("sessions")
            .insert(
                {
                    "user_id": user_id,
                    "doc_id": doc_id,  # Link the created document ID
                    "created_at": datetime.now().isoformat(),
                    "topic": topic,  # Use the generated topic instead of request.topic
                    "status": "Started",
                }
            )
            .execute()
        )

        # Robust check for session insertion
        if not session_response.data or not session_response.data[0].get("id"):
            error_details_session = "Unknown error during session insert"
            if hasattr(session_response, "error") and session_response.error:
                error_details_session = str(session_response.error)
            elif hasattr(session_response, "text"):
                error_details_session = session_response.text
            logger.error(
                f"Failed to insert session for user {user_id}, doc_id {doc_id}. "
                f"Response status: {getattr(session_response, 'status_code', 'N/A')}, Error: {error_details_session}, Response: {session_response}"
            )
            raise HTTPException(
                status_code=500,
                detail=f"Failed to create session record. Details: {error_details_session}",
            )

        session_id = session_response.data[0]["id"]

        # Step 3: Create initial chat messages
        system_message = {
            "role": "system",
            "content": (
                "You are a dynamic and engaging chatbot designed to **ask open-ended questions** to collect knowledge and experiences from employees. "
                + "Your role is to guide employees through a structured conversation by prompting for **more details, insights, and best practices**. "
                + "You should **only generate follow-up questions** and **avoid** summarizing, elaborating, or providing answers. "
                + "Make sure each question is relevant to the ongoing conversation and stays within the scope of the topic at hand. "
                + "Focus solely on **asking questions** to gather knowledge. "
                + "Do not provide any other form of text or summaries.\n\n"
                + "If the user provides a valid, detailed response that is **on-topic**, do not treat it as an out-of-scope response. Instead, generate a "
                + "**relevant follow-up question** based on the details provided, asking for more specific insights or examples related to their answer.\n\n"
                + "However, if the user responds with a subject **not related to the current conversation topic** or provides a response that is off-topic, "
                + "politely guide them back to the relevant topic by saying something like: \"That's an interesting point, but let's focus on collecting knowledge. "
                + 'Can you please answer the previous question?"\n\n'
                + "Make sure to tailor the question to the specific response provided, ensuring that the conversation stays relevant and productive."
            ),
        }

        initial_question = {
            "role": "assistant",
            "content": request.question,
        }

        chat_prompt = [system_message, initial_question]

        chat_msg_response = (
            supabase.from_("chat_messages_collector")
            .insert(
                {
                    "session_id": session_id,
                    "messages": chat_prompt,
                    "created_at": datetime.now().isoformat(),
                }
            )
            .execute()
        )

        # Robust check for chat message insertion
        if not chat_msg_response.data or not chat_msg_response.data[0].get("id"):
            error_details_chat = "Unknown error during chat_messages_collector insert"
            if hasattr(chat_msg_response, "error") and chat_msg_response.error:
                error_details_chat = str(chat_msg_response.error)
            elif hasattr(chat_msg_response, "text"):
                error_details_chat = chat_msg_response.text
            logger.error(
                f"Failed to insert chat_message_collector for session {session_id}. Response status: {getattr(chat_msg_response, 'status_code', 'N/A')}, Error: {error_details_chat}, Response: {chat_msg_response}"
            )
            raise HTTPException(
                status_code=500,
                detail=f"Failed to insert chat_message_collector. Details: {error_details_chat}",
            )
        chat_msg_id = chat_msg_response.data[0]["id"]

        # Step 4: Update session with chat_message_id
        session_update_response = (
            supabase.from_("sessions")
            .update({"chat_messages_id": chat_msg_id})
            .eq("id", session_id)
            .execute()
        )

        # Step 5: Fetch and update the question status
        query_response = (
            supabase.from_("questions")
            .select("questions, status")
            .eq("user_id", user_id)
            .execute()
        )

        updated_status = query_response.data[0]["status"]
        updated_status[request.id - 1] = "Started"

        question_status_update_response = (
            supabase.from_("questions")
            .update({"status": updated_status})
            .eq("user_id", user_id)
            .execute()
        )

        # Return success response
        return {
            "message": "Session created and question status updated successfully",
            "sessionId": session_id,
            "chatMessageId": chat_msg_id,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# generate questions
@router.post("/generate_questions")
def chat(data: dict, user: UserResponse = Depends(verify_token)):
    logger.info("Received chat data: " + str(data))
    user_id = data.get("user_id")
    questions_list, conversation_history = generate_initial_questions(user_id)
    logger.info(f"Questions: {questions_list}")
    topics = []
    # generate a topic for each question
    for question in questions_list:
        topic = generate_topic_from_question(question)
        topics.append(topic)

    status_questions = ["Not Started" for question in questions_list]
    # Remove "topics": topics from the upsert object as the column doesn't exist
    upsert_data = {
        "user_id": user_id,
        "questions": questions_list,
        "created_at": "NOW()",
        "status": status_questions,
        # "topics": topics, # Removed this line
    }
    response_questions = (
        supabase.table("questions")
        .upsert(upsert_data, on_conflict=["user_id"])
        .execute()
    )
    logger.info(f"Questions Response: {response_questions}")

    # Still include topics in the response to the frontend if needed by UI
    return {
        "questions": questions_list,
        "conversation": conversation_history,
        "status": status_questions,
        "topics": topics,  # Keep topics in the response if frontend uses it
    }


# init questions from uploaded JSON
@router.post("/init_questions")
def init_questions_from_upload(data: dict, user: UserResponse = Depends(verify_token)):
    logger.info("Received init_questions_from_upload data: " + str(data))
    user_id = data.get("user_id")
    questions_list = data.get("questions")

    if not user_id or not questions_list:
        raise HTTPException(status_code=400, detail="Missing user_id or questions list")

    topics = []
    # generate a topic for each question
    for question in questions_list:
        topic = generate_topic_from_question(question)
        topics.append(topic)

    status_questions = ["Not Started" for _ in questions_list]
    # Remove "topics": topics from the upsert object
    upsert_data_init = {
        "user_id": user_id,
        "questions": questions_list,
        "created_at": "NOW()",
        "status": status_questions,
        # "topics": topics, # Removed this line
    }
    response_questions = (
        supabase.table("questions")
        .upsert(upsert_data_init, on_conflict=["user_id"])
        .execute()
    )
    logger.info(f"Init Questions Response: {response_questions}")

    if response_questions.data:
        # Still include topics in the response
        return {
            "message": "Questions initialized successfully",
            "questions": questions_list,
            "status": status_questions,
            "topics": topics,  # Keep topics in the response
        }
    else:
        logger.error(
            f"Failed to initialize questions for user {user_id}: {response_questions.error}"
        )
        raise HTTPException(status_code=500, detail="Failed to initialize questions")


# get questions
@router.post("/get-questions")
async def get_questions(request: dict, user: UserResponse = Depends(verify_token)):
    user_id = request.get("user_id")

    if not user_id:
        raise HTTPException(status_code=400, detail="Missing user_id or auth_token")

    # Query Supabase
    try:
        response = (
            supabase.table("questions")
            .select("questions, status, topics")  # Attempt to select topics
            .eq("user_id", user_id)
            .execute()
        )
        topics_available = True
    except Exception as e:
        # Check if the error is due to the topics column not existing
        if "column questions.topics does not exist" in str(e).lower():
            logger.warning(
                f"Column 'topics' does not exist in 'questions' table. Fetching without it for user_id: {user_id}"
            )
            response = (
                supabase.table("questions")
                .select("questions, status")  # Fallback: select without topics
                .eq("user_id", user_id)
                .execute()
            )
            topics_available = False
        else:
            logger.error(
                f"An unexpected error occurred while fetching questions for user_id: {user_id}: {e}"
            )
            raise HTTPException(status_code=500, detail="Error fetching questions.")

    # Check for errors from Supabase or if data is None
    if response.data is None:
        logger.error(
            f"Supabase query failed for /get-questions for user_id: {user_id}. Response: {response}"
        )
        raise HTTPException(
            status_code=500, detail="Failed to retrieve questions from database."
        )

    if not response.data:  # Checks if the list is empty
        raise HTTPException(
            status_code=404,
            detail="No questions found. Click 'Generate' to create new questions or 'Upload Questions' to import from a file.",
        )

    data = response.data[0]

    return {
        "questions": data.get("questions", []),
        "status": data.get("status", []),
        "topics": (
            data.get("topics", []) if topics_available else []
        ),  # Return empty list if topics column was not available
    }


# collector chat page - follow up questions
@router.post("/generate_question_response")
def chat_collector(data: dict, user: UserResponse = Depends(verify_token)):
    logger.info("Received user response: " + str(data))
    chat_prompt_id = data.get("chat_prompt_id")
    user_text = data.get("user_text")

    # Validate chat_prompt_id
    if not chat_prompt_id:
        raise HTTPException(status_code=400, detail="Missing chat_prompt_id")

    try:
        # Fetch existing chat messages to validate the chat_prompt_id
        chat_response = (
            supabase.table("chat_messages_collector")
            .select("messages")
            .eq("id", chat_prompt_id)
            .maybe_single()
            .execute()
        )

        if not chat_response.data:
            raise HTTPException(status_code=404, detail="Chat session not found")

        follow_up_question, conversation_history = generate_response_collector(
            chat_prompt_id, user_text
        )
        logger.info(f"follow_up_question: {follow_up_question}")

        # Update the conversation history
        response_questions = (
            supabase.table("chat_messages_collector")
            .update({"messages": conversation_history})
            .eq("id", chat_prompt_id)
            .execute()
        )
        logger.info(response_questions)

        return {"follow_up_question": follow_up_question}
    except Exception as e:
        logger.error(f"Error in chat_collector: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# collector - generate summary
@router.post("/generate_summary")
def chat_summary(data: dict, user: UserResponse = Depends(verify_token)):
    logger.info("Received user response: " + str(data))
    chat_prompt_id = data.get("chat_prompt_id")

    chat_summary = generate_summary_chat(chat_prompt_id)

    return {"chat_summary": chat_summary}


# Collector Summary - update
@router.post("/update_summary")
def update_summary(
    request: CollectorSummaryUpdateSummaryRequest,
    user: UserResponse = Depends(verify_token),
):
    try:
        # 0️⃣ Get company_id from user profile
        profile_response = (
            supabase.table("profiles")
            .select("company_id")
            .eq("id", user.user.id)  # Assuming current user's company context
            .execute()
        )
        if not profile_response.data or not profile_response.data[0].get("company_id"):
            raise HTTPException(
                status_code=400,
                detail="User does not have a company associated with their profile",
            )
        company_id = profile_response.data[0]["company_id"]

        # Step 1: Retrieve the doc_id associated with the session_id
        response = (
            supabase.table("sessions")
            .select("doc_id")
            .eq("id", request.session_id)
            .execute()
        )

        # Step 2: Access the doc_id from the first session record (assuming only one session with the given ID)
        if not response:
            raise HTTPException(status_code=404, detail="Session not found")

        doc_id = response.data[0].get("doc_id")
        if not doc_id:
            raise HTTPException(
                status_code=404, detail="doc_id not found for the session"
            )

        # Step 3: Update the summary in the documents table using the doc_id
        update_response = (
            supabase.table("documents")
            .update({"summary": request.summary_text})
            .eq("doc_id", doc_id)
            .eq("company_id", company_id)  # Filter by company_id
            .execute()
        )

        return {"message": "Summary updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Collector Summary = continue
@router.post("/continue_session", response_model=CollectorSummaryContinueResponse)
def continue_session(
    request: CollectorSummaryContinueRequest, user: UserResponse = Depends(verify_token)
):
    try:
        # Step 1: Retrieve the doc_id associated with the session_id
        response = (
            supabase.table("sessions")
            .select("doc_id")
            .eq("id", request.session_id)
            .execute()
        )

        if not response:
            raise HTTPException(status_code=404, detail="Session not found")

        doc_id = response.data[0].get("doc_id")
        if not doc_id:
            raise HTTPException(
                status_code=404, detail="doc_id not found for the session"
            )

        # Step 2: Update the summary in the documents table
        update_response = (
            supabase.table("documents")
            .update({"summary": request.summary_text})
            .eq("doc_id", doc_id)
            .execute()
        )

        # Return the next navigation data
        return CollectorSummaryContinueResponse(
            message="Summary updated successfully",
            next_page="/applications/collector/CollectorMetaDataPage",
            state={
                "summary_text": request.summary_text,
                "session_id": request.session_id,
                "is_resume": request.is_resume,
            },
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Collector Metadata fetchExistingDocument
@router.post("/fetch_existing_doc")
def fetch_existing_document(data: dict, user: UserResponse = Depends(verify_token)):
    logger.info("Received user request: " + str(data))
    session_id = data.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="Missing sessionId")

    # Step 1: Get doc_id from sessions
    session_response = (
        supabase.table("sessions").select("doc_id").eq("id", session_id).execute()
    )
    session_data = session_response.data

    if not session_data or not session_data[0].get("doc_id"):
        raise HTTPException(status_code=404, detail="No doc_id found for this session")

    doc_id = session_data[0]["doc_id"]
    logger.info(f"Found doc_id: {doc_id}")

    # Step 2: Fetch document details
    doc_response = (
        supabase.table("documents").select("*").eq("doc_id", doc_id).execute()
    )
    doc_data = doc_response.data

    if not doc_data:
        raise HTTPException(status_code=404, detail="Document not found")

    # Get the first document row
    doc_row = doc_data[0]

    logger.info(f"Fetch existing document: {doc_row}")
    return {"document": doc_row}


# Collector meta data - generate tags
@router.post("/generate_tags")
def summary_tags(data: dict, user: UserResponse = Depends(verify_token)):
    logger.info("Received user response: " + str(data))
    text = data.get("text")

    tags = generate_tags_chat(text)
    logger.info(f"generated tags: {tags}")

    return {"tags": tags}


# Collector meta data - get validators
@router.get("/get_validators")
async def get_validators(user: UserResponse = Depends(verify_token)):
    try:
        # Fetch data from 'profiles' table where 'isValidator' is True
        response = (
            supabase.from_("profiles")
            .select("id, full_name")
            .eq("isValidator", True)
            .execute()
        )

        # Return the data
        return {"validators": response.data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching data: {str(e)}")


# Collector meta data - update session and document (submit)
@router.post("/update_session_and_document")
async def update_session_and_document(
    data: dict, user: UserResponse = Depends(verify_token)
):
    session_id = data.get("session_id")
    tags = data.get("tags", [])
    contact = data.get("contact", "")
    source_link = data.get("source_link", "")
    document_title = data.get("document_title", "")
    validator_id = data.get("validator_id", "")
    severity = data.get("severity", "")
    user_id = data.get("user_id", "")

    if not session_id or not tags or not document_title or not user_id:
        raise HTTPException(status_code=400, detail="Missing required parameters")

    try:
        # 0️⃣ Get company_id from the profile of the user passed in `user_id` (author_id)
        # This is because the document belongs to the author's company.
        profile_response = (
            supabase.table("profiles")
            .select("company_id")
            .eq("id", user_id)  # Use user_id from the request data
            .execute()
        )
        if not profile_response.data or not profile_response.data[0].get("company_id"):
            raise HTTPException(
                status_code=400,
                detail=f"User {user_id} does not have a company associated with their profile",
            )
        company_id = profile_response.data[0]["company_id"]

        # Step 1: Update the status of the session to "Completed"
        session_update_response = (
            supabase.table("sessions")
            .update({"status": "Completed"})
            .eq("id", session_id)
            .execute()
        )

        # Step 2: Retrieve the doc_id for the given session_id
        session_data = (
            supabase.table("sessions").select("doc_id").eq("id", session_id).execute()
        )

        # Assuming only one session returned
        doc_id = session_data.data[0]["doc_id"] if session_data.data else None
        if not doc_id:
            raise HTTPException(
                status_code=404, detail="No doc_id found for the session"
            )

        # Step 3: Update the document with the new data
        document_update_response = (
            supabase.table("documents")
            .update(
                {
                    "tags": json.dumps(tags),
                    "employee_contact": contact,
                    "link": source_link,
                    "title": document_title,
                    "responsible": validator_id,
                    "severity_levels": severity,
                    "status": "Pending",
                    "author_id": user_id,
                    # company_id is not updated here, it's used for filtering
                }
            )
            .eq("doc_id", doc_id)
            .eq("company_id", company_id)  # Filter by company_id
            .execute()
        )

        if document_update_response.data:
            return {"message": "Session and document updated successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to update document")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error submitting data: {str(e)}")
