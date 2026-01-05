from __future__ import annotations

import json
import re
from typing import Any

from app.integrations.ollama_client import chat


def _clean_lines(items: list[str]) -> list[str]:
    out: list[str] = []
    for x in items:
        x = re.sub(r"\s+", " ", x).strip()
        if x:
            out.append(x)
    return out


def generate_topic_from_question(question: str) -> str:
    messages = [
        {
            "role": "system",
            "content": (
                "Generate a short topic label (2-6 words) that best describes the question. "
                "Return ONLY the topic label."
            ),
        },
        {"role": "user", "content": question},
    ]
    topic = chat(messages).strip()
    topic = re.sub(r"^\"|\"$", "", topic).strip()
    return topic[:80] if topic else "General"


def generate_initial_questions(
    profile: dict[str, Any], n: int = 8
) -> tuple[list[str], list[dict[str, str]]]:
    full_name = profile.get("full_name") or ""
    dept = profile.get("department") or ""
    field = profile.get("fieldofexpertise") or ""
    yoe = profile.get("yearsofexperience") or ""
    cvtext = profile.get("CVtext") or ""

    prompt = f"""
Create {n} open-ended knowledge-transfer interview questions for an employee.

Employee context:
- Full name: {full_name}
- Department: {dept}
- Field of expertise: {field}
- Years of experience: {yoe}
- CV text (may be long): {cvtext[:6000]}

Rules:
- Questions must be specific and aimed at capturing tacit knowledge, best practices, pitfalls, checklists, workflows, and real examples.
- One question per line.
- Do NOT number the questions.
- Do NOT add any extra text.
""".strip()

    messages = [
        {"role": "system", "content": "You generate interview questions only."},
        {"role": "user", "content": prompt},
    ]
    raw = chat(messages)
    questions = _clean_lines(raw.splitlines())
    questions = questions[:n] if questions else []
    conversation_seed = [{"role": "system", "content": "Collector interview session initialized."}]
    return questions, conversation_seed


def generate_follow_up_question(
    existing_messages: list[dict[str, str]], user_text: str
) -> tuple[str, list[dict[str, str]]]:
    system = {
        "role": "system",
        "content": (
            "You are a dynamic and engaging chatbot designed to ask open-ended questions to collect "
            "knowledge and experiences from employees. Your role is to guide employees through a structured "
            "conversation by prompting for more details, insights, and best practices.\n\n"
            "IMPORTANT:\n"
            "- Only output the next follow-up question.\n"
            "- Do not summarize.\n"
            "- Do not provide answers.\n"
            "- Keep it on-topic and refer to details the user just gave.\n"
        ),
    }

    msgs = [system] + (existing_messages or [])
    msgs.append({"role": "user", "content": user_text})

    follow_up = chat(msgs).strip()
    follow_up = re.sub(r"^\"|\"$", "", follow_up).strip()

    updated = (existing_messages or []) + [
        {"role": "user", "content": user_text},
        {"role": "assistant", "content": follow_up},
    ]
    return follow_up, updated


def generate_summary(existing_messages: list[dict[str, str]]) -> str:
    prompt = (
        "Write a concise, structured knowledge article summary (bullets allowed). "
        "Include key steps, best practices, pitfalls, and examples mentioned. "
        "Do not invent facts."
    )
    msgs = [
        {
            "role": "system",
            "content": "You summarize conversations into knowledge-base ready text.",
        },
        {
            "role": "user",
            "content": prompt
            + "\n\nConversation:\n"
            + json.dumps(existing_messages or [], ensure_ascii=False),
        },
    ]
    return chat(msgs).strip()


def generate_tags(summary_text: str, max_tags: int = 10) -> list[str]:
    prompt = f"""
Generate up to {max_tags} short tags (1-3 words each) for the text below.
Return ONLY a JSON array of strings.

TEXT:
{summary_text}
""".strip()

    msgs = [
        {"role": "system", "content": "You generate tags as JSON only."},
        {"role": "user", "content": prompt},
    ]
    raw = chat(msgs).strip()

    try:
        arr = json.loads(raw)
        if isinstance(arr, list):
            tags = [str(x).strip() for x in arr if str(x).strip()]
            return tags[:max_tags]
    except Exception:
        pass

    # Fallback: split lines/commas if model didn't output JSON
    parts = re.split(r"[\n,]+", raw)
    tags = _clean_lines([p.strip("- ").strip() for p in parts])
    return tags[:max_tags]
