import { useState } from "react";
import "./Reports.css";

// ── SVG Icons ──
const IconClipboard  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>;
const IconCheckCircle= () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const IconXCircle    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>;
const IconStar       = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IconTrendingUp = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const IconRupee      = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="5" x2="18" y2="5"/><line x1="6" y1="10" x2="18" y2="10"/><path d="M6 10l7 9"/><path d="M6 5h5a4 4 0 0 1 0 8H6"/></svg>;
const IconDownload   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const IconEye        = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IconBarChart   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const IconAlertTriangle = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IconShield     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IconCalendar   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;

function Reports({ assessments }) {
  const [viewReport, setViewReport] = useState(null);

  const total       = assessments.length;
  const approved    = assessments.filter(a => a.status === "Approved").length;
  const rejected    = assessments.filter(a => a.status === "Rejected").length;
  const review      = assessments.filter(a => a.status === "Review").length;
  const avgScore    = total ? Math.round(assessments.reduce((s, a) => s + a.score, 0) / total) : 0;
  const defaultRate = total ? ((rejected / total) * 100).toFixed(1) : "0.0";
  const totalAmount = assessments.reduce((s, a) => s + Number(a.amount.replace(/[₹$,]/g, "")), 0);
  const formatAmount = (n) => n >= 10000000 ? `₹${(n/10000000).toFixed(2)}Cr` : n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : `₹${(n/1000).toFixed(1)}K`;
  const today = new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  const getFilteredData = (title) => {
    if (title === "Approved Loans")           return assessments.filter(a => a.status === "Approved");
    if (title === "Rejected Loans")           return assessments.filter(a => a.status === "Rejected");
    if (title === "Credit Score Distribution") return [...assessments].sort((a, b) => b.score - a.score);
    if (title === "Default Rate Analysis")    return assessments.filter(a => a.status === "Rejected");
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
    a.href = url; a.download = `${title.replace(/\s+/g, "_")}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const reports = [
    { Icon: IconClipboard,      title: "Total Assessments",       color: "#1a237e", bg: "#e8eaf6", description: `${total} loan risk assessments submitted and analyzed.`,                          value: total },
    { Icon: IconCheckCircle,    title: "Approved Loans",          color: "#0288d1", bg: "#e1f5fe", description: `${approved} of ${total} applications approved based on risk analysis.`,           value: approved },
    { Icon: IconXCircle,        title: "Rejected Loans",          color: "#ef5350", bg: "#ffebee", description: `${rejected} applications rejected. Default rate: ${defaultRate}%.`,               value: rejected },
    { Icon: IconStar,           title: "Credit Score Distribution",color: "#7b1fa2",bg: "#f3e5f5", description: `Average credit score across all assessments is ${avgScore}.`,                    value: avgScore },
    { Icon: IconAlertTriangle,  title: "Default Rate Analysis",   color: "#f57c00", bg: "#fff3e0", description: `Current default rate is ${defaultRate}% based on submitted assessments.`,        value: `${defaultRate}%` },
    { Icon: IconRupee,          title: "Total Loan Portfolio",    color: "#1565c0", bg: "#e3f2fd", description: `Combined loan amount across all assessments is ${formatAmount(totalAmount)}.`,   value: formatAmount(totalAmount) },
  ];

  const modalData = viewReport ? getFilteredData(viewReport.title) : [];

  const riskIcon = (risk) => {
    if (risk === "Low")  return <span className="td-icon td-icon--low"><IconCheckCircle /></span>;
    if (risk === "High") return <span className="td-icon td-icon--high"><IconAlertTriangle /></span>;
    return                      <span className="td-icon td-icon--medium"><IconShield /></span>;
  };

  const statusIcon = (status) => {
    if (status === "Approved") return <span className="td-icon td-icon--low"><IconCheckCircle /></span>;
    if (status === "Rejected") return <span className="td-icon td-icon--high"><IconXCircle /></span>;
    return                            <span className="td-icon td-icon--medium"><IconShield /></span>;
  };

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1>Reports & Analytics</h1>
        <p>Comprehensive loan assessment reports based on submitted data</p>
      </div>

      <div className="reports-actions">
        <button className="btn-generate" onClick={() => setViewReport({ title: "Total Assessments" })}>
          <IconBarChart /> Generate Report
        </button>
        <button className="btn-export" onClick={() => downloadCSV("Total Assessments")}>
          <IconDownload /> Export All
        </button>
      </div>

      <div className="reports-grid">
        {reports.map(({ Icon, title, color, bg, description, value }, i) => (
          <div key={i} className="report-card">
            <div className="report-card-top">
              <div className="report-icon-wrap" style={{ background: bg, color }}>
                <Icon />
              </div>
              <span className="report-value-badge" style={{ background: bg, color }}>{value}</span>
            </div>
            <div className="report-content">
              <h3 style={{ color }}>{title}</h3>
              <p>{description}</p>
              <div className="report-meta">
                <span className="report-date"><IconCalendar /> {today}</span>
              </div>
            </div>
            <div className="report-actions">
              <button className="btn-view" onClick={() => setViewReport({ title, description })}>
                <IconEye /> View
              </button>
              <button className="btn-download" onClick={() => downloadCSV(title)}>
                <IconDownload /> Download
              </button>
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
                      <th>Loan ID</th><th>Amount</th>
                      <th>Risk Level</th><th>Credit Score</th><th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalData.map((a) => (
                      <tr key={a.id}>
                        <td className="loan-id">{a.id}</td>
                        <td className="amount">{a.amount}</td>
                        <td><span className={`risk-badge ${a.risk.toLowerCase()}`}>{riskIcon(a.risk)}{a.risk}</span></td>
                        <td className="score">{a.score}</td>
                        <td><span className={`status-badge ${a.status.toLowerCase()}`}>{statusIcon(a.status)}{a.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="modal-footer">
              <button className="btn-download" onClick={() => downloadCSV(viewReport.title)}><IconDownload /> Download CSV</button>
              <button className="btn-view" onClick={() => setViewReport(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;
