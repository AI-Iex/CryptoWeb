from fastapi import FastAPI
from Backend.Api import auth, users
from fastapi.middleware.cors import CORSMiddleware
import os

from Backend.db.session import engine
from Backend.Models import user  # Asegúrate de importar el modelo para que se cree la tabla

# Crear las tablas si no existen
user.Base.metadata.create_all(bind=engine)

# Configuración inicial
app = FastAPI(
    title="CryptoWeb API",
    description="Backend for user management, cryptos and portfolios of CriptoWeb",
    version="0.1.0"
)

# CORS (Conectar con tu frontend)

# Lista de orígenes permitidos (frontends)
origins = [
    "http://localhost:3000",  # React/Vite
    "http://127.0.0.1:5500",  # Live Server (VS Code)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],    # permite cualquier origen (incluido null/file://)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health Check (Endpoint básico de prueba)
@app.get("/")
async def root():
    return {
        "message": "Bienvenido a CryptoWeb API",
        "status": "Operativo",
        "debug": os.getenv("ENVIRONMENT", "development")
    }

# Incluir router de auth (Autenticación)
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(users.router, prefix="/users", tags=["users"])

