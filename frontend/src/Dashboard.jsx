import "./Dashboard.css";

function Dashboard({ assessments }) {
  const approved = assessments.filter(a => a.status === "Approved").length;
  const rejected = assessments.filter(a => a.status === "Rejected").length;
  const totalAmount = assessments.reduce((sum, a) => sum + Number(a.amount.replace(/[$,]/g, "")), 0);

  const formatAmount = (n) => n >= 1000000 ? `$${(n/1000000).toFixed(1)}M` : `$${(n/1000).toFixed(1)}K`;

  const stats = [
    { icon: "📊", label: "Total Assessments", value: assessments.length.toLocaleString() },
    { icon: "✅", label: "Approved Loans", value: approved.toString() },
    { icon: "❌", label: "Rejected Loans", value: rejected.toString() },
    { icon: "💰", label: "Total Amount", value: formatAmount(totalAmount) }
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard Overview</h1>
        <p>Real-time loan assessment analytics</p>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <span className="stat-label">{stat.label}</span>
              <span className="stat-value">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="recent-section">
        <h2>Recent Assessments</h2>
        <div className="table-container">
          <table className="assessments-table">
            <thead>
              <tr>
                <th>Loan ID</th>
                <th>Amount</th>
                <th>Risk Level</th>
                <th>Credit Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {assessments.map((assessment) => (
                <tr key={assessment.id}>
                  <td className="loan-id">{assessment.id}</td>
                  <td className="amount">{assessment.amount}</td>
                  <td>
                    <span className={`risk-badge ${assessment.risk.toLowerCase()}`}>
                      {assessment.risk}
                    </span>
                  </td>
                  <td className="score">{assessment.score}</td>
                  <td>
                    <span className={`status-badge ${assessment.status.toLowerCase()}`}>
                      {assessment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
