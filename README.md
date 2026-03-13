# CrediShield - AI Loan Risk Assessment Platform

Professional loan risk assessment system powered by advanced machine learning algorithms.

## Features

- **AI-Powered Risk Analysis** - Ensemble ML model (Random Forest + Gradient Boosting + XGBoost)
- **Real-time Predictions** - Instant loan default risk assessment
- **Credit Score Generation** - Automated credit scoring (300-900 range)
- **Professional UI** - Modern, responsive React frontend
- **High Accuracy** - 85-92% prediction accuracy with improved model

## Project Structure

```
CrediShield/
├── backend/
│   ├── api/
│   │   └── main.py              # FastAPI application
│   ├── models/
│   │   └── train_lending_model.py  # ML model training
│   ├── routes/
│   │   └── loan_routes.py       # API endpoints
│   ├── services/
│   │   └── prediction_service.py   # Prediction logic
│   └── requirements.txt         # Python dependencies
├── frontend/
│   ├── public/
│   │   ├── favicon.ico
│   │   └── index.html
│   ├── src/
│   │   ├── App.js              # Main React component
│   │   ├── App.css             # Styling
│   │   ├── index.js            # React entry point
│   │   └── index.css           # Global styles
│   └── package.json            # Node dependencies
├── dataset/
│   └── lending_club_loan.csv   # Training dataset
├── trained_models/
│   ├── lending_model.pkl       # Trained ML model
│   └── scaler.pkl              # Feature scaler
├── start_backend.bat           # Backend startup script
├── start_frontend.bat          # Frontend startup script
└── retrain_model.bat           # Model retraining script

```

## Installation

### Prerequisites
- Python 3.8+
- Node.js 14+
- pip
- npm

### Backend Setup

1. Install Python dependencies:
```bash
cd backend
pip install -r requirements.txt
```

2. Train the model (optional - pre-trained model included):
```bash
cd models
python train_lending_model.py
```

### Frontend Setup

1. Install Node dependencies:
```bash
cd frontend
npm install
```

## Running the Application

### Start Backend Server
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
npm start
```

Frontend runs on: http://localhost:3000

## API Endpoints

### Health Check
```
GET http://127.0.0.1:8000/health
```

### Predict Loan Risk
```
POST http://127.0.0.1:8000/predict-loan
Content-Type: application/json

{
  "loan_amnt": 15000,
  "term": 36,
  "int_rate": 8.5,
  "installment": 472,
  "grade": 2,
  "emp_length": 10,
  "home_ownership": 1,
  "annual_inc": 75000,
  "purpose": 1,
  "dti": 12.5,
  "delinq_2yrs": 0,
  "inq_last_6mths": 1,
  "open_acc": 10,
  "revol_bal": 3500,
  "revol_util": 25,
  "total_acc": 15
}
```

## Input Fields

| Field | Description | Example |
|-------|-------------|---------|
| loan_amnt | Loan amount in dollars | 15000 |
| term | Loan term in months | 36 |
| int_rate | Interest rate percentage | 8.5 |
| installment | Monthly payment | 472 |
| grade | Credit grade (1=A, 2=B, 3=C...) | 2 |
| emp_length | Employment length in years | 10 |
| home_ownership | 0=Rent, 1=Own, 2=Mortgage | 1 |
| annual_inc | Annual income | 75000 |
| purpose | Loan purpose code (0-13) | 1 |
| dti | Debt-to-income ratio | 12.5 |
| delinq_2yrs | Delinquencies in past 2 years | 0 |
| inq_last_6mths | Credit inquiries in last 6 months | 1 |
| open_acc | Number of open accounts | 10 |
| revol_bal | Revolving balance | 3500 |
| revol_util | Credit utilization percentage | 25 |
| total_acc | Total number of accounts | 15 |

## ML Model Details

### Algorithms Used
- Random Forest Classifier (500 estimators)
- Gradient Boosting Classifier (300 estimators)
- XGBoost Classifier (400 estimators)
- Voting Ensemble (soft voting)

### Features
- 16 input features
- 5 engineered features (auto-calculated)
- SMOTE for class balancing
- StandardScaler for normalization

### Performance Metrics
- Accuracy: 85-92%
- ROC-AUC: 90-95%
- F1 Score: 80-88%

## Technologies Used

### Backend
- FastAPI
- scikit-learn
- XGBoost
- Pandas
- NumPy
- SHAP (explainability)

### Frontend
- React
- Axios
- CSS3

## License

MIT License

## Author

CrediShield Team - 2024
