import { useState, useMemo } from "react";
import axios from "axios";
import Login from "./Login.jsx";
import Signup from "./Signup.jsx";
import Dashboard from "./Dashboard.jsx";
import Reports from "./Reports.jsx";
import CADashboard from "./CADashboard.jsx";
import "./App.css";

function RiskAssessment({ onNewAssessment }) {
  const [formData, setFormData] = useState({
    loan_amnt: "", term: "", int_rate: "", grade: "",
    emp_length: "", home_ownership: "", annual_inc: "", purpose: "",
    delinq_2yrs: "", inq_last_6mths: "", open_acc: "",
    revol_bal: "", total_acc: ""
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [uploadedDocs, setUploadedDocs] = useState({});
  const [identityWarning, setIdentityWarning] = useState(null);

  const docTypes = [
    {
      key: "aadhar", label: "Aadhaar Card",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="8" cy="12" r="2"/><path d="M14 9h4M14 12h4M14 15h2"/></svg>
    },
    {
      key: "pan", label: "PAN Card",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/><line x1="6" y1="15" x2="10" y2="15"/><line x1="14" y1="15" x2="18" y2="15"/></svg>
    },
    {
      key: "passport", label: "Passport",
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M8 17h8M9 14h6"/></svg>
    },
  ];

  const [ocrResults, setOcrResults] = useState({});

  const handleDocUpload = async (key, e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadedDocs(prev => ({ ...prev, [key]: file.name }));
    // clear previous result while processing
    setOcrResults(prev => { const d = { ...prev }; delete d[key]; return d; });

    const fd = new FormData();
    fd.append("file", file);
    fd.append("doc_hint", key);  // tell backend which slot this is
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/ocr/upload-doc`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      setOcrResults(prev => ({ ...prev, [key]: data }));
    } catch (err) {
      console.error("OCR upload failed:", err);
      setOcrResults(prev => ({
        ...prev,
        [key]: { document_type: "Error", extracted_data: { status: "Fake", reason: "Could not reach OCR server" } }
      }));
    }
  };

  const removeDoc = (key) => {
    setUploadedDocs(prev => { const d = { ...prev }; delete d[key]; return d; });
    setOcrResults(prev => { const d = { ...prev }; delete d[key]; return d; });
  };

  // --- Helper: EMI = P * r * (1+r)^n / ((1+r)^n - 1)
  const calculateEMI = (principal, annualRate, termMonths) => {
    const r = annualRate / 100 / 12;
    if (r === 0) return principal / termMonths;
    const n = termMonths;
    return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  };

  // --- Helper: DTI = (annual EMI / annual income) * 100
  const calculateDTI = (emi, annualInc) => {
    if (!annualInc || annualInc <= 0) return 0;
    return ((emi * 12) / annualInc) * 100;
  };

  // --- Live derived metrics (recalculate on every relevant field change)
  const derived = useMemo(() => {
    const p = Number(formData.loan_amnt);
    const r = Number(formData.int_rate);
    const n = Number(formData.term);
    const inc = Number(formData.annual_inc);
    const rb = Number(formData.revol_bal);
    const ta = Number(formData.total_acc);
    if (!p || !r || !n) return null;
    const emi = calculateEMI(p, r, n);
    const dti = calculateDTI(emi, inc);
    const revolUtil = ta > 0 ? Math.min((rb / (ta * 5000)) * 100, 100) : 0;
    if ([emi, dti, revolUtil].some(v => isNaN(v) || !isFinite(v))) return null;
    return { emi, dti, revolUtil };
  }, [formData.loan_amnt, formData.int_rate, formData.term, formData.annual_inc, formData.revol_bal, formData.total_acc]);

  // Dropdown options — values are the exact LabelEncoder-encoded integers
  // from the Lending Club training data (alphabetical order per sklearn LabelEncoder)
  const SELECT_OPTIONS = {
    term: [
      { label: "36 months", value: 36 },
      { label: "60 months", value: 60 },
    ],
    grade: [
      { label: "A — Excellent", value: 0 },
      { label: "B — Good", value: 1 },
      { label: "C — Fair", value: 2 },
      { label: "D — Below Average", value: 3 },
      { label: "E — Poor", value: 4 },
      { label: "F — Very Poor", value: 5 },
      { label: "G — Worst", value: 6 },
    ],
    emp_length: [
      { label: "1 year",    value: 0 },
      { label: "10+ years", value: 1 },
      { label: "2 years",   value: 2 },
      { label: "3 years",   value: 3 },
      { label: "4 years",   value: 4 },
      { label: "5 years",   value: 5 },
      { label: "6 years",   value: 6 },
      { label: "7 years",   value: 7 },
      { label: "8 years",   value: 8 },
      { label: "9 years",   value: 9 },
      { label: "< 1 year",  value: 10 },
    ],
    home_ownership: [
      { label: "Mortgage", value: 0 },
      { label: "None",     value: 1 },
      { label: "Other",    value: 2 },
      { label: "Own",      value: 3 },
      { label: "Rent",     value: 4 },
    ],
    purpose: [
      { label: "Car", value: 0 },
      { label: "Credit Card", value: 1 },
      { label: "Debt Consolidation", value: 2 },
      { label: "Educational", value: 3 },
      { label: "Home Improvement", value: 4 },
      { label: "House", value: 5 },
      { label: "Major Purchase", value: 6 },
      { label: "Medical", value: 7 },
      { label: "Moving", value: 8 },
      { label: "Other", value: 9 },
      { label: "Renewable Energy", value: 10 },
      { label: "Small Business", value: 11 },
      { label: "Vacation", value: 12 },
      { label: "Wedding", value: 13 },
    ],
  };

  // ── Field SVG Icons ──
  const FiIcons = {
    loan_amnt:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="5" x2="18" y2="5"/><line x1="6" y1="10" x2="18" y2="10"/><path d="M6 10l7 9"/><path d="M6 5h5a4 4 0 0 1 0 8H6"/></svg>,
    term:           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    int_rate:       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>,
    purpose:        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>,
    grade:          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    annual_inc:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
    emp_length:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    home_ownership: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    revol_bal:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
    total_acc:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    open_acc:       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
    delinq_2yrs:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    inq_last_6mths: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    emi:            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
    dti:            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
    revol_util:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  };

  const fieldConfig = {
    loan_amnt:     { label: "Loan Amount",          icon: FiIcons.loan_amnt,      unit: "₹",  category: "loan" },
    term:          { label: "Loan Term",             icon: FiIcons.term,           unit: "",   category: "loan" },
    int_rate:      { label: "Interest Rate",         icon: FiIcons.int_rate,       unit: "%",  category: "loan" },
    purpose:       { label: "Loan Purpose",          icon: FiIcons.purpose,        unit: "",   category: "loan" },
    grade:         { label: "Credit Grade",          icon: FiIcons.grade,          unit: "",   category: "credit" },
    annual_inc:    { label: "Annual Income",         icon: FiIcons.annual_inc,     unit: "₹",  category: "personal" },
    emp_length:    { label: "Employment Length",     icon: FiIcons.emp_length,     unit: "",   category: "personal" },
    home_ownership:{ label: "Home Ownership",        icon: FiIcons.home_ownership, unit: "",   category: "personal" },
    revol_bal:     { label: "Revolving Balance",     icon: FiIcons.revol_bal,      unit: "₹",  category: "financial" },
    total_acc:     { label: "Total Accounts",        icon: FiIcons.total_acc,      unit: "",   category: "credit" },
    open_acc:      { label: "Open Accounts",         icon: FiIcons.open_acc,       unit: "",   category: "credit" },
    delinq_2yrs:   { label: "Delinquencies (2yrs)",  icon: FiIcons.delinq_2yrs,   unit: "",   category: "credit" },
    inq_last_6mths:{ label: "Credit Inquiries (6mo)",icon: FiIcons.inq_last_6mths, unit: "",  category: "credit" },
  };

  const categories = {
    loan: "Loan Information",
    personal: "Personal Information",
    financial: "Financial Details",
    credit: "Credit History"
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // For text inputs: allow only valid numeric characters
    if (!(name in SELECT_OPTIONS) && value !== "" && !/^-?\d*\.?\d*$/.test(value)) return;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors({ ...errors, [name]: false });
  };

  const DERIVED_FIELDS = ["installment", "dti", "revol_util"];

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      if (!DERIVED_FIELDS.includes(key) && (formData[key] === "" || formData[key] === null)) {
        newErrors[key] = true;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const normalizeName = (name) => {
    return name
      .toLowerCase()
      .replace(/\b(pan\s*card|aadhaar\s*card?|aadhar\s*card?|passport|permanent\s*account\s*number|income\s*tax|govt\.?\s*of\s*india|government\s*of\s*india|republic\s*of\s*india|uidai|name|surname|given\s*name|date\s*of\s*birth|dob)\b/gi, "")
      .replace(/[^a-z\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  // Fuzzy name match: true if names share at least one significant word
  const namesMatch = (a, b) => {
    if (a === b) return true;
    const wordsA = a.split(" ").filter(w => w.length > 2);
    const wordsB = b.split(" ").filter(w => w.length > 2);
    return wordsA.some(w => wordsB.includes(w));
  };

  const normalizeDob = (dob) => {
    // Normalize DD/MM/YYYY and DD-MM-YYYY to DD/MM/YYYY
    return dob.trim().replace(/-/g, "/");
  };

  const checkIdentityMatch = () => {
    const uploadedKeys = Object.keys(uploadedDocs);
    if (uploadedKeys.length < 2) {
      return { valid: false, message: "Please upload at least 2 KYC documents for identity verification." };
    }

    const docsWithData = uploadedKeys.filter(k => ocrResults[k]?.extracted_data);
    if (docsWithData.length < 2) return { valid: true, message: null };

    const names = docsWithData
      .map(k => ocrResults[k]?.extracted_data?.Name)
      .filter(Boolean)
      .map(normalizeName);
    const dobs = docsWithData
      .map(k => ocrResults[k]?.extracted_data?.DOB)
      .filter(Boolean)
      .map(normalizeDob);

    const mismatches = [];

    if (names.length >= 2) {
      const allNamesMatch = names.every(n => namesMatch(n, names[0]));
      if (!allNamesMatch) mismatches.push(`Names do not match across documents: ${names.join(" vs ")}`);
    }
    if (dobs.length >= 2) {
      const allDobsMatch = dobs.every(d => d === dobs[0]);
      if (!allDobsMatch) mismatches.push(`Dates of birth do not match: ${dobs.join(" vs ")}`);
    }

    if (mismatches.length > 0) {
      return { valid: false, message: "⚠️ Identity Mismatch Detected: " + mismatches.join(" | ") };
    }
    return { valid: true, message: names.length > 0 ? `✅ Identity verified: ${names[0]}` : null };
  };

  const predictLoan = async () => {
    if (!validateForm()) {
      alert("Please fill in all fields before submitting.");
      return;
    }

    const identity = checkIdentityMatch();
    setIdentityWarning(identity.message ? { text: identity.message, isError: !identity.valid } : null);
    if (!identity.valid) {
      setLoading(false);
      return;
    }

    if (!derived) {
      alert("Calculated values are invalid. Please check Loan Amount, Interest Rate, and Term.");
      return;
    }
    const { emi, dti, revolUtil } = derived;

    setLoading(true);
    try {
      // Build payload with all 16 required fields explicitly
      const payload = {
        loan_amnt:      Number(formData.loan_amnt),
        term:           Number(formData.term),
        int_rate:       Number(formData.int_rate),
        installment:    parseFloat(emi.toFixed(2)),
        grade:          Number(formData.grade),
        emp_length:     Number(formData.emp_length),
        home_ownership: Number(formData.home_ownership),
        annual_inc:     Number(formData.annual_inc),
        purpose:        Number(formData.purpose),
        dti:            parseFloat(dti.toFixed(4)),
        delinq_2yrs:    Number(formData.delinq_2yrs),
        inq_last_6mths: Number(formData.inq_last_6mths),
        open_acc:       Number(formData.open_acc),
        revol_bal:      Number(formData.revol_bal),
        revol_util:     parseFloat(revolUtil.toFixed(4)),
        total_acc:      Number(formData.total_acc),
      };

      // Sanity check — no NaN or undefined values
      const invalid = Object.entries(payload).filter(([, v]) => isNaN(v) || v === undefined);
      if (invalid.length > 0) {
        alert(`Invalid values for: ${invalid.map(([k]) => k).join(", ")}`);
        setLoading(false);
        return;
      }

      console.log("Sending payload:", payload);

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/predict-loan`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });

      console.log("Response:", response.data);
      setResult(response.data);
      onNewAssessment(response.data, formData.loan_amnt);
    } catch (error) {
      console.error("Error details:", error);
      console.error("Error response:", error.response);
      
      if (error.response) {
        alert(`Prediction failed: ${error.response.data.detail || JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        alert("Cannot connect to backend. Make sure the server is running on http://127.0.0.1:8000");
      } else {
        alert("Prediction failed. Please verify your inputs and try again.");
      }
    }
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      loan_amnt: "", term: "", int_rate: "", grade: "",
      emp_length: "", home_ownership: "", annual_inc: "", purpose: "",
      delinq_2yrs: "", inq_last_6mths: "", open_acc: "",
      revol_bal: "", total_acc: ""
    });
    setResult(null);
    setErrors({});
    setIdentityWarning(null);
  };

  const isFormComplete =
    Object.entries(formData).every(([k, v]) => DERIVED_FIELDS.includes(k) || (v !== "" && v !== null)) &&
    Object.keys(uploadedDocs).length >= 2;

  const getRiskLevel = (prob) => {
    if (prob < 0.115) return { text: "Low Risk",    color: "#10b981", icon: "✅" };
    if (prob < 0.233) return { text: "Medium Risk", color: "#f59e0b", icon: "⚠️" };
    return               { text: "High Risk",   color: "#ef4444", icon: "❌" };
  };

  const getScoreRating = (score) => {
    if (score >= 750) return { text: "Excellent", color: "#10b981" };
    if (score >= 700) return { text: "Good", color: "#3b82f6" };
    if (score >= 650) return { text: "Fair", color: "#f59e0b" };
    return { text: "Poor", color: "#ef4444" };
  };

  return (
    <>
      <div className="main-content">
        <div className="hero-section">
          <h1 className="hero-title">AI-Powered Loan Risk Assessment</h1>
          <p className="hero-subtitle">Advanced machine learning algorithms to predict loan default risk with precision</p>
        </div>

        <div className="content-wrapper">
          <div className="form-section">
            <div className="section-header">
              <h2>Application Details</h2>
              <p>Enter the loan applicant information below</p>
            </div>

            <form autoComplete="off" onSubmit={(e) => e.preventDefault()}>
            {Object.entries(categories).map(([catKey, catName]) => (
              <div key={catKey} className="form-category">
                <h3 className="category-title">{catName}</h3>
                <div className="form-grid">
                  {Object.entries(fieldConfig)
                    .filter(([_, config]) => config.category === catKey)
                    .map(([field, config]) => (
                      <div key={field} className={`input-group ${errors[field] ? 'error' : ''}`}>
                        <label>
                          <span className="label-icon-svg">{config.icon}</span>
                          {config.label}
                        </label>
                        <div className="input-wrapper">
                          {SELECT_OPTIONS[field] ? (
                            <select
                              name={field}
                              value={formData[field]}
                              onChange={handleChange}
                              style={{ flex: 1, padding: "14px 16px", border: "2px solid #e2e8f0", borderRadius: "10px", fontSize: "1rem", background: "#f8fafc", cursor: "pointer" }}
                            >
                              <option value="">Select {config.label}</option>
                              {SELECT_OPTIONS[field].map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              name={field}
                              type="text"
                              inputMode="decimal"
                              value={formData[field]}
                              placeholder={`Enter ${config.label.toLowerCase()}`}
                              onChange={handleChange}
                              autoComplete="new-password"
                              autoCorrect="off"
                              autoCapitalize="off"
                              spellCheck="false"
                              data-form-type="other"
                            />
                          )}
                          {config.unit && <span className="input-unit">{config.unit}</span>}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
            </form>

            {/* --- Auto-calculated metrics panel (always visible) --- */}
            <div className="form-category" style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "10px", padding: "16px", marginTop: "8px" }}>
              <h3 className="category-title" style={{ color: "#0369a1" }}>⚙️ Auto-Calculated Metrics</h3>
              {!derived && (
                <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "10px" }}>
                  Fill in Loan Amount, Interest Rate, and Term to see calculated values.
                </p>
              )}
              <div className="form-grid">
                {[
                  { label: "Monthly EMI",          icon: FiIcons.emi,        value: derived ? `₹${derived.emi.toFixed(2)}` : "—" },
                  { label: "Debt-to-Income Ratio", icon: FiIcons.dti,        value: derived ? `${derived.dti.toFixed(2)}%` : "—" },
                  { label: "Credit Utilization",   icon: FiIcons.revol_util, value: derived ? `${derived.revolUtil.toFixed(2)}%` : "—" },
                ].map(({ label, icon, value }) => (
                  <div key={label} className="input-group">
                    <label><span className="label-icon-svg">{icon}</span>{label}</label>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        value={value}
                        readOnly
                        style={{
                          background: derived ? "#e0f2fe" : "#f1f5f9",
                          color: derived ? "#0c4a6e" : "#94a3b8",
                          fontWeight: derived ? 600 : 400,
                          cursor: "not-allowed",
                          border: derived ? "1.5px solid #7dd3fc" : "1.5px solid #e2e8f0"
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="ra-upload-section">
              <h3 className="category-title">📎 KYC Document Upload</h3>
              <div className="ra-upload-grid">
                {docTypes.map(({ key, label, icon }) => {
                  const ocr = ocrResults[key];
                  const status = ocr?.extracted_data?.status;
                  const isReal = status === 'Real';
                  const isSuspicious = status === 'Suspicious';
                  return (
                    <div key={key} className={`ra-upload-card ${uploadedDocs[key] ? 'uploaded' : ''}`}>
                      <div className="ra-upload-icon">{icon}</div>
                      <div className="ra-upload-info">
                        <span className="ra-upload-label">{label}</span>

                        {!uploadedDocs[key] && (
                          <label className="ra-upload-btn">
                            Choose File
                            <input type="file" accept=".jpg,.jpeg,.png,.webp" hidden onChange={(e) => handleDocUpload(key, e)} />
                          </label>
                        )}

                        {uploadedDocs[key] && (
                          <>
                            <span className="ra-upload-filename">📄 {uploadedDocs[key]}</span>

                            {/* Analyzing spinner */}
                            {!ocr && (
                              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>⏳ Analyzing...</span>
                            )}

                            {/* Verdict badge */}
                            {status && (
                              <span style={{
                                display: 'inline-block',
                                marginTop: '4px',
                                padding: '4px 12px',
                                borderRadius: '8px',
                                fontSize: '0.85rem',
                                fontWeight: '700',
                                background: isReal ? '#d1fae5' : isSuspicious ? '#fef3c7' : '#fee2e2',
                                color: isReal ? '#065f46' : isSuspicious ? '#92400e' : '#991b1b',
                                border: `1px solid ${isReal ? '#6ee7b7' : isSuspicious ? '#fcd34d' : '#fca5a5'}`,
                              }}>
                                {isReal ? '✅ REAL' : isSuspicious ? '⚠️ SUSPICIOUS' : '❌ FAKE'}
                              </span>
                            )}

                            {/* Extracted ID number */}
                            {ocr?.extracted_data?.['ID Number'] && (
                              <span style={{ fontSize: '0.8rem', color: '#3b82f6', fontWeight: 600 }}>
                                🔢 {ocr.extracted_data['ID Number']}
                              </span>
                            )}

                            {/* Name */}
                            {ocr?.extracted_data?.Name && (
                              <span style={{ fontSize: '0.8rem', color: '#1e293b', fontWeight: 600 }}>
                                👤 {ocr.extracted_data.Name}
                              </span>
                            )}

                            {/* DOB */}
                            {ocr?.extracted_data?.DOB && (
                              <span style={{ fontSize: '0.8rem', color: '#1e293b' }}>
                                🎂 DOB: {ocr.extracted_data.DOB}
                              </span>
                            )}

                            {/* Confidence */}
                            {ocr?.extracted_data?.confidence && (
                              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                Confidence: {ocr.extracted_data.confidence}
                              </span>
                            )}

                            {/* Reason */}
                            {ocr?.extracted_data?.reason && (
                              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                {ocr.extracted_data.reason}
                              </span>
                            )}

                            <button className="ra-remove-btn" onClick={() => removeDoc(key)}>Remove</button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {identityWarning && (
              <div style={{
                margin: '12px 0',
                padding: '12px 16px',
                borderRadius: '10px',
                fontSize: '0.9rem',
                fontWeight: 600,
                background: identityWarning.isError ? '#fee2e2' : '#d1fae5',
                color: identityWarning.isError ? '#991b1b' : '#065f46',
                border: `1px solid ${identityWarning.isError ? '#fca5a5' : '#6ee7b7'}`,
              }}>
                {identityWarning.text}
              </div>
            )}

            <div className="button-group">
              <button onClick={predictLoan} disabled={loading || !isFormComplete} className="btn-primary" title={!isFormComplete ? "Fill all fields and upload at least 2 KYC documents" : ""}>
                {loading ? (
                  <><span className="spinner"></span> Analyzing...</>
                ) : (
                  <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:6,verticalAlign:"middle"}}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>Analyze Risk</>
                )}
              </button>
              <button onClick={resetForm} className="btn-secondary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:6,verticalAlign:"middle"}}><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg>Reset Form
              </button>
            </div>
          </div>

          {result && (() => {
            const risk = getRiskLevel(result.risk_probability);
            const score = getScoreRating(result.credit_score);
            const isApproved = result.risk_probability < 0.115;
            const isReview   = result.risk_probability >= 0.115 && result.risk_probability < 0.233;
            const isRejected = result.risk_probability >= 0.233;
            const statusLabel = isApproved ? "APPROVED" : isReview ? "UNDER REVIEW" : "REJECTED";
            const statusColor = isApproved ? "#10b981" : isReview ? "#f59e0b" : "#ef4444";
            const statusBg = isApproved ? "linear-gradient(135deg,#064e3b,#10b981)" : isReview ? "linear-gradient(135deg,#78350f,#f59e0b)" : "linear-gradient(135deg,#7f1d1d,#ef4444)";

            // SVG arc for credit score gauge (300–900)
            const minScore = 300, maxScore = 900;
            const pct = Math.min(Math.max((result.credit_score - minScore) / (maxScore - minScore), 0), 1);
            const r = 54, cx = 70, cy = 70;
            const startAngle = 210, sweepMax = 300;
            const toRad = d => (d * Math.PI) / 180;
            const arcX = (angle) => cx + r * Math.cos(toRad(angle));
            const arcY = (angle) => cy + r * Math.sin(toRad(angle));
            const endAngle = startAngle + sweepMax * pct;
            const largeArc = sweepMax * pct > 180 ? 1 : 0;
            const trackEnd = startAngle + sweepMax;
            const trackLarge = sweepMax > 180 ? 1 : 0;

            const recommendations = isApproved
              ? ["✅ Approve loan at standard interest rate", "📋 Standard documentation required", "🔄 Schedule quarterly repayment review", "💳 Eligible for credit limit increase"]
              : isReview
              ? ["🔍 Request additional income proof", "📊 Consider co-applicant or guarantor", "💰 Reduce loan amount by 20–30%", "📅 Extend term to lower EMI burden"]
              : ["❌ Do not approve at current terms", "🚫 High default probability detected", "📉 Significant credit risk factors present", "🔁 Re-apply after 6 months with improved profile"];

            return (
              <div className="results-section">
                {/* Verdict Banner */}
                <div className="verdict-banner" style={{ background: statusBg }}>
                  <div className="verdict-icon-wrap">
                    <span className="verdict-icon">{isApproved ? "🏆" : isReview ? "⚖️" : "🚫"}</span>
                  </div>
                  <div className="verdict-text">
                    <span className="verdict-label">Loan Assessment Complete</span>
                    <span className="verdict-status">{statusLabel}</span>
                    <span className="verdict-sub">{risk.text} · {(result.risk_probability * 100).toFixed(1)}% default probability</span>
                  </div>
                  <div className="verdict-badge" style={{ background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.5)" }}>
                    <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.85)", textTransform: "uppercase", letterSpacing: "1px" }}>Decision</span>
                    <span style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fff" }}>{statusLabel}</span>
                  </div>
                </div>

                {/* Main metrics row */}
                <div className="result-metrics-row">

                  {/* Credit Score Gauge */}
                  <div className="metric-card gauge-card">
                    <span className="metric-card-title">Credit Score</span>
                    <svg viewBox="0 0 140 100" className="gauge-svg">
                      {/* track */}
                      <path
                        d={`M ${arcX(startAngle)} ${arcY(startAngle)} A ${r} ${r} 0 ${trackLarge} 1 ${arcX(trackEnd)} ${arcY(trackEnd)}`}
                        fill="none" stroke="#e2e8f0" strokeWidth="10" strokeLinecap="round"
                      />
                      {/* fill */}
                      {pct > 0 && (
                        <path
                          d={`M ${arcX(startAngle)} ${arcY(startAngle)} A ${r} ${r} 0 ${largeArc} 1 ${arcX(endAngle)} ${arcY(endAngle)}`}
                          fill="none" stroke={score.color} strokeWidth="10" strokeLinecap="round"
                          className="gauge-fill"
                        />
                      )}
                      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="22" fontWeight="800" fill={score.color}>{result.credit_score}</text>
                      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="9" fill="#64748b">out of 900</text>
                    </svg>
                    <span className="gauge-rating" style={{ color: score.color }}>{score.text}</span>
                    <div className="score-range-bar">
                      <span style={{ color: "#ef4444" }}>300</span>
                      <div className="score-range-track">
                        <div className="score-range-fill" style={{ width: `${pct * 100}%`, background: score.color }} />
                      </div>
                      <span style={{ color: "#10b981" }}>900</span>
                    </div>
                  </div>

                  {/* Risk Probability */}
                  <div className="metric-card risk-card">
                    <span className="metric-card-title">Default Risk</span>
                    <div className="risk-dial-wrap">
                      <div className="risk-dial" style={{ "--risk-pct": `${result.risk_probability * 100}%`, "--risk-color": risk.color }}>
                        <span className="risk-dial-value" style={{ color: risk.color }}>{(result.risk_probability * 100).toFixed(1)}%</span>
                        <span className="risk-dial-label">probability</span>
                      </div>
                    </div>
                    <div className="risk-segments">
                      {[["Low","#10b981","< 11.5%"],["Medium","#f59e0b","11.5–23.3%"],["High","#ef4444","> 23.3%"]].map(([l,c,r2]) => (
                        <div key={l} className="risk-seg" style={{ opacity: risk.text.startsWith(l) ? 1 : 0.35 }}>
                          <span style={{ width: 10, height: 10, borderRadius: "50%", background: c, display: "inline-block" }} />
                          <span style={{ fontSize: "0.78rem", color: c, fontWeight: 700 }}>{l}</span>
                          <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{r2}</span>
                        </div>
                      ))}
                    </div>
                    <div className="risk-bar-track">
                      <div className="risk-bar-fill" style={{ width: `${result.risk_probability * 100}%`, background: `linear-gradient(90deg, #10b981, ${risk.color})` }} />
                      <div className="risk-bar-marker" style={{ left: `${result.risk_probability * 100}%`, borderColor: risk.color }} />
                    </div>
                  </div>

                  {/* Prediction + Summary */}
                  <div className="metric-card summary-card">
                    <span className="metric-card-title">Prediction Summary</span>
                    <div className="prediction-badge" style={{ background: result.default_prediction === "Default" ? "#fee2e2" : "#d1fae5", border: `2px solid ${result.default_prediction === "Default" ? "#fca5a5" : "#6ee7b7"}` }}>
                      <span style={{ fontSize: "2rem" }}>{result.default_prediction === "Default" ? "⚠️" : "✅"}</span>
                      <span style={{ fontWeight: 800, fontSize: "1.1rem", color: result.default_prediction === "Default" ? "#991b1b" : "#065f46" }}>{result.default_prediction}</span>
                    </div>
                    <div className="summary-stats">
                      {[
                        { label: "Loan Amount", value: `₹${Number(formData.loan_amnt).toLocaleString("en-IN")}` },
                        { label: "Monthly EMI", value: derived ? `₹${derived.emi.toFixed(0)}` : "—" },
                        { label: "DTI Ratio", value: derived ? `${derived.dti.toFixed(1)}%` : "—" },
                        { label: "Annual Income", value: `₹${Number(formData.annual_inc).toLocaleString("en-IN")}` },
                      ].map(({ label, value }) => (
                        <div key={label} className="summary-stat-row">
                          <span className="summary-stat-label">{label}</span>
                          <span className="summary-stat-value">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Risk Factors from SHAP */}
                {result.risk_factors && result.risk_factors.length > 0 && (
                  <div className="risk-factors-panel">
                    <div className="risk-factors-header">
                      <span>🔬</span>
                      <span>Key Risk Factors <span style={{fontSize:"0.78rem",fontWeight:400,color:"#94a3b8"}}>(AI explanation — what drove this decision)</span></span>
                    </div>
                    <div className="risk-factors-list">
                      {result.risk_factors.map((f, i) => (
                        <div key={i} className="risk-factor-row">
                          <div className="rf-rank">#{i + 1}</div>
                          <div className="rf-bar-wrap">
                            <div className="rf-label-row">
                              <span className="rf-name">{f.feature}</span>
                              <span className="rf-impact" style={{ color: f.direction === "negative" ? "#ef4444" : "#10b981" }}>
                                {f.direction === "negative" ? "▲ Increases Risk" : "▼ Decreases Risk"}
                              </span>
                            </div>
                            <div className="rf-bar-track">
                              <div
                                className="rf-bar-fill"
                                style={{
                                  width: `${Math.min(Math.abs(f.shap_value) * 400, 100)}%`,
                                  background: f.direction === "negative"
                                    ? "linear-gradient(90deg,#fca5a5,#ef4444)"
                                    : "linear-gradient(90deg,#6ee7b7,#10b981)"
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="rf-footnote">Powered by SHAP (SHapley Additive exPlanations) — values show each feature's contribution to the default probability.</p>
                  </div>
                )}

                {/* Recommendations */}
                <div className="rec-card" style={{ borderLeft: `5px solid ${statusColor}`, background: isApproved ? "#f0fdf4" : isReview ? "#fffbeb" : "#fef2f2" }}>
                  <div className="rec-header">
                    <span className="rec-icon">{isApproved ? "💡" : isReview ? "🔎" : "📋"}</span>
                    <span className="rec-title" style={{ color: isApproved ? "#065f46" : isReview ? "#92400e" : "#991b1b" }}>Analyst Recommendations</span>
                  </div>
                  <div className="rec-list">
                    {recommendations.map((r, i) => (
                      <div key={i} className="rec-item" style={{ animationDelay: `${i * 0.1}s` }}>{r}</div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [showSignup, setShowSignup] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [userName, setUserName] = useState(localStorage.getItem("fullName") || "");
  const [userRole, setUserRole] = useState(localStorage.getItem("role") || "bank_employee");
  const [userOrg, setUserOrg] = useState(localStorage.getItem("organization") || "");
  const [userEmail, setUserEmail] = useState(localStorage.getItem("userEmail") || "");
  const [assessments, setAssessments] = useState([]);
  const [profileOpen, setProfileOpen] = useState(false);

  const fetchAssessments = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/reports`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setAssessments(res.data);
    } catch (e) {
      console.error("Failed to fetch assessments", e);
    }
  };

  const handleNewAssessment = () => {
    fetchAssessments();
  };

  const handleLogin = (fullName, role) => {
    setIsLoggedIn(true);
    setShowSignup(false);
    setUserName(fullName || "");
    setUserRole(role || "bank_employee");
    setUserOrg(localStorage.getItem("organization") || "");
    setUserEmail(localStorage.getItem("userEmail") || "");
    setTimeout(fetchAssessments, 100);
  };

  const handleSignup = (fullName, role) => {
    setIsLoggedIn(true);
    setShowSignup(false);
    setUserName(fullName || "");
    setUserRole(role || "bank_employee");
    setUserOrg(localStorage.getItem("organization") || "");
    setUserEmail(localStorage.getItem("userEmail") || "");
    setTimeout(fetchAssessments, 100);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("fullName");
    localStorage.removeItem("role");
    localStorage.removeItem("organization");
    localStorage.removeItem("userEmail");
    setIsLoggedIn(false);
    setAssessments([]);
    setShowSignup(false);
    setCurrentPage("dashboard");
    setUserName("");
    setUserRole("bank_employee");
    setUserOrg("");
    setUserEmail("");
    setProfileOpen(false);
  };

  const switchToSignup = () => {
    setShowSignup(true);
  };

  const switchToLogin = () => {
    setShowSignup(false);
  };

  if (!isLoggedIn) {
    if (showSignup) {
      return <Signup onSignup={handleSignup} onSwitchToLogin={switchToLogin} />;
    }
    return <Login onLogin={handleLogin} onSwitchToSignup={switchToSignup} />;
  }

  // SVG Logo component
  const Logo = () => (
    <div className="logo">
      <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="shieldGrad" x1="0" y1="0" x2="38" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#29b6f6"/>
            <stop offset="100%" stopColor="#1a237e"/>
          </linearGradient>
          <linearGradient id="glowGrad" x1="0" y1="0" x2="38" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#81d4fa"/>
            <stop offset="100%" stopColor="#29b6f6"/>
          </linearGradient>
        </defs>
        {/* Shield body */}
        <path d="M19 2L4 8v10c0 9 6.5 16.5 15 19 8.5-2.5 15-10 15-19V8L19 2z" fill="url(#shieldGrad)" />
        <path d="M19 2L4 8v10c0 9 6.5 16.5 15 19 8.5-2.5 15-10 15-19V8L19 2z" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1"/>
        {/* Circuit nodes */}
        <circle cx="19" cy="13" r="2" fill="white" opacity="0.95"/>
        <circle cx="12" cy="19" r="1.5" fill="white" opacity="0.8"/>
        <circle cx="26" cy="19" r="1.5" fill="white" opacity="0.8"/>
        <circle cx="15" cy="25" r="1.5" fill="white" opacity="0.8"/>
        <circle cx="23" cy="25" r="1.5" fill="white" opacity="0.8"/>
        {/* Circuit lines */}
        <line x1="19" y1="13" x2="12" y2="19" stroke="url(#glowGrad)" strokeWidth="1.2" opacity="0.9"/>
        <line x1="19" y1="13" x2="26" y2="19" stroke="url(#glowGrad)" strokeWidth="1.2" opacity="0.9"/>
        <line x1="12" y1="19" x2="15" y2="25" stroke="url(#glowGrad)" strokeWidth="1.2" opacity="0.9"/>
        <line x1="26" y1="19" x2="23" y2="25" stroke="url(#glowGrad)" strokeWidth="1.2" opacity="0.9"/>
        <line x1="15" y1="25" x2="23" y2="25" stroke="url(#glowGrad)" strokeWidth="1.2" opacity="0.9"/>
        {/* Center glow dot */}
        <circle cx="19" cy="19" r="1" fill="#81d4fa" opacity="0.7"/>
      </svg>
      <span className="logo-text">CrediShield</span>
    </div>
  );

  // Avatar initials helper
  const getInitials = (name) => name ? name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0,2) : "U";
  const roleLabel = userRole === "ca_admin" ? "CA Admin" : "Bank Employee";
  const roleBadgeColor = userRole === "ca_admin" ? "#ffa726" : "#29b6f6";

  // Shared navbar profile dropdown
  const ProfileDropdown = () => (
    <div className="profile-wrap">
      <div className="profile-trigger" onClick={() => setProfileOpen(o => !o)}>
        <div className="profile-avatar">{getInitials(userName)}</div>
        <div className="profile-trigger-info">
          <span className="profile-trigger-name">{userName || "User"}</span>
          <span className="profile-trigger-role" style={{ color: roleBadgeColor }}>{roleLabel}</span>
        </div>
        <span className="profile-chevron" style={{ transform: profileOpen ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
      </div>

      {profileOpen && (
        <>
          <div className="profile-backdrop" onClick={() => setProfileOpen(false)} />
          <div className="profile-dropdown">
            <div className="profile-dropdown-header">
              <div className="profile-dropdown-avatar">{getInitials(userName)}</div>
              <div className="profile-dropdown-info">
                <span className="profile-dropdown-name">{userName || "User"}</span>
                <span className="profile-dropdown-badge" style={{ background: roleBadgeColor }}>{roleLabel}</span>
              </div>
            </div>
            <div className="profile-dropdown-divider" />
            <div className="profile-dropdown-row">
              <span className="profile-dropdown-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg></span>
              <div>
                <span className="profile-dropdown-label">Organisation</span>
                <span className="profile-dropdown-value">{userOrg || "—"}</span>
              </div>
            </div>
            <div className="profile-dropdown-row">
              <span className="profile-dropdown-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></span>
              <div>
                <span className="profile-dropdown-label">Email</span>
                <span className="profile-dropdown-value">{userEmail || "—"}</span>
              </div>
            </div>
            <div className="profile-dropdown-divider" />
            <button className="profile-dropdown-logout" onClick={handleLogout}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:6,verticalAlign:"middle"}}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );

  // CA Admin gets their own dashboard
  if (userRole === "ca_admin") {
    return (
      <div className="app-container">
        <nav className="navbar">
          <div className="nav-content">
            <Logo />
            <div className="nav-links">
              <span className="nav-link" style={{ cursor: "default", opacity: 0.7 }}>📋 CA Admin Portal</span>
              <ProfileDropdown />
            </div>
          </div>
        </nav>
        <CADashboard />
        <footer className="footer">
          <div className="footer-bottom">
            <span>&copy; {new Date().getFullYear()} CrediShield. All rights reserved.</span>
            <span className="footer-bottom-center">Owned &amp; Managed by <strong>Minal Periwal</strong> &amp; <strong>Manvi Kamboj</strong></span>
            <span className="footer-bottom-right">Last updated: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="nav-content">
          <Logo />
          <div className="nav-links">
            <span
              className={`nav-link ${currentPage === "dashboard" ? "active" : ""}`}
              onClick={() => setCurrentPage("dashboard")}
            >Dashboard</span>
            <span
              className={`nav-link ${currentPage === "assessment" ? "active" : ""}`}
              onClick={() => setCurrentPage("assessment")}
            >Risk Assessment</span>
            <span
              className={`nav-link ${currentPage === "reports" ? "active" : ""}`}
              onClick={() => setCurrentPage("reports")}
            >Reports</span>
            <ProfileDropdown />
          </div>
        </div>
      </nav>

      {currentPage === "dashboard" && <Dashboard assessments={assessments} />}
      {currentPage === "assessment" && <RiskAssessment onNewAssessment={handleNewAssessment} />}
      {currentPage === "reports" && <Reports assessments={assessments} />}

      <footer className="footer">
        <div className="footer-bottom">
          <span>&copy; {new Date().getFullYear()} CrediShield. All rights reserved.</span>
          <span className="footer-bottom-center">Owned &amp; Managed by <strong>Minal Periwal</strong> &amp; <strong>Manvi Kamboj</strong></span>
          <span className="footer-bottom-right">Last updated: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
        </div>
      </footer>
    </div>
  );
}

export default App;