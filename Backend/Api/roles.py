from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from Backend.Schemas.role import RoleRead, RoleCreate
from Backend.Services.role_service import (
    create_role_service,
    get_all_roles_service,
    get_role_by_id_service,
    delete_role_by_id_service
)
from Backend.db.session import get_db
from typing import List
from Backend.Core.security import require_admin, get_current_user
from Backend.Models.user import User

router = APIRouter(prefix="/roles", tags=["Roles"])

# Crear un nuevo Rol
@router.post("/", response_model=RoleRead)
def create_role(
    role_data: RoleCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)  # solo admins
):
    return create_role_service(db=db, role_name=role_data.name)

# Obtener todos los roles
@router.get("/", response_model=List[RoleRead])
def get_roles(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # cualquier usuario autenticado
):
    return get_all_roles_service(db)

# Obtener rol por id
@router.get("/{role_id}", response_model=RoleRead)
def get_role(
    role_id: int, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # cualquier usuario autenticado
):
    return get_role_by_id_service(db, role_id)

# Borrar un rol por id
@router.delete("/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_role(
    role_id: int, db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)  # solo admins
):
    delete_role_by_id_service(db, role_id)
