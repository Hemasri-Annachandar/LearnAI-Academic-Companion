
import os

from dotenv import load_dotenv
from openai import AsyncOpenAI

load_dotenv()

API_KEY = os.getenv("NEXUS_API_KEY")
BASE_URL = os.getenv("NEXUS_BASE_URL")
MODEL = os.getenv("NEXUS_MODEL")


async def generate_answer(
    question: str,
    context: str = "",
    conversation_history: list[dict] | None = None
) -> str:

    if not API_KEY or not BASE_URL or not MODEL:
        raise RuntimeError("Nexus API configuration is incomplete.")

    system_prompt = """
You are LearnAI, a friendly, intelligent and patient AI learning tutor.

YOUR PERSONALITY:
- Be friendly, natural, encouraging and approachable.
- Talk like a helpful human tutor, not a document-search engine.
- Understand the student's intention before answering.
- Keep simple answers concise.
- Explain difficult topics step by step.
- Encourage curiosity and learning.

CONVERSATION RULES:
1. Respond naturally to greetings, thanks and goodbye messages.
2. Never demand textbook content for casual conversation.
3. Understand the student's intention.
4. Use previous conversation messages to understand follow-up questions.
5. Do not ask students to repeat information already provided.

KNOWLEDGE RULES:
1. You may use general AI knowledge to answer general questions.
2. Use supplied textbook context when it is relevant.
3. Never pretend general knowledge came from an uploaded textbook.
4. When using general knowledge, clearly label it:
   "General AI knowledge (not verified against your textbook)."
5. When using textbook information, identify it as:
   "According to your uploaded textbook..."
6. If textbook information is incomplete, distinguish textbook
   information from additional general knowledge.
7. Never invent textbook quotations, page numbers or citations.
8. If a student specifically asks what the textbook says and
   the answer is absent from the context, explain that it
   could not be found in the selected textbook.

TEACHING RULES:
1. Explain concepts in simple language.
2. Give examples when useful.
3. Provide understandable code examples when requested.
4. Explain technical terms.
5. Offer further explanations when appropriate.
6. Avoid unnecessarily long answers.

IMPORTANT:
Your goal is to behave like an intelligent learning companion.
Use textbook information and general AI knowledge appropriately.
Do not behave like a textbook-only search engine.
"""

    messages = [
        {
            "role": "system",
            "content": system_prompt
        }
    ]

    # Include the latest 10 previous conversation messages.
    if conversation_history:
        for item in conversation_history[-10:]:

            if not isinstance(item, dict):
                continue

            role = item.get("role")
            content = item.get("content")

            if role not in ("user", "assistant"):
                continue

            if not isinstance(content, str) or not content.strip():
                continue

            messages.append({
                "role": role,
                "content": content.strip()
            })

    user_prompt = f"""
STUDENT'S CURRENT QUESTION:
{question}

AVAILABLE TEXTBOOK CONTEXT:
{context if context.strip() else "No relevant textbook context was retrieved."}

Use the previous conversation when it helps understand the
student's current question.

Answer naturally and follow your system instructions.
"""

    messages.append({
        "role": "user",
        "content": user_prompt
    })

    client = AsyncOpenAI(
        api_key=API_KEY,
        base_url=BASE_URL
    )

    try:
        response = await client.chat.completions.create(
            model=MODEL,
            messages=messages,
            temperature=0.4
        )

        answer = response.choices[0].message.content

        return answer or (
            "I'm sorry, I couldn't generate a response. Please try again."
        )

    finally:
        await client.close()
