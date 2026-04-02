import joblib
import pandas as pd
import os
import shap
import numpy as np
import logging

logger = logging.getLogger(__name__)

# Get project base path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_PATH = os.path.join(BASE_DIR, "trained_models", "lending_model.pkl")
SCALER_PATH = os.path.join(BASE_DIR, "trained_models", "scaler.pkl")

# Load model
try:
    model = joblib.load(MODEL_PATH)
except FileNotFoundError:
    logger.error("Model file not found at %s — run train_lending_model.py first", MODEL_PATH)
    raise

# Check if scaler exists (for new model) or use old model approach
USE_SCALER = os.path.exists(SCALER_PATH)
if USE_SCALER:
    try:
        scaler = joblib.load(SCALER_PATH)
        logger.info("Using new ensemble model with scaler")
    except FileNotFoundError:
        logger.error("Scaler file not found at %s", SCALER_PATH)
        raise
else:
    scaler = None
    logger.info("Using old model without scaler")

# Create SHAP explainer using the RF sub-estimator from the VotingClassifier
try:
    named = dict(model.named_estimators_)
    rf_estimator = named.get('rf') or list(named.values())[0]
    explainer = shap.TreeExplainer(rf_estimator)
except (ValueError, TypeError, NotImplementedError, AttributeError) as e:
    logger.warning("SHAP explainer could not be initialized: %s", e)
    explainer = None


def generate_credit_score(risk_probability):
    """
    Convert risk probability into credit score (300-900)
    Lower risk = higher score
    """
    score = int(900 - (risk_probability * 600))
    return max(300, min(score, 900))


def engineer_features(df):
    """
    Apply same feature engineering as training
    """
    df['loan_to_income'] = df['loan_amnt'] / (df['annual_inc'] + 1)
    df['installment_to_income'] = df['installment'] / (df['annual_inc'] / 12 + 1)
    df['credit_utilization_ratio'] = df['revol_util'] / 100
    df['total_credit_lines'] = df['open_acc'] + df['total_acc']
    df['inquiry_to_accounts'] = df['inq_last_6mths'] / (df['open_acc'] + 1)
    return df


def predict_loan(data):
    df = pd.DataFrame([data])
    
    # Apply feature engineering only if using new model
    if USE_SCALER:
        df = engineer_features(df)
        df_scaled = scaler.transform(df)
        prediction = model.predict(df_scaled)[0]
        probability = model.predict_proba(df_scaled)[0][1]
    else:
        # Old model without scaling
        prediction = model.predict(df)[0]
        probability = model.predict_proba(df)[0][1]
    
    credit_score = generate_credit_score(probability)
    
    # SHAP explanation
    feature_importance = {}
    if explainer:
        try:
            if USE_SCALER:
                shap_values = explainer(df_scaled)
            else:
                shap_values = explainer(df)
            
            shap_vals = shap_values.values
            
            # Handle 3D SHAP output (samples, features, classes)
            if len(shap_vals.shape) == 3:
                shap_vals = shap_vals[0, :, 1]
            else:
                shap_vals = shap_vals[0]
            
            for i, col in enumerate(df.columns):
                feature_importance[col] = float(shap_vals[i])
        except (ValueError, TypeError, RuntimeError) as e:
            logger.exception("SHAP explanation failed: %s", e)
    
    return {
        "default_prediction": "Default" if prediction == 1 else "No Default",
        "risk_probability": float(probability),
        "credit_score": credit_score,
        "feature_explanation": feature_importance
    }