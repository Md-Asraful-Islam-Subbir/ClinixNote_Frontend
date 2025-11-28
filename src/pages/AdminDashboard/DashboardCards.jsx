import React, { useEffect, useState } from "react";
import axios from "axios";
import "./DashboardCards.css";

const DashboardCards = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalDoctors, setTotalDoctors] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [totalAppointments, setTotalAppointments] = useState(0);

  useEffect(() => {
    // Fetch total users
    const fetchUsers = async () => {
      try {
        const res = await axios.get("https://clinixnote-backend.onrender.com/api/auth/total");
        setTotalUsers(res.data.total);
      } catch (error) {
        console.error("Failed to fetch users", error);
      }
    };

    // Fetch total doctors
    const fetchDoctors = async () => {
      try {
        const res = await axios.get(
          "https://clinixnote-backend.onrender.com/api/auth/total-doctors"
        );
        setTotalDoctors(res.data.total);
      } catch (error) {
        console.error("Failed to fetch doctors", error);
      }
    };

    // Fetch total revenue
    const fetchRevenue = async () => {
      try {
        const res = await axios.get(
          "https://clinixnote-backend.onrender.com/api/payment/total-revenue"
        );
        setRevenue(res.data.total);
      } catch (error) {
        console.error("Failed to fetch revenue", error);
      }
    };

    // Fetch total appointments
    const fetchAppointments = async () => {
      try {
        const res = await axios.get(
          "https://clinixnote-backend.onrender.com/api/appointments/total"
        );
        setTotalAppointments(res.data.total);
      } catch (error) {
        console.error("Failed to fetch appointments", error);
      }
    };

    fetchUsers();
    fetchDoctors();
    fetchRevenue();
    fetchAppointments();
  }, []);

  return (
    <div className="dashboard-cards">
      <div className="dashboard-card green">
        <h4>Total Users</h4>
        <h2>{totalUsers}</h2>
        <p>Last Month</p>
      </div>

      <div className="dashboard-card purple">
        <h4>Total Doctors</h4>
        <h2>{totalDoctors}</h2>
        <p>Last Month</p>
      </div>

      <div className="dashboard-card yellow">
        <h4>Revenue</h4>
        <h2>{revenue} BDT</h2>
        <p>Total Collected</p>
      </div>

      <div className="dashboard-card blue">
        <h4>Appointments</h4>
        <h2>{totalAppointments}</h2>
        <p>Last Month</p>
      </div>
    </div>
  );
};

export default DashboardCards;
