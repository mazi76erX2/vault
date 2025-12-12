import logging
import os
import argparse

from chat import generate_response_helper, clientOpenAI
from feedback import fn_report, fn_save, fn_thumbs_down_rlhf, fn_thumbs_up_rlhf


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

USE_SSL = os.environ.get("USE_SSL", "false").lower() in ["true", "1", "y", "yes"]


def main(args):
    with gr.Blocks(
        title="HICO VAULT Helper",
        theme=gr.themes.Default(
            primary_hue=gr.themes.colors.orange, secondary_hue=gr.themes.colors.orange
        ),
    ) as demo:
        with gr.Row():

            gr.Markdown(
                """
                    ## Welcome to the AI Virtual Assistant! 🤖

                    Start typing your message here to interact with our chatbot.

                    **To enhance your experience, follow best practices for prompt engineering by providing detailed, specific instructions and clearly stating your requirements.** 🚀

                    We're here to assist you! 😊
                """
            )
            gr.HTML(
                value="<img app='/file=images/hico_logo_1.png' style='width: 25%; float: right;' >"
            )
        with gr.Row():
            with gr.Tabs(selected="login") as tabs:
                tab_Login = gr.Tab("User Login", id="login")
                with tab_Login:
                    login_username = gr.Textbox(label="Username")
                    login_password = gr.Textbox(label="Password", type="password")
                    login_button = gr.Button("Login")

                tab_Login = gr.Tab(
                    "HICO VAULT ChatBot Helper", visible=False, id="chatbot"
                )
                with tab_Login:
                    with gr.Row():
                        with gr.Column():
                            chatbot = gr.Chatbot()
                            msg = gr.Textbox(
                                label="Search",
                                placeholder="What is meant by BPA in the Power BI scope?",
                            )
                            with gr.Row():
                                clear = gr.ClearButton([msg, chatbot])
                                bt_thumbs_up = gr.Button("👍")
                                bt_thumbs_down = gr.Button("👎")
                        with gr.Column():
                            Confidence = gr.HighlightedText(
                                label="Confidence",
                                combine_adjacent=True,
                                color_map={
                                    "Low Confidence": "red",
                                    "Access Denied": "red",
                                    "High Confidence": "green",
                                    "Moderate Confidence": "orange",
                                },
                            )
                            as_accordion = gr.Accordion("Advanced Settings", open=False)
                            with as_accordion:
                                temperature = gr.Radio(
                                    ["Creative", "Balance", "Precise"],
                                    label="Conversation Style",
                                    value="Precise",
                                )
                                max_token = gr.Slider(
                                    label="Max Tokens",
                                    minimum=100,
                                    maximum=1000,
                                    value=500,
                                )
                                retrieved_docs = gr.Slider(
                                    label="Top N Results as Context",
                                    minimum=1,
                                    maximum=5,
                                    step=1,
                                    value=2,
                                )
                                llm_config = gr.Dropdown(
                                    choices=["GPT-3.5 Turbo", "GPT-4.0"],
                                    label="Large Language Model",
                                    value="GPT-3.5 Turbo",
                                )
                            sc_accordion = gr.Accordion("Search Contexts", open=False)
                            with sc_accordion:
                                gr_md = gr.Markdown(mark_text)
                            rlhw_accordion = gr.Accordion(
                                "Reinforcement Learning Human Feedback (in Preview)",
                                visible=False,
                            )
                            with rlhw_accordion:
                                with gr.Column():
                                    report = gr.Textbox(
                                        label="RL Human Feedback",
                                        placeholder="Write here a comment",
                                    )
                                    bt_report = gr.Button("🖹 Report")
                            q_a_accordion = gr.Accordion(
                                "Reinforcement Learning Human Feedback (in Preview)",
                                visible=False,
                            )
                            with q_a_accordion:
                                with gr.Column():
                                    question = gr.Textbox(
                                        label="Question", placeholder=""
                                    )
                                    answer = gr.Textbox(label="answer", placeholder="")
                                    bt_save = gr.Button("🖹 Save")

        bt_report.click(fn_report, [report, chatbot], [report, rlhw_accordion])
        bt_save.click(fn_save, [question, answer], [question, answer, q_a_accordion])

        bt_thumbs_down.click(
            fn_thumbs_down_rlhf, [], [rlhw_accordion, as_accordion, sc_accordion]
        )
        bt_thumbs_up.click(
            fn_thumbs_up_rlhf,
            [chatbot],
            [question, answer, q_a_accordion, as_accordion, sc_accordion],
        )
        msg.submit(
            generate_response_helper,
            [msg, chatbot, temperature, max_token, llm_config, retrieved_docs],
            [msg, chatbot, Confidence, gr_md],
        )
        login_button.click(
            fn=login_helper,
            inputs=[login_username, login_password],
            outputs=[tabs, tab_Login, login_username, login_password],
        )
    demo.queue()

    if USE_SSL:
        # Use SSL Configuration and get the SSL Certificates using a Docker Volume and it's relative path
        # This is to prevent having the SSL Certificates inside the Docker container
        # TODO: Check ssl_verify as this should be removed later
        certFile = os.path.join("/app/ssl", "private.crt")
        keyFile = os.path.join("/app/ssl", "privatekeynew.pem")
        demo.launch(
            share=False,
            allowed_paths=["images/hico_logo_1.png"],
            ssl_certfile=certFile,
            ssl_keyfile=keyFile,
            ssl_verify=False,
        )
    else:
        demo.launch(share=True, allowed_paths=["images/hico_logo_1.png"])


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--threshold", type=float, default=[0.7, 0.9], help="threshold for confidence."
    )

    args = parser.parse_args()
    main(args)
