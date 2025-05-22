from sqlalchemy.orm import Session
from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError

from Backend.Models.favorite import Favorite
from Backend.Schemas.favorite import FavoriteCreate
from typing import List


def create_favorite(db: Session, user_id: int, favorite_in: FavoriteCreate) -> Favorite:
    favorite = Favorite(user_id=user_id, coin_id=favorite_in.coin_id)
    db.add(favorite)
    try:
        db.commit()
        db.refresh(favorite)
        return favorite
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Moneda ya está guardada como favorita.")


def get_favorites_by_user(db: Session, user_id: int) -> List[Favorite]:
    return db.query(Favorite).filter(Favorite.user_id == user_id).all()


def delete_favorite(db: Session, user_id: int, coin_id: str) -> None:
    favorite = db.query(Favorite).filter_by(user_id=user_id, coin_id=coin_id).first()
    if not favorite:
        raise HTTPException(status_code=404, detail="Favorito no encontrado.")
    db.delete(favorite)
    db.commit()
