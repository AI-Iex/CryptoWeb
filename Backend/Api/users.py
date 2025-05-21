from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from Backend.Schemas.user import UserRead, UserUpdate
from Backend.Services.user_service import (
    get_user_by_id_service, get_all_users_service, 
    update_user_service, delete_user_service
)
from Backend.db.session import get_db
from typing import List
from Backend.Core.security import require_admin, get_current_user
from Backend.Models.user import User

router = APIRouter(prefix="/users", tags=["Users"])

# Endpoint para obtener todos los usuarios
@router.get("/GetAll", response_model=List[UserRead])
def get_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # cualquier usuario autenticado
):
    return get_all_users_service(db=db)

# Obtener un usuario por ID
@router.get("/get/{user_id}", response_model=UserRead)
def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_user = get_user_by_id_service(db=db, user_id=user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

# Actualizar un usuario
@router.put("/update/{user_id}", response_model=UserRead)
def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)  # solo admin
):
    updated = update_user_service(db=db, user_id=user_id, user_data=user_data)
    if not updated:
        raise HTTPException(status_code=404, detail="User not found")
    return updated


# Borrar un usuario
@router.delete("/delete/{user_id}")
def delete_user(
    user_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_admin)
):
    delete_user_service(db=db, user_id=user_id)
    return {"message": "User successfully deleted"}