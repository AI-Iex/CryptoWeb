from Backend.Repositories.user_repository import (
    create_user, get_user_by_email, get_user_by_id,
    update_user, delete_user, update_user_last_login,
    get_all_users
)
from Backend.Schemas.user import UserCreate, UserUpdate, UserRead
from Backend.Models.user import User
from Backend.Core.security import get_password_hash, verify_password
from sqlalchemy.orm import Session
from typing import Optional
import logging
from fastapi import HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from Backend.Models.user import User
from Backend.Schemas.user import UserCreate
from Backend.Core.security import get_password_hash
from Backend.Repositories.user_repository import create_user, get_user_by_email

# Configurar el logger
logger = logging.getLogger(__name__)

def create_new_user_service(db: Session, user: UserCreate):
    try:
        # Búsqueda de usuario existente
        existing_user = get_user_by_email(db, user.email)
        if existing_user:
            raise HTTPException(
                status_code=409,
                detail="Email already registered"
            )

        # Operación con la base de datos
        hashed_password = get_password_hash(user.password)
        new_user = create_user(db, user, hashed_password)
        
        db.commit()
        
        return new_user

    except SQLAlchemyError as e:
        db.rollback()  # Importante para integridad transaccional
        logger.error(f"Database error during user creation: {str(e)}", 
                   extra={'email': user.email, 'error_type': type(e).__name__})
        raise HTTPException(
            status_code=503,  # Más apropiado para errores de infraestructura
            detail="Service temporarily unavailable"
        )

    except HTTPException:
        # Re-lanzar excepciones HTTP ya manejadas
        raise

    except Exception as e:
        logger.critical(f"Unexpected error during user creation: {str(e)}",
                      exc_info=True,
                      stack_info=True,
                      extra={'email': user.email})
        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )
    
def login_user_service(db: Session, email: str, password: str) -> User:
    user = get_user_by_email(db, email)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="There is not user associated with this email")
    if not verify_password(password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect password")

    update_last_login_service(db, user.id)
    return user

def get_all_users_service(db: Session) -> list[UserRead]:
    users = get_all_users(db=db)
    if not users:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No users registered")
    return users


def get_user_by_email_service(db: Session, email: str) -> User:
    user = get_user_by_email(db=db, email=email)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found with this email")
    return user

def get_user_by_id_service(db: Session, user_id: int) -> User:
    user = get_user_by_id(db=db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found with this ID")
    return user


def update_user_service(db: Session, user_id: int, user_data: UserUpdate) -> User:
    try:
        updated_user = update_user(db=db, user_id=user_id, user_data=user_data)
        if not updated_user:
            raise HTTPException(status_code=404, detail="User not found")
        return updated_user
    except SQLAlchemyError as e:
        logger.error(f"Database error: {str(e)}")
        raise HTTPException(status_code=500, detail="Database error")

def delete_user_service(db: Session, user_id: int):
    try:
        user = get_user_by_id(db=db, user_id=user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        deleted = delete_user(db=db, user_id=user_id)
        
    except SQLAlchemyError as e:
        logger.error(f"Database error: {str(e)}")
        raise HTTPException(status_code=500, detail="Database error")

def update_last_login_service(db: Session, user_id: int) -> User:
    user = update_user_last_login(db=db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def verify_user_password_service(db: Session, email: str, password: str) -> User:
    user = get_user_by_email_service(db, email)
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return user
