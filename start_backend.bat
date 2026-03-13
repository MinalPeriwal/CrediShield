@echo off
echo ============================================
echo Starting CrediShield Backend Server
echo ============================================
echo.

cd backend
echo Running from: %cd%
echo.

uvicorn api.main:app --reload --host 127.0.0.1 --port 8000
