import "./Dashboard.css";

function Dashboard() {
  const stats = [
    { icon: "📊", label: "Total Assessments", value: "1,234", change: "+12%" },
    { icon: "✅", label: "Approved Loans", value: "856", change: "+8%" },
    { icon: "❌", label: "Rejected Loans", value: "378", change: "-5%" },
    { icon: "💰", label: "Total Amount", value: "$12.5M", change: "+15%" }
  ];

  const recentAssessments = [
    { id: "LA-001", amount: "$15,000", risk: "Low", score: 780, status: "Approved" },
    { id: "LA-002", amount: "$25,000", risk: "Medium", score: 650, status: "Review" },
    { id: "LA-003", amount: "$35,000", risk: "High", score: 520, status: "Rejected" },
    { id: "LA-004", amount: "$10,000", risk: "Low", score: 820, status: "Approved" },
    { id: "LA-005", amount: "$20,000", risk: "Medium", score: 680, status: "Review" }
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
              <span className={`stat-change ${stat.change.startsWith('+') ? 'positive' : 'negative'}`}>
                {stat.change} from last month
              </span>
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
              {recentAssessments.map((assessment) => (
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
