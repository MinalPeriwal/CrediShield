import "./Reports.css";

function Reports() {
  const reports = [
    {
      title: "Monthly Risk Analysis",
      description: "Comprehensive risk assessment report for the current month",
      date: "December 2024",
      type: "PDF",
      size: "2.4 MB"
    },
    {
      title: "Quarterly Performance",
      description: "Q4 2024 loan approval and rejection statistics",
      date: "Q4 2024",
      type: "Excel",
      size: "1.8 MB"
    },
    {
      title: "Annual Summary",
      description: "Year-end comprehensive loan portfolio analysis",
      date: "2024",
      type: "PDF",
      size: "5.2 MB"
    },
    {
      title: "Credit Score Distribution",
      description: "Analysis of credit score ranges across all assessments",
      date: "November 2024",
      type: "PDF",
      size: "1.5 MB"
    },
    {
      title: "Default Rate Analysis",
      description: "Historical default rate trends and predictions",
      date: "October 2024",
      type: "Excel",
      size: "2.1 MB"
    },
    {
      title: "Model Performance",
      description: "ML model accuracy and performance metrics",
      date: "September 2024",
      type: "PDF",
      size: "3.2 MB"
    }
  ];

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1>Reports & Analytics</h1>
        <p>Download and view comprehensive loan assessment reports</p>
      </div>

      <div className="reports-actions">
        <button className="btn-generate">📊 Generate New Report</button>
        <button className="btn-export">📥 Export All</button>
      </div>

      <div className="reports-grid">
        {reports.map((report, index) => (
          <div key={index} className="report-card">
            <div className="report-icon">
              {report.type === "PDF" ? "📄" : "📊"}
            </div>
            <div className="report-content">
              <h3>{report.title}</h3>
              <p>{report.description}</p>
              <div className="report-meta">
                <span className="report-date">📅 {report.date}</span>
                <span className="report-size">💾 {report.size}</span>
              </div>
            </div>
            <div className="report-actions">
              <button className="btn-view">👁️ View</button>
              <button className="btn-download">⬇️ Download</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Reports;
