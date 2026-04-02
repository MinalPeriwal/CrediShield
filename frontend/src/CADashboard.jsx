import { useState, useEffect } from "react";
import "./CADashboard.css";

function CADashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedUser, setExpandedUser] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.detail) setError(data.detail);
        else setStats(data);
      })
      .catch(() => setError("Failed to load admin stats."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="ca-loading">⏳ Loading admin dashboard...</div>;
  if (error) return <div className="ca-error">❌ {error}</div>;

  const summaryCards = [
    { icon: "👥", label: "Total Employees", value: stats.total_employees },
    { icon: "📋", label: "Total Loans", value: stats.total_loans },
    { icon: "✅", label: "Approved", value: stats.total_approved },
    { icon: "❌", label: "Rejected", value: stats.total_rejected },
  ];

  return (
    <div className="ca-container">
      <div className="ca-header">
        <h1>📋 CA Admin Dashboard</h1>
        <p>Overview of all bank employees and their loan activity</p>
      </div>

      <div className="ca-summary-grid">
        {summaryCards.map((c, i) => (
          <div key={i} className="ca-summary-card">
            <span className="ca-summary-icon">{c.icon}</span>
            <div>
              <div className="ca-summary-value">{c.value}</div>
              <div className="ca-summary-label">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="ca-section">
        <h2>🏦 Bank Employees</h2>
        <div className="ca-table-wrapper">
          <table className="ca-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Organization</th>
                <th>Joined</th>
                <th>Total Loans</th>
                <th>Approved</th>
                <th>Rejected</th>
                <th>Review</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {stats.employees.length === 0 ? (
                <tr><td colSpan={10} style={{ textAlign: "center", color: "#94a3b8", padding: "32px" }}>No bank employees registered yet.</td></tr>
              ) : stats.employees.map((emp, i) => (
                <>
                  <tr key={emp.id} className="ca-row">
                    <td>{i + 1}</td>
                    <td className="ca-name">{emp.full_name}</td>
                    <td className="ca-email">{emp.email}</td>
                    <td>{emp.organization || "—"}</td>
                    <td>{emp.joined ? new Date(emp.joined).toLocaleDateString() : "—"}</td>
                    <td><span className="ca-badge total">{emp.total_loans}</span></td>
                    <td><span className="ca-badge approved">{emp.approved}</span></td>
                    <td><span className="ca-badge rejected">{emp.rejected}</span></td>
                    <td><span className="ca-badge review">{emp.review}</span></td>
                    <td>
                      <button
                        className="ca-expand-btn"
                        onClick={() => setExpandedUser(expandedUser === emp.id ? null : emp.id)}
                      >
                        {expandedUser === emp.id ? "▲ Hide" : "▼ View"}
                      </button>
                    </td>
                  </tr>
                  {expandedUser === emp.id && (
                    <tr key={`exp-${emp.id}`} className="ca-expanded-row">
                      <td colSpan={10}>
                        <div className="ca-loan-detail">
                          <h4>Recent Loans by {emp.full_name}</h4>
                          {emp.recent_loans.length === 0 ? (
                            <p style={{ color: "#94a3b8" }}>No loans assessed yet.</p>
                          ) : (
                            <table className="ca-inner-table">
                              <thead>
                                <tr>
                                  <th>Loan ID</th>
                                  <th>Amount</th>
                                  <th>Risk</th>
                                  <th>Credit Score</th>
                                  <th>Status</th>
                                  <th>Date</th>
                                </tr>
                              </thead>
                              <tbody>
                                {emp.recent_loans.map((loan) => (
                                  <tr key={loan.id}>
                                    <td>{loan.id}</td>
                                    <td>{loan.amount}</td>
                                    <td><span className={`ca-badge ${loan.risk.toLowerCase()}`}>{loan.risk}</span></td>
                                    <td>{loan.score}</td>
                                    <td><span className={`ca-badge ${loan.status.toLowerCase()}`}>{loan.status}</span></td>
                                    <td>{loan.created_at ? new Date(loan.created_at).toLocaleDateString() : "—"}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default CADashboard;
