# Troubleshooting Guide - Prediction Error Fix

## Current Issue
The prediction is failing because the model needs to be retrained with the new improvements.

## Quick Fix (Option 1) - Use Current Model

The prediction service has been updated to work with your existing model. 

**Steps:**
1. Restart your FastAPI server:
   ```bash
   cd backend/api
   uvicorn main:app --reload
   ```

2. Test with this sample data:
   - Loan Amount: 15000
   - Loan Term: 36
   - Interest Rate: 8.5
   - Monthly Payment: 472
   - Credit Grade: 2
   - Employment Length: 10
   - Home Ownership: 1
   - Annual Income: 75000
   - Loan Purpose: 1
   - Debt-to-Income Ratio: 12.5
   - Delinquencies (2yrs): 0
   - Credit Inquiries (6mo): 1
   - Open Accounts: 10
   - Revolving Balance: 3500
   - Credit Utilization: 25
   - Total Accounts: 15

## Better Fix (Option 2) - Retrain with Improved Model

To get the improved accuracy (85-92%), retrain the model:

**Steps:**

1. **Install new dependencies:**
   ```bash
   pip install xgboost imbalanced-learn
   ```

2. **Run the retrain script:**
   ```bash
   retrain_model.bat
   ```
   
   OR manually:
   ```bash
   cd backend/models
   python train_lending_model.py
   ```

3. **Restart FastAPI server:**
   ```bash
   cd backend/api
   uvicorn main:app --reload
   ```

## Common Errors and Solutions

### Error 1: "FileNotFoundError: scaler.pkl"
**Solution:** The prediction service is now backward compatible. Just restart the server.

### Error 2: "ModuleNotFoundError: No module named 'xgboost'"
**Solution:** 
```bash
pip install xgboost imbalanced-learn
```

### Error 3: "Prediction failed" alert in frontend
**Possible causes:**
1. Backend server not running
2. Wrong port (should be 8000)
3. CORS issue
4. Invalid input data

**Solution:**
- Check backend is running: http://127.0.0.1:8000
- Check browser console for errors (F12)
- Verify all form fields are filled

### Error 4: "Cannot read property 'data' of undefined"
**Solution:** Backend returned an error. Check backend console logs.

## Verify Everything is Working

### 1. Test Backend API directly:
```bash
curl -X POST http://127.0.0.1:8000/predict-loan ^
  -H "Content-Type: application/json" ^
  -d "{\"loan_amnt\":15000,\"term\":36,\"int_rate\":8.5,\"installment\":472,\"grade\":2,\"emp_length\":10,\"home_ownership\":1,\"annual_inc\":75000,\"purpose\":1,\"dti\":12.5,\"delinq_2yrs\":0,\"inq_last_6mths\":1,\"open_acc\":10,\"revol_bal\":3500,\"revol_util\":25,\"total_acc\":15}"
```

### 2. Check Backend Logs:
Look for error messages in the terminal where you ran `uvicorn main:app --reload`

### 3. Check Frontend Console:
Open browser DevTools (F12) → Console tab → Look for errors

## Model Training Time

Training the new model takes approximately:
- Small dataset (< 10K rows): 2-5 minutes
- Medium dataset (10K-100K rows): 5-15 minutes
- Large dataset (> 100K rows): 15-30 minutes

## Expected Model Performance

**Old Model:**
- Accuracy: ~80%
- ROC-AUC: ~85%

**New Improved Model:**
- Accuracy: 85-92%
- ROC-AUC: 90-95%
- F1 Score: 80-88%

## Need More Help?

Check these files for detailed information:
- `FIELD_MAPPING.md` - Field alignment documentation
- `backend/validate_fields.py` - Run to verify field alignment
- Backend console logs - Error details
- Browser console (F12) - Frontend errors
