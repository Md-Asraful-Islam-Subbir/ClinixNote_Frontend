import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./ReportPage.css";
import History from "../../pages/ReportPage/History"; 
const ReportPage = () => {
  const location = useLocation();
  const { patient, doctor } = location.state || {};
  const [documents, setDocuments] = useState([]);
  const [prescription, setPrescription] = useState("");
  const [savedPrescriptions, setSavedPrescriptions] = useState([]);
  const [editingPrescriptionId, setEditingPrescriptionId] = useState(null);
  const [notes, setNotes] = useState("");
  const [history, setHistory] = useState("");
  const [examFindings, setExamFindings] = useState("");
  const mediaRecorderRef = useRef(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [recording, setRecording] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("notes");
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [ehrSaved, setEhrSaved] = useState(false);
  const [interimTranscription, setInterimTranscription] = useState("");
  const recognitionRef = useRef(null);
const [analysisResult, setAnalysisResult] = useState(null);
const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    // Simulate initial data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Simulate initial patient data
      if (patient) {
        setHistory(patient.history || "No previous history available");
      }
    }, 800);

    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let interim = '';
        let final = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript + ' ';
          } else {
            interim += transcript;
          }
        }
        
        setInterimTranscription(interim);
        if (final) {
          setTranscription(prev => prev + final);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        stopRecording();
      };
    }

    return () => {
      clearTimeout(timer);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [patient]);

  useEffect(() => {
    if (patient) {
      // Reset states when patient changes
      setDocuments([]);
      setPrescription("");
      setNotes("");
      setExamFindings("");
      setAudioUrl(null);
      setRecording(false);
      setTranscription("");
      setInterimTranscription("");
      setIsProcessing(false);
      setImageLoaded(false);
      setEhrSaved(false);
    }
  }, [patient]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = (e) => {
    e.target.src = "/placeholder.jpg";
    setImageLoaded(true);
  };

  const startRecording = async () => {
    try {
      // Start audio recording
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      let audioChunks = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
      };

      mediaRecorderRef.current.start();
      
      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setRecording(true);
        setIsProcessing(true);
        setTranscription("");
        setInterimTranscription("");
      } else {
        alert("Speech recognition not supported in your browser");
      }
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    setRecording(false);
    setIsProcessing(false);
  };

  const savePrescription = () => {
    if (!prescription.trim()) return;
    
    const now = new Date();
    const prescriptionData = {
      id: Date.now(),
      content: prescription,
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString(),
      doctor: doctor?.[0]?.name || "Dr. Unknown",
      datetime: now.toISOString()
    };

    if (editingPrescriptionId) {
      // Update existing prescription
      setSavedPrescriptions(prev =>
        prev.map(p =>
          p.id === editingPrescriptionId ? prescriptionData : p
        )
      );
      setEditingPrescriptionId(null);
    } else {
      // Add new prescription
      setSavedPrescriptions(prev => [prescriptionData, ...prev]);
    }

    setPrescription("");
  };

  const editPrescription = (id) => {
    const prescriptionToEdit = savedPrescriptions.find(p => p.id === id);
    if (prescriptionToEdit) {
      setPrescription(prescriptionToEdit.content);
      setEditingPrescriptionId(id);
      setActiveTab("prescription");
    }
  };

  const deletePrescription = (id) => {
    setSavedPrescriptions(prev => prev.filter(p => p.id !== id));
  };

  // In your ReportPage component
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    const newDocument = {
      _id: Date.now().toString(), // Add unique ID
      url: URL.createObjectURL(file),
      name: file.name,
      type: file.type.split("/")[1] || "file",
      size: (file.size / 1024).toFixed(2) + " KB",
      date: new Date().toLocaleString(),
      mimetype: file.type
    };
    setDocuments((prevDocs) => [...prevDocs, newDocument]);
  }
};

const saveToEHR = async () => {
  try {
    const formData = new FormData();

    // 🧩 Append text data
    formData.append("patientId", patient.id);
    formData.append("patientName", patient.name);
    formData.append("doctorName", doctor.name);
    formData.append("image", patient.image);
    formData.append("contact", patient.contact);
    formData.append("lastVisit", patient.lastVisit || "");
    formData.append("procedure", patient.procedure || "");
    formData.append("notes", notes);
    formData.append("history", history);
    formData.append("examFindings", examFindings);
    formData.append("transcription", transcription);
    formData.append("prescriptions", JSON.stringify(savedPrescriptions));

    if (analysisResult) {
      formData.append("analysisResult", JSON.stringify({
        input: transcription,
        result: analysisResult.answer
      }));
    }

    // 🎤 Convert audio blob URL → File
    if (audioUrl) {
      const audioBlob = await fetch(audioUrl).then(res => res.blob());
      const audioFile = new File([audioBlob], "recording.wav", { type: "audio/wav" });
      formData.append("audio", audioFile);
    }

    // 📄 Convert document blob URLs → Files
    for (const doc of documents) {
      if (doc.url.startsWith("blob:")) {
        const blob = await fetch(doc.url).then(res => res.blob());
        const file = new File([blob], doc.name, { type: doc.mimetype || "application/octet-stream" });
        formData.append("documents", file);
      }
    }

    // 🚀 Send multipart/form-data
    const res = await fetch("https://clinixnote-backend.onrender.com/api/report", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      console.log("✅ Report saved:", data);
      setEhrSaved(true);
      alert("✅ Report successfully saved to EHR!");
      setTimeout(() => setEhrSaved(false), 3000);
    } else {
      const error = await res.text();
      console.error("❌ Server error:", error);
      alert("Failed to save report to EHR.");
    }
  } catch (err) {
    console.error("❌ Save failed:", err);
    alert("Error saving report to EHR.");
  }
};

  const downloadTranscription = () => {
    if (!transcription) return;
    
    const element = document.createElement("a");
    const file = new Blob([transcription], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `transcription_${patient.firstName}_${patient.lastName}_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
const analyzeTranscription = async () => {
  if (!transcription.trim()) return;
  setIsAnalyzing(true);
  try {
    const response = await fetch("https://clinixnote-backend.onrender.com/api/gpt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: transcription }),
    });

    if (!response.ok) throw new Error("Failed to analyze transcription");

    const data = await response.json();
    setAnalysisResult(data);
  } catch (err) {
    console.error("Analysis error:", err);
    alert("Failed to analyze transcription");
  } finally {
    setIsAnalyzing(false);
  }
};

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading patient data...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="no-patient-container">
        <h2 className="no-patient">No Patient Selected</h2>
        <p>Please select a patient from the dashboard to view or create reports.</p>
      </div>
    );
  }

  return (
    <div className="report-page">
      <header className="report-header">
        <div className="header-content">
          <h2>Patient Report Dashboard</h2>
          <div className="patient-info-header">
            <span className="patient-name">{patient.firstName} {patient.lastName}</span>
            <span className="patient-id">ID: {patient.id || "N/A"}</span>
          </div>
        </div>
      </header>

      <div className="report-content">
        <aside className="patient-card">
          <div className={`patient-image-container ${imageLoaded ? 'loaded' : 'loading'}`}>
<img
  src={
    patient.image
      ? `${(typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) || "https://clinixnote-backend.onrender.com"}/uploads/${patient.image}`
      : "/placeholder.jpg"
  }
  alt="Patient"
  className="patient-img"
  //onLoad={handleImageLoad}
  //onError={handleImageError}
/>

            {!imageLoaded && <div className="image-placeholder"></div>}
            <div className="patient-status">Active</div>
          </div>
          <h3>{patient.firstName} {patient.lastName}</h3>
          <div className="patient-details">
            <div className="detail-row">
              <span className="detail-label">Patient Name:</span>
              <span>{patient.name || "N/A"}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Contact:</span>
              <span>{patient.contact || "N/A"}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Doctor:</span>
              <span>{patient.doctor || "N/A"}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">AppointmentDate:</span>
              <span>{patient.appointmentDate|| "N/A"}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Time:</span>
              <span>{patient.appointmentTime || "N/A"}</span>
            </div>
          </div>
          <div className="patient-actions">
            <button className="view-history-btn">View Full History</button>
          </div>
        </aside>

        <main className="report-main">
          <div className="tabs">
            <button 
              className={`tab-btn ${activeTab === "notes" ? "active" : ""}`}
              onClick={() => setActiveTab("notes")}
            >
              Clinical Notes
            </button>
            <button 
              className={`tab-btn ${activeTab === "prescription" ? "active" : ""}`}
              onClick={() => setActiveTab("prescription")}
            >
              Prescription
            </button>
            <button 
              className={`tab-btn ${activeTab === "history" ? "active" : ""}`}
              onClick={() => setActiveTab("history")}
            >
              History
            </button>
            <button 
              className={`tab-btn ${activeTab === "exam" ? "active" : ""}`}
              onClick={() => setActiveTab("exam")}
            >
              Exam Findings
            </button>
          </div>

          {activeTab === "notes" && (
            <section className="notes-section card">
              <div className="section-header">
                <h3>Clinical Notes</h3>
                <div className="voice-recorder-controls">
                  {recording ? (
                    <button className="stop-btn" onClick={stopRecording}>
                      Stop Recording
                    </button>
                  ) : (
                    <button className="start-btn" onClick={startRecording}>
                      Start Recording
                    </button>
                  )}
                </div>
              </div>
              
              {audioUrl && (
                <div className="audio-player">
                  <audio controls src={audioUrl}></audio>
                </div>
              )}
              
              {isProcessing && (
                <div className="processing-indicator">
                  <div className="spinner"></div>
                  <p>Processing your recording...</p>
                </div>
              )}
              
              {(transcription || interimTranscription) && (
                <div className="transcription-result">
                  <div className="transcription-header">
                    <h4>Voice Transcription</h4>
                    {transcription && (
                      <button 
                        className="download-btn"
                        onClick={downloadTranscription}
                      >
                        Download as Text
                      </button>
                    )}
                  </div>
                  <div className="transcription-text">
                    {transcription}
                    {interimTranscription && (
                      <span className="interim-text">{interimTranscription}</span>
                    )}
                  </div>
                  <div className="transcription-actions">
                    <button 
                      className="apply-btn"
                      onClick={() => setNotes(transcription)}
                    >
                      Apply to Notes
                    </button>
                    <button 
                      className="clear-btn"
                      onClick={() => {
                        setTranscription("");
                        setInterimTranscription("");
                      }}
                    >
                      Clear Transcription
                    </button>
                  </div>
                </div>
              )}
              {transcription && (
  <div className="analysis-section">
    <button className="analyze-btn" onClick={analyzeTranscription} disabled={isAnalyzing}>
      {isAnalyzing ? "Analyzing..." : "Analyze with AI"}
    </button>

  {analysisResult && (
  <div className="analysis-result">
    <h4>AI Medical Insight</h4>
    <p>{analysisResult.answer}</p>
  </div>
)}

  </div>
)}

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter clinical notes here or use voice recording..."
                className="notes-textarea"
              />
            </section>
          )}

          {activeTab === "prescription" && (
            <section className="prescription-section card">
              <h3>Prescription</h3>
              <div className="medication-templates">
                <h4>Common Medications</h4>
                <div className="template-buttons">
                  <button onClick={() => setPrescription(prev => prev + "\nIbuprofen 400mg - Take 1 tablet every 6 hours as needed for pain")}>
                    Ibuprofen
                  </button>
                  <button onClick={() => setPrescription(prev => prev + "\nAmoxicillin 500mg - Take 1 capsule every 8 hours for 7 days")}>
                    Amoxicillin
                  </button>
                  <button onClick={() => setPrescription(prev => prev + "\nLisinopril 10mg - Take 1 tablet daily for blood pressure")}>
                    Lisinopril
                  </button>
                </div>
              </div>
              <textarea
                value={prescription}
                onChange={(e) => setPrescription(e.target.value)}
                placeholder="Write prescription here..."
                className="prescription-textarea"
              />
              <div className="prescription-actions">
                <button 
                  className="save-prescription-btn"
                  onClick={savePrescription}
                  disabled={!prescription.trim()}
                >
                  {editingPrescriptionId ? 'Update Prescription' : 'Save Prescription'}
                </button>
                {editingPrescriptionId && (
                  <button 
                    className="cancel-edit-btn"
                    onClick={() => {
                      setPrescription("");
                      setEditingPrescriptionId(null);
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
              
              <div className="signature-line">
                <span>{patient.doctor}</span>
              </div>

              {savedPrescriptions.length > 0 && (
                <div className="saved-prescriptions">
                  <h4>Saved Prescriptions</h4>
                  <div className="prescription-list">
                    {savedPrescriptions.map((prescription) => (
                      <div key={prescription.id} className="prescription-item">
                        <div className="prescription-header">
                          <span className="prescription-date">
                            {prescription.date} at {prescription.time}
                          </span>
                          <div className="prescription-item-actions">
                            <button 
                              className="edit-btn"
                              onClick={() => editPrescription(prescription.id)}
                            >
                              Edit
                            </button>
                            <button 
                              className="delete-btn"
                              onClick={() => deletePrescription(prescription.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <div className="prescription-content">
                          {prescription.content.split('\n').map((line, i) => (
                            <p key={i}>{line}</p>
                          ))}
                        </div>
                        <div className="prescription-footer">
                          Prescribed by: {patient.doctor}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {activeTab === "history" && (
  <History  patient={patient}  history={history} setHistory={setHistory}  />
)}

          {activeTab === "exam" && (
            <section className="exam-section card">
              <h3>Physical Exam Findings</h3>
              <textarea
                value={examFindings}
                onChange={(e) => setExamFindings(e.target.value)}
                placeholder="Enter physical examination findings..."
                className="exam-textarea"
              />
            </section>
          )}

          <section className="documents-section card1">
            <div className="section-header">
              <h3>Documents & Attachments</h3>
              <label className="upload-btn">
                <input 
                  type="file" 
                  onChange={handleFileUpload} 
                  style={{ display: 'none' }} 
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
                Upload Document
              </label>
            </div>
            
            {documents.length > 0 ? (
              <div className="documents-grid">
                {documents.map((doc, index) => (
                  <div key={index} className="document-card">
                    <div className={`document-icon ${doc.type}`}>
                      {doc.type === 'pdf' ? '📄' : 
                       doc.type === 'jpg' || doc.type === 'jpeg' || doc.type === 'png' ? '🖼️' : '📁'}
                    </div>
                    <div className="document-info">
                      <div className="document-name">{doc.name}</div>
                      <div className="document-meta">
                        <span>{doc.type}</span>
                        <span>{doc.size}</span>
                        <span>{doc.date}</span>
                      </div>
                    </div>
                    <a 
                      href={doc.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="view-doc-btn"
                    >
                      View
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-documents">
                <p>No documents uploaded yet</p>
              </div>
            )}
          </section>

          <div className="action-buttons">
            <button className="save-draft-btn">Save Draft</button>
            <button 
              className={`save-ehr-btn ${ehrSaved ? 'saved' : ''}`} 
              onClick={saveToEHR}
              disabled={ehrSaved}
            >
              {ehrSaved ? 'Saved to EHR!' : 'Save to EHR'}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReportPage;