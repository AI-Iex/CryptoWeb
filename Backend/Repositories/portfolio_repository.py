from sqlalchemy.orm import Session
from Backend.Models.portfolio import Portfolio
from Backend.Schemas.portfolio import PortfolioCreate, PortfolioUpdate

def get_by_user(db:Session, user_id: int):
    return db.query(Portfolio).filter(Portfolio.user_id == user_id).all()

def get_by_user_and_coin(db:Session, user_id: int, coin_id: str):
    return db.query(Portfolio).filter(
        Portfolio.user_id == user_id,
        Portfolio.coin_id == coin_id
    ).first()

def create(db:Session, user_id: int, data: PortfolioCreate):
    db_portfolio = Portfolio(user_id=user_id, **data.model_dump())
    db.add(db_portfolio)
    db.commit()
    db.refresh(db_portfolio)
    return db_portfolio

def update(db:Session, db_portfolio: Portfolio, updates: PortfolioUpdate):
    for field, value in updates.model_dump(exclude_unset=True).items():
        setattr(db_portfolio, field, value)
    db.commit()
    db.refresh(db_portfolio)
    return db_portfolio

def delete(db:Session, db_portfolio: Portfolio):
    db.delete(db_portfolio)
    db.commit()
