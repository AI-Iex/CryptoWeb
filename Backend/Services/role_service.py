from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from Backend.Repositories.role_repository import (
    create_role,
    get_all_roles,
    get_role_by_id,
    delete_role_by_id
)
from Backend.Models.role import Role
from typing import List

def create_role_service(db: Session, role_name: str) -> Role:
    existing = db.query(Role).filter(Role.name == role_name).first()
    if existing:
        raise HTTPException(status_code=409, detail="Role already exists")
    return create_role(db, role_name)

def get_all_roles_service(db: Session) -> List[Role]:
    return get_all_roles(db)

def get_role_by_id_service(db: Session, role_id: int) -> Role:
    role = get_role_by_id(db, role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return role

def delete_role_by_id_service(db: Session, role_id: int):
    success = delete_role_by_id(db, role_id)
    if not success:
        raise HTTPException(status_code=404, detail="Role not found")
    return {"message": "Role deleted successfully"}
