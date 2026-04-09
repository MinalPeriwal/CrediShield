import { useState, useEffect } from "react";
import "./CADashboard.css";

const IconUsers      = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IconClipboard  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>;
const IconCheckCircle= () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const IconXCircle    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>;

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
    { Icon: IconUsers,       label: "Total Employees", value: stats.total_employees, color: "#1a237e", bg: "#e8eaf6" },
    { Icon: IconClipboard,   label: "Total Loans",     value: stats.total_loans,     color: "#0288d1", bg: "#e1f5fe" },
    { Icon: IconCheckCircle, label: "Approved",        value: stats.total_approved,  color: "#2e7d32", bg: "#e8f5e9" },
    { Icon: IconXCircle,     label: "Rejected",        value: stats.total_rejected,  color: "#c62828", bg: "#ffebee" },
  ];

  return (
    <div className="ca-container">
      <div className="ca-header">
        <h1>📋 CA Admin Dashboard</h1>
        <p>Overview of all bank employees and their loan activity</p>
      </div>

      <div className="ca-summary-grid">
        {summaryCards.map(({ Icon, label, value, color, bg }, i) => (
          <div key={i} className="ca-summary-card">
            <div className="ca-summary-icon-wrap" style={{ background: bg, color }}>
              <Icon />
            </div>
            <div>
              <div className="ca-summary-value" style={{ color }}>{value}</div>
              <div className="ca-summary-label">{label}</div>
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
