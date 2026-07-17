from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.ai import ChatRequest, ChatResponse
from app.services import ai as ai_service

router = APIRouter(prefix="/ai")


@router.post("/chat", response_model=ChatResponse)
def chat(
    body: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    reply = ai_service.chat(user=current_user, message=body.message, db=db)
    return ChatResponse(reply=reply)
