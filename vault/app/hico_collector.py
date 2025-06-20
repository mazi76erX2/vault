

import logging
import os
import argparse

from state_manager import state_manager
from ui_handlers import go_to_chatbot_tab, radio_change, go_to_metadata_tab, go_to_questions, go_to_validation_tab, go_to_resume_session, go_initial_info, upload_prev_questions, add_tag
from utils import generate_tags
from chat import update_conversation, generate_summary_chat, initial_question_catalogue
from app.database import  get_all_managers, store_in_kb
from document import generate_init_questions


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main(args):
    logger.info("Starting the HICO Confluence RAG BOT App ... ")


    # Initiate the first conversation
    with gr.Blocks(title="HICO VAULT Collector",
                   theme=gr.themes.Default(primary_hue=gr.themes.colors.orange,
                                           secondary_hue=gr.themes.colors.orange)) as demo:
        state = gr.State(state_manager.get_state())
        with gr.Row():
            gr.Markdown(
            """
            ## Welcome to HICO Group's Knowledge Sharing Chatbot! 🤖

            This chatbot is designed to help collect valuable information that will facilitate knowledge transfer between coworkers.
            By sharing your insights and experiences, you contribute to building a robust knowledge base that supports new and existing team members.

            We appreciate your contribution and are here to assist you! 😊
            """)
            gr.HTML(value="<img app='/file=images/hico_logo_1.png' style='width: 25%; float: right;' >")
        with gr.Row():
            with gr.Tabs(selected="login") as tabs:
                tab_Login = gr.Tab("User Login", id = "login")
                with tab_Login:
                    login_username = gr.Textbox(label="Username")
                    login_password = gr.Textbox(label="Password", type="password")
                    login_button = gr.Button("Login")


                tab_info = gr.Tab("Initial Information", visible=False, id = "0")
                with tab_info:
                    with gr.Row():
                        gr.Markdown(
                        """
                        **To get started, please provide the following details:**
                        - **Your Name** 📝
                        - **Your Current Role** 💼
                        - **Years of Experience** ⏳
                        - **Domain of Expertise** 🔍
                        - **Upload a Document** 📝

                        Once you've shared these details, feel free to answer the questions posed by the chatbot to help us gather more insights! 🚀

                        We appreciate your contribution and are here to assist you! 😊
                        """)
                        upload_doc = gr.File(label="Upload a File (CV or Job Description)", file_types=[".txt", ".pdf", ".docx"])
                    with gr.Row():
                        coworker_name = gr.Textbox(label="Your Name", placeholder="Write your Name")
                        coworker_crt_role = gr.Textbox(label="Your Current Role", placeholder="Write your current role")
                        coworker_dmn_expertise = gr.Textbox(label="Your Domain of Expertise", placeholder="Write your domain of expertise")
                        coworker_yrs_exp = gr.Textbox(label="Years of Experience ", placeholder="provide your years of experience")
                    with gr.Row():
                        btn_next_step = gr.Button(value="Launch the Process")


                tab_projects = gr.Tab("Investigation", visible=False, id = "tab_projects")
                with tab_projects:
                    gr.Markdown(
                            """
                            ## Choose a Starting Point
                            To kick off the knowledge-sharing process, please select one of the following initial questions to begin the interview:
                            > **Note:** The selected question will guide the conversation and help us gather detailed insights from your experience. You can always choose to explore additional questions later in the process.
                            ### Start the Interview
                            Once you’ve chosen a question, click the **Start the Interview** button below to begin the chat. The chatbot will guide you through a series of follow-up questions based on your initial selection.
                            """)
                    with gr.Row():
                        with gr.Accordion(label="Previous Session"):
                            sessions_dropdown = gr.Dropdown(choices=[], label="Previous Sessions", interactive=True)
                            btn_previous_session = gr.Button(value="Resume the previous process")
                        with gr.Column():
                            btn_upload_previous_info = gr.Button("Upload Stored Questions")
                            btn_generate_init_questions = gr.Button("Generate Initial Questions")
                            upload_question_catalogue = gr.File(label="Select a Question Catalogue", file_types=[".json"])

                            questions = gr.Dropdown(choices=[""], label="Suggested questions", interactive=True)
                            
                            btn_start_chatbot = gr.Button("Start the Chat")


                        btn_finish = gr.Button("Stop the Interview")

                tab_chatbot =  gr.Tab("The chatbot", visible=False, id = "1")
                with tab_chatbot:
                    history = []
                    with gr.Column():
                        with gr.Row():
                            chatbot = gr.Chatbot(value=history)  # Initialize with the first question

                    with gr.Column():
                        with gr.Row():
                            msg = gr.Textbox(label="User's Answer")
                            with gr.Column():
                                submit_msg = gr.Button(value="Submit the answer")
                        btn_go_to_validation = gr.Button("Proceed")
                tab_validation = gr.Tab("The summary", visible=False, id = "2")
                with tab_validation:
                    with gr.Row():
                        # gr.Markdown(
                        # """
                        #     ### Summarize Content Using the Pyramid Principle and IBCS Rules

                        #     To create a summary following the Pyramid Principle by Barbara Minto, and in line with IBCS rules, adhere to the following steps:

                        #     1. **Start with the Main Message**: Begin the summary with the primary answer or key message.
                        #     2. **Logically Group Supporting Arguments**: Organize all supporting points under the main message in a coherent and logical order.
                        #     3. **Substantiate Each Point with Evidence**: Ensure that every supporting argument is backed by relevant evidence or data.
                        #     4. **Use a Hierarchical Pyramid Structure**: Arrange the content in a pyramid format, starting with a top-level summary statement, followed by clusters of related supporting points.
                        #     5. **Focus on Clarity, Conciseness, and Logical Flow**: Aim for a structured summary that is easy to understand, brief, and logically arranged, making it suitable for a business presentation or report.

                        # """)
                        with gr.Row():
                            chat_history = gr.Textbox(label="Extracted Information", value="", interactive=True)
                            with gr.Column():
                                radio_check = gr.Radio(label="Validate with the Knowledge Base", choices=["Yes", "No"], value="No")
                                accordion_validation = gr.Accordion(open=False, visible=False)
                                with accordion_validation:
                                    txtbox_validation = gr.Textbox(label="Check the answer", visible=False, interactive=True)


                    btn_generate_summary = gr.Button("Generate the Summary")
                    #drd_q_a = gr.Dropdown(choices=[0, 1], label="Select Q/A", visible=False, interactive=True)
                    btn_go_metadat = gr.Button("Validate")
                tab_metadata = gr.Tab("The metadata", visible=False, id = "3")
                with tab_metadata:
                    with gr.Row():
                        with gr.Column():
                            #drop_weights = gr.Dropdown(choices=["Low", "Medium", "High", "Critical"], value="Low", label="Confidence Levels")
                            drop_levels = gr.Dropdown(choices=["Low", "Medium", "High", "Critical"], value="Low", label="Severity Levels")
                            tags = []
                            with gr.Accordion():
                                tags_display = gr.Markdown(value=" ".join([f"`{tag}`" for tag in tags]))
                                btn_generate_tags = gr.Button("Generate the Tags")
                                new_tag_input = gr.Textbox(label="Add a new tag:")
                                # Button to trigger adding a new tag
                                add_button = gr.Button("Add Tag")
                        with gr.Column():
                            tags = gr.Textbox(label="Tags", placeholder="Add tags or keywords related to the shared knowledge.", interactive=True, visible=False)
                            reference_employee = gr.Textbox(label="Designated Employee Contact", placeholder="Add the designated employee(s) contact(s).", interactive=True)
                            reference_links = gr.Textbox(label="Source/Information Reference", placeholder="Add the link to the source information.", interactive=True)
                            title = gr.Textbox(label='Document title', placeholder="Choose the Doc Title", interactive=True)
                            global managers_dict
                            managers = get_all_managers()                         
                            # Transforming the list into the desired dictionary format
                            managers_dict = {
                                manager['manager_name']: {
                                    'Manager_id': manager['Manager_id'],
                                    'manager_mail': manager['manager_mail']
                                }
                                for manager in managers
                            }
                            responsible = gr.Dropdown(label='Validation Responsible', choices=list(managers_dict.keys()), interactive=True)
                    with gr.Row():
                        btn_store = gr.Button("Store in the Knowledge Base")


        submit_msg.click(update_conversation, [msg, chatbot, state], [msg, chatbot, txtbox_validation])
        btn_next_step.click(go_to_questions, [coworker_name, coworker_crt_role, coworker_dmn_expertise, coworker_yrs_exp, state], [tabs])
        btn_previous_session.click(go_to_resume_session, [sessions_dropdown, state], [tabs, chatbot, chat_history, tags, tags_display, reference_employee, reference_links, title, responsible, drop_levels])
        btn_generate_init_questions.click(generate_init_questions,[coworker_name, coworker_crt_role, coworker_dmn_expertise, coworker_yrs_exp, upload_doc, state], [questions, msg])
        btn_go_to_validation.click(go_to_validation_tab, [state], [tabs])
        btn_generate_summary.click(generate_summary_chat, [chatbot, radio_check, state], [chat_history, txtbox_validation])
        btn_go_metadat.click(go_to_metadata_tab, [chat_history, state], [tabs])
        btn_generate_tags.click(generate_tags, [chat_history, state], [tags_display, tags])
        btn_start_chatbot.click(go_to_chatbot_tab, [questions, state], [tabs, chatbot])
        btn_store.click(store_in_kb, [chat_history, tags, reference_employee, reference_links, title, responsible, drop_levels, state], [tabs, chatbot, chat_history, tags_display, reference_employee, reference_links, tags, title, msg, responsible, drop_levels, sessions_dropdown])
        btn_finish.click(go_initial_info, [state], [tabs, questions, coworker_name, coworker_crt_role, coworker_dmn_expertise, coworker_yrs_exp, upload_doc, login_username, login_password])
        add_button.click(fn=add_tag, inputs=[tags, new_tag_input, state], outputs=[tags_display, tags, new_tag_input])
        radio_check.change(radio_change, [radio_check, state], [txtbox_validation, accordion_validation])
        upload_question_catalogue.change(initial_question_catalogue, [upload_question_catalogue, state], [questions])
        login_button.click(
            fn=login_collector,
            inputs=[login_username, login_password, state],
            outputs=[tabs, tab_info, tab_projects, tab_projects, tab_chatbot, tab_validation, tab_metadata, coworker_name, coworker_crt_role, coworker_dmn_expertise, coworker_yrs_exp, sessions_dropdown, btn_previous_session ]
        )
        btn_upload_previous_info.click(upload_prev_questions, [state], [questions, upload_question_catalogue, btn_generate_init_questions])

    if False:
        # Use SSL Configuration and get the SSL Certificates using a Docker Volume and it's relative path
        # This is to prevent having the SSL Certificates inside the Docker container
        # TODO: Check ssl_verify as this should be removed later
        certFile = os.path.join('/app/ssl', 'private.crt')
        keyFile = os.path.join('/app/ssl', 'privatekeynew.pem')
        demo.launch(share=False, allowed_paths=["images/hico_logo_1.png"], ssl_certfile=certFile, ssl_keyfile=keyFile, ssl_verify=False)
    else:
        # Start up normally without SSL
        demo.launch(share=True, allowed_paths=["images/hico_logo_1.png"])


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--sender_email", type=str, default="aziz.raies@highcoordination.de", help="mailing system")
    args = parser.parse_args()
    main(args)
