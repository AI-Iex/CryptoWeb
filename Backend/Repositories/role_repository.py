from sqlalchemy.orm import Session
from Backend.Models.role import Role
from typing import Optional, List

# Crear un nuevo rol
def create_role(db: Session, role_name: str) -> Role:
    new_role = Role(name=role_name)
    db.add(new_role)
    db.commit()
    db.refresh(new_role)
    return new_role

# Obtener todos los roles
def get_all_roles(db: Session) -> List[Role]:
    return db.query(Role).all()

# Obtener un rol por ID
def get_role_by_id(db: Session, role_id: int) -> Optional[Role]:
    return db.query(Role).filter(Role.id == role_id).first()

# Borrar un rol por ID
def delete_role_by_id(db: Session, role_id: int) -> bool:
    role = db.query(Role).filter(Role.id == role_id).first()
    if role:
        db.delete(role)
        db.commit()
        return True
    return False