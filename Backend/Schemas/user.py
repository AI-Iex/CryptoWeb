from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime
from typing import Optional, List
from Backend.Schemas.role import RoleRead

class UserLogin(BaseModel):
    email: str
    password: str

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    roles: Optional[List[str]] = []

class UserRead(BaseModel):
    id: int
    username: str
    email: EmailStr
    roles: List[RoleRead]
    created_at: datetime
    last_login: Optional[datetime] = None

    # orm_mode = True es una herramienta para leer desde ORMs (los modelos)
    # Por eso solo se usa en esquemas de salida (UserRead) y no en los de entrada (UserCreate)
    class Config:
        orm_mode = True

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None 
    last_login: Optional[datetime] = None
    roles: Optional[List[str]] = None

