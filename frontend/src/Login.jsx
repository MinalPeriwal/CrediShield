import { useState } from "react";
import "./Login.css";

function Login({ onLogin, onSwitchToSignup }) {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!credentials.email || !credentials.password) {
      setError("Please enter email and password");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || "Login failed");
      } else {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("fullName", data.fullName);
        localStorage.setItem("role", data.role);
        localStorage.setItem("organization", data.organization || "");
        localStorage.setItem("userEmail", data.email || "");
        onLogin(data.fullName, data.role);
      }
    } catch {
      setError("Cannot connect to server. Make sure the backend is running.");
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <svg width="56" height="56" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display:"block",margin:"0 auto 16px"}}>
            <defs>
              <linearGradient id="lg1" x1="0" y1="0" x2="38" y2="38" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#29b6f6"/>
                <stop offset="100%" stopColor="#1a237e"/>
              </linearGradient>
              <linearGradient id="lg2" x1="0" y1="0" x2="38" y2="38" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#81d4fa"/>
                <stop offset="100%" stopColor="#29b6f6"/>
              </linearGradient>
            </defs>
            <path d="M19 2L4 8v10c0 9 6.5 16.5 15 19 8.5-2.5 15-10 15-19V8L19 2z" fill="url(#lg1)"/>
            <path d="M19 2L4 8v10c0 9 6.5 16.5 15 19 8.5-2.5 15-10 15-19V8L19 2z" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
            <circle cx="19" cy="13" r="2" fill="white" opacity="0.95"/>
            <circle cx="12" cy="19" r="1.5" fill="white" opacity="0.8"/>
            <circle cx="26" cy="19" r="1.5" fill="white" opacity="0.8"/>
            <circle cx="15" cy="25" r="1.5" fill="white" opacity="0.8"/>
            <circle cx="23" cy="25" r="1.5" fill="white" opacity="0.8"/>
            <line x1="19" y1="13" x2="12" y2="19" stroke="url(#lg2)" strokeWidth="1.2" opacity="0.9"/>
            <line x1="19" y1="13" x2="26" y2="19" stroke="url(#lg2)" strokeWidth="1.2" opacity="0.9"/>
            <line x1="12" y1="19" x2="15" y2="25" stroke="url(#lg2)" strokeWidth="1.2" opacity="0.9"/>
            <line x1="26" y1="19" x2="23" y2="25" stroke="url(#lg2)" strokeWidth="1.2" opacity="0.9"/>
            <line x1="15" y1="25" x2="23" y2="25" stroke="url(#lg2)" strokeWidth="1.2" opacity="0.9"/>
            <circle cx="19" cy="19" r="1" fill="#81d4fa" opacity="0.7"/>
          </svg>
          <h1>CrediShield</h1>
          <p>AI-Powered Loan Risk Assessment</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Signing in..." : "🔐 Sign In"}
          </button>
          {error && <p className="error-text" style={{ textAlign: 'center', marginTop: '10px' }}>{error}</p>}
        </form>

        <div className="login-footer">
          <p>
            Don't have an account?{" "}
            <span className="link-text" onClick={onSwitchToSignup}>
              Sign Up
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
