from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from Backend.Schemas.portfolio import PortfolioCreate, PortfolioRead
from Backend.Services.portfolio_service import (
    list_user_portfolios,
    add_or_update_portfolio,
    delete_portfolio as delete_portfolio_service
)
from Backend.db.session import get_db
from Backend.Core.security import get_current_user
from Backend.Models.user import User

router = APIRouter(prefix="/portfolios", tags=["Portfolios"])


@router.get("/", response_model=List[PortfolioRead])
def get_user_portfolios(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return list_user_portfolios(db, current_user.id)


@router.post("/", response_model=PortfolioRead, status_code=status.HTTP_201_CREATED)
def create_or_update_portfolio(
    portfolio_data: PortfolioCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        return add_or_update_portfolio(db, current_user.id, portfolio_data)
    except HTTPException:
        # Re-lanzar excepciones de negocio
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{coin_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_portfolio(
    coin_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        delete_portfolio_service(db, current_user.id, coin_id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
