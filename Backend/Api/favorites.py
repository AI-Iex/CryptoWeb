from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from Backend.db.session import get_db
from Backend.Models.user import User
from Backend.Schemas.favorite import FavoriteCreate, FavoriteRead
from Backend.Services import favorite_service
from Backend.Core.security import get_current_user

router = APIRouter(prefix="/favorites", tags=["FavoriteCrypto"])

@router.post("/", response_model=FavoriteRead)
def add_favorite(
    favorite_in: FavoriteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return favorite_service.create_favorite(db, user_id=current_user.id, favorite_in=favorite_in)


@router.get("/", response_model=List[FavoriteRead])
def get_favorites(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return favorite_service.get_favorites_by_user(db, user_id=current_user.id)


@router.delete("/{coin_id}", status_code=204)
def delete_favorite(
    coin_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    favorite_service.delete_favorite(db, user_id=current_user.id, coin_id=coin_id)

