import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./DoctorSchedulePage.css";

const DoctorSchedulePage = () => {
  const { doctorId } = useParams();
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await fetch(`https://clinixnote-backend.onrender.com/api/doctor/${doctorId}/schedule`);
        if (!res.ok) throw new Error("Failed to fetch schedule");
        const data = await res.json();
        setSchedules(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchSchedule();
  }, [doctorId]);

  // Convert 24h time → 12h format
  const formatTime12Hour = (time) => {
    if (!time) return "";
    const [hourStr, minuteStr] = time.split(":");
    let hour = parseInt(hourStr);
    const minute = parseInt(minuteStr);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${minute.toString().padStart(2, "0")} ${ampm}`;
  };

  return (
    <div className="doctor-schedule-page">
      <h2 className="page-title">Doctor Schedule</h2>
      {schedules.length === 0 ? (
        <p className="no-schedule">No schedule found for this doctor.</p>
      ) : (
        schedules.map((schedule) => (
          <div key={schedule._id} className="schedule-card">
            <div className="schedule-header">
              <div>
                <strong>Available From:</strong>{" "}
                {new Date(schedule.validFrom).toLocaleDateString()}
              </div>
              <div>
                <strong>Available To:</strong>{" "}
                {new Date(schedule.validTo).toLocaleDateString()}
              </div>
            </div>

            <div className="schedule-details">
              <p>
                <strong>Slot Duration:</strong> {schedule.slotDuration} min
              </p>

              <div className="days-list">
                {schedule.days.map((day, idx) => (
                  <div key={idx} className="day-item">
                    <span className="day-name">{day.day}</span>
                    <span className="day-time">
                      {formatTime12Hour(day.startTime)} - {formatTime12Hour(day.endTime)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default DoctorSchedulePage;
