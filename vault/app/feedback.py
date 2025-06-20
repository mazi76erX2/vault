import os
import json

from app.cache import cache_question_answer
from datetime import datetime

def fn_report(comment_report, history):
    """report wrong or inaccurate Chatbot responses

    Args:
        comment_report (string): user comment
        history (List of Lists): chatbot conversation history

    Returns:
        gradio: gradio components
    """
    last_answer = history[-1][1]
    last_question = history[-1][0]
    timestamp = datetime.now().isoformat()  # Generate a timestamp for the report

    try:
        # Check if the file exists and has size greater than 0
        if os.path.exists("rlhf.json") and os.path.getsize("rlhf.json") > 0:
            with open("rlhf.json", 'r') as file:
                data = json.load(file)
                index = len(data) + 1  # New index as the length of current data + 1
        else:
            data = []
            index = 1  # Start indexing from 1 if file is new or empty

        # Append new data entry with index and timestamp
        data.append({
            "index": index,
            "timestamp": timestamp,
            "User question": last_question,
            "Assistant answer": last_answer,
            "User comment": comment_report
        })

        # Write the updated data back to the file
        with open("rlhf.json", 'w') as file:
            json.dump(data, file, indent=4)
        return gr.Textbox(value=""), gr.Accordion(visible=False, open=False)
    except FileNotFoundError:
        # Initialize data if the file does not exist
        data = [{
            "index": 1,
            "timestamp": timestamp,
            "User question": last_question,
            "Assistant answer": last_answer,
            "User comment": comment_report
        }]
        with open("rlhf.json", 'w') as file:
            json.dump(data, file, indent=4)



def fn_save(last_question, last_answer):
    """Save Q/A

    Args:
        last_question (string):
        last_answer (string):

    Returns:
        gradio: gradio component
    """
    cache_question_answer(last_question, last_answer)
    return gr.Textbox(value=""), gr.Textbox(value=""), gr.Accordion(visible=False, open=False)

def fn_thumbs_down_rlhf():
    return gr.Accordion(visible=True, open=True), gr.Accordion(open=False), gr.Accordion(open=False)

def fn_thumbs_up_rlhf(history):
    last_answer = history[-1][1]
    last_question = history[-1][0]
    return gr.Textbox(value=last_question), gr.Textbox(value=last_answer), gr.Accordion(visible=True, open=True), gr.Accordion(open=False), gr.Accordion(open=False)