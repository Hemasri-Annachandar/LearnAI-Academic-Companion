
import logging
from typing import Literal

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from services.nexus_service import generate_answer
from services.retrieval_service import retrieve_relevant_chunks

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/chat",
    tags=["AI Chat"]
)


class ConversationMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    message: str
    context: str = ""
    file_ids: list[str] | None = None
    conversation_history: list[ConversationMessage] = Field(
        default_factory=list
    )


@router.post("/")
async def chat(request: ChatRequest):

    if not request.message.strip():
        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty"
        )

    try:
        # Step 1: Retrieve relevant textbook content.
        retrieved_context, sources = retrieve_relevant_chunks(
            question=request.message,
            file_ids=request.file_ids,
            top_k=5
        )

        # Step 2: Combine retrieved content with manually supplied context.
        context_parts = []

        if retrieved_context:
            context_parts.append(
                "Relevant textbook information:\n" + retrieved_context
            )

        if request.context.strip():
            context_parts.append(
                "Additional context:\n" + request.context.strip()
            )

        final_context = "\n\n".join(context_parts)

        # Step 3: Convert conversation history into dictionaries.
        conversation_history = [
            item.model_dump()
            for item in request.conversation_history[-10:]
        ]

        # Step 4: Generate an answer using Nexus.
        answer = await generate_answer(
            question=request.message,
            context=final_context,
            conversation_history=conversation_history
        )

        # Step 5: Return the answer and source details.
        return {
            "success": True,
            "question": request.message,
            "answer": answer,
            "sources": sources
        }

    except Exception:
        logger.exception("AI chat request failed")

        raise HTTPException(
            status_code=502,
            detail="AI service request failed. Check the backend logs."
        )
