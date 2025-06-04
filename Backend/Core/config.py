import os
from dotenv import load_dotenv

# Cargar el archivo .env
load_dotenv(dotenv_path="Backend/settings.env")

class Settings:
    SECRET_KEY: str = os.getenv("SECRET_KEY")
    ALGORITHM: str = os.getenv("ALGORITHM")
    TOGETHER_API_KEY: str = os.getenv("TOGETHER_API_KEY")
    NEWS_API_KEY: str = os.getenv("NEWS_API_KEY")
    ADMIN_USERNAME = os.getenv("ADMIN_USERNAME")
    ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")
    ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")
    DATABASE_URL = os.getenv("DATABASE_URL")

settings = Settings()