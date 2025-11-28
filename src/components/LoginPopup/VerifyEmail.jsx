import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./VerifyEmail.css";

const VerifyEmail = () => {
  const { token } = useParams();
  const [message, setMessage] = useState("Verifying...");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await fetch(`https://clinixnote-backend.onrender.com/api/verify-email/${token}`);
        const data = await response.json();
        if (response.ok) {
          setMessage("✅ Email verified successfully! You can now log in.");
        } else {
          setMessage(`❌ ${data.message}`);
        }
      } catch (error) {
        setMessage("❌ Something went wrong.");
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>{message}</h2>
      <a href="/">Go to Home</a>
    </div>
  );
};

export default VerifyEmail;