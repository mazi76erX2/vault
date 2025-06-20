import logging

from fastapi import APIRouter
from fastapi.params import Depends
from gotrue import UserResponse

from app.chat import generate_response_helper
from app.database import supabase
from app.middleware.auth import verify_token

router = APIRouter(prefix="/api/v1/helper", tags=["collector"])
logger = logging.getLogger(__name__)


@router.post("/add_new_chat_session")
def add_new_chat_session(data: dict, user: UserResponse = Depends(verify_token)):
    logger.info("Received user response: " + str(data))
    user_id = data.get("user_id")
    chat_id = None
    try:
        # Insert the user_id into the table
        response = (
            supabase.table("chat_messages_helper")
            .insert({"user_id": user_id})
            .execute()
        )  # Ensure you call `execute()` to perform the operation

        # Extract the `chat_id` from the response if it exists
        if response and response.data:
            chat_id = response.data[0].get(
                "id"
            )  # Assuming the chat_id is returned in the inserted row
            logger.info(f"Insert successful. chat_id: {chat_id}")
        else:
            logger.warning("Insert succeeded but no chat_id was returned.")

    except Exception as e:
        # Handle any exceptions
        logger.error(f"Error inserting chat message: {e}")
        raise

    return {"helper_chat_id": chat_id}


@router.post("/get_helper_chat_message")
def get_helper_chat_message(data: dict, user: UserResponse = Depends(verify_token)):
    logger.info("Received user response: " + str(data))
    chat_id = data.get("chat_id")

    try:
        # Get all
        response = (
            supabase.table("chat_messages_helper")
            .select("messages")
            .eq("id", chat_id)
            .execute()
        )

        # Extract the `chat_id` from the response if it exists
        logger.info(f"Previous chat successfully retrieved: {response.data}")

    except Exception as e:
        # Handle any exceptions
        logger.error(f"Error fetching the chat: {e}")
        raise

    return {"message": response.data}


@router.post("/generate_answer_response")
def chat_helper(data: dict, user: UserResponse = Depends(verify_token)):
    logger.info("Received user response: " + str(data))
    user_id = data.get("user_id")
    user_text = data.get("user_text")
    chat_id = data.get("chat_id")

    history = (
        supabase.table("chat_messages_helper")
        .select("messages")
        .eq("id", chat_id)
        .execute()
    )

    history = history.data[0]["messages"]
    if history is None:
        history = []

    helper_response, confidence, md_text_formatted, history = generate_response_helper(
        user_id, user_text, history
    )
    logger.info(f"Helper response: {helper_response}")

    # update the messages column with history value of supabase table
    response_questions = (
        supabase.table("chat_messages_helper")
        .update({"messages": history})
        .eq("id", chat_id)
        .execute()
    )
    logger.info(response_questions)

    return {
        "helper_response": helper_response,
        "confidence": confidence,
        "md_text_formatted": md_text_formatted,
    }


@router.post("/get_previous_chats")
def get_previous_chats(data: dict, user: UserResponse = Depends(verify_token)):
    logger.info("Received user response: " + str(data))
    user_id = data.get("user_id")

    try:
        # Get all
        response = (
            supabase.table("chat_messages_helper")
            .select("*")
            .eq("user_id", user_id)
            .execute()
        )

        # Extract the `chat_id` from the response if it exists
        logger.info(f"Previous chat successfully retrieved: {response.data}")

    except Exception as e:
        # Handle any exceptions
        logger.error(f"Error fetching the profiles: {e}")
        raise

    return {"get_previous_chats": response}


@router.get("/user_maps")
def add_user_maps(user: UserResponse = Depends(verify_token)):
    try:
        # Get the id and full_name of the profiles table
        response = supabase.table("profiles").select("id", "full_name").execute()

        # Extract the `chat_id` from the response if it exists
        logger.info(f"fetched successfully: {response.data}")

    except Exception as e:
        # Handle any exceptions
        logger.error(f"Error fetching the profiles: {e}")
        raise

    return {"user_maps": response}
