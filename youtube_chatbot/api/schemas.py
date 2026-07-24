from pydantic import BaseModel, Field


class PrepareVideoRequest(BaseModel):
    video_id: str = Field(..., description="YouTube video ID (the part after v= in the URL)")


class PrepareVideoResponse(BaseModel):
    video_id: str
    ready: bool
    message: str


class AskRequest(BaseModel):
    video_id: str
    question: str


class AskResponse(BaseModel):
    video_id: str
    question: str
    answer: str


class VideoStatusResponse(BaseModel):
    video_id: str
    vectorstore_exists: bool
    loaded_in_memory: bool
