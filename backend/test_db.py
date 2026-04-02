import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

print("=" * 50)
print("CREDISHIELD - SYSTEM CHECK")
print("=" * 50)

# 1. ENV VARS
print("\n[1] Environment Variables")
db_url = os.getenv("DATABASE_URL", "")
secret = os.getenv("SECRET_KEY", "")
print("  DATABASE_URL : " + ("SET OK - " + db_url[:40] + "..." if db_url else "MISSING"))
print("  SECRET_KEY   : " + ("SET OK" if secret else "MISSING"))

# 2. DB CONNECTION + TABLE CREATION
print("\n[2] Database Connection (Neon PostgreSQL)")
try:
    from database.db import engine
    from database import models
    models.Base.metadata.create_all(bind=engine)
    from sqlalchemy import inspect, text
    tables = inspect(engine).get_table_names()
    print("  Connection   : OK")
    print("  Tables       : " + str(tables))
    with engine.connect() as conn:
        users = conn.execute(text("SELECT COUNT(*) FROM users")).scalar()
        assessments = conn.execute(text("SELECT COUNT(*) FROM assessments")).scalar()
        docs = conn.execute(text("SELECT COUNT(*) FROM document_logs")).scalar()
    print("  Users        : " + str(users))
    print("  Assessments  : " + str(assessments))
    print("  Doc Logs     : " + str(docs))
except Exception as e:
    print("  FAILED : " + str(e))

# 3. AUTH SERVICE
print("\n[3] Auth Service")
try:
    from services.auth_service import hash_password, verify_password, create_access_token, decode_token
    hashed = hash_password("testpass123")
    assert verify_password("testpass123", hashed)
    token = create_access_token({"sub": 1})
    payload = decode_token(token)
    assert payload["sub"] == 1
    print("  Password hash/verify : OK")
    print("  JWT create/decode    : OK")
except Exception as e:
    print("  FAILED : " + str(e))

# 4. ROUTE IMPORTS
print("\n[4] Route Imports")
for name, mod in [
    ("auth_routes",  "routes.auth_routes"),
    ("loan_routes",  "routes.loan_routes"),
    ("ocr_routes",   "routes.ocr"),
    ("dependencies", "dependencies"),
]:
    try:
        __import__(mod)
        print("  " + name + " : OK")
    except Exception as e:
        print("  " + name + " : FAILED - " + str(e))

# 5. ML MODEL
print("\n[5] ML Model")
try:
    from services.prediction_service import predict_loan
    test_input = {
        "loan_amnt": 15000, "term": 36, "int_rate": 8.5, "installment": 472,
        "grade": 2, "emp_length": 10, "home_ownership": 1, "annual_inc": 75000,
        "purpose": 1, "dti": 12.5, "delinq_2yrs": 0, "inq_last_6mths": 1,
        "open_acc": 10, "revol_bal": 3500, "revol_util": 25, "total_acc": 15
    }
    result = predict_loan(test_input)
    print("  Model load   : OK")
    print("  Prediction   : " + result["default_prediction"] +
          " | Score: " + str(result["credit_score"]) +
          " | Risk: " + str(round(result["risk_probability"] * 100, 2)) + "%")
except Exception as e:
    print("  FAILED : " + str(e))

print("\n" + "=" * 50)
print("CHECK COMPLETE")
print("=" * 50)
