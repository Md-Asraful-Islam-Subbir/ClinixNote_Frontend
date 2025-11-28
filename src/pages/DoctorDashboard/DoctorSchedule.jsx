import React, { useState } from 'react';
import './DoctorSchedule.css';

const daysOfWeek = [
  'Monday', 'Tuesday', 'Wednesday',
  'Thursday', 'Friday', 'Saturday', 'Sunday'
];

const DoctorSchedule = () => {
  const [isSameTimeEveryDay, setIsSameTimeEveryDay] = useState(false);

  const [selectedDays, setSelectedDays] = useState([]);
  const [slots, setSlots] = useState({});

  const [globalStartTime, setGlobalStartTime] = useState('');
  const [globalEndTime, setGlobalEndTime] = useState('');

  const [slotDuration, setSlotDuration] = useState(15);
  const [validFrom, setValidFrom] = useState('');
  const [validTo, setValidTo] = useState('');

  const handleDayChange = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
      const updatedSlots = { ...slots };
      delete updatedSlots[day];
      setSlots(updatedSlots);
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleTimeChange = (day, type, value) => {
    setSlots({
      ...slots,
      [day]: {
        ...slots[day],
        [type]: value
      }
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    const schedule = {
      days: isSameTimeEveryDay
        ? [{ startTime: globalStartTime, endTime: globalEndTime }]
        : selectedDays.map(day => ({
            day,
            startTime: slots[day]?.startTime || '',
            endTime: slots[day]?.endTime || ''
          })),
      slotDuration,
      validFrom,
      validTo
    };

    try {
     const token = localStorage.getItem('token');
const response = await fetch('https://clinixnote-backend.onrender.com/api/doctor/schedule', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    // ✅ Send the Bearer token
    Authorization: `Bearer ${token}`
  },
  body: JSON.stringify(schedule)
});

      if (response.ok) {
        alert('Schedule saved successfully!');
        window.location.reload();
      } else {
        alert('Failed to save schedule.');
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
      alert('Error occurred.');
    }
  };

  return (
    <div className="doctor-schedule">
      <h2>Set Doctor Availability</h2>

      <label>
        <input
          type="checkbox"
          checked={isSameTimeEveryDay}
          onChange={() => setIsSameTimeEveryDay(!isSameTimeEveryDay)}
        />
        Same time for all days in range?
      </label>

      <form onSubmit={handleSubmit}>
        {!isSameTimeEveryDay && (
          <div className="days-selection">
            {daysOfWeek.map(day => (
              <div key={day} className="day-checkbox">
                <label className="day-label">
                  <input
                    type="checkbox"
                    checked={selectedDays.includes(day)}
                    onChange={() => handleDayChange(day)}
                  />
                  {day}
                </label>

                {selectedDays.includes(day) && (
                  <div className="time-range">
                    <label>
                      Start:
                      <input
                        type="time"
                        value={slots[day]?.startTime || ''}
                        onChange={(e) => handleTimeChange(day, 'startTime', e.target.value)}
                        required
                      />
                    </label>
                    <label>
                      End:
                      <input
                        type="time"
                        value={slots[day]?.endTime || ''}
                        onChange={(e) => handleTimeChange(day, 'endTime', e.target.value)}
                        required
                      />
                    </label>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {isSameTimeEveryDay && (
          <div className="time-range">
            <label>
              Start:
              <input
                type="time"
                value={globalStartTime}
                onChange={(e) => setGlobalStartTime(e.target.value)}
                required
              />
            </label>
            <label>
              End:
              <input
                type="time"
                value={globalEndTime}
                onChange={(e) => setGlobalEndTime(e.target.value)}
                required
              />
            </label>
          </div>
        )}

        <label>
          Slot Duration (minutes):
          <input
            type="number"
            value={slotDuration}
            min="5"
            step="5"
            onChange={(e) => setSlotDuration(e.target.value)}
            required
          />
        </label>

        <label>
          Valid From:
          <input
            type="date"
            value={validFrom}
            onChange={(e) => setValidFrom(e.target.value)}
            required
          />
        </label>

        <label>
          Valid To:
          <input
            type="date"
            value={validTo}
            onChange={(e) => setValidTo(e.target.value)}
            required
          />
        </label>

        <button type="submit">Save Schedule</button>
      </form>
    </div>
  );
};

export default DoctorSchedule;
