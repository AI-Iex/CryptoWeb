import httpx
from typing import List
from Backend.Schemas.news import NewsArticle
from Backend.Core.config import settings

NEWS_API_KEY = settings.NEWS_API_KEY

COUNTRY_NAMES = {
    "us": "United States",
    "mx": "Mexico",
    "es": "Spain",
    "ar": "Argentina",
    "cl": "Chile",
}

# Número fijo de noticias a devolver
FORCED_PAGE_SIZE = 50

async def fetch_news(mode: str, country: str = "us", category: str = "general", topic: str = "") -> List[NewsArticle]:
    base_url = "https://newsapi.org/v2/"
    params = {
        "apiKey": NEWS_API_KEY,
        "sortBy": "publishedAt",
        "language": "es",
        "pageSize": FORCED_PAGE_SIZE
    }

    if mode == "topic":
        url = base_url + "everything"
        params["q"] = topic
    else:
        if country == "us":
            url = base_url + "top-headlines"
            params["country"] = country
            params["category"] = category
            del params["language"]  # headlines acepta múltiples idiomas, pero filtramos por país
        else:
            url = base_url + "everything"
            query = f"{category} {COUNTRY_NAMES.get(country, country)}"
            params["q"] = query

    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        response.raise_for_status()
        data = response.json()

    if data.get("status") != "ok":
        raise Exception(data.get("message", "Error getting news"))

    articles = [NewsArticle(**article) for article in data.get("articles", [])]
    return articles