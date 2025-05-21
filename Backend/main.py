from fastapi import FastAPI
from Backend.Api import auth, users, roles
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from Backend.db.init_db import init_roles

from Backend.db.session import engine
from Backend.Models import user, role, user_roles  # Asegúrate de importar el modelo para que se cree la tabla

# Crear las tablas si no existen
user.Base.metadata.create_all(bind=engine)
role.Base.metadata.create_all(bind=engine)
user_roles.Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_roles()  # <- ejecuta la inicialización de roles
    yield

# Configuración inicial
app = FastAPI(
    title="CryptoWeb API",
    description="Backend for user management, cryptos and portfolios of CriptoWeb",
    version="0.1.0",
    lifespan=lifespan  # <-- esto es lo que falta
)

# CORS (Conectar con el frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],    # permite cualquier origen
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir router de auth (Autenticación)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(roles.router)


