from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class Message(BaseModel):
    role: str
    content: str
    timestamp: Optional[str] = None

class ChatCompletionRequest(BaseModel):
    messages: List[Message]
    api_key: str
    provider: str
    model: str
    session_id: Optional[str] = "default"

class ChatCompletionResponse(BaseModel):
    success: bool
    message: Optional[str] = None
    error: Optional[str] = None
    provider: Optional[str] = None
    model: Optional[str] = None

class DetectKeyRequest(BaseModel):
    api_key: str

class DetectKeyResponse(BaseModel):
    provider: str
    models: List[str]
    is_valid: bool

class ValidateKeyRequest(BaseModel):
    api_key: str
    provider: str

class ValidateKeyResponse(BaseModel):
    is_valid: bool
    provider: str
    error: Optional[str] = None

class Conversation(BaseModel):
    id: str
    title: str
    messages: List[Message]
    created_at: str
    updated_at: str
