import { useState } from "react";
import axios from "axios";
import Login from "./Login";
import Signup from "./Signup";
import Dashboard from "./Dashboard";
import Reports from "./Reports";
import "./App.css";

function RiskAssessment() {
  const [formData, setFormData] = useState({
    loan_amnt: "", term: "", int_rate: "", installment: "", grade: "",
    emp_length: "", home_ownership: "", annual_inc: "", purpose: "",
    dti: "", delinq_2yrs: "", inq_last_6mths: "", open_acc: "",
    revol_bal: "", revol_util: "", total_acc: ""
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

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

  const predictLoan = async () => {
    if (!validateForm()) {
      alert("Please fill in all fields before submitting.");
      return;
    }
    
    setLoading(true);
    try {
      const numericData = Object.keys(formData).reduce((acc, key) => {
        acc[key] = Number(formData[key]);
        return acc;
      }, {});
      
      console.log("Sending data:", numericData);
      
      const response = await axios.post("http://127.0.0.1:8000/predict-loan", numericData);
      
      console.log("Response:", response.data);
      setResult(response.data);
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
  };

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

            <div className="button-group">
              <button onClick={predictLoan} disabled={loading} className="btn-primary">
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");

  const handleLogin = () => {
    setIsLoggedIn(true);
    setShowSignup(false);
  };

  const handleSignup = () => {
    setIsLoggedIn(true);
    setShowSignup(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setShowSignup(false);
    setCurrentPage("dashboard");
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
            <span className="nav-link logout" onClick={handleLogout}>
              🚪 Logout
            </span>
          </div>
        </div>
      </nav>

      {currentPage === "dashboard" && <Dashboard />}
      {currentPage === "assessment" && <RiskAssessment />}
      {currentPage === "reports" && <Reports />}
      
      <footer className="footer">
        <p>© 2024 CrediShield. Powered by Advanced AI & Machine Learning</p>
      </footer>
    </div>
  );
}

export default App;