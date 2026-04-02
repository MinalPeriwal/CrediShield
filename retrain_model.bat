@echo off
echo ============================================
echo CrediShield - Model Retraining Script
echo ============================================
echo.

echo Step 1: Installing required packages...
pip install xgboost imbalanced-learn scikit-learn pandas numpy joblib

echo.
echo Step 2: Training improved ML model...
cd backend\models
python train_lending_model.py

echo.
echo ============================================
echo Model training complete!
echo ============================================
echo.
echo The new model files have been saved to:
echo - trained_models/lending_model.pkl
echo - trained_models/scaler.pkl
echo.
echo You can now restart your FastAPI server.
echo.
pause
