import os
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env"))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.db import engine
from database import models
from routes.loan_routes import router as loan_router
from routes.auth_routes import router as auth_router
from routes.ocr import router as ocr_router

# Create all tables on startup
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="CrediShield API", version="2.0")

# Allow specific origins in production, fallback to * for local dev
_origins_env = os.getenv("ALLOWED_ORIGINS", "*")
origins = [o.strip() for o in _origins_env.split(",")] if _origins_env != "*" else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(loan_router)
app.include_router(ocr_router, prefix="/ocr")


@app.get("/")
def home():
    return {"message": "CrediShield API Running", "version": "2.0", "status": "active"}


@app.get("/health")
def health_check():
    import os
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    model_path = os.path.join(BASE_DIR, "..", "trained_models", "lending_model.pkl")
    scaler_path = os.path.join(BASE_DIR, "..", "trained_models", "scaler.pkl")
    return {
        "status": "healthy",
        "model_exists": os.path.exists(model_path),
        "scaler_exists": os.path.exists(scaler_path),
        "model_type": "ensemble" if os.path.exists(scaler_path) else "random_forest"
    }
