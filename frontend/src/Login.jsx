import { useState } from "react";
import "./Login.css";

const ShieldLogo = () => (
  <svg width="48" height="48" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ll1" x1="0" y1="0" x2="38" y2="38" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#29b6f6"/>
        <stop offset="100%" stopColor="#1a237e"/>
      </linearGradient>
      <linearGradient id="ll2" x1="0" y1="0" x2="38" y2="38" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#81d4fa"/>
        <stop offset="100%" stopColor="#29b6f6"/>
      </linearGradient>
    </defs>
    <path d="M19 2L4 8v10c0 9 6.5 16.5 15 19 8.5-2.5 15-10 15-19V8L19 2z" fill="url(#ll1)"/>
    <path d="M19 2L4 8v10c0 9 6.5 16.5 15 19 8.5-2.5 15-10 15-19V8L19 2z" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1"/>
    <circle cx="19" cy="13" r="2" fill="white" opacity="0.95"/>
    <circle cx="12" cy="19" r="1.5" fill="white" opacity="0.8"/>
    <circle cx="26" cy="19" r="1.5" fill="white" opacity="0.8"/>
    <circle cx="15" cy="25" r="1.5" fill="white" opacity="0.8"/>
    <circle cx="23" cy="25" r="1.5" fill="white" opacity="0.8"/>
    <line x1="19" y1="13" x2="12" y2="19" stroke="url(#ll2)" strokeWidth="1.2" opacity="0.9"/>
    <line x1="19" y1="13" x2="26" y2="19" stroke="url(#ll2)" strokeWidth="1.2" opacity="0.9"/>
    <line x1="12" y1="19" x2="15" y2="25" stroke="url(#ll2)" strokeWidth="1.2" opacity="0.9"/>
    <line x1="26" y1="19" x2="23" y2="25" stroke="url(#ll2)" strokeWidth="1.2" opacity="0.9"/>
    <line x1="15" y1="25" x2="23" y2="25" stroke="url(#ll2)" strokeWidth="1.2" opacity="0.9"/>
    <circle cx="19" cy="19" r="1" fill="#81d4fa" opacity="0.7"/>
  </svg>
);

function Login({ onLogin, onSwitchToSignup }) {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

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
    <div className="auth-root">
      {/* ── Left Panel ── */}
      <div className="auth-left">
        <div className="auth-left-orb auth-left-orb-1" />
        <div className="auth-left-orb auth-left-orb-2" />
        <div className="auth-left-orb auth-left-orb-3" />

        <div className="auth-left-content">
          <div className="auth-left-logo">
            <ShieldLogo />
            <span className="auth-left-brand">CrediShield</span>
          </div>

          <h2 className="auth-left-title">
            AI-Powered<br />
            <span className="auth-left-gradient">Loan Risk Intelligence</span>
          </h2>
          <p className="auth-left-sub">
            Predict loan defaults with 85–92% accuracy using our ensemble ML model.
            Instant decisions. Full explainability.
          </p>

          <div className="auth-left-stats">
            {[
              { val: "85–92%", lbl: "Accuracy" },
              { val: "90–95%", lbl: "ROC-AUC" },
              { val: "3-in-1", lbl: "Models" },
            ].map((s, i) => (
              <div key={i} className="auth-stat">
                <span className="auth-stat-val">{s.val}</span>
                <span className="auth-stat-lbl">{s.lbl}</span>
              </div>
            ))}
          </div>

          <div className="auth-left-features">
            {[
              "Ensemble ML — RF + GBM + XGBoost",
              "OCR-based KYC document verification",
              "SHAP explainability on every decision",
              "Role-based access for banking teams",
            ].map((f, i) => (
              <div key={i} className="auth-feature-row">
                <span className="auth-feature-dot" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="auth-left-footer">
          Owned &amp; Managed by <strong>Minal Periwal</strong> &amp; <strong>Manvi Kamboj</strong>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="auth-right">
        <div className="auth-form-wrap">
          <div className="auth-form-badge">Welcome back</div>
          <h1 className="auth-form-title">Sign in to your account</h1>
          <p className="auth-form-sub">Enter your credentials to access the platform</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label className="auth-label">Email Address</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
                <input
                  type="email"
                  name="email"
                  value={credentials.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="username"
                  className={error ? "auth-input error" : "auth-input"}
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">Password</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className={error ? "auth-input error" : "auth-input"}
                />
                <button type="button" className="auth-eye-btn" onClick={() => setShowPass(p => !p)} tabIndex={-1}>
                  {showPass ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="auth-error-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? (
                <><span className="auth-spinner" /> Signing in...</>
              ) : (
                <>
                  Sign In
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                    <path d="M5 12h14"/><path d="M12 5l7 7-7 7"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="auth-switch">
            Don't have an account?{" "}
            <span className="auth-switch-link" onClick={onSwitchToSignup}>Create one</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
