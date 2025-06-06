from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator
from Backend.Core.config import settings

# Conexión a la base de datos
SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL  # Archivo local .db

# Motor de la base de datos
# Solo incluimos check_same_thread si estamos usando SQLite
if settings.DATABASE_URL.startswith("sqlite"):
    engine = create_engine(settings.DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(settings.DATABASE_URL)

# Crear una sesión
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base declarativa para los modelos
Base = declarative_base()

# Función que se encargará de obtener la sesión para cada petición
def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()