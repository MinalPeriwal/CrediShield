# CrediShield - AI Loan Risk Assessment Platform

Professional loan risk assessment system powered by advanced machine learning algorithms, with user authentication, OTP email verification, KYC document verification, and persistent report storage.

## Features

- **AI-Powered Risk Analysis** - Ensemble ML model (Random Forest + Gradient Boosting + XGBoost)
- **Real-time Predictions** - Instant loan default risk assessment
- **Credit Score Generation** - Automated credit scoring (300-900 range)
- **User Authentication** - Secure JWT-based register/login system
- **OTP Email Verification** - 6-digit OTP sent to email on signup (expires in 10 minutes)
- **KYC Document Verification** - CNN-based Aadhaar, PAN, and Passport validation
- **Persistent Reports** - All assessments stored in PostgreSQL database per user
- **Professional UI** - Modern, responsive React (Vite) frontend
- **High Accuracy** - 85-92% prediction accuracy with ensemble model

## Project Structure

```
CrediShield/
├── backend/
│   ├── api/
│   │   └── main.py                         # FastAPI application entry point
│   ├── database/
│   │   ├── db.py                           # SQLAlchemy engine & session setup
│   │   └── models.py                       # User, Assessment, DocumentLog models
│   ├── models/
│   │   └── train_lending_model.py          # ML model training script
│   ├── routes/
│   │   ├── auth_routes.py                  # Register (OTP flow) & login endpoints
│   │   ├── loan_routes.py                  # Prediction & reports endpoints
│   │   └── ocr.py                          # KYC document upload endpoints
│   ├── services/
│   │   ├── auth_service.py                 # JWT, password hashing, user queries
│   │   ├── prediction_service.py           # ML prediction logic + SHAP
│   │   └── doc_verification_service.py     # CNN-based document verification
│   ├── dependencies.py                     # JWT auth dependency (get_current_user)
│   ├── .env                                # Environment variables (git-ignored)
│   └── requirements.txt                    # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── App.jsx                         # Main app + Risk Assessment form
│   │   ├── Dashboard.jsx                   # Assessment stats & recent table
│   │   ├── Reports.jsx                     # Reports & analytics page
│   │   ├── Login.jsx                       # Login page
│   │   └── Signup.jsx                      # Signup page with OTP verification
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── dataset/
│   └── lending_club_loan.csv               # Training dataset
├── trained_models/
│   ├── lending_model.pkl                   # Trained ensemble model
│   ├── scaler.pkl                          # Feature scaler
│   └── doc_cnn_model.keras                 # CNN model for document verification
├── .env.example                            # Example environment variables
├── start_backend.bat                       # Backend startup script
├── start_frontend.bat                      # Frontend startup script
└── retrain_model.bat                       # Model retraining script
```

## Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- pip
- npm

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

Configure environment variables by copying `.env.example` to `backend/.env`:
```
SECRET_KEY=your_secret_key
DATABASE_URL=postgresql://user:password@host/dbname
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_gmail@gmail.com
SMTP_PASS=your_gmail_app_password
```

> For `SMTP_PASS`, generate a **Gmail App Password** at: Google Account → Security → 2-Step Verification → App Passwords

Train the model (optional — pre-trained model included):
```bash
cd models
python train_lending_model.py
```

### Frontend Setup

```bash
cd frontend
npm install
```

## Running the Application

### Start Backend
```bash
.\start_backend.bat
```
Or manually:
```bash
cd backend
uvicorn api.main:app --reload
```
Backend runs on: http://127.0.0.1:8000

### Start Frontend
```bash
.\start_frontend.bat
```
Or manually:
```bash
cd frontend
npm run dev
```
Frontend runs on: http://localhost:3000

## API Endpoints

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/send-otp` | Send OTP to email (step 1 of registration) |
| POST | `/auth/verify-otp` | Verify OTP & create account (step 2 of registration) |
| POST | `/auth/login` | Login and receive JWT token |

### Prediction & Reports

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/predict-loan` | Run risk assessment & save report | ✅ |
| GET | `/reports` | Fetch all reports for logged-in user | ✅ |

### KYC / OCR

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ocr/upload-doc` | Upload & verify KYC document |
| POST | `/ocr/debug-ocr` | Return raw OCR text for debugging |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server & model status check |

---

## Registration Flow (OTP Verification)

1. User fills in the signup form and clicks **Continue**
2. Frontend calls `POST /auth/send-otp` — a 6-digit OTP is emailed to the user
3. User enters the OTP on the verification screen
4. Frontend calls `POST /auth/verify-otp` — account is created and JWT token is returned
5. OTP expires after **10 minutes**

### Example: Send OTP
```json
POST /auth/send-otp
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "password": "securepassword",
  "organization": "ABC Bank"
}
```

### Example: Verify OTP
```json
POST /auth/verify-otp
{
  "email": "jane@example.com",
  "otp": "482910"
}
```

### Example: Predict Loan Risk
```
POST /predict-loan
Authorization: Bearer <token>

{
  "loan_amnt": 10000,
  "term": 36,
  "int_rate": 7.5,
  "installment": 311,
  "grade": 1,
  "emp_length": 10,
  "home_ownership": 1,
  "annual_inc": 90000,
  "purpose": 1,
  "dti": 8.5,
  "delinq_2yrs": 0,
  "inq_last_6mths": 0,
  "open_acc": 12,
  "revol_bal": 2000,
  "revol_util": 10,
  "total_acc": 20
}
```

## Input Fields

| Field | Description | Example |
|-------|-------------|---------|
| loan_amnt | Loan amount in dollars | 10000 |
| term | Loan term in months (36 or 60) | 36 |
| int_rate | Interest rate percentage | 7.5 |
| installment | Monthly payment amount | 311 |
| grade | Credit grade (1=A, 2=B, 3=C, 4=D, 5=E, 6=F, 7=G) | 1 |
| emp_length | Employment length in years | 10 |
| home_ownership | 0=Rent, 1=Own, 2=Mortgage | 1 |
| annual_inc | Annual income in dollars | 90000 |
| purpose | Loan purpose code (0-13) | 1 |
| dti | Debt-to-income ratio | 8.5 |
| delinq_2yrs | Delinquencies in past 2 years | 0 |
| inq_last_6mths | Credit inquiries in last 6 months | 0 |
| open_acc | Number of open credit accounts | 12 |
| revol_bal | Revolving credit balance | 2000 |
| revol_util | Credit utilization percentage | 10 |
| total_acc | Total number of credit accounts | 20 |

## Database Schema

Backed by **PostgreSQL** (Neon serverless). Tables are auto-created on first run.

### `users` table
| Column | Type | Description |
|--------|------|-------------|
| id | Integer | Primary key |
| full_name | String | User's full name |
| email | String | Unique email (login key) |
| organization | String | User's organization |
| hashed_password | String | bcrypt hashed password |
| created_at | DateTime | Registration timestamp |

### `assessments` table
| Column | Type | Description |
|--------|------|-------------|
| id | Integer | Primary key |
| user_id | Integer | FK → users.id |
| loan_amnt, annual_inc, dti, int_rate, grade, term | Float | Key loan input features |
| risk_probability | Float | Model confidence (0-1) |
| credit_score | Integer | Generated score (300-900) |
| default_prediction | String | "Default" or "No Default" |
| risk_level | String | "Low", "Medium", or "High" |
| status | String | "Approved", "Review", or "Rejected" |
| created_at | DateTime | Assessment timestamp |

### `document_logs` table
| Column | Type | Description |
|--------|------|-------------|
| id | Integer | Primary key |
| user_id | Integer | FK → users.id |
| assessment_id | Integer | FK → assessments.id (optional) |
| doc_type | String | "aadhar", "pan", or "passport" |
| filename | String | Uploaded file name |
| verdict | String | "REAL", "FAKE", or "SUSPICIOUS" |
| confidence | Float | Model confidence score |
| created_at | DateTime | Upload timestamp |

## ML Model Details

### Algorithms
- Random Forest Classifier (500 estimators)
- Gradient Boosting Classifier (300 estimators)
- XGBoost Classifier (400 estimators)
- Soft Voting Ensemble

### Features
- 16 raw input features
- 5 engineered features (loan-to-income, installment-to-income, credit utilization ratio, total credit lines, inquiry-to-accounts)
- SMOTE for class balancing
- StandardScaler for normalization
- SHAP explainability (TreeExplainer on RF sub-model)

### Performance
- Accuracy: 85-92%
- ROC-AUC: 90-95%
- F1 Score: 80-88%

## Technologies Used

### Backend
- FastAPI
- SQLAlchemy + PostgreSQL (Neon)
- scikit-learn, XGBoost
- SHAP
- Pandas, NumPy
- python-jose (JWT)
- bcrypt / passlib
- TensorFlow / Keras (document CNN)
- smtplib (OTP email)

### Frontend
- React + Vite
- Axios
- CSS3

