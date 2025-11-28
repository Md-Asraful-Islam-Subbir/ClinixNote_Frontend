import React, { useState, useEffect } from "react";
import "./AppointmentForm.css";

const AppointmentForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    preferredDate: "",
    preferredTime: "",
    doctor: "",
    saveInfo: false,
  });

  const [doctors, setDoctors] = useState([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
useEffect(() => {
  const fetchAvailableSlots = async () => {
    if (!formData.doctor || !formData.preferredDate) return;

    const selectedDoctor = doctors.find((doc) => doc.name === formData.doctor);
    if (!selectedDoctor) return;

    try {
      const res = await fetch(
        `https://clinixnote-backend.onrender.com/api/doctor/timeslots?doctorId=${selectedDoctor._id}&date=${formData.preferredDate}`
      );
      if (!res.ok) throw new Error("Failed to fetch time slots");
      const data = await res.json();

      setAvailableTimeSlots(data);
    } catch (error) {
      console.error("Error fetching available time slots:", error);
      setAvailableTimeSlots([]); // Clear previous slots
    }
  };

  fetchAvailableSlots();
}, [formData.doctor, formData.preferredDate]);

const [doctorSchedule, setDoctorSchedule] = useState([]);
  useEffect(() => {
    // Fetch doctors dynamically
    const fetchDoctors = async () => {
      try {
        const res = await fetch("https://clinixnote-backend.onrender.com/api/doctor/doctorsforappointment");
        if (!res.ok) throw new Error("Failed to fetch doctors");
        const data = await res.json();
        setDoctors(data);
      } catch (error) {
        console.error("Error loading doctors:", error);
      }
    };

    fetchDoctors();

    // Load saved info if any
    const savedInfo = JSON.parse(localStorage.getItem("patientInfo"));
    if (savedInfo) {
      setFormData((prev) => ({ ...prev, ...savedInfo }));
    }
  }, []);

const handleChange = async (e) => {
  const { name, value, type, checked } = e.target;

  // If doctor changes, fetch the schedule
  if (name === "doctor") {
    setFormData({ ...formData, [name]: value });

    const selectedDoctor = doctors.find((doc) => doc.name === value);
    if (selectedDoctor) {
      try {
        const res = await fetch(`https://clinixnote-backend.onrender.com/api/doctor/${selectedDoctor._id}/schedule`);
        if (!res.ok) throw new Error("Failed to fetch doctor schedule");
        const data = await res.json();
        setDoctorSchedule(data);
      } catch (error) {
        console.error("Error fetching doctor schedule:", error);
      }
    }
    return; // Exit early
  }

  // Otherwise handle normally
  setFormData({
    ...formData,
    [name]: type === "checkbox" ? checked : value,
  });
};


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.saveInfo) {
      localStorage.setItem(
        "patientInfo",
        JSON.stringify({
          name: formData.name,
          contact: formData.contact,
        })
      );
    }

    try {
      const res = await fetch("https://clinixnote-backend.onrender.com/api/appointments/quick-appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("Failed to send appointment");
      }

      alert("Appointment request sent and pay your bill as soon as possible. We'll call or email you to confirm.");
    } catch (error) {
      console.error(error);
      alert("Something went wrong while booking.");
    }

    setFormData({
      name: "",
      contact: "",
      preferredDate: "",
      preferredTime: "",
      doctor: "",
      saveInfo: false,
    });
  };

  const handleEmergency = () => {
    const confirmEmergency = window.confirm(
      "This will connect you directly to our emergency line. Continue?"
    );
    if (confirmEmergency) {
      window.location.href = "tel:+1234567890";
    }
  };

  return (
    <div className="appointment-container">
      <div className="appointment-header">
        <h2>Quick Doctor Appointment</h2>
        <p>Book with *patient minimum info — we'll reach out to you.</p>
      </div>

      <form onSubmit={handleSubmit} className="appointment-form">
        <div className="form-group">
          <label htmlFor="name">Patient Name</label>
          <input
  type="text"
  name="name"
  placeholder="Patient name"
  value={formData.name}
  onChange={handleChange}
  onBlur={(e) =>
    setFormData({ ...formData, name: e.target.value.toUpperCase() })
  }
  required
/>

        </div>

        <div className="form-group">
          <label htmlFor="contact">Phone or Email</label>
          <input
            type="text"
            name="contact"
            placeholder="Phone number or email"
            value={formData.contact}
            onChange={handleChange}
            required
          />
        </div>

        {/* ✅ Doctor selector (dynamic) */}
        <div className="form-group">
          <label htmlFor="doctor">Select Doctor</label>
          <select
            name="doctor"
            value={formData.doctor}
            onChange={handleChange}
            required
          >
            <option value="">Select Doctor</option>
            {doctors.map((doc) => (
              <option key={doc._id} value={doc.name}>
                {doc.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="preferredDate">Preferred Date</label>
           <input
  type="date"
  name="preferredDate"
  value={formData.preferredDate}
  onChange={handleChange}
  required
  min={
    doctorSchedule.length > 0
      ? new Date(
          Math.min(...doctorSchedule.map(s => new Date(s.validFrom)))
        ).toISOString().split("T")[0]
      : ""
  }
  max={
    doctorSchedule.length > 0
      ? new Date(
          Math.max(...doctorSchedule.map(s => new Date(s.validTo)))
        ).toISOString().split("T")[0]
      : ""
  }
/>
          </div>
         <div className="form-group">
  <label htmlFor="preferredTime">Preferred Time</label>
  <select
    name="preferredTime"
    value={formData.preferredTime}
    onChange={handleChange}
    required
  >
    <option value="">Select Time</option>
    {availableTimeSlots.map((slot, i) => (
      <option key={i} value={slot.startTime}>
        {slot.startTime} - {slot.endTime}
      </option>
    ))}
  </select>
</div>
        </div>

        <div className="checkbox-group">
          <input
            type="checkbox"
            id="saveInfo"
            name="saveInfo"
            checked={formData.saveInfo}
            onChange={handleChange}
          />
          <label htmlFor="saveInfo">Save my info for next time</label>
        </div>

        <button type="submit" className="primary-btn">
          Book Appointment
        </button>

        <div className="divider">
          <span>or</span>
        </div>

        <button
          type="button"
          className="emergency-btn"
          onClick={handleEmergency}
        >
          <span className="icon">📞</span> Need urgent help? Call now
        </button>
      </form>
    </div>
  );
};

export default AppointmentForm;
