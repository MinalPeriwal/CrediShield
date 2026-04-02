import pandas as pd
import joblib
import os
import numpy as np

from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, VotingClassifier
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, roc_auc_score, f1_score
from imblearn.over_sampling import SMOTE

# LOAD DATA
data = pd.read_csv("../../dataset/lending_club_loan.csv", low_memory=False)
print("Dataset shape:", data.shape)

# SELECT FEATURES
features = [
    "loan_amnt", "term", "int_rate", "installment", "grade",
    "emp_length", "home_ownership", "annual_inc", "purpose",
    "dti", "delinq_2yrs", "inq_last_6mths", "open_acc",
    "revol_bal", "revol_util", "total_acc", "loan_status"
]

data = data[features]

# TARGET VARIABLE
data = data[data["loan_status"].isin(["Fully Paid", "Charged Off"])]
data["loan_status"] = data["loan_status"].apply(lambda x: 1 if x == "Charged Off" else 0)

# CLEAN DATA
data["int_rate"] = data["int_rate"].str.replace("%","").astype(float)
data["revol_util"] = data["revol_util"].str.replace("%","").astype(float)
data["term"] = data["term"].str.replace(" months","").astype(int)

# Handle missing values more intelligently
data = data.fillna(data.median(numeric_only=True))

# ENCODE CATEGORICAL
cat_cols = ["grade", "emp_length", "home_ownership", "purpose"]
le = LabelEncoder()
for col in cat_cols:
    data[col] = le.fit_transform(data[col].astype(str))

# FEATURE ENGINEERING
data['loan_to_income'] = data['loan_amnt'] / (data['annual_inc'] + 1)
data['installment_to_income'] = data['installment'] / (data['annual_inc'] / 12 + 1)
data['credit_utilization_ratio'] = data['revol_util'] / 100
data['total_credit_lines'] = data['open_acc'] + data['total_acc']
data['inquiry_to_accounts'] = data['inq_last_6mths'] / (data['open_acc'] + 1)

# SPLIT DATA
X = data.drop("loan_status", axis=1)
y = data["loan_status"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# HANDLE CLASS IMBALANCE with SMOTE
print("\nApplying SMOTE for class balancing...")
smote = SMOTE(random_state=42)
X_train_balanced, y_train_balanced = smote.fit_resample(X_train, y_train)

# FEATURE SCALING
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train_balanced)
X_test_scaled = scaler.transform(X_test)

# ENSEMBLE MODEL - Combining multiple algorithms
print("\nTraining Ensemble Model...")

# Model 1: Random Forest
rf_model = RandomForestClassifier(
    n_estimators=500,
    max_depth=15,
    min_samples_split=5,
    min_samples_leaf=2,
    max_features='sqrt',
    random_state=42,
    n_jobs=-1,
    class_weight='balanced'
)

# Model 2: Gradient Boosting
gb_model = GradientBoostingClassifier(
    n_estimators=300,
    learning_rate=0.05,
    max_depth=7,
    min_samples_split=5,
    min_samples_leaf=2,
    subsample=0.8,
    random_state=42
)

# Model 3: XGBoost
xgb_model = XGBClassifier(
    n_estimators=400,
    learning_rate=0.05,
    max_depth=8,
    min_child_weight=3,
    subsample=0.8,
    colsample_bytree=0.8,
    gamma=0.1,
    random_state=42,
    n_jobs=-1,
    eval_metric='logloss'
)

# Voting Classifier (Ensemble)
ensemble_model = VotingClassifier(
    estimators=[
        ('rf', rf_model),
        ('gb', gb_model),
        ('xgb', xgb_model)
    ],
    voting='soft',
    n_jobs=-1
)

print("Training ensemble model...")
ensemble_model.fit(X_train_scaled, y_train_balanced)

# CROSS-VALIDATION
print("\nPerforming Cross-Validation...")
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
cv_scores = cross_val_score(ensemble_model, X_train_scaled, y_train_balanced, cv=cv, scoring='roc_auc')
print(f"Cross-Validation ROC-AUC Scores: {cv_scores}")
print(f"Mean CV ROC-AUC: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")

# EVALUATE MODEL
preds = ensemble_model.predict(X_test_scaled)
probabilities = ensemble_model.predict_proba(X_test_scaled)[:, 1]

accuracy = accuracy_score(y_test, preds)
roc_auc = roc_auc_score(y_test, probabilities)
f1 = f1_score(y_test, preds)

print("\n" + "="*50)
print("MODEL PERFORMANCE METRICS")
print("="*50)
print(f"Accuracy: {accuracy:.4f}")
print(f"ROC-AUC Score: {roc_auc:.4f}")
print(f"F1 Score: {f1:.4f}")

print("\nConfusion Matrix:")
print(confusion_matrix(y_test, preds))

print("\nClassification Report:")
print(classification_report(y_test, preds))

# SAVE MODEL AND SCALER
os.makedirs("../../trained_models", exist_ok=True)
joblib.dump(ensemble_model, "../../trained_models/lending_model.pkl")
joblib.dump(scaler, "../../trained_models/scaler.pkl")

print("\nModel and scaler saved successfully")
print(f"\nFinal Model Accuracy: {accuracy:.2%}")
print(f"Final Model ROC-AUC: {roc_auc:.2%}")