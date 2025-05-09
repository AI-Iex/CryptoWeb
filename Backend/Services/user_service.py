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
import datetime
import logging
from fastapi import HTTPException
from sqlalchemy.exc import SQLAlchemyError
from Backend.Models.user import User
from Backend.Schemas.user import UserCreate
from Backend.Core.security import get_password_hash
from Backend.Repositories.user_repository import create_user, get_user_by_email

# Configurar el logger
logger = logging.getLogger(__name__)

def create_new_user_service(db, user: UserCreate):
    try:
        # Verificar si el usuario ya existe
        existing_user = get_user_by_email(db, user.email)
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")

        # Hashear la contraseña antes de crear el usuario
        hashed_password = get_password_hash(user.password)

        # Crear un nuevo usuario
        new_user = create_user(db, user, hashed_password)

        return new_user

    except SQLAlchemyError as e:
        # Capturar errores de la base de datos
        logger.error(f"Database error: {str(e)}")
        raise HTTPException(status_code=500, detail="SQLAlchemyError error")

    except Exception as e:
        # Capturar cualquier otro error inesperado
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Another server error")
    
def login_user_service(db: Session, email: str, password: str) -> Optional[User]:
    user = get_user_by_email(db, email)
    if not user or not verify_password(password, user.password_hash):
        return None

    # Actualizar last_login
    update_last_login_service(db, user.id)
    return user

def get_all_users_service(db:Session) ->Optional[list[UserRead]]:
    return get_all_users(db=db)

def get_user_by_email_service(db: Session, email: str) -> Optional[User]:
    # Llamamos al repositorio para obtener el usuario por correo
    return get_user_by_email(db=db, email=email)

def get_user_by_id_service(db: Session, user_id: int) -> Optional[User]:
    # Llamamos al repositorio para obtener el usuario por ID
    return get_user_by_id(db=db, user_id=user_id)

def update_user_service(db: Session, user_id: int, user_data: UserUpdate) -> Optional[User]:
    # Llamamos al repositorio para actualizar un usuario
    return update_user(db=db, user_id=user_id, user_data=user_data)

def delete_user_service(db: Session, user_id: int):
    # Llamamos al repositorio para eliminar un usuario
    delete_user(db=db, user_id=user_id)

def update_last_login_service(db: Session, user_id: int) -> Optional[User]:
    # Llamamos al repositorio para actualizar el último inicio de sesión
    return update_user_last_login(db=db, user_id=user_id)

def verify_user_password_service(db: Session, email: str, password: str) -> Optional[User]:
    user = get_user_by_email_service(db, email)
    if user and verify_password(password, user.password_hash):
        return user
    return None
