from pydantic import BaseModel

class FavoriteBase(BaseModel):
    coin_id: str

class FavoriteCreate(FavoriteBase):
    pass

class FavoriteRead(FavoriteBase):
    id: int
    user_id: int

    class Config:
        orm_mode = True
