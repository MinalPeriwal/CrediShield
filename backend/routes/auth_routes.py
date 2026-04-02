import random, time, smtplib, os
from email.message import EmailMessage
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from database.db import get_db
from services.auth_service import (
    get_user_by_email, register_user,
    authenticate_user, create_access_token
)

router = APIRouter(prefix="/auth", tags=["auth"])

# In-memory OTP store: email -> {otp, expires_at, data}
_otp_store: dict = {}

def send_otp_email(to_email: str, otp: str):
    host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    port = int(os.getenv("SMTP_PORT", 587))
    user = os.getenv("SMTP_USER", "")
    password = os.getenv("SMTP_PASS", "")
    msg = EmailMessage()
    msg["Subject"] = "CrediShield - Your OTP Code"
    msg["From"] = user
    msg["To"] = to_email
    msg.set_content(f"Your CrediShield verification code is: {otp}\n\nThis code expires in 10 minutes.")
    with smtplib.SMTP(host, port) as s:
        s.starttls()
        s.login(user, password)
        s.send_message(msg)


class RegisterRequest(BaseModel):
    fullName: str
    email: EmailStr
    password: str
    organization: str
    role: str = "bank_employee"  # "bank_employee" | "ca_admin"


class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


@router.post("/send-otp")
def send_otp(data: RegisterRequest, db: Session = Depends(get_db)):
    if get_user_by_email(db, data.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    otp = str(random.randint(100000, 999999))
    _otp_store[data.email] = {
        "otp": otp,
        "expires_at": time.time() + 600,  # 10 min
        "data": data.model_dump()
    }
    try:
        send_otp_email(data.email, otp)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send OTP: {str(e)}")
    return {"message": "OTP sent to your email"}


@router.post("/verify-otp")
def verify_otp(data: VerifyOtpRequest, db: Session = Depends(get_db)):
    entry = _otp_store.get(data.email)
    if not entry:
        raise HTTPException(status_code=400, detail="No OTP requested for this email")
    if time.time() > entry["expires_at"]:
        _otp_store.pop(data.email, None)
        raise HTTPException(status_code=400, detail="OTP expired")
    if entry["otp"] != data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    reg = entry["data"]
    _otp_store.pop(data.email, None)
    user = register_user(db, reg["fullName"], reg["email"], reg["password"], reg["organization"], reg.get("role", "bank_employee"))
    token = create_access_token({"sub": user.id})
    return {"access_token": token, "fullName": user.full_name, "role": user.role}


@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, data.email, data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": user.id})
    return {"access_token": token, "fullName": user.full_name, "role": user.role}
