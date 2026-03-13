# Field Mapping Documentation

## Frontend to Backend Field Mapping

This document ensures that all fields from the frontend match exactly with the ML model requirements.

### ✅ All Fields Match (16 fields)

| Field Name | Frontend | Backend API | ML Model | Description |
|------------|----------|-------------|----------|-------------|
| loan_amnt | ✅ | ✅ | ✅ | Loan amount in dollars |
| term | ✅ | ✅ | ✅ | Loan term in months |
| int_rate | ✅ | ✅ | ✅ | Interest rate percentage |
| installment | ✅ | ✅ | ✅ | Monthly installment payment |
| grade | ✅ | ✅ | ✅ | Credit grade (A=1, B=2, C=3...) |
| emp_length | ✅ | ✅ | ✅ | Employment length in years |
| home_ownership | ✅ | ✅ | ✅ | Home ownership status (0=Rent, 1=Own, 2=Mortgage) |
| annual_inc | ✅ | ✅ | ✅ | Annual income in dollars |
| purpose | ✅ | ✅ | ✅ | Loan purpose code |
| dti | ✅ | ✅ | ✅ | Debt-to-income ratio |
| delinq_2yrs | ✅ | ✅ | ✅ | Delinquencies in past 2 years |
| inq_last_6mths | ✅ | ✅ | ✅ | Credit inquiries in last 6 months |
| open_acc | ✅ | ✅ | ✅ | Number of open accounts |
| revol_bal | ✅ | ✅ | ✅ | Revolving balance in dollars |
| revol_util | ✅ | ✅ | ✅ | Revolving utilization percentage |
| total_acc | ✅ | ✅ | ✅ | Total number of accounts |

### 🔧 Engineered Features (Auto-calculated in Backend)

These features are automatically calculated from the input fields:

| Feature Name | Formula | Purpose |
|--------------|---------|---------|
| loan_to_income | loan_amnt / (annual_inc + 1) | Loan burden relative to income |
| installment_to_income | installment / (annual_inc / 12 + 1) | Monthly payment burden |
| credit_utilization_ratio | revol_util / 100 | Credit usage ratio |
| total_credit_lines | open_acc + total_acc | Total credit accounts |
| inquiry_to_accounts | inq_last_6mths / (open_acc + 1) | Credit inquiry intensity |

### 📊 Data Flow

```
Frontend (16 fields)
    ↓
Backend API (Pydantic validation)
    ↓
Prediction Service (adds 5 engineered features = 21 total)
    ↓
Feature Scaling (StandardScaler)
    ↓
ML Model (Ensemble: RF + GB + XGBoost)
    ↓
Prediction Result
```

### 🎯 Field Order (Important!)

The fields must be sent in this exact order for the model to work correctly:

1. loan_amnt
2. term
3. int_rate
4. installment
5. grade
6. emp_length
7. home_ownership
8. annual_inc
9. purpose
10. dti
11. delinq_2yrs
12. inq_last_6mths
13. open_acc
14. revol_bal
15. revol_util
16. total_acc

### ✅ Validation Rules

All fields are validated in the backend API:

- **loan_amnt**: Must be > 0
- **term**: Must be > 0
- **int_rate**: Must be between 0-100
- **installment**: Must be > 0
- **grade**: Must be >= 0
- **emp_length**: Must be >= 0
- **home_ownership**: Must be >= 0
- **annual_inc**: Must be > 0
- **purpose**: Must be >= 0
- **dti**: Must be >= 0
- **delinq_2yrs**: Must be >= 0
- **inq_last_6mths**: Must be >= 0
- **open_acc**: Must be >= 0
- **revol_bal**: Must be >= 0
- **revol_util**: Must be between 0-100
- **total_acc**: Must be >= 0

### 🔍 Testing

To test if fields are aligned, use this sample data:

```json
{
  "loan_amnt": 10000,
  "term": 36,
  "int_rate": 10.5,
  "installment": 323.0,
  "grade": 2,
  "emp_length": 5,
  "home_ownership": 1,
  "annual_inc": 50000,
  "purpose": 0,
  "dti": 15.5,
  "delinq_2yrs": 0,
  "inq_last_6mths": 1,
  "open_acc": 8,
  "revol_bal": 5000,
  "revol_util": 30.5,
  "total_acc": 12
}
```

### ✅ Status: ALL FIELDS ALIGNED

The frontend, backend API, and ML model are all synchronized and using the same field names and data types.
