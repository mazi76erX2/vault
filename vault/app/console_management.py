
import argparse
import os
import logging
from ui_handlers import on_select, on_select_verifier, fn_validate, fn_validate_user, modify_info, apply_modify_info, reject_doc, delegate_fn, fn_connector_drop, fn_tab_manager, fn_tab_reviewer, fn_connect_confluence, fn_connect_sharepoint
from app.database import get_all_users


CLIENT_ID = os.environ['CLIENT_ID']
CLIENT_SECRET = os.environ['CLIENT_SECRET']
TENANT_ID = os.environ["TENANT_ID"]
USE_SSL = os.environ["USE_SSL"].lower() in ['true', '1', 'y', 'yes']
mng_doc_list = []
selected_doc = None
username = ""



# Configure logging
logging.basicConfig(
    level=logging.DEBUG,  # Set the lowest severity level to capture
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("testing.log"),  # Log messages to a file
        logging.StreamHandler()  # Print messages to the console
    ]
)


def main(args):
    users = get_all_users()
    with gr.Blocks(title=" VAULT Management Console",
                   theme=gr.themes.Default(primary_hue=gr.themes.colors.orange,
                                           secondary_hue=gr.themes.colors.orange), css="""
                #scrollable_dataframe_mng {
                    max-height: 250px;
                    overflow-y: auto;
                }
                #scrollable_dataframeverifiers {
                    max-height: 250px;
                    overflow-y: auto;
                }
                """) as demo:

        with gr.Row():
            gr.Markdown(
            """
            ## Welcome to  Group's Knowledge Sharing Chatbot! 🤖

            This chatbot is designed to help collect valuable information that will facilitate knowledge transfer between coworkers.
            By sharing your insights and experiences, you contribute to building a robust knowledge base that supports new and existing team members.

            We appreciate your contribution and are here to assist you! 😊
            """)
            gr.HTML(value="<img app='/file=images/_logo_1.png' style='width: 25%; float: right;' >")
        with gr.Row():
            with gr.Tabs(selected="Login") as tabs:
                tab_login = gr.Tab("Login", id = "Login")
                with tab_login:
                    username_input = gr.Textbox(label="Username")
                    password_input = gr.Textbox(label="Password", type="password")
                    login_button = gr.Button("Login")
                tab_doc_selection = gr.Tab("Document Selection", id = "doc_selection")
                with tab_doc_selection:
                    with gr.Row():
                        with gr.Column():
                            with gr.Tabs(selected="Manager") as tabs_docs:
                                tab_doc_manager = gr.Tab("Manager Section", id = "Manager")
                                with tab_doc_manager:
                                    scrolldown_docs_managers = gr.DataFrame([], headers=["Options"], height=500, interactive=True, elem_id="scrollable_dataframe_mng")
                                tab_doc_verifiers = gr.Tab("Expert Section", id = "Verifier")
                                with tab_doc_verifiers:
                                    scrolldown_docs_verifiers = gr.DataFrame([], headers=["Options"], interactive=True, elem_id="scrollable_dataframeverifiers", height=500)


                        with gr.Column():
                            markdown_description = gr.Markdown()
                            with gr.Accordion("Tags"):
                                markdown_tags = gr.Markdown()
                            with gr.Accordion("Doc Information"):
                                markdown_summary = gr.Markdown()
                                btn_modify = gr.Button("Modify")
                                txt_summary = gr.Textbox(interactive=True, visible=False)
                                btn_apply_modify = gr.Button("Apply the Modification", visible=False)


                            txt_comment = gr.Textbox(label="Comment")
                            with gr.Row():
                                btn_validate = gr.Button('Validate', elem_classes="green-button")
                                btn_send_back = gr.Button('Send Back', elem_classes="green-button")
                                btn_refuse = gr.Button('Reject', elem_classes="red-button")
                            delegate_accordion = gr.Accordion(label="Delegate section")

                            with delegate_accordion:
                                dropdown_verifier = gr.Dropdown(label="List of Verifiers", choices=[])
                                btn_delegate = gr.Button('Delegate')
                
                tab_connector = gr.Tab("Data Connectors (Comming Soon)", id = "Connectors", interactive=False)
                with tab_connector:
                    with gr.Row():
                        connector_dropdown = gr.Dropdown(["Confluence", "SharePoint", "Custom"], value="Confluence", label="Connectors")
                        txt_index = gr.Textbox(label="Knowledge Base Index")
                        with gr.Column():
                            accordion_confluence = gr.Accordion('Confluence Access Data', visible= True)
                            with accordion_confluence:
                                txt_url = gr.Textbox(label="Confluence URL", placeholder="Write here the url")
                                txt_user = gr.Textbox(label="Confluence Username", placeholder="Write here the username")
                                txt_keyspace = gr.Textbox(label="Confluence Keyspace", placeholder="Write here the keyspace")
                                txt_api = gr.Textbox(label="Confluence API Key", placeholder="Write here the api key", type="password")
                                btn_connect_confluence = gr.Button(value="Connect")
                            accordion_sharepoint = gr.Accordion('SharePoint Access Data', visible= False)
                            with accordion_sharepoint:
                                txt_hostname_sp = gr.Textbox(label="Hostname", placeholder="For example: highcoordinationde.sharepoint.com")
                                txt_sitepath_sp = gr.Textbox(label="site path", placeholder="For example: home")
                                btn_connect_sharepoint = gr.Button(value="Connect")

                            accordion_custom = gr.Accordion('Custom Access Data', visible= False)
                            with accordion_custom:
                                folder_download = gr.FileExplorer()
                                
        scrolldown_docs_managers.select(on_select, None, [markdown_description, markdown_tags, markdown_summary])
        scrolldown_docs_verifiers.select(on_select_verifier, None, [markdown_description, markdown_tags, markdown_summary ])

        btn_modify.click(modify_info, [markdown_summary], [ markdown_summary, txt_summary, btn_modify, btn_apply_modify])
        btn_apply_modify.click(apply_modify_info, [txt_summary], [ markdown_summary, txt_summary, btn_modify, btn_apply_modify])
        btn_validate.click(fn_validate, [markdown_summary, txt_comment], [scrolldown_docs_managers, scrolldown_docs_verifiers, txt_comment, markdown_description, markdown_tags, markdown_summary])
        btn_send_back.click(fn_validate_user, [markdown_summary, txt_comment], [txt_comment, markdown_description, markdown_tags, markdown_summary, scrolldown_docs_managers, scrolldown_docs_verifiers])

        login_button.click(login_console_management, [username_input, password_input], [tabs, scrolldown_docs_managers, scrolldown_docs_verifiers, dropdown_verifier, btn_send_back])
        btn_refuse.click(reject_doc, [txt_comment], [scrolldown_docs_managers, scrolldown_docs_verifiers, txt_comment])
        btn_delegate.click(delegate_fn, [txt_comment, dropdown_verifier], [scrolldown_docs_managers, scrolldown_docs_verifiers, txt_comment, dropdown_verifier])
        connector_dropdown.select(fn_connector_drop, [connector_dropdown], [accordion_confluence, accordion_sharepoint, accordion_custom])
        btn_connect_confluence.click(fn_connect_confluence, [txt_url, txt_user, txt_api, txt_keyspace, txt_index], [txt_url, txt_user, txt_api, txt_keyspace, txt_index])
        btn_connect_sharepoint.click(fn_connect_sharepoint, [txt_hostname_sp, txt_sitepath_sp, txt_index], [txt_hostname_sp, txt_sitepath_sp, txt_index])
        tab_doc_manager.select(fn_tab_manager, [], [btn_validate, btn_send_back, btn_refuse])
        tab_doc_verifiers.select(fn_tab_reviewer, [], [btn_validate, btn_send_back, btn_refuse])

    if USE_SSL:
        # Use SSL Configuration and get the SSL Certificates using a Docker Volume and it's relative path
        # This is to prevent having the SSL Certificates inside the Docker container
        # TODO: Check ssl_verify as this should be removed later
        certFile = os.path.join('/app/ssl', 'private.crt')
        keyFile = os.path.join('/app/ssl', 'privatekeynew.pem')
        demo.launch(share=False, allowed_paths=["images/_logo_1.png"], ssl_certfile=certFile, ssl_keyfile=keyFile, ssl_verify=False)
    else:
        demo.launch(share=True, allowed_paths=["images/_logo_1.png"])


if __name__ == "__main__":

    parser = argparse.ArgumentParser()
    parser.add_argument("--sender_email", type=str, default="aziz.raies@highcoordination.de", help="mailing system")

    args = parser.parse_args()

    logging.info("starting the console management application")
    main(args)
