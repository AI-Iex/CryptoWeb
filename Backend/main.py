from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

# Configuración inicial
app = FastAPI(
    title="CryptoWeb API",
    description="Backend para gestión de criptomonedas",
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
    allow_origins=origins,  # Lista de dominios permitidos
    allow_credentials=True,  # Para cookies/tokens
    allow_methods=["*"],     # Métodos HTTP permitidos (GET, POST, etc.)
    allow_headers=["*"],     # Cabeceras permitidas
)

# Health Check (Endpoint básico de prueba)
@app.get("/")
async def root():
    return {
        "message": "Bienvenido a CryptoWeb API",
        "status": "Operativo",
        "debug": os.getenv("ENVIRONMENT", "development")
    }

# --- Futuros Endpoints Aquí ---
# Ejemplo:
# from api.auth import router as auth_router
# app.include_router(auth_router, prefix="/auth")