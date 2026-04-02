import { useState } from "react";
import "./Reports.css";

function Reports({ assessments }) {
  const [viewReport, setViewReport] = useState(null);

  const total = assessments.length;
  const approved = assessments.filter(a => a.status === "Approved").length;
  const rejected = assessments.filter(a => a.status === "Rejected").length;
  const review = assessments.filter(a => a.status === "Review").length;
  const avgScore = total ? Math.round(assessments.reduce((s, a) => s + a.score, 0) / total) : 0;
  const defaultRate = total ? ((rejected / total) * 100).toFixed(1) : "0.0";
  const totalAmount = assessments.reduce((s, a) => s + Number(a.amount.replace(/[$,]/g, "")), 0);
  const formatAmount = (n) => n >= 1000000 ? `$${(n / 1000000).toFixed(2)}M` : `$${(n / 1000).toFixed(1)}K`;
  const today = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const getFilteredData = (title) => {
    if (title === "Approved Loans") return assessments.filter(a => a.status === "Approved");
    if (title === "Rejected Loans") return assessments.filter(a => a.status === "Rejected");
    if (title === "Credit Score Distribution") return [...assessments].sort((a, b) => b.score - a.score);
    if (title === "Default Rate Analysis") return assessments.filter(a => a.status === "Rejected");
    return assessments;
  };

  const downloadCSV = (title) => {
    const data = getFilteredData(title);
    if (!data.length) { alert("No data available to download."); return; }
    const headers = ["Loan ID", "Amount", "Risk Level", "Credit Score", "Status"];
    const rows = data.map(a => [a.id, a.amount, a.risk, a.score, a.status]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "_")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reports = [
    {
      title: "Total Assessments",
      description: `${total} loan risk assessments have been submitted and analyzed.`,
      date: today, type: "PDF", value: total
    },
    {
      title: "Approved Loans",
      description: `${approved} out of ${total} applications were approved based on risk analysis.`,
      date: today, type: "Excel", value: approved
    },
    {
      title: "Rejected Loans",
      description: `${rejected} applications were rejected. Default rate stands at ${defaultRate}%.`,
      date: today, type: "PDF", value: rejected
    },
    {
      title: "Credit Score Distribution",
      description: `Average credit score across all assessments is ${avgScore}.`,
      date: today, type: "PDF", value: avgScore
    },
    {
      title: "Default Rate Analysis",
      description: `Current default rate is ${defaultRate}% based on submitted assessments.`,
      date: today, type: "Excel", value: `${defaultRate}%`
    },
    {
      title: "Total Loan Portfolio",
      description: `Combined loan amount across all assessments is ${formatAmount(totalAmount)}.`,
      date: today, type: "PDF", value: formatAmount(totalAmount)
    }
  ];

  const modalData = viewReport ? getFilteredData(viewReport.title) : [];

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1>Reports & Analytics</h1>
        <p>Comprehensive loan assessment reports based on submitted data</p>
      </div>

      <div className="reports-actions">
        <button className="btn-generate" onClick={() => setViewReport({ title: "Total Assessments" })}>📊 Generate New Report</button>
        <button className="btn-export" onClick={() => downloadCSV("Total Assessments")}>📥 Export All</button>
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
                <span className="report-value">📈 {report.value}</span>
              </div>
            </div>
            <div className="report-actions">
              <button className="btn-view" onClick={() => setViewReport(report)}>👁️ View</button>
              <button className="btn-download" onClick={() => downloadCSV(report.title)}>⬇️ Download</button>
            </div>
          </div>
        ))}
      </div>

      {viewReport && (
        <div className="modal-overlay" onClick={() => setViewReport(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{viewReport.title}</h2>
              <button className="modal-close" onClick={() => setViewReport(null)}>✕</button>
            </div>
            <p className="modal-desc">{viewReport.description}</p>
            {modalData.length === 0 ? (
              <p className="no-data">No data available for this report yet.</p>
            ) : (
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
                    {modalData.map((a) => (
                      <tr key={a.id}>
                        <td className="loan-id">{a.id}</td>
                        <td className="amount">{a.amount}</td>
                        <td><span className={`risk-badge ${a.risk.toLowerCase()}`}>{a.risk}</span></td>
                        <td className="score">{a.score}</td>
                        <td><span className={`status-badge ${a.status.toLowerCase()}`}>{a.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="modal-footer">
              <button className="btn-download" onClick={() => downloadCSV(viewReport.title)}>⬇️ Download CSV</button>
              <button className="btn-view" onClick={() => setViewReport(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;
