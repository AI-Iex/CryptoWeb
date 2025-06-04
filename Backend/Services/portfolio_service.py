from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from Backend.Repositories.portfolio_repository import (
    get_by_user,
    get_by_user_and_coin,
    create as create_portfolio,
    update as update_portfolio,
    delete as delete_portfolio_repo
)
from Backend.Schemas.portfolio import PortfolioCreate, PortfolioUpdate

def list_user_portfolios(db: Session, user_id: int):
    return get_by_user(db, user_id)

def add_or_update_portfolio(db: Session, user_id: int, data: PortfolioCreate):
    existing = get_by_user_and_coin(db, user_id, data.coin_id)
    if existing:
        # sumar la inversión nueva a la existente
        new_investment = existing.investment + data.investment
        update_data = PortfolioUpdate(
            investment=new_investment,
            purchase_price=data.purchase_price
        )
        return update_portfolio(db, existing, update_data)
    else:
        return create_portfolio(db, user_id, data)

def delete_portfolio(db: Session, user_id: int, coin_id: str):
    portfolio = get_by_user_and_coin(db, user_id, coin_id)
    if not portfolio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found"
        )
    if portfolio.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    delete_portfolio_repo(db, portfolio)
    return {"msg": "Portfolio deleted"}
