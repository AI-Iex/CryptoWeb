from fastapi import APIRouter, HTTPException, Query
from typing import List
from Backend.Schemas.news import NewsArticle
from Backend.Services.news_service import fetch_news

router = APIRouter(prefix="/news", tags=["news"])

@router.get("/", response_model=List[NewsArticle], include_in_schema=False)
async def get_news(
    mode: str = Query("headlines", enum=["headlines", "topic"]),
    country: str = Query("us"),
    category: str = Query("general"),
    topic: str = Query("")
):
    try:
        return await fetch_news(mode=mode, country=country, category=category, topic=topic)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))