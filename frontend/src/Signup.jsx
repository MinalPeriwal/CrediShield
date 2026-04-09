import { useState } from "react";
import "./Signup.css";

function Signup({ onSignup, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    fullName: "", email: "", password: "", confirmPassword: "", organization: "", role: "bank_employee"
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("form"); // "form" | "otp"
  const [otp, setOtp] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    if (!formData.organization.trim()) newErrors.organization = "Organization is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setServerError("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          organization: formData.organization,
          role: formData.role,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.detail || "Failed to send OTP");
      } else {
        setStep("otp");
      }
    } catch {
      setServerError("Cannot connect to server. Make sure the backend is running.");
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim()) return;
    setLoading(true);
    setServerError("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.detail || "OTP verification failed");
      } else {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("fullName", data.fullName);
        localStorage.setItem("role", data.role);
        localStorage.setItem("organization", data.organization || "");
        localStorage.setItem("userEmail", data.email || "");
        onSignup(data.fullName, data.role);
      }
    } catch {
      setServerError("Cannot connect to server.");
    }
    setLoading(false);
  };

  if (step === "otp") {
    return (
      <div className="signup-container">
        <div className="signup-card">
          <div className="signup-header">
            <span className="signup-icon">📧</span>
            <h1>Verify Your Email</h1>
            <p>Enter the 6-digit OTP sent to <strong>{formData.email}</strong></p>
          </div>
          <form onSubmit={handleVerifyOtp} className="signup-form">
            <div className="form-group">
              <label>OTP Code</label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                autoFocus
              />
            </div>
            <button type="submit" className="signup-btn" disabled={loading}>
              {loading ? "Verifying..." : "✅ Verify & Create Account"}
            </button>
            {serverError && <p className="error-text" style={{ textAlign: "center", marginTop: "10px" }}>{serverError}</p>}
          </form>
          <div className="signup-footer">
            <p><span className="link-text" onClick={() => { setStep("form"); setServerError(""); }}>← Back</span></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <svg width="52" height="52" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display:"block",margin:"0 auto 14px"}}>
            <defs>
              <linearGradient id="sg1" x1="0" y1="0" x2="38" y2="38" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#29b6f6"/>
                <stop offset="100%" stopColor="#1a237e"/>
              </linearGradient>
              <linearGradient id="sg2" x1="0" y1="0" x2="38" y2="38" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#81d4fa"/>
                <stop offset="100%" stopColor="#29b6f6"/>
              </linearGradient>
            </defs>
            <path d="M19 2L4 8v10c0 9 6.5 16.5 15 19 8.5-2.5 15-10 15-19V8L19 2z" fill="url(#sg1)"/>
            <path d="M19 2L4 8v10c0 9 6.5 16.5 15 19 8.5-2.5 15-10 15-19V8L19 2z" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
            <circle cx="19" cy="13" r="2" fill="white" opacity="0.95"/>
            <circle cx="12" cy="19" r="1.5" fill="white" opacity="0.8"/>
            <circle cx="26" cy="19" r="1.5" fill="white" opacity="0.8"/>
            <circle cx="15" cy="25" r="1.5" fill="white" opacity="0.8"/>
            <circle cx="23" cy="25" r="1.5" fill="white" opacity="0.8"/>
            <line x1="19" y1="13" x2="12" y2="19" stroke="url(#sg2)" strokeWidth="1.2" opacity="0.9"/>
            <line x1="19" y1="13" x2="26" y2="19" stroke="url(#sg2)" strokeWidth="1.2" opacity="0.9"/>
            <line x1="12" y1="19" x2="15" y2="25" stroke="url(#sg2)" strokeWidth="1.2" opacity="0.9"/>
            <line x1="26" y1="19" x2="23" y2="25" stroke="url(#sg2)" strokeWidth="1.2" opacity="0.9"/>
            <line x1="15" y1="25" x2="23" y2="25" stroke="url(#sg2)" strokeWidth="1.2" opacity="0.9"/>
            <circle cx="19" cy="19" r="1" fill="#81d4fa" opacity="0.7"/>
          </svg>
          <h1>Create Account</h1>
          <p>Join CrediShield for AI-Powered Risk Assessment</p>
        </div>

        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Enter your full name" autoComplete="name" />
            {errors.fullName && <span className="error-text">{errors.fullName}</span>}
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" autoComplete="email" />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Organization</label>
            <input type="text" name="organization" value={formData.organization} onChange={handleChange} placeholder="Enter your organization name" autoComplete="organization" />
            {errors.organization && <span className="error-text">{errors.organization}</span>}
          </div>

          <div className="form-group">
            <label>Role</label>
            <select name="role" value={formData.role} onChange={handleChange} style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontSize: "0.97rem", background: "#f8fafc", color: "#1e293b" }}>
              <option value="bank_employee">🏦 Bank Employee</option>
              <option value="ca_admin">📋 Chartered Accountant (CA Admin)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Create a password (min 6 characters)" autoComplete="new-password" />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm your password" autoComplete="new-password" />
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
          </div>

          <button type="submit" className="signup-btn" disabled={loading}>
            {loading ? "Sending OTP..." : "✨ Continue"}
          </button>
          {serverError && <p className="error-text" style={{ textAlign: "center", marginTop: "10px" }}>{serverError}</p>}
        </form>

        <div className="signup-footer">
          <p>Already have an account?{" "}<span className="link-text" onClick={onSwitchToLogin}>Sign In</span></p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
