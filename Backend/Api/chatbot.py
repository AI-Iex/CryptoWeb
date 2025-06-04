from fastapi import Depends, HTTPException, APIRouter
from sqlalchemy.orm import Session

from Backend.db.session import get_db
from Backend.Core.security import get_current_user
from Backend.Models.user import User
from Backend.Schemas.chat import ChatRequest
from Backend.AgenteIA.agent import process_user_input

router = APIRouter(prefix="/chat", tags=["ChatBot"])

@router.post("/")
async def chat_endpoint(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        response = await process_user_input(request.message, db, current_user)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
