import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Appointments.css';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://clinixnote-backend.onrender.com/api/appointments/appointments');
      setAppointments(response.data);
    } catch (err) {
      setError('Failed to load appointments.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
const handleDecline = async (appointment) => {
  try {
    await axios.delete(
      `https://clinixnote-backend.onrender.com/api/appointments/appointments/${appointment._id}/decline`
    );

    setAppointments(prev =>
      prev.filter(appt => appt._id !== appointment._id) // remove from UI
    );

    alert("Appointment cancelled and applicant notified via email!");
  } catch (error) {
    console.error("Decline error:", error);
    alert(error.response?.data?.error || "Failed to cancel appointment");
  }
};

  const handleConfirm = async (appointment) => {
    try {
      const response = await axios.put(
        `https://clinixnote-backend.onrender.com/api/appointments/appointments/${appointment._id}/confirm`,
        {
          contact: appointment.contact,
          doctorName: appointment.doctor
        }
      );

      setAppointments(prev =>
        prev.map(appt =>
          appt._id === appointment._id
            ? { ...appt, status: 'Confirmed' }
            : appt
        )
      );

      alert('Appointment confirmed successfully!');
    } catch (error) {
      console.error('Confirmation error:', error);
      alert(error.response?.data?.error || 'Failed to confirm appointment');
    }
  };

  if (loading) return <div className="appointments-container">Loading appointments...</div>;
  if (error) return <div className="appointments-container">{error}</div>;
  if (appointments.length === 0) return <div className="appointments-container">No appointments found.</div>;

  return (
    <div className="appointments-container">
      <h2>All Appointments</h2>
      {appointments.map((appt) => (
        <div key={appt._id} className="appointment-card">
          <p><strong>Patient:</strong> {appt.name}</p>
          <p><strong>Doctor ID:</strong> {appt.doctor}</p>
          <p>
            <strong>Status:</strong>{' '}
            <span className={appt.status === 'Confirmed' ? 'status-confirmed' : 'status-pending'}>
              {appt.status}
            </span>
          </p>
<p>
  <strong>Payment status:</strong> {appt.payment_status}
</p>

          {appt.status !== 'Confirmed' ? (
            <>
              <p><strong>Contact:</strong> {appt.contact}</p>
              <p><strong>Date:</strong> {new Date(appt.preferredDate).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {appt.preferredTime}</p>
              <div className="button-group">
  <button
    onClick={() => handleConfirm(appt)}
    className="confirm-button"
  >
    Confirm
  </button>
  <button
    onClick={() => handleDecline(appt)}
    className="decline-button"
  >
    Decline
  </button>
</div>
            </>
          ) : (
            <p className="minimized-info">✔️ Appointment Confirmed</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default Appointments;
