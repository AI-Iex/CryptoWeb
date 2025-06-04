from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List
from Backend.Schemas.role import RoleRead

class UserLogin(BaseModel):
    email: EmailStr = Field(example="example@example.com")
    password: str = Field(example="password")

class UserCreate(BaseModel):
    username: str = Field(example="Alejandro Example")
    email: EmailStr = Field(example="example@example.com")
    password: str = Field(example="password")
    roles: Optional[List[str]] = Field(default=None, example=["user"])

class UserRead(BaseModel):
    id: int = Field(example="1")
    username: str = Field(example="Alejandro Example")
    roles: List[RoleRead] = Field(example=["user"])
    created_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        orm_mode = True

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None 
    last_login: Optional[datetime] = None
    roles: Optional[List[str]] = None

