from sqlalchemy import Column, Integer, Float, String, ForeignKey
from sqlalchemy.orm import relationship

from Backend.db.session import Base

class Portfolio(Base):
    __tablename__ = "portfolios"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    coin_id = Column(String, nullable=False) 
    purchase_price = Column(Float, nullable=False)
    investment = Column(Float, nullable=False)

    user = relationship("User", back_populates="portfolios")
