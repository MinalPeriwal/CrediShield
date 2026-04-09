import "./Dashboard.css";

// ── SVG Icon Components ──
const IconClipboard = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
    <line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>
  </svg>
);

const IconCheckCircle = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const IconXCircle = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
);

const IconRupee = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="6" y1="5" x2="18" y2="5"/>
    <line x1="6" y1="10" x2="18" y2="10"/>
    <path d="M6 10l7 9"/>
    <path d="M6 5h5a4 4 0 0 1 0 8H6"/>
  </svg>
);

const IconHash = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/>
    <line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>
  </svg>
);

const IconTrendingUp = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
);

const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const IconAlertTriangle = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

function Dashboard({ assessments }) {
  const approved    = assessments.filter(a => a.status === "Approved").length;
  const rejected    = assessments.filter(a => a.status === "Rejected").length;
  const totalAmount = assessments.reduce((sum, a) => sum + Number(a.amount.replace(/[₹$,]/g, "")), 0);
  const formatAmount = (n) => n >= 10000000 ? `₹${(n/10000000).toFixed(1)}Cr` : n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : `₹${(n/1000).toFixed(1)}K`;

  const stats = [
    {
      Icon: IconClipboard,
      label: "Total Assessments",
      value: assessments.length.toLocaleString(),
      color: "#1a237e",
      bg: "#e8eaf6",
      trend: "All submitted loans"
    },
    {
      Icon: IconCheckCircle,
      label: "Approved Loans",
      value: approved.toString(),
      color: "#0288d1",
      bg: "#e1f5fe",
      trend: `${assessments.length ? ((approved/assessments.length)*100).toFixed(0) : 0}% approval rate`
    },
    {
      Icon: IconXCircle,
      label: "Rejected Loans",
      value: rejected.toString(),
      color: "#ef5350",
      bg: "#ffebee",
      trend: `${assessments.length ? ((rejected/assessments.length)*100).toFixed(0) : 0}% rejection rate`
    },
    {
      Icon: IconRupee,
      label: "Total Portfolio",
      value: formatAmount(totalAmount),
      color: "#1565c0",
      bg: "#e3f2fd",
      trend: "Combined loan value"
    },
  ];

  const riskIcon = (risk) => {
    if (risk === "Low")    return <span className="td-icon td-icon--low"><IconCheckCircle /></span>;
    if (risk === "High")   return <span className="td-icon td-icon--high"><IconAlertTriangle /></span>;
    return                        <span className="td-icon td-icon--medium"><IconShield /></span>;
  };

  const statusIcon = (status) => {
    if (status === "Approved") return <span className="td-icon td-icon--low"><IconCheckCircle /></span>;
    if (status === "Rejected") return <span className="td-icon td-icon--high"><IconXCircle /></span>;
    return                            <span className="td-icon td-icon--medium"><IconShield /></span>;
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard Overview</h1>
        <p>Real-time loan assessment analytics</p>
      </div>

      <div className="stats-grid">
        {stats.map(({ Icon, label, value, color, bg, trend }, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon-wrap" style={{ background: bg, color }}>
              <Icon />
            </div>
            <div className="stat-content">
              <span className="stat-label">{label}</span>
              <span className="stat-value" style={{ color }}>{value}</span>
              <span className="stat-trend">{trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="recent-section">
        <div className="recent-header">
          <h2>Recent Assessments</h2>
          <span className="recent-count">{assessments.length} records</span>
        </div>
        {assessments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><IconClipboard /></div>
            <p>No assessments yet. Run your first risk analysis to see results here.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="assessments-table">
              <thead>
                <tr>
                  <th><span className="th-inner">No.</span></th>
                  <th><span className="th-inner"><IconHash />Loan ID</span></th>
                  <th><span className="th-inner"><IconRupee />Amount</span></th>
                  <th><span className="th-inner"><IconAlertTriangle />Risk Level</span></th>
                  <th><span className="th-inner"><IconTrendingUp />Credit Score</span></th>
                  <th><span className="th-inner"><IconShield />Status</span></th>
                </tr>
              </thead>
              <tbody>
                {assessments.map((a, idx) => (
                  <tr key={a.id}>
                    <td className="serial-no">{idx + 1}</td>
                    <td className="loan-id">{a.id}</td>
                    <td className="amount">{a.amount}</td>
                    <td>
                      <span className={`risk-badge ${a.risk.toLowerCase()}`}>
                        {riskIcon(a.risk)}{a.risk}
                      </span>
                    </td>
                    <td className="score">{a.score}</td>
                    <td>
                      <span className={`status-badge ${a.status.toLowerCase()}`}>
                        {statusIcon(a.status)}{a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
