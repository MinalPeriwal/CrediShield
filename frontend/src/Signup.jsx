import { useState } from "react";
import "./Signup.css";

const ShieldLogo = () => (
  <svg width="48" height="48" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="sl1" x1="0" y1="0" x2="38" y2="38" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#29b6f6"/>
        <stop offset="100%" stopColor="#1a237e"/>
      </linearGradient>
      <linearGradient id="sl2" x1="0" y1="0" x2="38" y2="38" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#81d4fa"/>
        <stop offset="100%" stopColor="#29b6f6"/>
      </linearGradient>
    </defs>
    <path d="M19 2L4 8v10c0 9 6.5 16.5 15 19 8.5-2.5 15-10 15-19V8L19 2z" fill="url(#sl1)"/>
    <path d="M19 2L4 8v10c0 9 6.5 16.5 15 19 8.5-2.5 15-10 15-19V8L19 2z" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1"/>
    <circle cx="19" cy="13" r="2" fill="white" opacity="0.95"/>
    <circle cx="12" cy="19" r="1.5" fill="white" opacity="0.8"/>
    <circle cx="26" cy="19" r="1.5" fill="white" opacity="0.8"/>
    <circle cx="15" cy="25" r="1.5" fill="white" opacity="0.8"/>
    <circle cx="23" cy="25" r="1.5" fill="white" opacity="0.8"/>
    <line x1="19" y1="13" x2="12" y2="19" stroke="url(#sl2)" strokeWidth="1.2" opacity="0.9"/>
    <line x1="19" y1="13" x2="26" y2="19" stroke="url(#sl2)" strokeWidth="1.2" opacity="0.9"/>
    <line x1="12" y1="19" x2="15" y2="25" stroke="url(#sl2)" strokeWidth="1.2" opacity="0.9"/>
    <line x1="26" y1="19" x2="23" y2="25" stroke="url(#sl2)" strokeWidth="1.2" opacity="0.9"/>
    <line x1="15" y1="25" x2="23" y2="25" stroke="url(#sl2)" strokeWidth="1.2" opacity="0.9"/>
    <circle cx="19" cy="19" r="1" fill="#81d4fa" opacity="0.7"/>
  </svg>
);

const getPasswordStrength = (pw) => {
  if (!pw) return { level: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { level: 1, label: "Weak", color: "#ef4444" };
  if (score <= 3) return { level: 2, label: "Fair", color: "#f59e0b" };
  return { level: 3, label: "Strong", color: "#10b981" };
};

function Signup({ onSignup, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    fullName: "", email: "", password: "", confirmPassword: "", organization: "", role: "bank_employee"
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("form");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const pwStrength = getPasswordStrength(formData.password);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  // OTP box handlers
  const handleOtpChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) {
      document.getElementById(`otp-${i + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      document.getElementById(`otp-${i - 1}`)?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      document.getElementById("otp-5")?.focus();
    }
    e.preventDefault();
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Minimum 6 characters";
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
    const otpStr = otp.join("");
    if (otpStr.length < 6) return;
    setLoading(true);
    setServerError("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp: otpStr }),
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

  // ── OTP Step ──
  if (step === "otp") {
    return (
      <div className="auth-root">
        <div className="auth-left">
          <div className="auth-left-orb auth-left-orb-1" />
          <div className="auth-left-orb auth-left-orb-2" />
          <div className="auth-left-orb auth-left-orb-3" />
          <div className="auth-left-content">
            <div className="auth-left-logo">
              <ShieldLogo />
              <span className="auth-left-brand">CrediShield</span>
            </div>
            <h2 className="auth-left-title">One last step<br /><span className="auth-left-gradient">Verify your identity</span></h2>
            <p className="auth-left-sub">We sent a 6-digit code to your email. Enter it to activate your account.</p>
            <div className="auth-otp-info-card">
              <div className="auth-otp-info-icon">📧</div>
              <div>
                <div className="auth-otp-info-label">Code sent to</div>
                <div className="auth-otp-info-email">{formData.email}</div>
              </div>
            </div>
            <p className="auth-otp-expire">⏱ Code expires in 10 minutes</p>
          </div>
          <div className="auth-left-footer">
            Owned &amp; Managed by <strong>Minal Periwal</strong> &amp; <strong>Manvi Kamboj</strong>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-form-wrap">
            <div className="auth-form-badge">Email Verification</div>
            <h1 className="auth-form-title">Enter your OTP</h1>
            <p className="auth-form-sub">Check your inbox for the 6-digit verification code</p>

            <form onSubmit={handleVerifyOtp} className="auth-form">
              <div className="auth-otp-boxes" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className={`auth-otp-box ${digit ? "filled" : ""}`}
                    autoFocus={i === 0}
                  />
                ))}
              </div>

              {serverError && (
                <div className="auth-error-box">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {serverError}
                </div>
              )}

              <button type="submit" className="auth-submit-btn" disabled={loading || otp.join("").length < 6}>
                {loading ? (
                  <><span className="auth-spinner" /> Verifying...</>
                ) : (
                  <>Verify & Create Account
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                      <path d="M5 12h14"/><path d="M12 5l7 7-7 7"/>
                    </svg>
                  </>
                )}
              </button>
            </form>

            <div className="auth-switch">
              <span className="auth-switch-link" onClick={() => { setStep("form"); setServerError(""); setOtp(["","","","","",""]); }}>
                ← Back to signup
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Signup Form ──
  return (
    <div className="auth-root">
      <div className="auth-left">
        <div className="auth-left-orb auth-left-orb-1" />
        <div className="auth-left-orb auth-left-orb-2" />
        <div className="auth-left-orb auth-left-orb-3" />
        <div className="auth-left-content">
          <div className="auth-left-logo">
            <ShieldLogo />
            <span className="auth-left-brand">CrediShield</span>
          </div>
          <h2 className="auth-left-title">Join the platform<br /><span className="auth-left-gradient">Built for banking teams</span></h2>
          <p className="auth-left-sub">Get instant AI-powered loan risk assessments with full explainability and KYC verification.</p>
          <div className="auth-left-steps">
            {[
              { n: "1", t: "Create your account" },
              { n: "2", t: "Verify via OTP email" },
              { n: "3", t: "Start assessing loans" },
            ].map((s, i) => (
              <div key={i} className="auth-step-row">
                <div className="auth-step-num">{s.n}</div>
                <span className="auth-step-text">{s.t}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="auth-left-footer">
          Owned &amp; Managed by <strong>Minal Periwal</strong> &amp; <strong>Manvi Kamboj</strong>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-wrap signup-wrap">
          <div className="auth-form-badge">New Account</div>
          <h1 className="auth-form-title">Create your account</h1>
          <p className="auth-form-sub">Fill in the details below to get started</p>

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Row: Full Name + Organization */}
            <div className="auth-form-row">
              <div className="auth-field">
                <label className="auth-label">Full Name</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                  </span>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange}
                    placeholder="Your full name" autoComplete="name"
                    className={`auth-input ${errors.fullName ? "error" : ""}`} />
                </div>
                {errors.fullName && <span className="auth-field-error">{errors.fullName}</span>}
              </div>

              <div className="auth-field">
                <label className="auth-label">Organization</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                    </svg>
                  </span>
                  <input type="text" name="organization" value={formData.organization} onChange={handleChange}
                    placeholder="Your organization" autoComplete="organization"
                    className={`auth-input ${errors.organization ? "error" : ""}`} />
                </div>
                {errors.organization && <span className="auth-field-error">{errors.organization}</span>}
              </div>
            </div>

            {/* Email */}
            <div className="auth-field">
              <label className="auth-label">Email Address</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
                <input type="email" name="email" value={formData.email} onChange={handleChange}
                  placeholder="you@example.com" autoComplete="email"
                  className={`auth-input ${errors.email ? "error" : ""}`} />
              </div>
              {errors.email && <span className="auth-field-error">{errors.email}</span>}
            </div>

            {/* Role */}
            <div className="auth-field">
              <label className="auth-label">Role</label>
              <div className="auth-role-group">
                {[
                  { val: "bank_employee", icon: "🏦", label: "Bank Employee" },
                  { val: "ca_admin",      icon: "📋", label: "CA Admin" },
                ].map((r) => (
                  <label key={r.val} className={`auth-role-card ${formData.role === r.val ? "selected" : ""}`}>
                    <input type="radio" name="role" value={r.val}
                      checked={formData.role === r.val} onChange={handleChange} hidden />
                    <span className="auth-role-icon">{r.icon}</span>
                    <span className="auth-role-label">{r.label}</span>
                    {formData.role === r.val && (
                      <span className="auth-role-check">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Row: Password + Confirm */}
            <div className="auth-form-row">
              <div className="auth-field">
                <label className="auth-label">Password</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </span>
                  <input type={showPass ? "text" : "password"} name="password" value={formData.password}
                    onChange={handleChange} placeholder="Min 6 characters" autoComplete="new-password"
                    className={`auth-input ${errors.password ? "error" : ""}`} />
                  <button type="button" className="auth-eye-btn" onClick={() => setShowPass(p => !p)} tabIndex={-1}>
                    {showPass
                      ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
                {formData.password && (
                  <div className="auth-pw-strength">
                    <div className="auth-pw-bars">
                      {[1,2,3].map(l => (
                        <div key={l} className="auth-pw-bar"
                          style={{ background: pwStrength.level >= l ? pwStrength.color : "#e2e8f0" }} />
                      ))}
                    </div>
                    <span style={{ color: pwStrength.color, fontSize: "0.75rem", fontWeight: 600 }}>{pwStrength.label}</span>
                  </div>
                )}
                {errors.password && <span className="auth-field-error">{errors.password}</span>}
              </div>

              <div className="auth-field">
                <label className="auth-label">Confirm Password</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </span>
                  <input type={showConfirm ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword}
                    onChange={handleChange} placeholder="Repeat password" autoComplete="new-password"
                    className={`auth-input ${errors.confirmPassword ? "error" : ""}`} />
                  <button type="button" className="auth-eye-btn" onClick={() => setShowConfirm(p => !p)} tabIndex={-1}>
                    {showConfirm
                      ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
                {errors.confirmPassword && <span className="auth-field-error">{errors.confirmPassword}</span>}
              </div>
            </div>

            {serverError && (
              <div className="auth-error-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {serverError}
              </div>
            )}

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? (
                <><span className="auth-spinner" /> Sending OTP...</>
              ) : (
                <>Continue — Send OTP
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                    <path d="M5 12h14"/><path d="M12 5l7 7-7 7"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="auth-switch">
            Already have an account?{" "}
            <span className="auth-switch-link" onClick={onSwitchToLogin}>Sign in</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
