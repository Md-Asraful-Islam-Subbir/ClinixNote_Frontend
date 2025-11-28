import { useState } from "react";
import { useLocation } from "react-router-dom";
import "./PrescriptionReport.css";

const PrescriptionReport = () => {
  const location = useLocation();
  const { prescription, patient, doctor } = location.state || {};

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const saveToMySQL = async () => {
    if (!prescription || !patient) {
      setError("Missing prescription or patient information.");
      return;
    }

    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(
        "https://clinixnote-backend.onrender.com/api/prescriptions/save-mysql",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientName:
              patient?.name ||
              `${patient?.firstName || ""} ${patient?.lastName || ""}`.trim(),
            contact: patient?.contact,
            doctorName: doctor?.name || prescription?.doctor,
            date: prescription?.date,
            time: prescription?.time,
            prescriptionText: prescription?.content,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
      } else {
        setError("Failed to save prescription.");
      }
    } catch (err) {
      console.error("Save error:", err);
      setError("Something went wrong while saving the prescription.");
    }
  };

  return (
    <div className="prescription-report-container">
      <div className="prescription-report-header">
        <h2>Prescription Details</h2>
        <p className="prescription-date">
          Date: {prescription?.date || "N/A"} at {prescription?.time || "N/A"}
        </p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && (
        <div className="success-message">
          Prescription successfully saved to MySQL!
        </div>
      )}

      <div className="prescription-preview-card">
        <div className="prescription-preview-header">
          <h3>Prescription Summary</h3>
          <span className="prescription-id">
            ID: {prescription?._id || "N/A"}
          </span>
        </div>

        <div className="prescription-preview-content">
          <div className="preview-section">
            <label>Patient Name:</label>
            <p>
              {patient?.name ||
                `${patient?.firstName || ""} ${patient?.lastName || ""}`}
            </p>
          </div>

          <div className="preview-section">
            <label>Doctor:</label>
            <p>{doctor?.name || prescription?.doctor || "N/A"}</p>
          </div>

          <div className="preview-section">
            <label>Contact:</label>
            <p>{patient?.contact || "N/A"}</p>
          </div>

          <div className="preview-section">
            <label>Prescription:</label>
            <div className="prescription-text">
              {prescription?.content?.split("\n").map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>
        </div>

        <div className="prescription-actions">
          <button className="save-btn" onClick={saveToMySQL}>
            Save to MySQL
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionReport;
