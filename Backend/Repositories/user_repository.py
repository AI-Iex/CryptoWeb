from sqlalchemy.orm import Session
from Backend.Models.user import User
from Backend.Models.role import Role
from Backend.Schemas.user import UserCreate, UserUpdate, UserRead
from typing import Optional, List
from datetime import datetime

def create_user(db: Session, user: UserCreate, hashed_password: str, roles: Optional[list] = None):
    db_user = User(
        username=user.username,
        email=user.email,
        password_hash=hashed_password,
        roles=roles or []
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_all_users(db: Session) -> Optional[list[User]]:
    return db.query(User).all()

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()

def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()

def update_user(db: Session, user_id: int, user_data: UserUpdate, roles: Optional[List[Role]] = None):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None

    update_data = user_data.dict(exclude_unset=True)

    # Asignar campos normales
    for key, value in update_data.items():
        setattr(user, key, value)

    # Asignar roles si se proporcionan
    if roles is not None:
        user.roles = roles

    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        db.delete(user)
        db.commit()

def update_user_last_login(db: Session, user_id: int) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.last_login = datetime.now()
        db.commit()
        db.refresh(user)
    return user

