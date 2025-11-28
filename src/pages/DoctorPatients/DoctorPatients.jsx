import React, { useState, useEffect, useRef } from "react";
import ReactWebcam from "react-webcam";
import "./DoctorPatients.css";
import { useNavigate } from "react-router-dom";

const DoctorPatients = () => {
  const [patients, setPatients] = useState([]);
  const [doctor, setDoctor] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [capturing, setCapturing] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState(null);
  const [examFindings, setExamFindings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const webcamRef = useRef(null);
  const navigate = useNavigate();

  // Fetch all patients for logged-in doctor
  useEffect(() => {
    const fetchPatients = async () => {
      const token = localStorage.getItem("token");
      if (!token) return console.error("No token found.");

      try {
        const response = await fetch("https://clinixnote-backend.onrender.com/api/patients/my-patients", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setPatients(data);
        } else {
          console.error("Failed to fetch patients");
        }
      } catch (error) {
        console.error("Error fetching patients:", error);
      }
    };

    fetchPatients();
  }, []);

  // Fetch doctor profile
  useEffect(() => {
    const fetchDoctor = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch("https://clinixnote-backend.onrender.com/api/doctor/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setDoctor(data);
        } else {
          console.error("Failed to fetch doctor profile");
        }
      } catch (error) {
        console.error("Error fetching doctor:", error);
      }
    };

    fetchDoctor();
  }, []);

  // Capture and upload patient image
  const captureImage = async (patientId) => {
    if (!webcamRef.current) return;

    const imageSrc = webcamRef.current.getScreenshot();
    setCapturing(false);

    if (!imageSrc) {
      alert("Failed to capture image");
      return;
    }

    // Convert base64 image to Blob
    const response = await fetch(imageSrc);
    const blob = await response.blob();

    const formData = new FormData();
    formData.append("image", blob, "capture.jpg");
    formData.append("patientId", patientId);

    try {
      const token = localStorage.getItem("token");
      const uploadResponse = await fetch(
        `https://clinixnote-backend.onrender.com/api/patients/${patientId}/uploadImage`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      const result = await uploadResponse.json();
      console.log("Recognition result:", result);
      setRecognitionResult(result);

      // 🧠 Fetch exam findings if a match is found
      if (result.match && result.patient_id) {
        try {
          const reportResponse = await fetch(
            `https://clinixnote-backend.onrender.com/api/patientreports/${result.patient_id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (reportResponse.ok) {
            const reportData = await reportResponse.json();
            console.log("Report data:", reportData);
            setExamFindings(reportData.examFindings || []);
          } else {
            console.error("Failed to fetch exam findings");
            setExamFindings([]);
          }
        } catch (error) {
          console.error("Error fetching exam findings:", error);
        }
      }

      // Update local patient image
      setPatients((prevPatients) =>
        prevPatients.map((p) =>
          p._id === patientId ? { ...p, image: imageSrc } : p
        )
      );
    } catch (error) {
      console.error("Error processing face recognition:", error);
    }
  };

  const removePatient = async (patient) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`https://clinixnote-backend.onrender.com/api/patients`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: patient.name,
          contact: patient.contact,
          doctor: patient.doctor,
          appointmentDate: patient.appointmentDate,
          appointmentTime: patient.appointmentTime,
        }),
      });

      if (response.ok) {
        alert("Patient removed successfully");
        setPatients((prev) => prev.filter((p) => p._id !== patient._id));
      } else {
        const errData = await response.json();
        console.error("Failed to remove patient:", errData.message);
      }
    } catch (error) {
      console.error("Error removing patient:", error);
    }
  };

  const closeRecognitionModal = () => {
    setRecognitionResult(null);
    setExamFindings([]); // 🆕 clear findings
  };

  return (
    <div className="doctor-patients-container">
      <h2>Patient List</h2>
<input
  type="text"
  placeholder="Search patient..."
  className="search-box"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
/>

      <table className="patients-table">

        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Contact</th>
            <th>Doctor</th>
            <th>Appointment</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {patients
           .filter((patient) => {
    if (!searchTerm) return true;
    return (
      patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.contact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.doctor?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  })
          .map((patient) => (
            <tr key={patient._id}>
              <td>
                {patient.image ? (
                  <img
                    src={
                      patient.image.startsWith("data:")
                        ? patient.image
                        : `https://clinixnote-backend.onrender.com/uploads/${patient.image}`
                    }
                    alt="Patient"
                    className="patient-image"
                  />
                ) : (
                  <button onClick={() => setCapturing(patient._id)}>Capture</button>
                )}
              </td>
              <td>{patient.name}</td>
              <td>{patient.contact}</td>
              <td>{patient.doctor}</td>
              <td>
                {patient.appointmentDate} at {patient.appointmentTime}
              </td>
              <td>
                <button onClick={() => setSelectedPatient(patient)}>View</button>
                <button onClick={() => removePatient(patient)}>Remove</button>
                <button
                  onClick={() =>
                    navigate("/report", { state: { patient, doctor } })
                  }
                >
                  Report
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Webcam Capture Modal */}
      {capturing && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="webcam-container">
              <ReactWebcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: "user" }}
                width={500}
                height={375}
              />
              <div className="webcam-controls">
                <button onClick={() => captureImage(capturing)}>Capture & Save</button>
                <button onClick={() => setCapturing(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Patient Info Modal */}
      {selectedPatient && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Patient Details</h3>
            <p><strong>Name:</strong> {selectedPatient.name}</p>
            <p><strong>Contact:</strong> {selectedPatient.contact}</p>
            <p><strong>Doctor:</strong> {selectedPatient.doctor}</p>
            <p><strong>Appointment Date:</strong> {selectedPatient.appointmentDate}</p>
            <p><strong>Appointment Time:</strong> {selectedPatient.appointmentTime}</p>
            {selectedPatient.image && (
              <img
                src={
                  selectedPatient.image.startsWith("data:")
                    ? selectedPatient.image
                    : `data:image/jpeg;base64,${selectedPatient.image}`
                }
                alt="Patient"
                className="patient-modal-image"
              />
            )}
            <button className="close-button" onClick={() => setSelectedPatient(null)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Recognition Result Modal */}
      {recognitionResult && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Recognition Result</h3>
            <p><strong>Match:</strong> {recognitionResult.match ? "Yes" : "No"}</p>
            <p>
              <strong>Confidence:</strong>{" "}
              {recognitionResult.score !== undefined && !isNaN(recognitionResult.score)
                ? (recognitionResult.score * 100).toFixed(2) + "%"
                : "N/A"}
            </p>

            {recognitionResult.match && (
              <>
                <p><strong>Patient ID:</strong> {recognitionResult.patient_id}</p>

                {examFindings.length > 0 ? (
                  <div>
                    <h4>Exam Findings:</h4>
                    <ul>
                      {examFindings.map((finding, idx) => (
                        <li key={idx}>
                          {typeof finding === "string"
                            ? finding
                            : finding.content || JSON.stringify(finding)}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p>No exam findings found.</p>
                )}
              </>
            )}

            <button className="close-button" onClick={closeRecognitionModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorPatients;
