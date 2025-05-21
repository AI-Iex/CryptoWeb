from Backend.Repositories.user_repository import (
    create_user, get_user_by_email, get_user_by_id,
    update_user, delete_user, update_user_last_login,
    get_all_users
)
from Backend.Schemas.user import UserCreate, UserUpdate, UserRead
from Backend.Models.user import User
from Backend.Core.security import get_password_hash, verify_password
from sqlalchemy.orm import Session
from typing import Optional, List
import logging
from fastapi import HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from Backend.Models.role import Role
from Backend.Models.user import User
from Backend.Schemas.user import UserCreate
from Backend.Repositories.user_repository import create_user, get_user_by_email

# Configurar el logger
logger = logging.getLogger(__name__)

def create_new_user_service(db: Session, user: UserCreate) -> User:
    try:
        # 1) Comprueba email duplicado
        if get_user_by_email(db, user.email):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT,
                                detail="Email already registered")

        # 2) Carga objetos Role desde DB
        roles_to_assign: List[Role] = []
        if user.roles:
            roles_to_assign = db.query(Role).filter(Role.name.in_(user.roles)).all()
            if len(roles_to_assign) != len(user.roles):
                missing = set(user.roles) - {r.name for r in roles_to_assign}
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Roles not found: {', '.join(missing)}"
                )
        else:
            # asigna rol "user" por defecto
            default = db.query(Role).filter_by(name="user").first()
            if not default:
                raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                    detail="Default role not initialized")
            roles_to_assign = [default]

        # 3) Hashea la contraseña y crea el usuario
        hashed = get_password_hash(user.password)
        new_user = create_user(db=db,
                               user=user,
                               hashed_password=hashed,
                               roles=roles_to_assign)

        return new_user

    except HTTPException:
        # relanza errores controlados
        raise
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error during user creation: {e}",
                     extra={'email': user.email})
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                            detail="Service temporarily unavailable")
    except Exception as e:
        logger.critical(f"Unexpected error during user creation: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail="Internal server error")

    
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
        # Obtener el usuario
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Extraer datos a actualizar
        update_data = user_data.dict(exclude_unset=True)

        # Si hay contraseña, hashearla y sustituir el campo
        if "password" in update_data:
            hashed = get_password_hash(update_data.pop("password"))
            update_data["password_hash"] = hashed

        # Si hay roles, cargar objetos Role desde la BD
        if "roles" in update_data:
            role_objs = db.query(Role).filter(Role.name.in_(update_data["roles"])).all()
            if not role_objs:
                raise HTTPException(status_code=400, detail="No valid roles found")
            user.roles = role_objs
            update_data.pop("roles")  # Evitar que se pase como atributo normal

        # Actualizar campos normales
        for key, value in update_data.items():
            setattr(user, key, value)

        db.commit()
        db.refresh(user)
        return user

    except SQLAlchemyError as e:
        logger.error(f"Database error: {str(e)}")
        raise HTTPException(status_code=500, detail="Database error")


    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"Database error: {str(e)}")
        raise HTTPException(status_code=500, detail="Database error")
    except Exception as e:
        logger.critical(f"Unexpected error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

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
