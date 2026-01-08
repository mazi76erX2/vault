"""
Collector LLM service - generates questions, follow-ups, summaries, and tags.
Includes fallback mechanisms when Ollama is slow or unavailable.
"""

from __future__ import annotations

import json
import logging
import re
from typing import Any

from app.integrations.ollama_client import (
    chat,
    check_connection,
    get_best_chat_model,
    OllamaError,
    OllamaTimeoutError,
    OllamaConnectionError,
    CHAT_MODEL,
)

logger = logging.getLogger(__name__)

# Timeout for question generation (can be slow for first request)
QUESTION_GENERATION_TIMEOUT = 180.0  # 3 minutes
FOLLOW_UP_TIMEOUT = 60.0  # 1 minute
SUMMARY_TIMEOUT = 90.0  # 1.5 minutes


def _clean_lines(items: list[str]) -> list[str]:
    """Clean and filter list of strings."""
    out: list[str] = []
    for x in items:
        x = re.sub(r"\s+", " ", x).strip()
        # Remove numbering like "1.", "1)", "- ", etc.
        x = re.sub(r"^[\d]+[.\)]\s*", "", x)
        x = re.sub(r"^[-•*]\s*", "", x)
        if x and len(x) > 10:  # Filter out very short lines
            out.append(x)
    return out


def _get_fallback_questions(profile: dict[str, Any], n: int = 8) -> list[str]:
    """Return fallback questions when LLM is unavailable or times out."""
    field = profile.get("fieldofexpertise") or profile.get("field_of_expertise") or "your field"
    department = profile.get("department") or "your department"
    full_name = profile.get("full_name") or "you"
    
    fallback_questions = [
        f"What are the most important lessons you've learned working in {field}?",
        f"Can you describe a challenging project in {department} and how you approached it?",
        "What knowledge or skills do you wish you had when you first started your role?",
        "What processes or methods have you developed that improved your work efficiency?",
        "Can you share an experience where you had to solve an unexpected problem creatively?",
        "What advice would you give to someone new joining your team?",
        "What are the most common mistakes you've seen in your field and how can they be avoided?",
        "How has your approach to work evolved over your career?",
        "What tools, techniques, or resources do you find most valuable in your daily work?",
        "Can you describe a situation where you had to adapt your methods to achieve success?",
        "What undocumented knowledge do you rely on that others might not know about?",
        "What's a process that seems simple but has important nuances that took time to learn?",
    ]
    
    return fallback_questions[:n]


def generate_topic_from_question(question: str) -> str:
    """Generate a short topic label from a question."""
    
    # Quick fallback if Ollama is not available
    if not check_connection():
        return _extract_topic_fallback(question)
    
    messages = [
        {
            "role": "system",
            "content": (
                "Generate a short topic label (2-6 words) that best describes the question. "
                "Return ONLY the topic label, nothing else."
            ),
        },
        {"role": "user", "content": question},
    ]
    
    try:
        topic = chat(messages, timeout=15.0, max_tokens=30)
        topic = topic.strip()
        # Remove quotes if present
        topic = re.sub(r'^["\']|["\']$', "", topic).strip()
        return topic[:80] if topic else _extract_topic_fallback(question)
    except OllamaError as e:
        logger.warning(f"Topic generation failed, using fallback: {e}")
        return _extract_topic_fallback(question)


def _extract_topic_fallback(question: str) -> str:
    """Extract topic from question without LLM."""
    # Remove question words and punctuation
    text = question.lower()
    text = re.sub(r"^(what|how|why|when|where|who|can you|could you|would you|describe|explain|tell me about)\s+", "", text)
    text = re.sub(r"\?$", "", text)
    
    words = text.split()[:5]
    if words:
        return " ".join(words).title()
    return "General Topic"


def generate_initial_questions(
    profile: dict[str, Any], n: int = 8
) -> tuple[list[str], list[dict[str, str]]]:
    """
    Generate initial interview questions based on user profile.
    
    Returns:
        Tuple of (questions list, conversation seed messages)
    """
    # Check connection first
    if not check_connection():
        logger.warning("Ollama not available, using fallback questions")
        questions = _get_fallback_questions(profile, n)
        seed = [{"role": "system", "content": "Collector interview session initialized (fallback mode)."}]
        return questions, seed
    
    # Build prompt from profile
    full_name = profile.get("full_name") or "the employee"
    dept = profile.get("department") or "Not specified"
    field = profile.get("fieldofexpertise") or profile.get("field_of_expertise") or "Not specified"
    yoe = profile.get("yearsofexperience") or profile.get("years_of_experience") or "Not specified"
    cvtext = profile.get("CVtext") or profile.get("cv_text") or ""
    
    # Truncate CV text if too long
    cv_snippet = cvtext[:4000] if cvtext else "Not provided"
    
    prompt = f"""Generate exactly {n} open-ended knowledge-transfer interview questions for an employee.

Employee Profile:
- Full name: {full_name}
- Department: {dept}
- Field of expertise: {field}
- Years of experience: {yoe}
- CV/Background: {cv_snippet}

Requirements:
1. Questions must capture tacit knowledge, best practices, workflows, and real examples
2. Questions should be specific to their expertise when possible
3. Each question should encourage detailed, story-based responses
4. Cover different aspects: challenges faced, lessons learned, processes developed, advice for others
5. Output ONLY the questions, one per line
6. Do NOT number the questions
7. Do NOT add any explanatory text

Generate {n} questions now:"""

    messages = [
        {
            "role": "system", 
            "content": "You are an expert interviewer. Generate only interview questions, no other text."
        },
        {"role": "user", "content": prompt},
    ]
    
    try:
        # Use best available model for potentially slow operation
        model = get_best_chat_model()
        logger.info(f"Generating questions using model: {model}")
        
        raw = chat(
            messages, 
            model=model,
            temperature=0.7,
            max_tokens=2048,
            timeout=QUESTION_GENERATION_TIMEOUT
        )
        
        # Parse response
        questions = _clean_lines(raw.splitlines())
        
        if len(questions) < n // 2:
            # If we got too few questions, supplement with fallback
            logger.warning(f"Only got {len(questions)} questions, supplementing with fallback")
            fallback = _get_fallback_questions(profile, n)
            questions = questions + fallback
            questions = questions[:n]
        else:
            questions = questions[:n]
        
        conversation_seed = [
            {"role": "system", "content": "Collector interview session initialized."}
        ]
        
        return questions, conversation_seed
        
    except OllamaTimeoutError:
        logger.error("Question generation timed out, using fallback questions")
        questions = _get_fallback_questions(profile, n)
        seed = [{"role": "system", "content": "Collector interview session initialized (timeout fallback)."}]
        return questions, seed
        
    except OllamaError as e:
        logger.error(f"Question generation failed: {e}, using fallback")
        questions = _get_fallback_questions(profile, n)
        seed = [{"role": "system", "content": "Collector interview session initialized (error fallback)."}]
        return questions, seed


def generate_follow_up_question(
    existing_messages: list[dict[str, str]], user_text: str
) -> tuple[str, list[dict[str, str]]]:
    """
    Generate a follow-up question based on user's response.
    
    Returns:
        Tuple of (follow-up question, updated messages list)
    """
    system_prompt = {
        "role": "system",
        "content": (
            "You are a dynamic and engaging chatbot designed to ask open-ended questions to collect "
            "knowledge and experiences from employees. Your role is to guide employees through a structured "
            "conversation by prompting for more details, insights, and best practices.\n\n"
            "IMPORTANT RULES:\n"
            "- Only output the next follow-up question\n"
            "- Do NOT summarize what the user said\n"
            "- Do NOT provide answers or opinions\n"
            "- Keep the question on-topic and refer to specific details the user mentioned\n"
            "- Ask for concrete examples, steps, or lessons learned\n"
            "- Be conversational but professional"
        ),
    }
    
    # Build message history
    msgs = [system_prompt]
    if existing_messages:
        # Filter out any existing system messages
        for m in existing_messages:
            if m.get("role") != "system":
                msgs.append(m)
    
    # Add the new user message
    msgs.append({"role": "user", "content": user_text})
    
    # Prepare fallback
    fallback_question = _get_fallback_followup(user_text)
    
    if not check_connection():
        logger.warning("Ollama not available for follow-up, using fallback")
        updated = (existing_messages or []) + [
            {"role": "user", "content": user_text},
            {"role": "assistant", "content": fallback_question},
        ]
        return fallback_question, updated
    
    try:
        follow_up = chat(
            msgs,
            temperature=0.7,
            max_tokens=256,
            timeout=FOLLOW_UP_TIMEOUT
        )
        follow_up = follow_up.strip()
        
        # Clean up response
        follow_up = re.sub(r'^["\']|["\']$', "", follow_up).strip()
        
        # Validate response is a question
        if not follow_up or len(follow_up) < 10:
            follow_up = fallback_question
        
        updated = (existing_messages or []) + [
            {"role": "user", "content": user_text},
            {"role": "assistant", "content": follow_up},
        ]
        return follow_up, updated
        
    except OllamaError as e:
        logger.warning(f"Follow-up generation failed: {e}, using fallback")
        updated = (existing_messages or []) + [
            {"role": "user", "content": user_text},
            {"role": "assistant", "content": fallback_question},
        ]
        return fallback_question, updated


def _get_fallback_followup(user_text: str) -> str:
    """Generate a simple follow-up question without LLM."""
    followups = [
        "That's really interesting. Can you walk me through the specific steps you took?",
        "Thank you for sharing that. What challenges did you face during this process?",
        "I'd love to hear more details. What was the most critical decision point?",
        "That's valuable insight. How did you learn to handle situations like this?",
        "Could you give me a specific example of when this approach worked well?",
        "What would you do differently if you faced this situation again?",
        "How would you explain this process to someone completely new to it?",
    ]
    
    # Simple heuristic: choose based on length of response
    idx = len(user_text) % len(followups)
    return followups[idx]


def generate_summary(existing_messages: list[dict[str, str]]) -> str:
    """
    Generate a structured summary from chat conversation.
    
    Returns:
        Summary text formatted as a knowledge article
    """
    if not existing_messages:
        return "No conversation to summarize."
    
    # Filter to just user/assistant messages
    conversation = [m for m in existing_messages if m.get("role") in ("user", "assistant")]
    
    if not conversation:
        return "No conversation content to summarize."
    
    # Format conversation for summarization
    conv_text = "\n".join([
        f"{m['role'].upper()}: {m['content']}" 
        for m in conversation
    ])
    
    prompt = f"""Summarize this knowledge-sharing conversation into a structured document.

Include:
- Key insights and lessons learned
- Step-by-step processes mentioned
- Best practices and tips
- Common pitfalls to avoid
- Specific examples given

Format with clear sections and bullet points where appropriate.
Do NOT invent facts - only include what was actually discussed.

CONVERSATION:
{conv_text}

SUMMARY:"""

    messages = [
        {
            "role": "system",
            "content": "You create structured knowledge-base articles from conversations. Be concise and factual."
        },
        {"role": "user", "content": prompt},
    ]
    
    if not check_connection():
        return _generate_fallback_summary(conversation)
    
    try:
        summary = chat(
            messages,
            temperature=0.3,
            max_tokens=1024,
            timeout=SUMMARY_TIMEOUT
        )
        return summary.strip()
        
    except OllamaError as e:
        logger.warning(f"Summary generation failed: {e}, using fallback")
        return _generate_fallback_summary(conversation)


def _generate_fallback_summary(conversation: list[dict[str, str]]) -> str:
    """Create a basic summary without LLM."""
    user_responses = [m["content"] for m in conversation if m.get("role") == "user"]
    
    if not user_responses:
        return "No user responses to summarize."
    
    summary_parts = ["## Knowledge Summary\n"]
    
    for i, response in enumerate(user_responses[:5], 1):
        # Truncate long responses
        text = response[:500] + "..." if len(response) > 500 else response
        summary_parts.append(f"### Point {i}\n{text}\n")
    
    return "\n".join(summary_parts)


def generate_tags(summary_text: str, max_tags: int = 10) -> list[str]:
    """
    Generate relevant tags from summary text.
    
    Returns:
        List of tag strings
    """
    if not summary_text or len(summary_text.strip()) < 20:
        return []
    
    prompt = f"""Extract {max_tags} relevant tags/keywords from this text.
Return ONLY a JSON array of strings, nothing else.
Example: ["tag1", "tag2", "tag3"]

TEXT:
{summary_text[:2000]}

JSON TAGS:"""

    messages = [
        {"role": "system", "content": "You extract tags as a JSON array only. No other text."},
        {"role": "user", "content": prompt},
    ]
    
    if not check_connection():
        return _extract_fallback_tags(summary_text, max_tags)
    
    try:
        raw = chat(
            messages,
            temperature=0.2,
            max_tokens=200,
            timeout=30.0
        )
        raw = raw.strip()
        
        # Try to parse JSON
        try:
            # Find JSON array in response
            match = re.search(r'', raw, re.DOTALL)
            if match:
                arr = json.loads(match.group())
                if isinstance(arr, list):
                    tags = [str(x).strip() for x in arr if str(x).strip()]
                    return tags[:max_tags]
        except json.JSONDecodeError:
            pass
        
        # Fallback: try to extract from raw text
        return _extract_fallback_tags(raw, max_tags)
        
    except OllamaError as e:
        logger.warning(f"Tag generation failed: {e}, using fallback")
        return _extract_fallback_tags(summary_text, max_tags)


def _extract_fallback_tags(text: str, max_tags: int = 10) -> list[str]:
    """Extract tags from text without LLM."""
    # Remove common words and extract potential keywords
    stopwords = {
        "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
        "have", "has", "had", "do", "does", "did", "will", "would", "could",
        "should", "may", "might", "must", "shall", "can", "need", "dare",
        "to", "of", "in", "for", "on", "with", "at", "by", "from", "as",
        "into", "through", "during", "before", "after", "above", "below",
        "between", "under", "again", "further", "then", "once", "here",
        "there", "when", "where", "why", "how", "all", "each", "few",
        "more", "most", "other", "some", "such", "no", "nor", "not",
        "only", "own", "same", "so", "than", "too", "very", "just",
        "and", "but", "if", "or", "because", "until", "while", "this",
        "that", "these", "those", "what", "which", "who", "whom", "i",
        "you", "he", "she", "it", "we", "they", "me", "him", "her", "us",
        "them", "my", "your", "his", "its", "our", "their", "myself",
    }
    
    # Extract words
    words = re.findall(r'\b[a-zA-Z]{4,}\b', text.lower())
    
    # Count frequency
    word_count: dict[str, int] = {}
    for word in words:
        if word not in stopwords:
            word_count[word] = word_count.get(word, 0) + 1
    
    # Sort by frequency and return top tags
    sorted_words = sorted(word_count.items(), key=lambda x: x[1], reverse=True)
    tags = [word.title() for word, _ in sorted_words[:max_tags]]
    
    return tags