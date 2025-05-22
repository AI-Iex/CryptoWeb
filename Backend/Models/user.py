from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from Backend.db.session import Base
from sqlalchemy.orm import relationship
from Backend.Models.user_roles import user_roles

class User(Base):
     __tablename__ = "users"

     id = Column(Integer, primary_key = True, index = True)
     username = Column(String, unique = False, index = True)
     email = Column(String, unique=True, index=True)
     password_hash = Column(String)
     roles = relationship("Role", secondary=user_roles, back_populates="users")
     favorites = relationship("Favorite", back_populates="user", cascade="all, delete", passive_deletes=True)

     created_at = Column(DateTime(timezone = True), server_default = func.now())
     last_login = Column(DateTime(timezone = True), nullable= True)


    
