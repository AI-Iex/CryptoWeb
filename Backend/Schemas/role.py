from pydantic import BaseModel

class RoleBase(BaseModel):
    name: str

class RoleCreate(RoleBase):
    name:str

class RoleRead(RoleBase):
    id: int
    name:str

    class Config:
        orm_mode = True