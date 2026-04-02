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
