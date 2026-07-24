from fastapi import APIRouter, HTTPException

from ..vectorstore import vectorstore_exists
from .cache import get_chatbot, is_cached, clear_cache
from .schemas import (
    AskRequest,
    AskResponse,
    PrepareVideoRequest,
    PrepareVideoResponse,
    VideoStatusResponse,
)

router = APIRouter(prefix="/api", tags=["chatbot"])


@router.get("/videos/{video_id}/status", response_model=VideoStatusResponse)
def video_status(video_id: str):
    """Check whether a video's vector store exists on disk / is loaded in memory."""
    return VideoStatusResponse(
        video_id=video_id,
        vectorstore_exists=vectorstore_exists(video_id),
        loaded_in_memory=is_cached(video_id),
    )


@router.post("/videos/prepare", response_model=PrepareVideoResponse)
def prepare_video(payload: PrepareVideoRequest):
    """Build (or load) the vector store + chatbot for a video ahead of chatting.

    Optional call from the frontend - e.g. right after the user submits a
    video URL/ID - so the (possibly slow, first-time) build happens before
    they start typing questions. /api/chat will also build it on demand
    if this step is skipped.
    """
    try:
        get_chatbot(payload.video_id)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    return PrepareVideoResponse(
        video_id=payload.video_id,
        ready=True,
        message="Video is ready for questions.",
    )


@router.post("/chat", response_model=AskResponse)
def ask_question(payload: AskRequest):
    """Ask a question about a video. Builds the vector store first if needed."""
    if not payload.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    try:
        bot = get_chatbot(payload.video_id)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    answer = bot.ask(payload.question)
    return AskResponse(video_id=payload.video_id, question=payload.question, answer=answer)


@router.delete("/videos/{video_id}/cache")
def evict_video(video_id: str):
    """Drop a video's chatbot from memory (e.g. to free RAM). Files on disk are kept."""
    clear_cache(video_id)
    return {"video_id": video_id, "evicted": True}
