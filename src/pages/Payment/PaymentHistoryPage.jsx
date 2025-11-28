import React, { useEffect, useState } from "react";
import axios from "axios";
import "./PaymentHistoryPage.css";

const PaymentHistoryPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/payment/history");
        setPayments(res.data);
      } catch (err) {
        console.error("Failed to fetch payments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  if (loading) return <h2>Loading payment history...</h2>;

  return (
    <div className="payment-history-page">
      <h2>Payment History</h2>

      <table className="payment-table">
        <thead>
          <tr>
            <th>Transaction ID</th>
            <th>Doctor</th>
            <th>Patient</th>
            <th>Contact</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>
          {payments.map((p) => (
            <tr key={p._id}>
              <td>{p.tran_id}</td>
              <td>{p.user}</td>
              <td>{p.patient_name}</td>
              <td>{p.patient_contact}</td>
              <td>{p.amount} {p.currency}</td>
              <td>{p.status}</td>
              <td>{new Date(p.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentHistoryPage;
