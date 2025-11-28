import React, { useEffect, useState } from 'react';
import './DoctorAppointment.css';
import axios from 'axios';

const DoctorAppointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "https://clinixnote-backend.onrender.com/api/appointments/my-appointments",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAppointments(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const handleAdd = async (appt) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `https://clinixnote-backend.onrender.com/api/patients/add/${appt._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(res.data.message);

      // Update local state to hide button
      setAppointments(prev =>
        prev.map(a =>
          a._id === appt._id ? { ...a, doctorConfirmed: true } : a
        )
      );
    } catch (error) {
      if (error.response) alert(error.response.data.message);
      else alert("Failed to add patient");
    }
  };

  if (loading) return <p className="loading">Loading...</p>;

  return (
    <div className="appointment-container">
      <h2>My Appointments</h2>
      {appointments.length === 0 ? (
        <p className="no-data">No appointments found</p>
      ) : (
        <table className="appointment-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status (Admin)</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map(appt => (
              <tr key={appt._id}>
                <td>{appt.name}</td>
                <td>{appt.contact}</td>
                <td>{appt.preferredDate}</td>
                <td>{appt.preferredTime}</td>
                <td>{appt.status}</td>
                <td>
                  {!appt.doctorConfirmed && (
                    <button className="add-btn" onClick={() => handleAdd(appt)}>
                      Add
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DoctorAppointment;
