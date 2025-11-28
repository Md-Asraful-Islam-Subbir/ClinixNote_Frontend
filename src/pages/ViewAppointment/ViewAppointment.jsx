import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ViewAppointment.css';

const UserAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserAppointments = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('https://clinixnote-backend.onrender.com/api/appointments/user-appointments', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setAppointments(response.data);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load appointments");
      } finally {
        setLoading(false);
      }
    };

    fetchUserAppointments();
  }, []);

  const handlePayment = async (appointment) => {
    try {
      const response = await axios.post("https://clinixnote-backend.onrender.com/api/payment/initiate", {
        name: appointment.name,
        contact: appointment.contact,
        doctor: appointment.doctor
      });

      if (response.data.url) {
        window.location.href = response.data.url; // redirect to SSLCommerz
      }
    } catch (error) {
      console.error("Payment Error:", error);
      alert("Payment initialization failed");
    }
  };

  if (loading) return <div>Loading appointments...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!appointments.length) return <div>No appointments found.</div>;

  return (
    <div className="appointments-container">
      <h2 className="appointments-header">Your Appointments</h2>

      {appointments.map(appointment => (
        <div key={appointment._id} className="appointment-card">
          <p><strong>Patient Name:</strong> {appointment.name}</p>
          <p><strong>Doctor:</strong> {appointment.doctor}</p>
          <p><strong>Date:</strong> {new Date(appointment.preferredDate).toLocaleDateString()}</p>
          <p><strong>Time:</strong> {appointment.preferredTime}</p>
          <p><strong>Contact:</strong> {appointment.contact}</p>
          <p><strong>Status:</strong> <span className="status">{appointment.status}</span></p>

          {appointment.status !== "Confirmed" && (
            <button
              className="pay-btn"
              onClick={() => handlePayment(appointment)}
            >
              Pay Now
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default UserAppointments;