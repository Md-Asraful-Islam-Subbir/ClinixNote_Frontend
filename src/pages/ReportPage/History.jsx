import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./History.css";
import ExamHistory from "./ExamHistory"; // 🆕 import reusable component

const History = ({ patient }) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
const navigate = useNavigate();
  useEffect(() => {
    const fetchHistoryById = async () => {
      if (!patient?.id) {
        setReport({
          history: "No previous history available",
          patientName: patient?.firstName + " " + patient?.lastName,
        });
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `https://clinixnote-backend.onrender.com/api/report/by-patient-id/${patient.id}`
        );
        if (!res.ok) throw new Error("Failed to fetch report by patient ID");

        const data = await res.json();
        if (data.length > 0) {
          setReport(data[0]);
        } else {
          setReport({
            history: "No previous history available",
            patientName: patient?.firstName + " " + patient?.lastName,
          });
        }
      } catch (err) {
        console.error("Error loading history by patient ID:", err);
        setReport({
          history: "No previous history available",
          patientName: patient?.firstName + " " + patient?.lastName,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHistoryById();
  }, [patient]);

const handleDownload = async (fileUrl, filename) => {
  try {
    const response = await fetch(`https://clinixnote-backend.onrender.com${fileUrl}`);
    if (!response.ok) throw new Error("Download failed");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    }, 100);

  } catch (error) {
    console.error("Download failed:", error);
    alert("Download failed");
  }
};


  if (loading) return <p className="history-loading">Loading latest history...</p>;
  if (!report) return <p className="history-no-data">No history found.</p>;

  return (
    <div className="history-container">
      <h2 className="history-title">🗘 Latest Patient Report Summary</h2>

      <div className="history-info-grid">
        <div><strong>🕒 Date:</strong> {new Date(report.timestamp).toLocaleString()}</div>
        <div><strong>👤 Patient:</strong> {report.patientName}</div>
        <div><strong>🩺 Doctor:</strong> {report.doctorName}</div>
        <div><strong>📞 Contact:</strong> {report.contact}</div>
        <div><strong>🔍 Procedure:</strong> {report.procedure}</div>
      </div>

      {/* 🧩 Reusable History + Exam Findings component */}
      <ExamHistory report={report} />

      {(report.analysisResult || report.analysisResults?.length > 0) && (
        <div className="history-section">
          <h3>🧠 AI Medical Insights History</h3>
          <ul className="analysis-list">
            {[...(report.analysisResults || []),
              ...(report.analysisResult
                ? [
                    {
                      input: report.analysisResult.input,
                      result: report.analysisResult.result,
                      date: report.timestamp || new Date(),
                    },
                  ]
                : []),
            ]
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map((item, idx) => (
                <li key={idx} className="analysis-item">
                  <p><strong>🗓 {new Date(item.date).toLocaleString()}</strong></p>
                  <p><strong>🧠 Input:</strong> {item.input}</p>
                  <p><strong>💡 Insight:</strong> {item.result}</p>
                  <hr />
                </li>
              ))}
          </ul>
        </div>
      )}
{/* 🧾 Prescription History Section */}
{report.prescriptions?.length > 0 && (
  <div className="history-section">
    <h3>💊 Prescription History</h3>
    <ul className="prescription-list">
      {report.prescriptions
        .sort(
          (a, b) =>
            new Date(b.datetime || `${b.date} ${b.time}`) -
            new Date(a.datetime || `${a.date} ${a.time}`)
        )
        .map((pres, idx) => (
          <li key={idx} className="prescription-item">
            <p><strong>🗓 Date:</strong> {pres.date}</p>
            <p><strong>⏰ Time:</strong> {pres.time}</p>
            <p><strong>👨‍⚕️ Doctor:</strong> {report.doctorName || "Unknown"}</p>
            <p><strong>💊 Medicine:</strong> {pres.content}</p>
             <button
                    onClick={() =>
                      navigate("/prescription", {
                        state: {
                          prescription: pres,
                          patient: patient || report.patient,
                          doctor: { name: report.doctorName },
                        },
                      })
                    }
                  >
                    Download
                  </button>
            <hr />
          </li>
        ))}
    </ul>
  </div>
)}
      {report.documents?.length > 0 && (
        <div className="history-section">
          <h3>📎 Attached Documents</h3>
          <ul className="document-list">
            {report.documents.map((doc, idx) => (
              <li key={idx} className="document-item">
                <div className="document-details">
                  <p><strong>{doc.name}</strong> ({doc.type}, {doc.size})</p>
                  <p className="document-date">🗓 Uploaded: {doc.date}</p>
                </div>
                <div className="document-actions">
                  <a
                    href={`https://clinixnote-backend.onrender.com${doc.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="view-link"
                  >
                    🔍 View
                  </a>
                  <button
                    onClick={() => handleDownload(doc.url, doc.name)}
                    className="download-link"
                  >
                    ⬇️ Download
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default History;
