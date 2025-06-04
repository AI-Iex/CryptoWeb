from pydantic import BaseModel
from typing import Optional

class NewsSource(BaseModel):
    name: str
    
class NewsArticle(BaseModel):
    title: str
    description: Optional[str]
    url: str
    urlToImage: Optional[str]
    publishedAt: str
    source: dict
