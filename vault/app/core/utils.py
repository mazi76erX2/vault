import gradio as gr
from chat import generate_summary_chat, generate_tags_chat
from docx2python import docx2python

from app.database import get_all_managers

levels_txt_int_map = {"Low": 1, "Medium": 2, "High": 3, "Critical": 4}

levels_int_text_map = {1: "Low", 2: "Medium", 3: "High", 4: "Critical"}


def show_summary(chatbot_history, radio_validation):
    chat_summary, _, validation_report = generate_summary_chat(chatbot_history, radio_validation)
    return gr.Textbox(chat_summary), gr.Textbox(validation_report)


def generate_tags(chatbot_sum):
    suggested_tags = generate_tags_chat(chatbot_sum)
    return gr.Markdown(value=" ".join([f"`{tag}`" for tag in suggested_tags])), gr.Textbox(
        suggested_tags
    )


def get_plain_text_from_markdown(markdown_str):
    """
    Converts the Markdown Q/A format back into plain Q/A lines.

    Expected Markdown format (simplified):

        **Q: Could you compare your experiences...?**

        A: At  Group, the focus was...
        A: ...

        **Q: What are some of the challenges...?**

        A: Major challenges included...
        ...

    Returns lines like:

        Q: Could you compare your experiences...?
        A: At  Group, the focus was...
        A: ...
        Q: What are some of the challenges...?
        A: Major challenges included...
        ...

    This function removes the Markdown bold formatting,
    and restores "Q:" and "A:" lines for your summary text.
    """
    lines = markdown_str.split("\n")
    plain_text_lines = []

    # Track whether we're currently accumulating answer lines
    in_answer = False
    current_answer = []

    for line in lines:
        stripped_line = line.strip()

        # Identify a line starting with **Q: or **Question:
        if stripped_line.startswith("**Q:") or stripped_line.startswith("**Question:"):
            # If we were previously accumulating an answer, finalize it
            if in_answer:
                plain_text_lines.append(" ".join(current_answer))
                in_answer = False
                current_answer = []

            # Remove bold markers and restore the original Q:
            # e.g. "**Q: Something**" -> "Q: Something"
            restored_line = stripped_line.replace("**", "")
            plain_text_lines.append(restored_line)

        # Identify a line starting with **A: or **Answer:
        elif stripped_line.startswith("A:") or stripped_line.startswith("Answer:"):
            # Finalize previous answer if needed
            if in_answer:
                plain_text_lines.append(" ".join(current_answer))

            # Start accumulating a new answer block
            in_answer = True
            current_answer = [stripped_line.replace("**", "")]

        # If we're in an answer block and encounter a normal line, accumulate it
        elif in_answer and stripped_line:
            # Remove any leftover "**" just in case
            current_answer.append(stripped_line.replace("**", ""))

        # Ignore blank lines or lines that do not match Q/A format

    # Finalize any leftover answer block
    if in_answer and current_answer:
        plain_text_lines.append(" ".join(current_answer))

    # Join everything with newlines
    return "\n".join(plain_text_lines)


def get_info_markdown_txt(text):
    """
    Converts a string containing Q/A pairs into formatted Markdown.

    Parameters:
    - text (str): The input string containing questions and answers separated by newlines.

    Returns:
    - str: The formatted Markdown string.
    """
    # Split the input string into lines
    text_list = text.split("\n")

    # Initialize an empty list to store formatted markdown content
    markdown_content = []

    # Initialize variables to track if we're in an answer block
    in_answer = False
    current_answer = []

    # Iterate over the text list to identify Q/A pairs
    for line in text_list:
        stripped_line = line.strip()
        if stripped_line.startswith("Q:") or stripped_line.startswith("Question:"):
            # If we encounter a new question, finalize the current answer (if any)
            if in_answer:
                markdown_content.append(" ".join(current_answer))
                in_answer = False
                current_answer = []

            # Add the question in bold
            markdown_content.append(f"**{stripped_line}**")

        elif stripped_line.startswith("A:") or stripped_line.startswith("Answer:"):
            # If it's the start of an answer, set the in_answer flag
            if in_answer:
                # Finalize the previous answer before starting a new one
                markdown_content.append(" ".join(current_answer))

            in_answer = True
            current_answer = [stripped_line]

        elif in_answer:
            # If we're in an answer block, append the current line to the answer
            current_answer.append(stripped_line)

    # Finalize any remaining answer
    if in_answer:
        markdown_content.append(" ".join(current_answer))
        markdown_content.append("---")  # Add a separator after the last answer

    # Join the content with double newlines for proper Markdown formatting
    return "\n\n".join(markdown_content)


def get_info_mrkdwn(text_list):
    # Initialize an empty list to store formatted markdown content
    markdown_content = []

    # Initialize variables to track if we're in an answer block
    in_answer = False
    current_answer = []

    # Iterate over the text list to identify Q/A pairs
    for line in text_list:
        stripped_line = line.strip()
        if stripped_line.startswith("Q:") or stripped_line.startswith("Question:"):
            # If we encounter a new question, finalize the current answer (if any)
            if in_answer:
                markdown_content.append(" ".join(current_answer))

                in_answer = False
                current_answer = []

            # Add the question in bold
            markdown_content.append(f"**{stripped_line}**")

        elif stripped_line.startswith("A:") or stripped_line.startswith("Answer:"):
            # If it's the start of an answer, set the in_answer flag
            if in_answer:
                # Finalize the previous answer before starting a new one
                markdown_content.append(" ".join(current_answer))

            in_answer = True
            current_answer = [stripped_line]

        elif in_answer:
            # If we're in an answer block, append the current line to the answer
            current_answer.append(stripped_line)

    # Finalize any remaining answer
    if in_answer:
        markdown_content.append(" ".join(current_answer))
        markdown_content.append("---")

    # Join the content with newlines
    return "\n\n".join(markdown_content)


def generate_markdown_from_info(extracted_info):
    # Generate the markdown content using the extracted information

    managers = get_all_managers()
    # Transforming the list into the desired dictionary format
    managers_dict = {
        manager["Manager_id"]: {
            "username": manager["username"],
            "manager_mail": manager["manager_mail"],
            "manager_name": manager["manager_name"],
        }
        for manager in managers
    }
    markdown_content = f"""
                            # Document Title: {extracted_info["title"]}
                            **Status**: {extracted_info["status"]}
                            **Document ID**: {extracted_info["doc_id"]}
                            **Designated Manager**: {managers_dict[int(extracted_info["mng_id"])]["manager_name"]}
                            **Comment**: {extracted_info["comment"]}
                            **Author**: {extracted_info["employee_contact"]}
                            **Security Level**: {levels_int_text_map[int(extracted_info["level"])]}
                        """

    return markdown_content


def extract_text_with_docx2python(file_path):
    try:
        # Extract text using docx2python
        content = docx2python(file_path)

        # content.body is a nested list structure
        # Flatten the nested structure to get all paragraphs
        paragraphs = []
        for section in content.body:
            for page in section:
                for column in page:
                    for paragraph in column:
                        paragraphs.append(paragraph)

        # Join paragraphs into a single string
        text_content = "\n".join(paragraphs)
        return text_content

    except IndexError:
        print("Error processing the file: The file is a form")
        return ""
    except Exception as e:
        print(f"An error occurred: {e}")
        return ""
