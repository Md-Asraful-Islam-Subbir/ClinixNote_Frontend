import React from "react";
import "./ExamHistory.css";

const ExamHistory = ({ report }) => {
  if (!report) return <p>No report data available.</p>;

  const formattedDate = (date) =>
    new Date(date || report.timestamp).toLocaleString();

  return (
    <div className="exam-history-section">
      <h3>📂 History & Exam Findings</h3>

      {/* Patient History */}
      {Array.isArray(report.history) && report.history.length > 0 ? (
  report.history.map((h, idx) => (
    <div key={idx} className="history-entry">
      <p>🗓 <strong>{formattedDate(h.date)}</strong></p>
      <p>🩺 {typeof h === "string" ? h : h.content}</p>
      <hr />
    </div>
  ))
) : (
  <p>{report.history || "No history provided."}</p>
)}

{report.examFindings?.length > 0 && (
  <div className="exam-findings">
    <h4>🧾 Exam Findings</h4>
    {report.examFindings.map((finding, idx) => (
      <div key={idx} className="exam-finding-item">
        <p>🗓 <strong>{formattedDate(finding.date)}</strong></p>
        <p>🔹 {typeof finding === "string" ? finding : finding.content}</p>
        <hr />
      </div>
    ))}
  </div>
)}
    </div>
  );
};

export default ExamHistory;
