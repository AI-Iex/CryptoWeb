from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from Backend.Schemas.user import UserCreate, UserLogin, UserRead
from Backend.Services.user_service import create_new_user_service, login_user_service
from Backend.db.session import get_db
from Backend.Core.security import create_access_token

router = APIRouter()

# Endpoint para registrar un nuevo usuario
@router.post("/register", response_model=UserRead)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # Llamamos al servicio para crear un nuevo usuario
    return create_new_user_service(db=db, user=user)

# Endpoint para iniciar sesión
@router.post("/login")
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    db_user = login_user_service(db=db, email=user.email, password=user.password)
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(data={"sub": db_user.email})
    return {"access_token": access_token, "token_type": "bearer"}