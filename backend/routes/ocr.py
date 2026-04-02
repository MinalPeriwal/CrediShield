import os
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional
from services.doc_verification_service import verify_document, _ocr, _preprocess

router = APIRouter()

_HINT_LABELS = {
    "aadhar":   "Aadhaar Card",
    "pan":      "PAN Card",
    "passport": "Passport",
}

_ALLOWED_TYPES = {"image/jpeg", "image/png", "image/jpg", "image/webp"}
_ALLOWED_EXT   = {".jpg", ".jpeg", ".png", ".webp"}


@router.post("/upload-doc")
async def upload_doc(file: UploadFile = File(...), doc_hint: Optional[str] = Form(None)):
    ext = os.path.splitext(file.filename or "")[1].lower()
    if file.content_type not in _ALLOWED_TYPES or ext not in _ALLOWED_EXT:
        raise HTTPException(status_code=400, detail="Only JPG, PNG, or WEBP images are supported.")

    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds 10MB.")

    doc_type = _HINT_LABELS.get(doc_hint, doc_hint or "Document")
    result   = verify_document(contents, doc_type)

    # Map verdict to frontend-expected status
    status = {"REAL": "Real", "SUSPICIOUS": "Suspicious", "FAKE": "Fake"}.get(result["verdict"], "Fake")

    extracted = {
        "status":     status,
        "reason":     result["message"],
        "confidence": f"{result['confidence']}%",
    }

    fields = result.get("fields", {})
    if fields.get("number"):
        extracted["ID Number"] = fields["number"]
    if fields.get("mrz"):
        extracted["MRZ"] = fields["mrz"]
    if fields.get("keywords"):
        extracted["Keywords"] = ", ".join(fields["keywords"][:4])
    if result.get("name"):
        extracted["Name"] = result["name"]
    if result.get("dob"):
        extracted["DOB"] = result["dob"]
    if not result.get("ocr_available", True):
        extracted["note"] = "Tesseract not installed — pattern matching unavailable"

    return {
        "document_type":  doc_type,
        "verdict":        result["verdict"],
        "extracted_data": extracted,
    }


@router.post("/debug-ocr")
async def debug_ocr(file: UploadFile = File(...)):
    """Returns raw OCR text — use this to see exactly what Tesseract reads from your document."""
    contents = await file.read()
    text = _ocr(contents)
    return {"ocr_text": text, "lines": text.splitlines()}
