from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from Backend.db.session import Base

class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    coin_id = Column(String, nullable=False)

    __table_args__ = (
        UniqueConstraint("user_id", "coin_id", name="uq_user_coin"),
    )

    user = relationship("User", back_populates="favorites")
