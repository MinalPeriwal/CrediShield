import "./LandingPage.css";

const ShieldLogo = () => (
  <svg width="52" height="52" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="lpGrad1" x1="0" y1="0" x2="38" y2="38" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#29b6f6"/>
        <stop offset="100%" stopColor="#1a237e"/>
      </linearGradient>
      <linearGradient id="lpGrad2" x1="0" y1="0" x2="38" y2="38" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#81d4fa"/>
        <stop offset="100%" stopColor="#29b6f6"/>
      </linearGradient>
    </defs>
    <path d="M19 2L4 8v10c0 9 6.5 16.5 15 19 8.5-2.5 15-10 15-19V8L19 2z" fill="url(#lpGrad1)"/>
    <path d="M19 2L4 8v10c0 9 6.5 16.5 15 19 8.5-2.5 15-10 15-19V8L19 2z" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1"/>
    <circle cx="19" cy="13" r="2" fill="white" opacity="0.95"/>
    <circle cx="12" cy="19" r="1.5" fill="white" opacity="0.8"/>
    <circle cx="26" cy="19" r="1.5" fill="white" opacity="0.8"/>
    <circle cx="15" cy="25" r="1.5" fill="white" opacity="0.8"/>
    <circle cx="23" cy="25" r="1.5" fill="white" opacity="0.8"/>
    <line x1="19" y1="13" x2="12" y2="19" stroke="url(#lpGrad2)" strokeWidth="1.2" opacity="0.9"/>
    <line x1="19" y1="13" x2="26" y2="19" stroke="url(#lpGrad2)" strokeWidth="1.2" opacity="0.9"/>
    <line x1="12" y1="19" x2="15" y2="25" stroke="url(#lpGrad2)" strokeWidth="1.2" opacity="0.9"/>
    <line x1="26" y1="19" x2="23" y2="25" stroke="url(#lpGrad2)" strokeWidth="1.2" opacity="0.9"/>
    <line x1="15" y1="25" x2="23" y2="25" stroke="url(#lpGrad2)" strokeWidth="1.2" opacity="0.9"/>
    <circle cx="19" cy="19" r="1" fill="#81d4fa" opacity="0.7"/>
  </svg>
);

const features = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
      </svg>
    ),
    title: "Ensemble ML Model",
    desc: "Random Forest, Gradient Boosting & XGBoost combined for 85–92% accuracy on loan default prediction."
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: "KYC Document Verification",
    desc: "OCR-based Aadhaar, PAN & Passport verification with deskew, denoising and fuzzy identity matching."
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    title: "Real-Time Assessment",
    desc: "Instant risk scoring with auto-calculated EMI, DTI and credit utilization from form inputs."
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
    title: "SHAP Explainability",
    desc: "Top 5 risk factors explained per prediction using SHapley Additive exPlanations for full transparency."
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: "Role-Based Access",
    desc: "Bank Employee and CA Admin roles with JWT authentication and OTP email verification on signup."
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
      </svg>
    ),
    title: "Persistent Reports",
    desc: "All assessments stored in PostgreSQL per user with CSV export and full analytics dashboard."
  },
];

const stats = [
  { value: "85–92%", label: "Prediction Accuracy" },
  { value: "90–95%", label: "ROC-AUC Score" },
  { value: "300–900", label: "Credit Score Range" },
  { value: "3-in-1", label: "Ensemble Models" },
];

const steps = [
  { num: "01", title: "Sign Up & Verify", desc: "Create your account with OTP email verification. Choose your role — Bank Employee or CA Admin." },
  { num: "02", title: "Upload KYC Docs", desc: "Upload Aadhaar, PAN or Passport. Our OCR engine verifies authenticity and cross-matches identity." },
  { num: "03", title: "Fill Loan Details", desc: "Enter applicant data. EMI, DTI and credit utilization are auto-calculated as you type." },
  { num: "04", title: "Get AI Decision", desc: "Receive instant risk score, credit score, SHAP explanation and analyst recommendations." },
];

function LandingPage({ onGetStarted }) {
  return (
    <div className="lp-root">
      {/* ── Navbar ── */}
      <nav className="lp-nav">
        <div className="lp-nav-inner">
          <div className="lp-nav-logo">
            <ShieldLogo />
            <span className="lp-nav-brand">CrediShield</span>
          </div>
          <div className="lp-nav-actions">
            <button className="lp-btn-ghost" onClick={onGetStarted}>Sign In</button>
            <button className="lp-btn-solid" onClick={onGetStarted}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="lp-hero">
        <div className="lp-hero-bg-orbs">
          <div className="lp-orb lp-orb-1" />
          <div className="lp-orb lp-orb-2" />
          <div className="lp-orb lp-orb-3" />
        </div>
        <div className="lp-hero-inner">
          <div className="lp-hero-badge">
            <span className="lp-badge-dot" />
            AI-Powered · Real-Time · Explainable
          </div>
          <h1 className="lp-hero-title">
            Smarter Loan Risk<br />
            <span className="lp-hero-gradient">Assessment Platform</span>
          </h1>
          <p className="lp-hero-sub">
            CrediShield uses an ensemble of Random Forest, Gradient Boosting and XGBoost
            to predict loan default risk with up to 92% accuracy — with full SHAP explainability,
            OCR-based KYC verification, and role-based access for banking teams.
          </p>
          <div className="lp-hero-cta">
            <button className="lp-cta-primary" onClick={onGetStarted}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
              Start Assessing Loans
            </button>
            <button className="lp-cta-secondary" onClick={onGetStarted}>
              View Demo
            </button>
          </div>

          {/* Floating stat pills */}
          <div className="lp-hero-stats">
            {stats.map((s, i) => (
              <div key={i} className="lp-stat-pill">
                <span className="lp-stat-val">{s.value}</span>
                <span className="lp-stat-lbl">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hero visual card */}
        <div className="lp-hero-visual">
          <div className="lp-mock-card">
            <div className="lp-mock-header">
              <div className="lp-mock-dots">
                <span /><span /><span />
              </div>
              <span className="lp-mock-title">Risk Assessment Result</span>
            </div>
            <div className="lp-mock-verdict approved">
              <span className="lp-mock-verdict-icon">🏆</span>
              <div>
                <div className="lp-mock-verdict-label">Loan Decision</div>
                <div className="lp-mock-verdict-status">APPROVED</div>
              </div>
            </div>
            <div className="lp-mock-metrics">
              <div className="lp-mock-metric">
                <span className="lp-mock-metric-val" style={{ color: "#10b981" }}>782</span>
                <span className="lp-mock-metric-lbl">Credit Score</span>
              </div>
              <div className="lp-mock-metric">
                <span className="lp-mock-metric-val" style={{ color: "#10b981" }}>8.4%</span>
                <span className="lp-mock-metric-lbl">Default Risk</span>
              </div>
              <div className="lp-mock-metric">
                <span className="lp-mock-metric-val" style={{ color: "#29b6f6" }}>Low</span>
                <span className="lp-mock-metric-lbl">Risk Level</span>
              </div>
            </div>
            <div className="lp-mock-bar-section">
              <div className="lp-mock-bar-label">
                <span>Risk Probability</span><span style={{ color: "#10b981" }}>8.4%</span>
              </div>
              <div className="lp-mock-bar-track">
                <div className="lp-mock-bar-fill" style={{ width: "8.4%", background: "#10b981" }} />
              </div>
            </div>
            <div className="lp-mock-factors">
              <div className="lp-mock-factor-title">Top Risk Factors (SHAP)</div>
              {[
                { name: "Annual Income", dir: "positive", w: 72 },
                { name: "Credit Grade", dir: "positive", w: 55 },
                { name: "DTI Ratio", dir: "negative", w: 30 },
              ].map((f, i) => (
                <div key={i} className="lp-mock-factor-row">
                  <span className="lp-mock-factor-name">{f.name}</span>
                  <div className="lp-mock-factor-bar">
                    <div style={{
                      width: `${f.w}%`, height: "100%", borderRadius: 4,
                      background: f.dir === "positive"
                        ? "linear-gradient(90deg,#6ee7b7,#10b981)"
                        : "linear-gradient(90deg,#fca5a5,#ef4444)"
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="lp-features">
        <div className="lp-section-inner">
          <div className="lp-section-label">What We Offer</div>
          <h2 className="lp-section-title">Everything you need for loan risk intelligence</h2>
          <p className="lp-section-sub">Built for banking professionals who need fast, accurate, and explainable credit decisions.</p>
          <div className="lp-features-grid">
            {features.map((f, i) => (
              <div key={i} className="lp-feature-card">
                <div className="lp-feature-icon">{f.icon}</div>
                <h3 className="lp-feature-title">{f.title}</h3>
                <p className="lp-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="lp-how">
        <div className="lp-section-inner">
          <div className="lp-section-label">How It Works</div>
          <h2 className="lp-section-title">From signup to decision in minutes</h2>
          <div className="lp-steps">
            {steps.map((s, i) => (
              <div key={i} className="lp-step">
                <div className="lp-step-num">{s.num}</div>
                <div className="lp-step-connector" />
                <h3 className="lp-step-title">{s.title}</h3>
                <p className="lp-step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Risk Thresholds ── */}
      <section className="lp-thresholds">
        <div className="lp-section-inner">
          <div className="lp-section-label">Decision Engine</div>
          <h2 className="lp-section-title">Calibrated risk thresholds</h2>
          <p className="lp-section-sub">Derived from real Lending Club data — percentile-based cutoffs for fair, consistent decisions.</p>
          <div className="lp-threshold-cards">
            <div className="lp-threshold-card low">
              <div className="lp-threshold-icon">✅</div>
              <div className="lp-threshold-range">{"< 11.5%"}</div>
              <div className="lp-threshold-level">Low Risk</div>
              <div className="lp-threshold-status">Approved</div>
              <p className="lp-threshold-desc">Strong credit profile. Loan approved at standard terms.</p>
            </div>
            <div className="lp-threshold-card medium">
              <div className="lp-threshold-icon">⚖️</div>
              <div className="lp-threshold-range">11.5% – 23.3%</div>
              <div className="lp-threshold-level">Medium Risk</div>
              <div className="lp-threshold-status">Under Review</div>
              <p className="lp-threshold-desc">Borderline profile. Additional documentation or co-applicant recommended.</p>
            </div>
            <div className="lp-threshold-card high">
              <div className="lp-threshold-icon">🚫</div>
              <div className="lp-threshold-range">{"> 23.3%"}</div>
              <div className="lp-threshold-level">High Risk</div>
              <div className="lp-threshold-status">Rejected</div>
              <p className="lp-threshold-desc">High default probability. Re-apply after improving credit profile.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="lp-cta-banner">
        <div className="lp-cta-banner-inner">
          <ShieldLogo />
          <h2 className="lp-cta-banner-title">Ready to make smarter credit decisions?</h2>
          <p className="lp-cta-banner-sub">Join banking professionals using CrediShield for AI-powered loan risk assessment.</p>
          <button className="lp-cta-primary lp-cta-banner-btn" onClick={onGetStarted}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
            Get Started Free
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-brand">
            <ShieldLogo />
            <span className="lp-footer-brand-name">CrediShield</span>
          </div>
          <p className="lp-footer-copy">
            &copy; {new Date().getFullYear()} CrediShield. All rights reserved. &nbsp;·&nbsp;
            Owned &amp; Managed by <strong>Minal Periwal</strong> &amp; <strong>Manvi Kamboj</strong>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
