# docstring

import logging
import os
import pickle

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def search_cache_for_answer(question):
    """search saved Q/A

    Args:
        question (string): Asked Question

    Returns:
        string: saved response corresponding to the question
    """

    cache_file_path = "qa_cache.pkl"  # Path to the cache file

    # Check if the cache file exists
    if os.path.exists(cache_file_path):
        # Open the cache file and search for the question
        logger.info("A cache file found")
        with open(cache_file_path, "rb") as file:
            qa_cache = pickle.load(file)
            for q, a in qa_cache:
                if (
                    q.lower() == question.lower()
                ):  # Check if the current cached question matches the input
                    logger.info("A cached answer found")
                    return a  # Return the cached answer
    else:
        logger.info("No cache file found")
        return None


def cache_question_answer(question: str, answer: str):
    """Save Q/A into the cache

    Args:
        question (str):
        answer (str):
    """
    cache_file_path = "qa_cache.pkl"  # File path for the cache file
    # Check if the cache file already exists
    if os.path.exists(cache_file_path):
        # Load existing cache data
        with open(cache_file_path, "rb") as file:
            qa_cache = pickle.load(file)
    else:
        # Initialize an empty list if the file does not exist
        qa_cache = []

    # Append the new question-answer pair
    qa_cache.append((question, answer))

    # Write the updated data back to the file
    with open(cache_file_path, "wb") as file:
        pickle.dump(qa_cache, file)
