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


FEATURE_LABELS = {
    "loan_amnt":               "Loan Amount",
    "term":                    "Loan Term",
    "int_rate":                "Interest Rate",
    "installment":             "Monthly Installment",
    "grade":                   "Credit Grade",
    "emp_length":              "Employment Length",
    "home_ownership":          "Home Ownership",
    "annual_inc":              "Annual Income",
    "purpose":                 "Loan Purpose",
    "dti":                     "Debt-to-Income Ratio",
    "delinq_2yrs":             "Delinquencies (2 yrs)",
    "inq_last_6mths":          "Credit Inquiries (6 mo)",
    "open_acc":                "Open Accounts",
    "revol_bal":               "Revolving Balance",
    "revol_util":              "Credit Utilization",
    "total_acc":               "Total Accounts",
    "loan_to_income":          "Loan-to-Income Ratio",
    "installment_to_income":   "Installment-to-Income Ratio",
    "credit_utilization_ratio":"Credit Utilization Ratio",
    "total_credit_lines":      "Total Credit Lines",
    "inquiry_to_accounts":     "Inquiry-to-Accounts Ratio",
}


def generate_credit_score(risk_probability):
    """
    Convert risk probability into credit score (300-900)
    Lower risk = higher score
    """
    score = int(900 - (risk_probability * 600))
    return max(300, min(score, 900))


# Exact column order the scaler was fit on during training
TRAIN_COLUMNS = [
    "loan_amnt", "term", "int_rate", "installment", "grade",
    "emp_length", "home_ownership", "annual_inc", "purpose",
    "dti", "delinq_2yrs", "inq_last_6mths", "open_acc",
    "revol_bal", "revol_util", "total_acc",
    "loan_to_income", "installment_to_income", "credit_utilization_ratio",
    "total_credit_lines", "inquiry_to_accounts"
]


def engineer_features(df):
    df['loan_to_income'] = df['loan_amnt'] / (df['annual_inc'] + 1)
    df['installment_to_income'] = df['installment'] / (df['annual_inc'] / 12 + 1)
    df['credit_utilization_ratio'] = df['revol_util'] / 100
    df['total_credit_lines'] = df['open_acc'] + df['total_acc']
    df['inquiry_to_accounts'] = df['inq_last_6mths'] / (df['open_acc'] + 1)
    return df[TRAIN_COLUMNS]  # enforce exact column order


def predict_loan(data):
    df = pd.DataFrame([data])

    if USE_SCALER:
        df_engineered = engineer_features(df)
        df_scaled = scaler.transform(df_engineered)
        prediction = model.predict(df_scaled)[0]
        probability = model.predict_proba(df_scaled)[0][1]
    else:
        df_engineered = df
        prediction = model.predict(df_engineered)[0]
        probability = model.predict_proba(df_engineered)[0][1]

    credit_score = generate_credit_score(probability)

    # SHAP explanation — use named DataFrame so columns are preserved
    feature_importance = {}
    if explainer:
        try:
            df_shap = pd.DataFrame(df_scaled, columns=TRAIN_COLUMNS) if USE_SCALER else df_engineered
            shap_values = explainer(df_shap)
            shap_vals = shap_values.values

            if len(shap_vals.shape) == 3:
                shap_vals = shap_vals[0, :, 1]
            else:
                shap_vals = shap_vals[0]

            for i, col in enumerate(TRAIN_COLUMNS):
                feature_importance[col] = float(shap_vals[i])
        except (ValueError, TypeError, RuntimeError) as e:
            logger.exception("SHAP explanation failed: %s", e)

    # Build top risk factors from SHAP values
    risk_factors = []
    if feature_importance:
        sorted_factors = sorted(feature_importance.items(), key=lambda x: abs(x[1]), reverse=True)[:5]
        for feat, shap_val in sorted_factors:
            risk_factors.append({
                "feature": FEATURE_LABELS.get(feat, feat),
                "impact": "increases risk" if shap_val > 0 else "decreases risk",
                "direction": "negative" if shap_val > 0 else "positive",
                "shap_value": round(shap_val, 4)
            })

    return {
        "default_prediction": "Default" if prediction == 1 else "No Default",
        "risk_probability": float(probability),
        "credit_score": credit_score,
        "feature_explanation": feature_importance,
        "risk_factors": risk_factors
    }