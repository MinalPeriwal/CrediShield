from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.loan_routes import router

app = FastAPI(title="CrediShield API", version="2.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get("/")
def home():
    return {
        "message": "CrediShield API Running",
        "version": "2.0",
        "status": "active"
    }

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