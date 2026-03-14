import { useState } from "react";
import "./Login.css";

function Login({ onLogin, onSwitchToSignup }) {
  const [credentials, setCredentials] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simple authentication (in production, validate against backend)
    if (credentials.email && credentials.password) {
      onLogin();
    } else {
      alert("Please enter email and password");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <span className="login-icon">🛡️</span>
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

          <button type="submit" className="login-btn">
            🔐 Sign In
          </button>
        </form>

        <div className="login-footer">
          <p>Demo Credentials: Any email/password</p>
          <p style={{ marginTop: '10px' }}>
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
