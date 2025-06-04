from sqlalchemy.orm import Session
from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from typing import List

from Backend.Models.favorite import Favorite
from Backend.Schemas.favorite import FavoriteCreate
from Backend.Repositories.favorite_repository import create_favorite,get_favorites_by_user,delete_favorite, get_favorite_by_id


def create_favorite_service(db: Session, user_id: int, favorite_in: FavoriteCreate) -> Favorite:
    try:
        return create_favorite(db, user_id, favorite_in)
    except IntegrityError:
        raise HTTPException(status_code=400, detail="Coin is already saved as a favorite.")
    
def get_favorite_by_id_service(db: Session, user_id: int, coin_id: str) -> Favorite:
    favorite = get_favorite_by_id(db, user_id, coin_id)
    if not favorite:
        raise HTTPException(status_code=404, detail="Favorite coin not found.")
    return favorite

def get_favorites_by_user_service(db: Session, user_id: int) -> List[Favorite]:
    return get_favorites_by_user(db, user_id)

def delete_favorite_service(db: Session, user_id: int, coin_id: str) -> None:
    get_favorite_by_id_service(db, user_id, coin_id)
    delete_favorite(db, user_id, coin_id)
