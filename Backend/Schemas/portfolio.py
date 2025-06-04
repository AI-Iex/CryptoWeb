from pydantic import BaseModel, Field
from typing import Optional

class PortfolioBase(BaseModel):
    coin_id: str = Field(..., example="bitcoin")
    purchase_price: float = Field(..., example=30000.0)
    investment: float = Field(..., example=1500.0)

class PortfolioCreate(PortfolioBase):
    pass

class PortfolioUpdate(BaseModel):
    purchase_price: Optional[float] = Field(None, example=32000.0)
    investment: Optional[float] = Field(None, example=1000.0)

class PortfolioRead(PortfolioBase):
    id: int
    user_id: int

    class Config:
        orm_mode = True
