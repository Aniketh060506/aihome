from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List
import uuid
from datetime import datetime

from models import (
    ChatCompletionRequest,
    ChatCompletionResponse,
    DetectKeyRequest,
    DetectKeyResponse,
    ValidateKeyRequest,
    ValidateKeyResponse
)
from ai_service import (
    AIService,
    detect_api_key_provider,
    get_available_models
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

# Basic routes
@api_router.get("/")
async def root():
    return {"message": "CyberAI Backend - BYOK Cybersecurity Assistant"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# AI Service routes
@api_router.post("/keys/detect", response_model=DetectKeyResponse)
async def detect_key(request: DetectKeyRequest):
    """Detect API key provider and return available models."""
    try:
        provider = detect_api_key_provider(request.api_key)
        
        if provider == "unknown":
            return DetectKeyResponse(
                provider="unknown",
                models=[],
                is_valid=False
            )
        
        models = get_available_models(provider)
        
        return DetectKeyResponse(
            provider=provider,
            models=models,
            is_valid=True
        )
    except Exception as e:
        logger.error(f"Error detecting key: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@api_router.post("/keys/validate", response_model=ValidateKeyResponse)
async def validate_key(request: ValidateKeyRequest):
    """Validate an API key by making a test request."""
    try:
        result = await AIService.validate_api_key(
            api_key=request.api_key,
            provider=request.provider
        )
        return ValidateKeyResponse(**result)
    except Exception as e:
        logger.error(f"Error validating key: {str(e)}")
        return ValidateKeyResponse(
            is_valid=False,
            provider=request.provider,
            error=str(e)
        )

@api_router.post("/chat/completions", response_model=ChatCompletionResponse)
async def chat_completion(request: ChatCompletionRequest):
    """Handle chat completion requests with user's API key."""
    try:
        # Validate inputs
        if not request.api_key:
            raise HTTPException(status_code=400, detail="API key is required")
        
        if not request.messages:
            raise HTTPException(status_code=400, detail="Messages are required")
        
        # Convert messages to dict format
        messages = [msg.dict() for msg in request.messages]
        
        # Call AI service
        result = await AIService.chat_completion(
            messages=messages,
            api_key=request.api_key,
            provider=request.provider,
            model=request.model,
            session_id=request.session_id
        )
        
        return ChatCompletionResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in chat completion: {str(e)}")
        return ChatCompletionResponse(
            success=False,
            error=str(e),
            message=f"An error occurred: {str(e)}"
        )

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
