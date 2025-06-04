from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel

from Backend.db.session import get_db
from Backend.Services.user_service import create_new_user_service, login_user_service
from Backend.Core.security import create_access_token
from Backend.Schemas.user import UserCreate, UserRead, UserLogin

router = APIRouter(prefix="/auth", tags=["Auth"])

# Registro público
@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    return create_new_user_service(db=db, user=user)

# Login público
@router.post("/login", response_model=dict)
def login_user(login_data: UserLogin, db: Session = Depends(get_db)):
    user = login_user_service(db=db, email=login_data.email, password=login_data.password)
    token = create_access_token(data={"sub": user.email})
    return JSONResponse({"access_token": token, "token_type": "bearer"})