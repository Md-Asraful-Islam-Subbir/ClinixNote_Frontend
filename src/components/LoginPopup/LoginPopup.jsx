import React, { useState } from 'react';
import './LoginPopup.css';
import { assets } from '../../assets/assets';
import { IoIosMail, IoIosEye, IoIosEyeOff } from "react-icons/io";
const SECTIONS = ["Patient", "Doctor", "Admin"];

const LoginPopup = ({ setShowLogin }) => {
  const [activeSection, setActiveSection] = useState("Patient");
  const [formState, setFormState] = useState("Login");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    specialization: ""
  });
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
const [showPassword, setShowPassword] = useState(false);
  const onChangeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    let endpoint = "";
    let userType = activeSection;

    if (formState === "Login") endpoint = "/login";
    else if (formState === "Sign Up" && activeSection === "Patient") endpoint = "/signup";
    else if (formState === "Apply" && activeSection === "Doctor") endpoint = "/doctor/application";

    if (!endpoint) {
      alert("Invalid action.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`https://clinixnote-backend.onrender.com/api/auth${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, userType }),
      });

      const data = await response.json();

      if (response.ok) {
        if (formState === "Login") {
  localStorage.setItem("token", data.token);
  localStorage.setItem("userType", userType);

  if (userType === "Admin") {
    window.location.href = "/admin-dashboard";
  } else if (userType === "Doctor") {
    window.location.href = "/doctor-dashboard"; // example
  } else if (userType === "Patient") {
    window.location.href = "/"; // example, maybe "/patient-dashboard"
  } else {
    window.location.href = "/";
  }
}
else {
          alert(data.message || (formState === "Apply" ? "Application submitted!" : "Account created!"));
          setShowLogin(false);
        }
      } else {
        alert(data.message || "An error occurred. Please try again.");
      }
    } catch (error) {
      alert("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const onForgotPasswordHandler = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("https://clinixnote-backend.onrender.com/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();
      alert(data.message || "Password reset link sent to your email.");
      setShowForgotPassword(false);
    } catch (error) {
      alert("Failed to send reset link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderSectionTabs = () => (
    <div className="login-sections">
      {SECTIONS.map(sec => (
        <div
          key={sec}
          className={`section-tab${activeSection === sec ? " active" : ""}`}
          onClick={() => {
            setActiveSection(sec);
            setFormState("Login");
            setShowForgotPassword(false);
            setFormData({ name: "", email: "", password: "", specialization: "" });
          }}
        >
          {sec}
        </div>
      ))}
    </div>
  );

  const renderPatientForm = () => (
    <form className="login-popup-form" onSubmit={onSubmitHandler}>
      <div className="login-popup-title">
        <h2>{formState === "Sign Up" ? "Join as Patient" : "Patient Login"}</h2>
        <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="Close" />
      </div>
      <div className="login-popup-inputs">
        {formState === "Sign Up" && (
          <div className="input-group">
            <label htmlFor="name">Full Name</label>
            <input id="name" name='name' type="text" placeholder='John Doe' onChange={onChangeHandler} required />
          </div>
        )}
        <div className="input-group">
          <label htmlFor="email">Email</label><IoIosMail className="input-icon" />
          <input id="email" name="email" type="email" placeholder='your@email.com' onChange={onChangeHandler} required />
        </div>
        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type={showPassword ? "text" : "password"} placeholder='••••••••' onChange={onChangeHandler} required />
        <span
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <IoIosEyeOff /> : <IoIosEye />}
          </span>
        </div>
      </div>
      <button type="submit" disabled={isLoading} aria-busy={isLoading}>
        {isLoading ? (
          <>
            <span className="loading-spinner" aria-hidden="true"></span>
            <span className="sr-only">Processing...</span>
          </>
        ) : formState === "Sign Up" ? "Create Account" : "Login"}
      </button>
      {formState === "Login" ? (
        <div className="login-popup-actions">
          <p>Don't have an account? <span onClick={() => setFormState("Sign Up")}>Sign Up</span></p>
          <p className="forgot-link" onClick={() => setShowForgotPassword(true)}>Forgot Password?</p>
        </div>
      ) : (
        <p>Already have an account? <span onClick={() => setFormState("Login")}>Login</span></p>
      )}
    </form>
  );

  const renderDoctorForm = () => (
    <form className="login-popup-form" onSubmit={onSubmitHandler}>
      <div className="login-popup-title">
        <h2>{formState === "Apply" ? "Apply as Doctor" : "Doctor Login"}</h2>
        <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="Close" />
      </div>
      <div className="login-popup-inputs">
        {formState === "Apply" && (
          <>
            <div className="input-group">
              <label htmlFor="name">Full Name</label>
              <input id="name" name='name' type="text" placeholder='Dr. John Smith' onChange={onChangeHandler} required />
            </div>
            <div className="input-group">
              <label htmlFor="email">Email</label><IoIosMail className="input-icon" />
              <input id="email" name='email' type="email" placeholder='your@email.com' onChange={onChangeHandler} required />
            </div>
            <div className="input-group">
              <label htmlFor="specialization">Specialization</label>
              <input id="specialization" name='specialization' type="text" placeholder='Cardiology' onChange={onChangeHandler} required />
            </div>
          </>
        )}
        {formState === "Login" && (
          <>
            <div className="input-group">
              <label htmlFor="email">Email</label> <IoIosMail className="input-icon" />
              <input id="email" name="email" type="email" placeholder='your@email.com' onChange={onChangeHandler} required />
            </div>
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type={showPassword ? "text" : "password"} placeholder='••••••••' onChange={onChangeHandler} required />
            <span
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <IoIosEyeOff /> : <IoIosEye />}
          </span>
            </div>
          </>
        )}
      </div>
      <button type="submit" disabled={isLoading} aria-busy={isLoading}>
        {isLoading ? (
          <>
            <span className="loading-spinner" aria-hidden="true"></span>
            <span className="sr-only">Processing...</span>
          </>
        ) : formState === "Apply" ? "Submit Application" : "Login"}
      </button>
      {formState === "Login" ? (
        <div className="login-popup-actions">
          <p>Want to join as a Doctor? <span onClick={() => setFormState("Apply")}>Apply Now</span></p>
          <p className="forgot-link" onClick={() => setShowForgotPassword(true)}>Forgot Password?</p>
        </div>
      ) : (
        <p>Already have an account? <span onClick={() => setFormState("Login")}>Login</span></p>
      )}
    </form>
  );

  const renderAdminForm = () => (
    <form className="login-popup-form" onSubmit={onSubmitHandler}>
      <div className="login-popup-title">
        <h2>Admin Portal</h2>
        <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="Close" />
      </div>
      <div className="login-popup-inputs">
        <div className="input-group">
          <label htmlFor="email">Admin Email</label><IoIosMail className="input-icon" />
          <input id="email" name="email" type="email" placeholder='admin@example.com' onChange={onChangeHandler} required />
        </div>
        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type={showPassword ? "text" : "password"} placeholder='••••••••' onChange={onChangeHandler} required />
        <span
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <IoIosEyeOff /> : <IoIosEye />}
          </span>
        </div>
      </div>
      <button type="submit" disabled={isLoading} aria-busy={isLoading}>
        {isLoading ? (
          <>
            <span className="loading-spinner" aria-hidden="true"></span>
            <span className="sr-only">Processing...</span>
          </>
        ) : "Login"}
      </button>
      <div className="login-popup-actions">
        <p>*only for authorized members</p>
        <p className="forgot-link" onClick={() => setShowForgotPassword(true)}>Forgot Password?</p>
      </div>
    </form>
  );

  const renderForgotPassword = () => (
    <div className="forgot-password-popup">
      <form className="forgot-password-container" onSubmit={onForgotPasswordHandler}>
        <div className="forgot-password-title">
          <h2>Reset Password</h2>
          <img onClick={() => setShowForgotPassword(false)} src={assets.cross_icon} alt="Close" />
        </div>
        <p className="forgot-instructions">Enter your email and we'll send you a link to reset your password.</p>
        <div className="forgot-password-inputs">
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" placeholder='your@email.com' onChange={onChangeHandler} required />
          </div>
        </div>
        <button type="submit" disabled={isLoading} aria-busy={isLoading}>
          {isLoading ? (
            <>
              <span className="loading-spinner" aria-hidden="true"></span>
              <span className="sr-only">Processing...</span>
            </>
          ) : "Send Reset Link"}
        </button>
        <p className="back-to-login" onClick={() => setShowForgotPassword(false)}>
          ← Back to login
        </p>
      </form>
    </div>
  );

  return (
    <div className="login-popup">
      <div className="login-popup-container">
        {renderSectionTabs()}
        {!showForgotPassword && (
          <>
            {activeSection === "Patient" && renderPatientForm()}
            {activeSection === "Doctor" && renderDoctorForm()}
            {activeSection === "Admin" && renderAdminForm()}
          </>
        )}
        {showForgotPassword && renderForgotPassword()}
      </div>
    </div>
  );
};

export default LoginPopup;
