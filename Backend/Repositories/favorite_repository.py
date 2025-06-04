from sqlalchemy.orm import Session
from Backend.Models.favorite import Favorite
from Backend.Schemas.favorite import FavoriteCreate

def create_favorite(db: Session, user_id: int, favorite_in: FavoriteCreate):
    favorite = Favorite(user_id=user_id, coin_id=favorite_in.coin_id)
    db.add(favorite)
    db.commit()
    db.refresh(favorite)
    return favorite

def get_favorites_by_user(db: Session, user_id: int):
    return db.query(Favorite).filter(Favorite.user_id == user_id).all()

def get_favorite_by_id(db: Session, user_id: int, coin_id: str):
    return db.query(Favorite).filter_by(user_id=user_id, coin_id=coin_id).first()

def delete_favorite(db: Session, user_id: int, coin_id: str):
    db.query(Favorite).filter(Favorite.user_id == user_id, Favorite.coin_id == coin_id).delete()
    db.commit()
