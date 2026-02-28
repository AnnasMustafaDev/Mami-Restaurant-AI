from pydantic import BaseModel


class ChatSessionCreate(BaseModel):
    source: str = "text"  # text or voice


class ChatSessionResponse(BaseModel):
    id: str
    started_at: str
    source: str | None = None
    message_count: int
    reservation_id: int | None = None

    model_config = {"from_attributes": True}


class ChatMessageCreate(BaseModel):
    content: str


class ChatMessageResponse(BaseModel):
    id: int
    session_id: str
    role: str
    content: str
    created_at: str

    model_config = {"from_attributes": True}
