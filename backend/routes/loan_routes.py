from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database.db import get_db
from database.models import User, Assessment, DocumentLog
from services.prediction_service import predict_loan
from services.doc_verification_service import verify_document
from dependencies import get_current_user

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
def predict(
    data: LoanRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        result = predict_loan(data.dict())

        # Calibrated thresholds from model's actual probability distribution
        # on 5000 real Lending Club samples: p33=0.115, p66=0.233
        prob = result["risk_probability"]
        risk_level = "Low" if prob < 0.115 else "Medium" if prob < 0.233 else "High"
        status = (
            "Rejected" if risk_level == "High"
            else "Review" if risk_level == "Medium"
            else "Approved"
        )

        # Persist to DB
        assessment = Assessment(
            user_id=current_user.id,
            loan_amnt=data.loan_amnt,
            annual_inc=data.annual_inc,
            dti=data.dti,
            int_rate=data.int_rate,
            grade=data.grade,
            term=data.term,
            risk_probability=prob,
            credit_score=result["credit_score"],
            default_prediction=result["default_prediction"],
            risk_level=risk_level,
            status=status
        )
        db.add(assessment)
        db.commit()
        db.refresh(assessment)

        result["assessment_id"] = assessment.id
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@router.post("/verify-document")
async def verify_doc(
    file: UploadFile = File(...),
    doc_type: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    allowed_types = {"image/jpeg", "image/png", "image/jpg", "image/webp"}
    allowed_extensions = {".jpg", ".jpeg", ".png", ".webp"}
    import os
    ext = os.path.splitext(file.filename or "")[1].lower()
    if file.content_type not in allowed_types or ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Only image files (JPG, PNG, WEBP) are supported.")

    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds 10MB limit.")

    try:
        result = verify_document(contents, doc_type)

        # Persist doc log
        doc_log = DocumentLog(
            user_id=current_user.id,
            doc_type=doc_type,
            filename=file.filename,
            verdict=result["verdict"],
            confidence=result.get("confidence"),
            fake_score=result.get("fake_score")
        )
        db.add(doc_log)
        db.commit()

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Verification error: {str(e)}")


@router.get("/admin/stats")
def get_admin_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "ca_admin":
        raise HTTPException(status_code=403, detail="Access denied. CA Admin only.")

    users = db.query(User).filter(User.role == "bank_employee").all()
    result = []
    for u in users:
        assessments = db.query(Assessment).filter(Assessment.user_id == u.id).all()
        result.append({
            "id": u.id,
            "full_name": u.full_name,
            "email": u.email,
            "organization": u.organization,
            "joined": u.created_at.isoformat() if u.created_at else None,
            "total_loans": len(assessments),
            "approved": sum(1 for a in assessments if a.status == "Approved"),
            "rejected": sum(1 for a in assessments if a.status == "Rejected"),
            "review": sum(1 for a in assessments if a.status == "Review"),
            "recent_loans": [
                {
                    "id": f"LA-{str(a.id).zfill(3)}",
                    "amount": f"₹{a.loan_amnt:,.0f}",
                    "status": a.status,
                    "risk": a.risk_level,
                    "score": a.credit_score,
                    "created_at": a.created_at.isoformat() if a.created_at else None
                }
                for a in sorted(assessments, key=lambda x: x.created_at or 0, reverse=True)[:5]
            ]
        })
    return {
        "total_employees": len(users),
        "total_loans": sum(e["total_loans"] for e in result),
        "total_approved": sum(e["approved"] for e in result),
        "total_rejected": sum(e["rejected"] for e in result),
        "employees": result
    }


@router.get("/reports")
def get_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    assessments = (
        db.query(Assessment)
        .filter(Assessment.user_id == current_user.id)
        .order_by(Assessment.created_at.desc())
        .all()
    )

    return [
        {
            "id": f"LA-{str(a.id).zfill(3)}",
            "amount": f"₹{a.loan_amnt:,.0f}",
            "risk": a.risk_level,
            "score": a.credit_score,
            "status": a.status,
            "created_at": a.created_at.isoformat() if a.created_at else None
        }
        for a in assessments
    ]
