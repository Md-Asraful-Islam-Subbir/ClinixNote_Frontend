import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./PaymentPage.css";

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Prefer explicit empty string fallback
  const [doctorName, setDoctorName] = useState(
    location.state?.doctorName || localStorage.getItem("doctorName") || ""
  );

  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);

  // If you sometimes arrive without doctorName in route state, consider storing it once selected elsewhere:
  useEffect(() => {
    if (doctorName) {
      localStorage.setItem("doctorName", doctorName);
    }
  }, [doctorName]);

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!name || !contact || !doctorName) {
      return alert("Missing required fields (patient name, contact, doctor)");
    }

    try {
      setLoading(true);

      // Use relative URL if you use a proxy or same origin; change if necessary
      const res = await axios.post("http://localhost:4000/api/payment/initiate", {
        name,
        contact,
        doctor: doctorName,
      });

      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        alert("Payment failed to start. See console for details.");
        console.error("Unexpected response:", res.data);
      }
    } catch (err) {
      // More informative error logging
      console.error("Payment Error - response data:", err.response?.data);
      console.error("Payment Error - status:", err.response?.status);
      console.error("Payment Error - message:", err.message);
      alert(
        `Error initiating payment. Server responded: ${err.response?.status || ""} ${
          err.response?.data?.error || err.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-page">
      <aside className="sidebar1">
        <ul className="sidebar1-menu">
          <li onClick={() => navigate("/doctor-dashboard")}>🏥 Dashboard</li>
          <li onClick={() => navigate("/doctor-appointments")}>📅 Appointments</li>
          {/* pass doctorName explicitly (fix undefined `doctor` bug) */}
          <li onClick={() => navigate("/doctor-patients", { state: { doctor: doctorName } })}>
            👩‍⚕️ Patients
          </li>
          <li onClick={() => navigate("/doctor-schedule")}>💬 Availability</li>
          <li className="active">📊 Payment</li>
          <li
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/", { replace: true });
              window.location.reload();
            }}
            className="logout"
          >
            🚪 Logout
          </li>
        </ul>
      </aside>

      <main className="main-content">
        <section className="make-payment">
          <h2>Record Payment</h2>
          <form onSubmit={handlePayment} className="payment-form">
            <label>
              Patient Name
              <input
                type="text"
                placeholder="Enter patient's name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>

            <label>
              Contact
              <input
                type="text"
                placeholder="Enter contact info"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                required
              />
            </label>

            {/* show doctor name for debugging */}
            <div style={{ margin: "8px 0" }}>
              <strong>Doctor:</strong> {doctorName || "(none selected)"}
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Processing..." : "Pay with SSLCommerz"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
};

export default PaymentPage;