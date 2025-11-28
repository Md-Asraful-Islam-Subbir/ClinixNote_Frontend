import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import './ResetPassword.css';

const ResetPassword = () => {
    const { token } = useParams();
    const [password, setPassword] = useState("");

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`https://clinixnote-backend.onrender.com/api/auth/reset-password/${token}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                window.location.href = "/login";
            } else {
                alert(data.message);
            }
        } catch (error) {
            alert("Something went wrong.");
        }
    };

    return (
        <div className="reset-password-container">
            <div className="reset-password-card">
                <h2>Reset Password</h2>
                <p>Enter your new password below.</p>
                <form onSubmit={onSubmitHandler}>
                    <input
                        type="password"
                        placeholder="New Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit">Reset Password</button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
