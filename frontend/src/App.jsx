import { useState } from "react";
import axios from "axios";
import Login from "./Login.jsx";
import Signup from "./Signup.jsx";
import Dashboard from "./Dashboard.jsx";
import Reports from "./Reports.jsx";
import CADashboard from "./CADashboard.jsx";
import "./App.css";

function RiskAssessment({ onNewAssessment }) {
  const [formData, setFormData] = useState({
    loan_amnt: "", term: "", int_rate: "", installment: "", grade: "",
    emp_length: "", home_ownership: "", annual_inc: "", purpose: "",
    dti: "", delinq_2yrs: "", inq_last_6mths: "", open_acc: "",
    revol_bal: "", revol_util: "", total_acc: ""
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [uploadedDocs, setUploadedDocs] = useState({});
  const [identityWarning, setIdentityWarning] = useState(null);

  const docTypes = [
    { key: "aadhar", label: "Aadhaar Card", icon: "🪪" },
    { key: "pan", label: "PAN Card", icon: "💳" },
    { key: "passport", label: "Passport", icon: "📘" }
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

  const fieldConfig = {
    loan_amnt: { label: "Loan Amount", icon: "💰", unit: "$", category: "loan" },
    term: { label: "Loan Term", icon: "📅", unit: "months", category: "loan" },
    int_rate: { label: "Interest Rate", icon: "📊", unit: "%", category: "loan" },
    installment: { label: "Monthly Payment", icon: "💳", unit: "$", category: "loan" },
    grade: { label: "Credit Grade", icon: "🎯", unit: "(A=1, B=2, C=3...)", category: "credit" },
    annual_inc: { label: "Annual Income", icon: "💼", unit: "$", category: "personal" },
    emp_length: { label: "Employment Length", icon: "⏱️", unit: "years", category: "personal" },
    home_ownership: { label: "Home Ownership", icon: "🏠", unit: "(0=Rent, 1=Own, 2=Mortgage)", category: "personal" },
    dti: { label: "Debt-to-Income Ratio", icon: "⚖️", unit: "%", category: "financial" },
    revol_bal: { label: "Revolving Balance", icon: "💵", unit: "$", category: "financial" },
    revol_util: { label: "Credit Utilization", icon: "📈", unit: "%", category: "financial" },
    total_acc: { label: "Total Accounts", icon: "🔢", unit: "", category: "credit" },
    open_acc: { label: "Open Accounts", icon: "📂", unit: "", category: "credit" },
    delinq_2yrs: { label: "Delinquencies (2yrs)", icon: "⚠️", unit: "", category: "credit" },
    inq_last_6mths: { label: "Credit Inquiries (6mo)", icon: "🔍", unit: "", category: "credit" },
    purpose: { label: "Loan Purpose", icon: "🎯", unit: "(0=debt, 1=credit, 2=home...)", category: "loan" }
  };

  const categories = {
    loan: "Loan Information",
    personal: "Personal Information",
    financial: "Financial Details",
    credit: "Credit History"
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Prevent any unwanted changes by explicitly setting only the changed field
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors({ ...errors, [name]: false });
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      if (formData[key] === "" || formData[key] === null) {
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
      const allNamesMatch = names.every(n => n === names[0]);
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

    setLoading(true);
    try {
      const numericData = Object.keys(formData).reduce((acc, key) => {
        acc[key] = Number(formData[key]);
        return acc;
      }, {});
      
      console.log("Sending data:", numericData);
      
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/predict-loan`, numericData, {
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
      loan_amnt: "", term: "", int_rate: "", installment: "", grade: "",
      emp_length: "", home_ownership: "", annual_inc: "", purpose: "",
      dti: "", delinq_2yrs: "", inq_last_6mths: "", open_acc: "",
      revol_bal: "", revol_util: "", total_acc: ""
    });
    setResult(null);
    setErrors({});
    setIdentityWarning(null);
  };

  const isFormComplete =
    Object.values(formData).every(v => v !== "" && v !== null) &&
    Object.keys(uploadedDocs).length >= 2;

  const getRiskLevel = (prob) => {
    if (prob < 0.3) return { text: "Low Risk", color: "#10b981", icon: "✅" };
    if (prob < 0.6) return { text: "Medium Risk", color: "#f59e0b", icon: "⚠️" };
    return { text: "High Risk", color: "#ef4444", icon: "❌" };
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
                          <span className="label-icon">{config.icon}</span>
                          {config.label}
                        </label>
                        <div className="input-wrapper">
                          <input
                            name={field}
                            type="number"
                            step="any"
                            value={formData[field]}
                            placeholder={`Enter ${config.label.toLowerCase()}`}
                            onChange={handleChange}
                            autoComplete="new-password"
                            autoCorrect="off"
                            autoCapitalize="off"
                            spellCheck="false"
                            data-form-type="other"
                          />
                          <span className="input-unit">{config.unit}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
            </form>

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
                  <>🔍 Analyze Risk</>
                )}
              </button>
              <button onClick={resetForm} className="btn-secondary">
                🔄 Reset Form
              </button>
            </div>
          </div>

          {result && (
            <div className="results-section">
              <div className="section-header">
                <h2>Assessment Results</h2>
                <p>Comprehensive risk analysis based on provided data</p>
              </div>

              <div className="results-grid">
                <div className="result-card primary">
                  <div className="card-icon">{getRiskLevel(result.risk_probability).icon}</div>
                  <div className="card-content">
                    <span className="card-label">Risk Level</span>
                    <span className="card-value" style={{ color: getRiskLevel(result.risk_probability).color }}>
                      {getRiskLevel(result.risk_probability).text}
                    </span>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ 
                          width: `${result.risk_probability * 100}%`,
                          backgroundColor: getRiskLevel(result.risk_probability).color
                        }}
                      ></div>
                    </div>
                    <span className="card-detail">{(result.risk_probability * 100).toFixed(2)}% probability</span>
                  </div>
                </div>

                <div className="result-card">
                  <div className="card-icon">📊</div>
                  <div className="card-content">
                    <span className="card-label">Credit Score</span>
                    <span className="card-value score">{result.credit_score}</span>
                    <span className="card-detail" style={{ color: getScoreRating(result.credit_score).color }}>
                      {getScoreRating(result.credit_score).text} Rating
                    </span>
                  </div>
                </div>

                <div className="result-card">
                  <div className="card-icon">{result.default_prediction === 'Default' ? '❌' : '✅'}</div>
                  <div className="card-content">
                    <span className="card-label">Default Prediction</span>
                    <span className={`card-value ${result.default_prediction === 'Default' ? 'danger' : 'success'}`}>
                      {result.default_prediction}
                    </span>
                    <span className="card-detail">
                      {result.default_prediction === 'Default' ? 'High default risk detected' : 'Low default risk'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="recommendation-card">
                <h3>💡 Recommendation</h3>
                <p>
                  {result.risk_probability < 0.3 
                    ? "This application shows strong indicators for approval. The applicant demonstrates low risk factors and good creditworthiness."
                    : result.risk_probability < 0.6
                    ? "This application requires careful review. Consider additional verification or adjusted terms to mitigate moderate risk factors."
                    : "This application shows significant risk factors. Recommend denial or substantial risk mitigation measures before approval."}
                </p>
              </div>
            </div>
          )}
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
  const [assessments, setAssessments] = useState([]);

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
    setTimeout(fetchAssessments, 100);
  };

  const handleSignup = (fullName, role) => {
    setIsLoggedIn(true);
    setShowSignup(false);
    setUserName(fullName || "");
    setUserRole(role || "bank_employee");
    setTimeout(fetchAssessments, 100);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("fullName");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    setAssessments([]);
    setShowSignup(false);
    setCurrentPage("dashboard");
    setUserName("");
    setUserRole("bank_employee");
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

  // CA Admin gets their own dashboard
  if (userRole === "ca_admin") {
    return (
      <div className="app-container">
        <nav className="navbar">
          <div className="nav-content">
            <div className="logo">
              <span className="logo-icon">🛡️</span>
              <span className="logo-text">CrediShield</span>
            </div>
            <div className="nav-links">
              <span className="nav-link" style={{ color: "#1e3a8a", cursor: "default" }}>📋 CA Admin</span>
              {userName && <span className="nav-link" style={{ color: "#1e3a8a", cursor: "default" }}>👤 {userName}</span>}
              <span className="nav-link logout" onClick={handleLogout}>🚪 Logout</span>
            </div>
          </div>
        </nav>
        <CADashboard />
        <footer className="footer">
          <p>© 2024 CrediShield. Powered by Advanced AI & Machine Learning</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="nav-content">
          <div className="logo">
            <span className="logo-icon">🛡️</span>
            <span className="logo-text">CrediShield</span>
          </div>
          <div className="nav-links">
            <span 
              className={`nav-link ${currentPage === "dashboard" ? "active" : ""}`}
              onClick={() => setCurrentPage("dashboard")}
            >
              Dashboard
            </span>
            <span 
              className={`nav-link ${currentPage === "assessment" ? "active" : ""}`}
              onClick={() => setCurrentPage("assessment")}
            >
              Risk Assessment
            </span>
            <span 
              className={`nav-link ${currentPage === "reports" ? "active" : ""}`}
              onClick={() => setCurrentPage("reports")}
            >
              Reports
            </span>
            {userName && <span className="nav-link" style={{ color: '#1e3a8a', cursor: 'default' }}>👤 {userName}</span>}
            <span className="nav-link logout" onClick={handleLogout}>
              🚪 Logout
            </span>
          </div>
        </div>
      </nav>

      {currentPage === "dashboard" && <Dashboard assessments={assessments} />}
      {currentPage === "assessment" && <RiskAssessment onNewAssessment={handleNewAssessment} />}
      {currentPage === "reports" && <Reports assessments={assessments} />}
      
      <footer className="footer">
        <p>© 2024 CrediShield. Powered by Advanced AI & Machine Learning</p>
      </footer>
    </div>
  );
}

export default App;