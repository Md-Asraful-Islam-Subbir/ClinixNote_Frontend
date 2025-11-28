import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets"; // Import icons/images
import "./DoctorDashboard.css"; // Custom CSS

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [doctor, setDoctor] = useState(null); // State to store doctor's information

  // Fetch Doctor's Information
  useEffect(() => {
    const fetchDoctorInfo = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login"); // Redirect to login if no token is found
        return;
      }

      try {
        const response = await fetch("http://localhost:4000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setDoctor(data); // Set doctor's information
      } catch (error) {
        console.error("Error fetching doctor info:", error);
        navigate("/login"); // Redirect to login on error
      }
    };

    fetchDoctorInfo();
  }, [navigate]);

  // Fetch Doctor's Appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login"); // Redirect to login if no token is found
        return;
      }

      try {
        const response = await fetch("http://localhost:4000/api/doctor/appointments", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setAppointments(data); // Set appointments
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };

    fetchAppointments();
  }, [navigate]);

  if (!doctor) {
    return <div>Loading...</div>; // Show loading state while fetching doctor info
  }

  return (
    <div className="doctor-dashboard">
      {/* Sidebar */}
      <aside className="sidebar1">
        <ul className="sidebar1-menu">
          <li onClick={() => navigate("/doctor-dashboard")} className="active">
            <span>🏥</span> Dashboard
          </li>
          <li onClick={() => navigate("/doctor-appointments")}>
            <span>📅</span> Appointments
          </li>
          <li onClick={() => navigate("/doctor-patients",{ state: { doctor } })}>
            <span>👩‍⚕️</span> Patients
          </li>
          <li onClick={() => navigate("/doctor-schedule")}>
            <span>💬</span> Availability
          </li>
        <li onClick={() => {
  localStorage.setItem("doctorName", doctor.name); // store doctor name
  navigate("/payment", { state: { doctorName: doctor.name } });
}}>
  <span>📊</span> Payment
</li>
<li onClick={() => navigate("/payment-history")}><span>📜</span> Payment History</li>

          <li
  onClick={() => {
    localStorage.removeItem("token");
    navigate("/", { replace: true }); 
    window.location.reload(); 
  }}
  className="logout"
>
  <span>🚪</span> Logout
</li>

        </ul>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <h1>Doctor Dashboard</h1>
         <div className="user-profile">
  <img src={doctor.avatar || assets.Physician1} alt="Doctor Avatar" />
  <div className="doctor-info">
    <span className="doctor-name">{doctor.name}</span>
    <span className="doctor-email">{doctor.email}</span>
    <span className="doctor-specialization">{doctor.specialization}</span>
  </div>
</div>

        </header>

        <section className="appointments">
          <h2>Upcoming Appointments</h2>
          <div className="appointment-list">
            {appointments.length > 0 ? (
              appointments.map((appt, index) => (
                <div key={index} className="appointment-card">
                  <div className="appointment-info">
                    <h3>{appt.patientName}</h3>
                    <p>📅 {appt.date} | ⏰ {appt.time}</p>
                    <p>🩺 Reason: {appt.reason}</p>
                  </div>
                  <button
                    className="view-details-btn"
                    onClick={() => navigate(`/appointment/${appt.id}`)}
                  >
                    View Details
                  </button>
                </div>
              ))
            ) : (
              <p className="no-appointments">No upcoming appointments</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default DoctorDashboard;