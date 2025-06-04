from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from Backend.db.session import get_db
from Backend.Models.user import User
from Backend.Schemas.favorite import FavoriteCreate, FavoriteRead
from Backend.Services.favorite_service import (
    create_favorite_service,
    get_favorites_by_user_service,
    get_favorite_by_id_service,
    delete_favorite_service
)
from Backend.Core.security import get_current_user

router = APIRouter(prefix="/favorites", tags=["FavoriteCrypto"])

@router.post("/", response_model=FavoriteRead)
def add_favorite(
    favorite_in: FavoriteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_favorite_service(db, user_id=current_user.id, favorite_in=favorite_in)


@router.get("/", response_model=List[FavoriteRead])
def get_favorites(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_favorites_by_user_service(db, user_id=current_user.id)


@router.get("/{coin_id}", response_model=FavoriteRead)
def get_favorite_by_id(
    coin_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_favorite_by_id_service(db, user_id=current_user.id, coin_id=coin_id)


@router.delete("/{coin_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_favorite(
    coin_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    delete_favorite_service(db, user_id=current_user.id, coin_id=coin_id)

