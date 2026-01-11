"""
Collector LLM service - generates questions, follow-ups, summaries, and tags.
Uses cloud models for speed with local fallback.
"""

from __future__ import annotations

import json
import logging
import re
from typing import Any

from app.integrations.ollama_client import (
    chat,
    chat_with_fallback,
    check_connection,
    get_best_model,
    OllamaError,
)

logger = logging.getLogger(__name__)


# =============================================================================
# Helper Functions
# =============================================================================

def _clean_lines(items: list[str]) -> list[str]:
    """Clean question lines."""
    out = []
    for x in items:
        x = re.sub(r"\s+", " ", x).strip()
        x = re.sub(r"^[\d]+[.\)]\s*", "", x)  # Remove "1." or "1)"
        x = re.sub(r"^[-•*]\s*", "", x)       # Remove bullets
        x = re.sub(r"^\*+\s*", "", x)         # Remove markdown
        if x and len(x) > 15:
            out.append(x)
    return out


def _extract_simple_topic(question: str) -> str:
    """Extract topic without LLM."""
    text = question.lower()
    starters = [
        "what are", "what is", "what", "how do", "how did", "how",
        "why do", "why did", "why", "when", "where", "who", "which",
        "can you", "could you", "would you", "describe", "explain",
        "tell me about", "share", "walk me through",
    ]
    for s in starters:
        if text.startswith(s):
            text = text[len(s):].strip()
            break
    text = text.replace("?", "").strip()
    words = text.split()[:4]
    return " ".join(words).title() if words else "General Topic"


def _get_fallback_questions(profile: dict[str, Any], n: int = 8) -> list[str]:
    """Fallback questions when LLM unavailable."""
    field = profile.get("fieldofexpertise") or profile.get("field_of_expertise") or "your field"
    dept = profile.get("department") or "your department"
    
    return [
        f"What are the most important lessons you've learned in {field}?",
        f"Can you describe a challenging project in {dept} and how you handled it?",
        "What knowledge do you wish you had when you first started?",
        "What processes have you developed that improved your efficiency?",
        "Can you share an experience solving an unexpected problem?",
        "What advice would you give someone new to your team?",
        "What common mistakes have you seen and how to avoid them?",
        "How has your approach evolved over your career?",
        "What tools or techniques do you find most valuable?",
        "What undocumented knowledge do you rely on daily?",
        "What process seems simple but has important nuances?",
        "Describe a situation where you had to adapt quickly.",
    ][:n]


def _get_fallback_followup(user_text: str) -> str:
    """Fallback follow-up question."""
    followups = [
        "Can you walk me through the specific steps you took?",
        "What challenges did you face during this?",
        "What was the most critical decision point?",
        "How did you learn to handle this?",
        "Can you give a specific example?",
        "What would you do differently next time?",
        "How would you explain this to someone new?",
        "What resources helped you develop this expertise?",
    ]
    return followups[len(user_text) % len(followups)]


# =============================================================================
# Topic Generation
# =============================================================================

def generate_topic_from_question(question: str) -> str:
    """Generate topic label from question."""
    if not check_connection():
        return _extract_simple_topic(question)
    
    try:
        response = chat(
            messages=[
                {"role": "system", "content": "Generate a 2-5 word topic. Return ONLY the topic."},
                {"role": "user", "content": f"Topic for: {question}"},
            ],
            task="topic",
            max_tokens=20,
            temperature=0.3,
        )
        topic = response.strip()
        topic = re.sub(r'^["\']|["\']$', "", topic)
        topic = re.sub(r'^topic[:\s]*', "", topic, flags=re.IGNORECASE)
        return topic[:60] if topic else _extract_simple_topic(question)
    except OllamaError as e:
        logger.warning(f"Topic generation failed: {e}")
        return _extract_simple_topic(question)


# =============================================================================
# Question Generation
# =============================================================================

def generate_initial_questions(
    profile: dict[str, Any], n: int = 8
) -> tuple[list[str], list[dict[str, str]]]:
    """
    Generate interview questions from profile.
    Uses cloud models for speed.
    
    Returns:
        Tuple of (questions, conversation_seed)
    """
    if not check_connection():
        logger.warning("Ollama unavailable, using fallback")
        return _get_fallback_questions(profile, n), [{"role": "system", "content": "Fallback"}]
    
    # Build context
    name = profile.get("full_name") or "the employee"
    dept = profile.get("department") or ""
    field = profile.get("fieldofexpertise") or profile.get("field_of_expertise") or ""
    yoe = profile.get("yearsofexperience") or profile.get("years_of_experience") or ""
    cv = (profile.get("CVtext") or profile.get("cv_text") or "")[:2000]
    
    prompt = f"""Generate {n} interview questions for knowledge capture.

Employee: {name}
Department: {dept}
Expertise: {field}
Experience: {yoe} years
Background: {cv}

Rules:
- Open-ended questions capturing tacit knowledge
- Focus on processes, lessons, best practices, challenges
- One question per line
- No numbering, bullets, or extra text"""

    try:
        response, model = chat_with_fallback(
            messages=[
                {"role": "system", "content": "Generate interview questions. One per line, no numbering."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            max_tokens=1024,
            task="questions",
        )
        
        logger.info(f"Generated questions using: {model}")
        questions = _clean_lines(response.splitlines())
        
        # Add fallback if needed
        if len(questions) < n // 2:
            logger.warning(f"Only {len(questions)} questions, adding fallback")
            questions += _get_fallback_questions(profile, n - len(questions))
        
        return questions[:n], [{"role": "system", "content": f"Model: {model}"}]
        
    except OllamaError as e:
        logger.error(f"Question generation failed: {e}")
        return _get_fallback_questions(profile, n), [{"role": "system", "content": "Fallback"}]


# =============================================================================
# Follow-up Generation
# =============================================================================

def generate_follow_up_question(
    existing_messages: list[dict[str, str]],
    user_text: str
) -> tuple[str, list[dict[str, str]]]:
    """
    Generate follow-up question.
    
    Returns:
        Tuple of (follow_up, updated_messages)
    """
    system = {
        "role": "system",
        "content": """You collect knowledge through follow-up questions.
- Ask ONE follow-up question
- Reference specific details from the response
- Ask for examples, steps, or deeper explanation
- Do NOT summarize or provide answers"""
    }
    
    # Build context (limit history)
    msgs = [system]
    for m in (existing_messages or [])[-6:]:
        if m.get("role") != "system":
            msgs.append(m)
    msgs.append({"role": "user", "content": user_text})
    
    fallback = _get_fallback_followup(user_text)
    
    if not check_connection():
        updated = (existing_messages or []) + [
            {"role": "user", "content": user_text},
            {"role": "assistant", "content": fallback},
        ]
        return fallback, updated
    
    try:
        follow_up = chat(msgs, task="chat", temperature=0.7, max_tokens=150)
        follow_up = follow_up.strip()
        follow_up = re.sub(r'^["\']|["\']$', "", follow_up)
        
        if not follow_up or len(follow_up) < 10:
            follow_up = fallback
        
        updated = (existing_messages or []) + [
            {"role": "user", "content": user_text},
            {"role": "assistant", "content": follow_up},
        ]
        return follow_up, updated
        
    except OllamaError as e:
        logger.warning(f"Follow-up failed: {e}")
        updated = (existing_messages or []) + [
            {"role": "user", "content": user_text},
            {"role": "assistant", "content": fallback},
        ]
        return fallback, updated


# =============================================================================
# Summary Generation
# =============================================================================

def generate_summary(existing_messages: list[dict[str, str]]) -> str:
    """Generate summary from conversation."""
    if not existing_messages:
        return "No conversation to summarize."
    
    conversation = [m for m in existing_messages if m.get("role") in ("user", "assistant")]
    if not conversation:
        return "No content to summarize."
    
    conv_text = "\n".join([
        f"{m['role'].upper()}: {m['content']}"
        for m in conversation[-10:]
    ])
    
    prompt = f"""Summarize this conversation:

{conv_text}

Include:
- Key insights
- Processes mentioned
- Best practices
- Pitfalls to avoid

Be concise and factual."""

    if not check_connection():
        user_msgs = [m["content"] for m in conversation if m["role"] == "user"]
        return "## Key Points\n\n" + "\n\n".join([f"- {msg[:200]}" for msg in user_msgs[:5]])
    
    try:
        return chat(
            messages=[
                {"role": "system", "content": "Create concise knowledge summaries."},
                {"role": "user", "content": prompt},
            ],
            task="summary",
            temperature=0.3,
            max_tokens=600,
        ).strip()
    except OllamaError as e:
        logger.warning(f"Summary failed: {e}")
        user_msgs = [m["content"] for m in conversation if m["role"] == "user"]
        return "## Key Points\n\n" + "\n\n".join([f"- {msg[:200]}" for msg in user_msgs[:5]])


# =============================================================================
# Tag Generation
# =============================================================================

def generate_tags(summary_text: str, max_tags: int = 10) -> list[str]:
    """Generate tags from text."""
    if not summary_text or len(summary_text.strip()) < 20:
        return []
    
    if not check_connection():
        return _extract_tags_fallback(summary_text, max_tags)
    
    try:
        raw = chat(
            messages=[
                {"role": "system", "content": "Extract tags as JSON array only."},
                {"role": "user", "content": f'Extract {max_tags} tags: ["tag1",...]\n\n{summary_text[:1500]}'},
            ],
            task="tags",
            temperature=0.2,
            max_tokens=150,
        ).strip()
        
        match = re.search(r'', raw, re.DOTALL)
        if match:
            try:
                arr = json.loads(match.group())
                if isinstance(arr, list):
                    return [str(x).strip() for x in arr if x][:max_tags]
            except json.JSONDecodeError:
                pass
        
        return _extract_tags_fallback(raw, max_tags)
        
    except OllamaError as e:
        logger.warning(f"Tag generation failed: {e}")
        return _extract_tags_fallback(summary_text, max_tags)


def _extract_tags_fallback(text: str, max_tags: int = 10) -> list[str]:
    """Extract tags without LLM."""
    stopwords = {
        "the", "a", "an", "is", "are", "was", "were", "be", "been", "have",
        "has", "had", "do", "does", "did", "will", "would", "could", "should",
        "may", "might", "must", "can", "to", "of", "in", "for", "on", "with",
        "at", "by", "from", "as", "into", "through", "and", "but", "or", "if",
        "this", "that", "these", "those", "what", "which", "who", "i", "you",
        "he", "she", "it", "we", "they", "my", "your", "about", "very", "just",
    }
    
    words = re.findall(r'\b[a-zA-Z]{4,}\b', text.lower())
    counts: dict[str, int] = {}
    for w in words:
        if w not in stopwords:
            counts[w] = counts.get(w, 0) + 1
    
    sorted_words = sorted(counts.items(), key=lambda x: x[1], reverse=True)
    return [w.title() for w, _ in sorted_words[:max_tags]]