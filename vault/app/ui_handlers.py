import json
import os

import pandas as pd
from connectors.store_data_in_kb import (
    store_confluence_in_azure_kb,
    store_in_azure_kb,
    store_sharepoint_in_azure_kb,
)
from email_utils import send_email_graph
from utils import generate_markdown_from_info, get_info_markdown_txt, get_plain_text_from_markdown

from app.database import (
    add_session,
    get_user_session_by_id,
    refresh_displayed_docs,
    update_document,
    update_session,
    update_user,
)

CLIENT_ID = os.environ["CLIENT_ID"]
CLIENT_SECRET = os.environ["CLIENT_SECRET"]
TENANT_ID = os.environ["TENANT_ID"]


def upload_prev_questions(user_state):
    # upload the user information
    # display the stored questions in the Suggested questions dropdown
    # disable the generate init questions and Select questions catalogue
    questions_list = user_state["suggested_questions"].split("|")

    return (
        gr.Dropdown(choices=questions_list, value=questions_list[0]),
        gr.File(interactive=False),
        gr.Button(interactive=False),
        user_state,
    )


def add_tag(existing_tags, new_tag):
    existing_tags = eval(existing_tags)
    if new_tag and new_tag not in existing_tags:
        existing_tags.append(new_tag)  # Add new tag if it's not already in the list
    tags_markdown = " ".join(
        [f"`{tag}`" for tag in existing_tags]
    )  # Convert list to Markdown format
    return tags_markdown, existing_tags, gr.Textbox("")  # Return updated Markdown and tag list


def go_to_resume_session(previous_session):
    global current_session, conversation_history
    session_id = sessions_dict[previous_session]["user_session_id"]
    current_session = get_user_session_by_id(session_id)[0]
    conversation_history = json.loads(current_session["chatbot_prompts"])
    json_compatible_str = current_session["tags"].replace("'", '"')
    return (
        gr.Tabs(selected="1"),
        gr.Chatbot(json.loads(current_session["chatbot_conversation"])),
        gr.Textbox(current_session["summary"]),
        gr.Textbox(current_session["tags"]),
        gr.Markdown(value=" ".join([f"`{tag}`" for tag in json.loads(json_compatible_str)])),
        gr.Textbox(current_session["designated_employee"]),
        gr.Textbox(current_session["url_reference"]),
        gr.Textbox(current_session["document_title"]),
        gr.Dropdown(value=current_session["validation_responsible"]),
        gr.Dropdown(value=current_session["severity_levels"]),
    )


def go_initial_info():
    return (
        gr.Tabs(selected="login"),
        gr.Dropdown(choices=[]),
        gr.Textbox(value=""),
        gr.Textbox(value=""),
        gr.Textbox(value=""),
        gr.Textbox(value=""),
        gr.File(value=None),
        gr.Textbox(value=""),
        gr.Textbox(value=""),
    )


def go_to_metadata_tab(chat_history, state):
    # store the conversation in db
    update_session(current_session["id"], summary=chat_history)
    return gr.Tabs(selected="3")


def radio_change(radio):
    is_visible = False
    if radio == "Yes":
        is_visible = True
    return gr.Textbox(visible=is_visible), gr.Accordion(open=is_visible, visible=is_visible)


def go_to_validation_tab():
    return gr.Tabs(selected="2")


def go_to_chatbot_tab(initial_question, state):
    # create a new session in sessions table
    current_session_id, str_info = add_session(user_glb["id"])
    get_user_session_by_id(current_session_id)[0]
    gr.Info(str_info, duration=1)
    history = [(initial_question, "")]
    if len(conversation_history) == 0:
        # Define the chatbot's system message
        system_message = {
            "role": "system",
            "content": (
                "You are a dynamic and engaging chatbot designed to collect knowledge and experiences from employees. "
                "Your role is to guide employees through a structured conversation to capture valuable insights, best practices, "
                "problem-solving techniques, and technical knowledge. You should ask open-ended questions, prompt for details, "
                "and use dynamic follow-ups to gather as much useful information as possible. Be friendly, supportive, and show "
                "appreciation for the employee’s contributions."
            ),
        }
        # Initialize conversation history with system message
        conversation_history = [system_message]
    conversation_history.append({"role": "assistant", "content": initial_question})
    return gr.Tabs(selected="1"), gr.Chatbot(value=history)


def go_to_questions(coworker_name, coworker_crt_role, coworker_dmn_expertise, coworker_yrs_exp):
    # update the user sql db
    update_info = update_user(
        user_glb["id"],
        new_name=coworker_name,
        current_role=coworker_crt_role,
        expertise_domain=coworker_dmn_expertise,
        experience_years=coworker_yrs_exp,
    )
    gr.Info(update_info, duration=2)
    return gr.Tabs(selected="tab_projects")


def on_select(evt: gr.SelectData):
    global mng_doc_list
    global selected_doc
    content = ""
    doc_info = ""

    if len(mng_doc_list) > 0:
        _, _ = refresh_displayed_docs()
        content = generate_markdown_from_info(mng_doc_list[evt.index[0]])

        tags = [tag.strip() for tag in mng_doc_list[evt.index[0]]["tags"].split(",")]
        doc_info = get_info_markdown_txt(mng_doc_list[evt.index[0]]["summary"])
        selected_doc = mng_doc_list[evt.index[0]]
        return (
            gr.Markdown(content),
            gr.Markdown(value=" ".join([f"`{tag}`" for tag in tags])),
            gr.Markdown(doc_info),
        )
    else:
        return gr.Markdown(content), gr.Markdown(value=" "), gr.Markdown(doc_info)


def on_select_verifier(evt: gr.SelectData):
    global verifier_doc_list
    global selected_doc
    content = ""
    doc_info = ""

    if len(verifier_doc_list) > 0:
        _, _ = refresh_displayed_docs()
        content = generate_markdown_from_info(verifier_doc_list[evt.index[0]])

        tags = [tag.strip() for tag in verifier_doc_list[evt.index[0]]["tags"].split(",")]
        doc_info = get_info_markdown_txt(verifier_doc_list[evt.index[0]]["summary"])
        selected_doc = verifier_doc_list[evt.index[0]]
        return (
            gr.Markdown(content),
            gr.Markdown(value=" ".join([f"`{tag}`" for tag in tags])),
            gr.Markdown(doc_info),
        )
    else:
        return gr.Markdown(content), gr.Markdown(value=" "), gr.Markdown(doc_info)


def fn_validate(info, comment):
    selected_doc
    # todos:
    # change the summary with the info
    selected_doc["summary"] = get_plain_text_from_markdown(info)

    if comment == "":
        comment = None
    update_document(selected_doc["doc_id"], status="validated - Stored", comment=comment)
    doc_to_store = {
        "file_name": selected_doc["path"],
        "content": selected_doc["summary"],
        "file_title": selected_doc["title"],
        "level": selected_doc["level"],
    }

    # store in KB
    store_in_azure_kb(doc_to_store)
    gr.Info("Document validated and stored in the Knowledge Base")
    mng_doc_ids_data, verifier_doc_ids_data = refresh_displayed_docs()
    if len(verifier_doc_ids_data) == 0:
        verifier_doc_ids_data = pd.DataFrame([{"Documents": "No Documents Available"}])
    if len(mng_doc_ids_data) == 0:
        mng_doc_ids_data = pd.DataFrame([{"Documents": "No Documents Available"}])
    return (
        gr.Dataframe(value=mng_doc_ids_data, headers=["Documents"]),
        gr.Dataframe(value=verifier_doc_ids_data, headers=["Documents"]),
        gr.Textbox(""),
        gr.Markdown(""),
        gr.Markdown(""),
        gr.Markdown(""),
    )


def fn_validate_user(info, comment):
    selected_doc
    # todos:
    # differenciate between validate manager and validate and send back to manager
    if comment == "":
        comment = None

    update_document(
        selected_doc["doc_id"],
        status="Validated - Awaiting Approval",
        summary=get_plain_text_from_markdown(info),
        comment=comment,
    )

    gr.Info("Document validated and waiting to be store in the Knowledge Base")
    mng_doc_ids_data, verifier_doc_ids_data = refresh_displayed_docs()
    if len(verifier_doc_ids_data) == 0:
        verifier_doc_ids_data = pd.DataFrame([{"Documents": "No Documents Available"}])
    if len(mng_doc_ids_data) == 0:
        mng_doc_ids_data = pd.DataFrame([{"Documents": "No Documents Available"}])

    else:
        return (
            gr.Textbox(""),
            gr.Markdown(""),
            gr.Markdown(""),
            gr.Markdown(""),
            gr.Dataframe(value=mng_doc_ids_data, headers=["Documents"]),
            gr.Dataframe(value=verifier_doc_ids_data, headers=["Documents"]),
        )


def modify_info(text):
    return (
        gr.Markdown(visible=False),
        gr.Textbox(text, visible=True),
        gr.Button(visible=False),
        gr.Button(visible=True),
    )


def apply_modify_info(text):
    # save the modification
    # here add a function that update the doc in db
    info_string = update_document(
        selected_doc["doc_id"], summary=get_plain_text_from_markdown(text)
    )
    gr.Info(info_string, duration=1)

    return (
        gr.Markdown(text, visible=True),
        gr.Textbox(text, visible=False),
        gr.Button(visible=True),
        gr.Button(visible=False),
    )


def reject_doc(comment):
    global mng_doc_ids_data, verifier_doc_ids_data, glb_username

    # check if there is a comment otherwise ask for it
    if comment != "":
        # update_status_in_file(selected_doc["path"], "rejected")
        # update_comment_in_file(selected_doc["path"], comment)
        # ADapt with DB
        info_text = update_document(selected_doc["doc_id"], status="rejected", comment=comment)
        gr.Info(info_text, duration=1)
        mng_doc_ids_data, verifier_doc_ids_data = refresh_displayed_docs()
        if len(verifier_doc_ids_data) == 0:
            verifier_doc_ids_data = pd.DataFrame([{"Documents": "No Documents Available"}])
        if len(mng_doc_ids_data) == 0:
            mng_doc_ids_data = pd.DataFrame([{"Documents": "No Documents Available"}])

        return (
            gr.Dataframe(value=mng_doc_ids_data, headers=["Documents"]),
            gr.Dataframe(value=verifier_doc_ids_data, headers=["Documents"]),
            gr.Textbox(""),
        )
    else:
        gr.Info("A comment is mandatory")
        return gr.Dataframe(), gr.Dataframe(), gr.Textbox("")


def delegate_fn(comment, user):
    global mng_doc_ids_data, username
    info_str = update_document(
        selected_doc["doc_id"], Reviewer=users_dict[user]["id"], status="on review", comment=comment
    )
    gr.Info(info_str, duration=1)

    # rename_file_pathlib(selected_doc, user)

    mng_doc_ids_data, ver_doc_ids_data = refresh_displayed_docs()
    if len(ver_doc_ids_data) == 0:
        ver_doc_ids_data = pd.DataFrame([{"Documents": "No Documents Available"}])
    if len(mng_doc_ids_data) == 0:
        mng_doc_ids_data = pd.DataFrame([{"Documents": "No Documents Available"}])

    subject = " Vault Validation Process"
    body = "You have a new document to verify"

    send_email_graph(
        CLIENT_ID,
        CLIENT_SECRET,
        TENANT_ID,
        args.sender_email,
        users_dict[user]["mail"],
        subject,
        body,
    )

    return (
        gr.Dataframe(value=mng_doc_ids_data, headers=["Documents"]),
        gr.Dataframe(value=ver_doc_ids_data, headers=["Documents"]),
        gr.Textbox(""),
        gr.Dropdown(choices=[]),
    )


def fn_connector_drop(selected_connector):
    if selected_connector == "Confluence":
        return gr.Accordion(visible=True), gr.Accordion(visible=False), gr.Accordion(visible=False)
    elif selected_connector == "SharePoint":
        return gr.Accordion(visible=False), gr.Accordion(visible=True), gr.Accordion(visible=False)
    elif selected_connector == "Custom":
        return gr.Accordion(visible=False), gr.Accordion(visible=False), gr.Accordion(visible=True)


def fn_tab_manager():
    return gr.Button(interactive=True), gr.Button(interactive=False), gr.Button(interactive=True)


def fn_tab_reviewer():
    return gr.Button(interactive=False), gr.Button(interactive=True), gr.Button(interactive=False)


def fn_connect_confluence(url, user, api, keyspace, index):
    store_confluence_in_azure_kb(url, user, api, keyspace, index)
    gr.Info("Confluence Documents stored in the Knowledge Base")
    return gr.Textbox(""), gr.Textbox(""), gr.Textbox(""), gr.Textbox(""), gr.Textbox("")


def fn_connect_sharepoint(hostname, sitepath, index):
    store_sharepoint_in_azure_kb(hostname, sitepath, index)
    gr.Info("SharePoint Documents stored in the Knowledge Base")
    return gr.Textbox(""), gr.Textbox(""), gr.Textbox("")
