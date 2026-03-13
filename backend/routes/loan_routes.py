from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.prediction_service import predict_loan

router = APIRouter()

class LoanRequest(BaseModel):
    loan_amnt: float
    term: float
    int_rate: float
    installment: float
    grade: float
    emp_length: float
    home_ownership: float
    annual_inc: float
    purpose: float
    dti: float
    delinq_2yrs: float
    inq_last_6mths: float
    open_acc: float
    revol_bal: float
    revol_util: float
    total_acc: float

@router.post("/predict-loan")
def predict(data: LoanRequest):
    try:
        loan_data = data.dict()
        result = predict_loan(loan_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")