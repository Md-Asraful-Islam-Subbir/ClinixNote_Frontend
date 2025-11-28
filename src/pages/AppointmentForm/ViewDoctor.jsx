import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./ViewDoctor.css";

const ViewDoctor = () => {
  const [doctors, setDoctors] = useState([]);
const isLoggedIn = localStorage.getItem("token"); // or check context

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await fetch("https://clinixnote-backend.onrender.com/api/doctor/doctorsforappointment");
        if (!res.ok) throw new Error("Failed to fetch doctors");
        const data = await res.json();
        setDoctors(data);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };

    fetchDoctors();
  }, []);

  return (
    <div className="view-doctor-container">
      <h2>Available Doctors</h2>
      <div className="doctor-grid">
        {doctors.map((doc) => (
          <div key={doc._id} className="doctor-card">
            <img
              src="https://alabamaoncology.com/wp-content/uploads/Doctor_0013_AAO-365976-c.jpg"
              alt={`Dr. ${doc.name}`}
              className="doctor-img"
            />
            <h3>{doc.name}</h3>
            <p className="specialization">{doc.specialization}</p>
            <p className="email">{doc.email}</p>

            <div className="doctor-actions">
               {isLoggedIn ? (
    <Link to="/appointment-form">
      <button>Book Appointment</button>
    </Link>
  ) : (
    <button
      onClick={() => alert("You must log in to book an appointment")}
    >
      Book Appointment
    </button>
  )}

              <Link to={`/doctor-schedule/${doc._id}`}>
                <button>View Schedule </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewDoctor;
