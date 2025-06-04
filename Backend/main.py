from fastapi import FastAPI, Request
from Backend.Api import auth, portfolios, users, roles, favorites, chatbot, news_routes
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from Backend.db.init_db import init_roles, init_admin

from Backend.db.session import engine
from Backend.Models import user, role, user_roles, favorite, portfolio
import logging
from fastapi.responses import JSONResponse

# Crear las tablas si no existen
user.Base.metadata.create_all(bind=engine)
role.Base.metadata.create_all(bind=engine)
user_roles.Base.metadata.create_all(bind=engine)
favorite.Base.metadata.create_all(bind=engine)
portfolio.Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_roles()  # <- ejecuta la inicialización de roles
    init_admin()
    yield

# Configuración inicial
app = FastAPI(
    title="CryptoWeb API",
    description="Backend for user management, cryptos and portfolios of CriptoWeb",
    version="0.1.0",
    lifespan=lifespan  # <-- esto es lo que falta
)

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logging.error(f"Error en la solicitud: {exc}")
    return JSONResponse(
        status_code=500,
        content={"message": f"Error interno del servidor: {exc}"}
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
app.include_router(favorites.router)
app.include_router(portfolios.router)
app.include_router(chatbot.router)
app.include_router(news_routes.router)
