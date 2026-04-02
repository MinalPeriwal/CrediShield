from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database.db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    organization = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False, server_default="bank_employee")  # "bank_employee" | "ca_admin"
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    assessments = relationship("Assessment", back_populates="user", cascade="all, delete")


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Loan inputs (stored for audit trail)
    loan_amnt = Column(Float)
    annual_inc = Column(Float)
    dti = Column(Float)
    int_rate = Column(Float)
    grade = Column(Float)
    term = Column(Float)

    # Results
    risk_probability = Column(Float, nullable=False)
    credit_score = Column(Integer, nullable=False)
    default_prediction = Column(String, nullable=False)  # "Default" | "No Default"
    risk_level = Column(String, nullable=False)          # "Low" | "Medium" | "High"
    status = Column(String, nullable=False)              # "Approved" | "Review" | "Rejected"

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="assessments")
    documents = relationship("DocumentLog", back_populates="assessment", cascade="all, delete")


class DocumentLog(Base):
    __tablename__ = "document_logs"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    doc_type = Column(String, nullable=False)       # "aadhar" | "pan" | "passport"
    filename = Column(String, nullable=False)
    verdict = Column(String, nullable=False)        # "REAL" | "FAKE" | "SUSPICIOUS"
    confidence = Column(Float, nullable=True)
    fake_score = Column(Float, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    assessment = relationship("Assessment", back_populates="documents")
