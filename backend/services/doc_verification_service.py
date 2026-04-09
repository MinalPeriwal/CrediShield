import re
import os
import io
import shutil
import numpy as np
from PIL import Image, ImageFilter, ImageEnhance

try:
    import cv2
    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False

try:
    import pytesseract
    if not shutil.which("tesseract"):
        _tess = os.getenv("TESSERACT_PATH", r"C:\Program Files\Tesseract-OCR\tesseract.exe")
        if os.path.exists(_tess):
            pytesseract.pytesseract.tesseract_cmd = _tess
    OCR_AVAILABLE = True
except ImportError:
    OCR_AVAILABLE = False

# OCR noise corrections: common Tesseract misreads on Indian documents
_OCR_FIXES = [
    (r"(?<![A-Z])0(?=[A-Z])|(?<=[A-Z])0(?![A-Z0-9])", "O"),  # 0 → O in letter context
    (r"(?<=[A-Z])1(?=[A-Z])", "I"),                            # 1 → I between letters
    (r"\bUlDAl\b", "UIDAI"),
    (r"\bAadhaar\b", "Aadhaar"),
    (r"\bGovt\b", "Govt"),
    (r"[|l]ndia", "India"),
    (r"D\.0\.B", "D.O.B"),
    (r"(?i)\bdat[e3]\s+of\s+b[il1]rth\b", "Date of Birth"),
]


# ── Document patterns ─────────────────────────────────────────────────────────

# DOB: DD/MM/YYYY, DD-MM-YYYY, DD MMM YYYY, YYYY-MM-DD
_DOB_RE = re.compile(
    r"\b(\d{1,2}[/\-]\d{1,2}[/\-]\d{4}"
    r"|\d{4}[/\-]\d{1,2}[/\-]\d{1,2}"
    r"|\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4})\b",
    re.IGNORECASE
)

# DOB label-based: "DOB", "Date of Birth", "D.O.B" followed by date
_DOB_LABEL_RE = re.compile(
    r"(?:date\s*of\s*birth|dob|d\.o\.b)[\s:/-]*"
    r"(\d{1,2}[/\-]\d{1,2}[/\-]\d{4}"
    r"|\d{4}[/\-]\d{1,2}[/\-]\d{1,2}"
    r"|\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4})",
    re.IGNORECASE
)

# Name patterns per document type
# Aadhaar: name is usually on a standalone line after UIDAI header, all caps or title case
_AADHAAR_NAME_RE = re.compile(
    r"^([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){1,4})$",
    re.MULTILINE
)
# PAN: name appears after "Name" label or as a standalone all-caps line
_PAN_NAME_RE = re.compile(
    r"(?:^|name[\s:]+)([A-Z][A-Z\s]{3,40})$",
    re.MULTILINE | re.IGNORECASE
)
# Passport: Surname + Given Name fields
_PASSPORT_NAME_RE = re.compile(
    r"(?:surname|given\s*name|name)[\s:/-]+([A-Z][A-Za-z\s]{2,40})",
    re.IGNORECASE
)
# Generic fallback
_NAME_RE = re.compile(r"(?:name|surname|given\s*name)\s*[:\-]?\s*([A-Z][A-Za-z\s]{2,40})", re.IGNORECASE)

_PATTERNS = {
    "aadhaar": {
        "number":   re.compile(r"\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b"),
        "keywords": ["aadhaar", "aadhar", "uidai", "unique identification authority",
                     "government of india", "date of birth", "male", "female", "dob"],
    },
    "pan": {
        "number":       re.compile(r"\b[A-Z]{5}[0-9]{4}[A-Z]\b"),
        "number_fuzzy": re.compile(r"\b[A-Z0-9]{5}[0-9OILT]{4}[A-Z]\b"),
        "keywords": ["permanent account number", "income tax", "pan",
                     "govt. of india", "government of india", "father", "date of birth"],
    },
    "passport": {
        "number":   re.compile(r"[A-Z]\d{7}"),
        "mrz":      re.compile(r"P[<«ec][A-Z]{3}[A-Z<«ec ]{5,}"),
        "keywords": ["passport", "republic of india", "nationality", "surname",
                     "date of birth", "place of birth", "date of expiry", "given name"],
    },
}

_DOC_HINT_MAP = {
    "aadhaar card": "aadhaar",
    "aadhar card":  "aadhaar",
    "aadhaar":      "aadhaar",
    "aadhar":       "aadhaar",
    "pan card":     "pan",
    "pan":          "pan",
    "passport":     "passport",
}


# ── Image preprocessing ───────────────────────────────────────────────────────

def _preprocess(image_bytes: bytes) -> Image.Image:
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    w, h = img.size
    # Upscale to at least 1800px wide for better OCR on small/phone photos
    if w < 1800:
        scale = 1800 / w
        img = img.resize((int(w * scale), int(h * scale)), Image.LANCZOS)
    img = ImageEnhance.Contrast(img).enhance(2.5)
    img = ImageEnhance.Sharpness(img).enhance(3.0)
    img = ImageEnhance.Brightness(img).enhance(1.1)
    img = img.filter(ImageFilter.SHARPEN)
    gray = img.convert("L")
    if CV2_AVAILABLE:
        arr = np.array(gray)
        # Deskew: rotate to straighten text
        coords = np.column_stack(np.where(arr < 128))
        if len(coords) > 100:
            angle = cv2.minAreaRect(coords.astype(np.float32))[-1]
            if angle < -45:
                angle = 90 + angle
            if abs(angle) > 0.5:
                (hh, ww) = arr.shape
                M = cv2.getRotationMatrix2D((ww // 2, hh // 2), angle, 1.0)
                arr = cv2.warpAffine(arr, M, (ww, hh), flags=cv2.INTER_CUBIC,
                                     borderMode=cv2.BORDER_REPLICATE)
        # Denoise before thresholding
        arr = cv2.fastNlMeansDenoising(arr, h=15)
        arr = cv2.adaptiveThreshold(
            arr, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 21, 8
        )
        # Morphological cleanup to close broken characters
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (2, 2))
        arr = cv2.morphologyEx(arr, cv2.MORPH_CLOSE, kernel)
        return Image.fromarray(arr)
    return gray


def _apply_ocr_fixes(text: str) -> str:
    for pattern, replacement in _OCR_FIXES:
        text = re.sub(pattern, replacement, text)
    return text


# ── OCR ───────────────────────────────────────────────────────────────────────

def _ocr(image_bytes: bytes) -> str:
    if not OCR_AVAILABLE:
        return ""
    try:
        img = _preprocess(image_bytes)
        results = []
        # PSM 3 = auto, 6 = uniform block, 4 = single column — best for ID cards
        for psm in (3, 4, 6):
            try:
                cfg = f"--oem 3 --psm {psm} -l eng+hin --dpi 300"
                text = pytesseract.image_to_string(img, config=cfg)
                results.append(_apply_ocr_fixes(text))
            except Exception:
                pass
        # Merge: pick the longest result per unique line (most complete read)
        seen = set()
        merged = []
        for text in sorted(results, key=len, reverse=True):
            for line in text.splitlines():
                line = line.strip()
                if line and line not in seen:
                    seen.add(line)
                    merged.append(line)
        return "\n".join(merged)
    except Exception as e:
        print(f"OCR error: {e}")
        return ""


# ── Pattern matching ──────────────────────────────────────────────────────────

def _match(text: str, doc_key: str) -> dict:
    upper = text.upper()
    lower = text.lower()
    p = _PATTERNS[doc_key]
    found = {}
    score = 0.0

    # Number match
    if doc_key == "passport":
        # findall to get all candidates, pick one that's not part of a longer word
        candidates = p["number"].findall(upper)
        # filter out matches embedded in long digit strings (dates etc.)
        candidates = [c for c in candidates if len(c) == 8]
        if candidates:
            found["number"] = candidates[-1]  # last match is usually the passport number
            score += 0.5
    else:
        m = p["number"].search(upper)
        if not m and doc_key == "pan":
            m = p["number_fuzzy"].search(upper)
        if m:
            found["number"] = (m.group(1) if m.lastindex else m.group()).strip()
            score += 0.5

    # MRZ for passport
    if doc_key == "passport":
        mrz = p["mrz"].search(upper)
        if mrz:
            found["mrz"] = mrz.group()[:24] + "..."
            score += 0.2

    # Keyword hits
    hits = [kw for kw in p["keywords"] if kw in lower]
    found["keywords"] = hits
    score += min(len(hits) * 0.1, 0.5)

    # Extract name — document-specific
    name = None
    _SKIP_WORDS = {"aadhaar", "aadhar", "uidai", "government", "india", "male", "female",
                   "dob", "date", "birth", "address", "help", "enrollment", "vid",
                   "permanent", "account", "number", "income", "tax", "passport",
                   "republic", "nationality", "authority", "unique", "identification"}
    if doc_key == "aadhaar":
        for m in _AADHAAR_NAME_RE.finditer(text):
            candidate = m.group(1).strip()
            words = candidate.lower().split()
            if not any(s in words for s in _SKIP_WORDS) and 2 <= len(words) <= 5 and len(candidate) > 4:
                name = candidate.title()
                break
        # Fallback: look for line after "Name" label
        if not name:
            lines = text.splitlines()
            for i, line in enumerate(lines):
                if re.search(r"^name\s*[:\-]?\s*$", line.strip(), re.IGNORECASE) and i + 1 < len(lines):
                    candidate = lines[i + 1].strip()
                    if re.match(r"^[A-Za-z\s]{4,40}$", candidate):
                        name = candidate.title()
                        break
    elif doc_key == "pan":
        # PAN: name is usually the ALL-CAPS line just before father's name
        lines = [l.strip() for l in text.splitlines() if l.strip()]
        for i, line in enumerate(lines):
            if re.match(r"^[A-Z][A-Z\s]{3,39}$", line) and not any(s in line.lower() for s in _SKIP_WORDS):
                name = line.title()
                break
        if not name:
            m = _PAN_NAME_RE.search(text)
            if m:
                name = m.group(1).strip().title()
    elif doc_key == "passport":
        m = _PASSPORT_NAME_RE.search(text)
        if m:
            name = m.group(1).strip().title()
    if not name:
        m = _NAME_RE.search(text)
        if m:
            name = m.group(1).strip().title()
    # Final cleanup: remove stray single chars and numeric tokens
    if name:
        name = re.sub(r"\b[A-Z0-9]\b", "", name).strip()
        name = re.sub(r"\s{2,}", " ", name).strip()
    if name and len(name) > 3:
        found["name"] = name

    # Extract DOB — prefer label-based match, fallback to bare date
    dob_m = _DOB_LABEL_RE.search(text)
    if not dob_m:
        dob_m = _DOB_RE.search(text)
    if dob_m:
        found["dob"] = dob_m.group(1).strip()

    return {"fields": found, "score": min(score, 1.0)}


# ── Image quality check ───────────────────────────────────────────────────────

def _quality(image_bytes: bytes) -> float:
    """Returns a fake_score 0–1 based on image quality. Lower = better quality."""
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    arr = np.array(img, dtype=np.float32)
    w, h = img.size
    bad = 0
    if w < 100 or h < 100:
        bad += 1
    brightness = float(np.mean(arr))
    if brightness < 10 or brightness > 252:
        bad += 1
    gray = np.mean(arr, axis=2)
    edges = float(np.mean(np.abs(np.diff(gray, axis=1))) + np.mean(np.abs(np.diff(gray, axis=0))))
    if edges < 0.5:
        bad += 1
    return bad / 3


# ── Public API ────────────────────────────────────────────────────────────────

def verify_document(image_bytes: bytes, doc_type: str) -> dict:
    doc_key      = _DOC_HINT_MAP.get(doc_type.lower())
    quality_fake = _quality(image_bytes)

    # Completely unreadable image
    if quality_fake >= 1.0:
        return {
            "verdict":    "FAKE",
            "confidence": 100.0,
            "message":    f"{doc_type} image is unreadable — too dark, too small, or blank.",
            "fields":     {},
            "ocr_text":   "",
        }

    ocr_text = _ocr(image_bytes)

    if not doc_key:
        return {
            "verdict":    "SUSPICIOUS",
            "confidence": 50.0,
            "message":    "Unknown document type. Manual review required.",
            "fields":     {},
            "ocr_text":   ocr_text[:200],
        }

    result     = _match(ocr_text, doc_key)
    # OCR = 80%, image quality = 20%
    real_score = 0.8 * result["score"] + 0.2 * (1 - quality_fake)
    fake_score = round(1 - real_score, 4)

    if real_score >= 0.35:
        verdict    = "REAL"
        confidence = round(real_score * 100, 1)
        message    = f"{doc_type} verified successfully."
    elif real_score >= 0.15:
        verdict    = "SUSPICIOUS"
        confidence = round(real_score * 100, 1)
        message    = f"{doc_type} partially matched. Manual review recommended."
    else:
        verdict    = "FAKE"
        confidence = round(fake_score * 100, 1)
        message    = f"{doc_type} could not be verified — no valid patterns found."

    return {
        "verdict":       verdict,
        "confidence":    confidence,
        "message":       message,
        "fake_score":    fake_score,
        "fields":        result["fields"],
        "name":          result["fields"].get("name"),
        "dob":           result["fields"].get("dob"),
        "ocr_available": OCR_AVAILABLE,
    }
