# CrediShield - AI Loan Risk Assessment Platform

Professional loan risk assessment system powered by advanced machine learning algorithms, with role-based user authentication, OTP email verification, enhanced OCR-based KYC document verification, and persistent report storage.

## Features

- **AI-Powered Risk Analysis** — Ensemble ML model (Random Forest + Gradient Boosting + XGBoost)
- **Real-time Predictions** — Instant loan default risk assessment with SHAP explainability
- **Credit Score Generation** — Automated credit scoring (300–900 range)
- **Role-Based Authentication** — Bank Employee and CA Admin roles with JWT-based login
- **OTP Email Verification** — 6-digit OTP sent to email on signup (expires in 10 minutes)
- **Enhanced KYC Document Verification** — OCR-based Aadhaar, PAN, and Passport validation with deskew, denoising, and fuzzy identity cross-matching
- **Auto-Calculated Metrics** — EMI, DTI, and Credit Utilization computed live from form inputs
- **CA Admin Dashboard** — Chartered Accountant view of all bank employees and their loan activity
- **Persistent Reports** — All assessments stored in PostgreSQL database per user with CSV export
- **Professional UI** — Modern, responsive React (Vite) frontend with SVG icons throughout
- **High Accuracy** — 85–92% prediction accuracy with ensemble model

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
│   │   ├── loan_routes.py                  # Prediction, reports & admin endpoints
│   │   └── ocr.py                          # KYC document upload endpoints
│   ├── services/
│   │   ├── auth_service.py                 # JWT, password hashing, user queries
│   │   ├── prediction_service.py           # ML prediction logic + SHAP
│   │   └── doc_verification_service.py     # OCR-based document verification
│   ├── dependencies.py                     # JWT auth dependency (get_current_user)
│   ├── .env                                # Environment variables (git-ignored)
│   └── requirements.txt                    # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── App.jsx                         # Main app + Risk Assessment form
│   │   ├── App.css                         # Global styles
│   │   ├── Dashboard.jsx                   # Assessment stats & recent table
│   │   ├── Dashboard.css
│   │   ├── Reports.jsx                     # Reports & analytics page
│   │   ├── Reports.css
│   │   ├── CADashboard.jsx                 # CA Admin portal
│   │   ├── CADashboard.css
│   │   ├── Login.jsx                       # Login page
│   │   ├── Login.css
│   │   ├── Signup.jsx                      # Signup page with OTP verification
│   │   └── Signup.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── dataset/
│   └── lending_club_loan.csv               # Training dataset
├── trained_models/
│   ├── lending_model.pkl                   # Trained ensemble model
│   └── scaler.pkl                          # Feature scaler
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
- Tesseract OCR — [Download](https://github.com/UB-Mannheim/tesseract/wiki) and install to `C:\Program Files\Tesseract-OCR\`

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
TESSERACT_PATH=C:\Program Files\Tesseract-OCR\tesseract.exe
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

## User Roles

| Role | Access |
|------|--------|
| `bank_employee` | Risk Assessment, Dashboard, Reports |
| `ca_admin` | CA Admin Dashboard — view all employees & their loan activity |

Role is selected at signup and stored in the JWT token.

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
| POST | `/verify-document` | Upload & verify KYC document (authenticated) | ✅ |

### Admin

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/admin/stats` | All employees & loan stats (CA Admin only) | ✅ CA Admin |

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

1. User fills in the signup form (name, email, password, organization, role) and clicks **Continue**
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
  "organization": "ABC Bank",
  "role": "bank_employee"
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

---

## Risk Assessment — Input Fields

Fields are entered via a categorised form. EMI, DTI, and Credit Utilization are **auto-calculated** from the inputs — you do not enter them manually.

| Field | Description | Dropdown Options / Example |
|-------|-------------|---------------------------|
| loan_amnt | Loan amount (₹) | 500000 |
| term | Loan term | 36 months / 60 months |
| int_rate | Interest rate (%) | 10.5 |
| grade | Credit grade | A (0) · B (1) · C (2) · D (3) · E (4) · F (5) · G (6) |
| emp_length | Employment length | 1 yr (0) · 2 yrs (2) · … · 10+ yrs (1) · <1 yr (10) |
| home_ownership | Home ownership | Mortgage (0) · None (1) · Other (2) · Own (3) · Rent (4) |
| annual_inc | Annual income (₹) | 800000 |
| purpose | Loan purpose | Car (0) · Credit Card (1) · Debt Consolidation (2) · Education (3) · Home Improvement (4) · House (5) · Major Purchase (6) · Medical (7) · Moving (8) · Other (9) · Renewable Energy (10) · Small Business (11) · Vacation (12) · Wedding (13) |
| delinq_2yrs | Delinquencies in past 2 years | 0 |
| inq_last_6mths | Credit inquiries in last 6 months | 1 |
| open_acc | Number of open credit accounts | 8 |
| revol_bal | Revolving credit balance (₹) | 15000 |
| total_acc | Total number of credit accounts | 15 |
| **installment** | *(Auto-calculated)* Monthly EMI | — |
| **dti** | *(Auto-calculated)* Debt-to-income ratio | — |
| **revol_util** | *(Auto-calculated)* Credit utilization % | — |

### Example Payload (Low Risk — Likely Approved)
```json
POST /predict-loan
Authorization: Bearer <token>

{
  "loan_amnt": 200000,
  "term": 36,
  "int_rate": 8.5,
  "installment": 6312.45,
  "grade": 1,
  "emp_length": 1,
  "home_ownership": 3,
  "annual_inc": 900000,
  "purpose": 2,
  "dti": 8.42,
  "delinq_2yrs": 0,
  "inq_last_6mths": 0,
  "open_acc": 10,
  "revol_bal": 12000,
  "revol_util": 0.16,
  "total_acc": 18
}
```

### Example Payload (High Risk — Likely Rejected)
```json
{
  "loan_amnt": 800000,
  "term": 60,
  "int_rate": 22.0,
  "installment": 22145.30,
  "grade": 5,
  "emp_length": 10,
  "home_ownership": 4,
  "annual_inc": 300000,
  "purpose": 11,
  "dti": 88.58,
  "delinq_2yrs": 3,
  "inq_last_6mths": 5,
  "open_acc": 3,
  "revol_bal": 95000,
  "revol_util": 1.0,
  "total_acc": 5
}
```

---

## Risk Thresholds

| Risk Level | Default Probability | Status |
|------------|--------------------:|--------|
| Low | < 11.5% | Approved |
| Medium | 11.5% – 23.3% | Under Review |
| High | > 23.3% | Rejected |

---

## KYC Document Verification

Supports **Aadhaar Card**, **PAN Card**, and **Passport**. At least **2 documents** must be uploaded before submitting a risk assessment.

### How it works
1. Image is upscaled to 1800px, contrast/sharpness enhanced, deskewed, and denoised
2. Tesseract OCR runs in 3 passes (PSM 3, 4, 6) with common misread corrections applied
3. Patterns matched: ID number, keywords, name, date of birth
4. Verdict assigned: **REAL** (≥35% score) · **SUSPICIOUS** (15–35%) · **FAKE** (<15%)
5. Names across documents are **fuzzy-matched** — passes if any significant word overlaps

### Supported formats
JPG, JPEG, PNG, WEBP — max 10MB

---

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
| role | String | `bank_employee` or `ca_admin` |
| created_at | DateTime | Registration timestamp |

### `assessments` table
| Column | Type | Description |
|--------|------|-------------|
| id | Integer | Primary key |
| user_id | Integer | FK → users.id |
| loan_amnt, annual_inc, dti, int_rate, grade, term | Float | Key loan input features |
| risk_probability | Float | Model confidence (0–1) |
| credit_score | Integer | Generated score (300–900) |
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
| fake_score | Float | Inverse confidence score |
| created_at | DateTime | Upload timestamp |

---

## ML Model Details

### Algorithms
- Random Forest Classifier (500 estimators)
- Gradient Boosting Classifier (300 estimators)
- XGBoost Classifier (400 estimators)
- Soft Voting Ensemble

### Features
- 16 raw input features
- 5 engineered features: loan-to-income, installment-to-income, credit utilization ratio, total credit lines, inquiry-to-accounts
- SMOTE for class balancing
- StandardScaler for normalization
- SHAP explainability (TreeExplainer on RF sub-model) — top 5 risk factors shown per prediction

### Performance
- Accuracy: 85–92%
- ROC-AUC: 90–95%
- F1 Score: 80–88%

---

## Technologies Used

### Backend
- FastAPI
- SQLAlchemy + PostgreSQL (Neon)
- scikit-learn, XGBoost
- SHAP
- Pandas, NumPy
- python-jose (JWT)
- bcrypt / passlib
- Tesseract OCR + pytesseract + OpenCV (document verification)
- Pillow (image preprocessing)
- smtplib (OTP email)

### Frontend
- React + Vite
- Axios
- CSS3 (custom, no UI framework)
- SVG icons (inline, no icon library)

---

*Owned & Managed by **Minal Periwal** & **Manvi Kamboj***
