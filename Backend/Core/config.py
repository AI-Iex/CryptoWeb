import os
from dotenv import load_dotenv


# Cargar el archivo .env
load_dotenv(dotenv_path="Backend/settings.env")

class Settings:
    SECRET_KEY: str = os.getenv("SECRET_KEY")
    ALGORITHM: str = os.getenv("ALGORITHM")

settings = Settings()

