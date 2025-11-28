import React, { useState, useEffect } from "react";
import './AddDoctor.css';

const AddDoctor = () => {
  const [applications, setApplications] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [password, setPassword] = useState("");

  useEffect(() => {
    fetch("https://clinixnote-backend.onrender.com/api/doctor/applications")
      .then((res) => res.json())
      .then((data) => setApplications(data))
      .catch(() => alert("Failed to fetch doctor applications"));
  }, []);

  const handleApprove = async () => {
    if (!password) return alert("Please enter a password.");

    try {
      const res = await fetch(`https://clinixnote-backend.onrender.com/api/doctor/approve/${selectedDoctor._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      alert(data.message);

      if (res.ok) {
        setApplications(applications.filter((doc) => doc._id !== selectedDoctor._id));
        setSelectedDoctor(null);
        setPassword("");
      }
    } catch {
      alert("Failed to approve doctor");
    }
  };

  const handleDecline = async () => {
    console.log("Decline button clicked!"); 
    try {
      const res = await fetch(`https://clinixnote-backend.onrender.com/api/doctor/decline/${selectedDoctor._id}`, {
        method: "POST",
      });
      const data = await res.json();
      alert(data.message);

      if (res.ok) {
        setApplications(applications.filter((doc) => doc._id !== selectedDoctor._id));
        setSelectedDoctor(null);
        setPassword("");
      }
    } catch {
      alert("Failed to decline doctor");
    }
  };

  return (
    <div className="add-doctor-container">
      <h2>Pending Doctor Applications</h2>
      <ul className="applications-list">
        {applications.map((doc) => (
          <li key={doc._id} onClick={() => setSelectedDoctor(doc)}>
            {doc.name} - {doc.email} - {doc.specialization}
          </li>
        ))}
      </ul>

      {selectedDoctor && (
        <div className="approve-section">
          <h3>Approve Doctor</h3>
          <p><strong>Name:</strong> {selectedDoctor.name}</p>
          <p><strong>Email:</strong> {selectedDoctor.email}</p>
          <p><strong>Specialization:</strong> {selectedDoctor.specialization}</p>

          <input
            type="password"
            placeholder="Set password for doctor"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <br />
          <button onClick={handleApprove}>Approve</button>
          <button  type="button" onClick={handleDecline} className="decline">Decline</button>
        </div>
      )}
    </div>
  );
};

export default AddDoctor;
