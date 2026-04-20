import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, NavLink, Link } from "react-router-dom";
import { StoreContext } from '../../context/StoreContext';
import './Navbar.css';
import { assets } from '../../assets/assets';

const Navbar = ({ setShowLogin, showLogin }) => {
  const navigate = useNavigate();
  const { token, setToken } = useContext(StoreContext);
  const [userType, setUserType] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUserType = localStorage.getItem("userType");

    if (storedToken) setToken(storedToken);
    if (storedUserType) setUserType(storedUserType);
  }, [setToken]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    setToken("");
    setUserType("");
    navigate("/");
    setMenuOpen(false);
  };
  
  console.log("userType:", userType);

  // Helper function to get dashboard path
  const getDashboardPath = () => {
    if (userType === "Admin") return "/admin-dashboard";
    if (userType === "Doctor") return "/doctor-dashboard";
    return "/view-appointment";
  };

  // Helper function to get appointment path
  const getAppointmentPath = () => {
    if (userType === "Admin") return "/admin-dashboard";
    if (userType === "Doctor") return "/doctor-dashboard";
    return "/appointment-form";
  };

  // Helper function to get contact/view doctors path
  const getContactOrDoctorsPath = () => {
    if (token && userType === "Patient") return "/view-doctor";
    return "/contact";
  };

  return (
    <div className='navbar'>
      <Link to='/'><img src={assets.logo3} alt="Logo" className="logo" /></Link>

      {/* Hamburger menu toggle */}
      <div className={`navbar-toggle ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(!menuOpen)}>
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* Desktop menu */}
      <div className="navbar-center">
        <ul className="navbar-menu-left">
          <li>
            <NavLink to="/product-overview" className={({ isActive }) => isActive ? "active-link" : ""}>
              Products
            </NavLink>
          </li>
          <li>
            <NavLink to="/about-us" className={({ isActive }) => isActive ? "active-link" : ""}>
              About Us
            </NavLink>
          </li>
          <li>
            <NavLink to="/resources" className={({ isActive }) => isActive ? "active-link" : ""}>
              Resources
            </NavLink>
          </li>
        </ul>
      </div>

      <div className="navbar-right">
        {!token ? (
          <button className="btn-signin" onClick={() => setShowLogin(true)}>Sign In</button>
        ) : (
          <button
            className="btn-signin"
            onClick={() => navigate(getDashboardPath())}
          >
            {userType === "Admin"
              ? "Admin Dashboard"
              : userType === "Doctor"
                ? "Doctor Dashboard"
                : "View Appointment"}
          </button>
        )}

        {userType !== "Doctor" && userType !== "Admin" && (
          <button
            className="btn-contact"
            onClick={() => navigate(getContactOrDoctorsPath())}
          >
            {token && userType === "Patient" ? "View Doctors" : "Contact Us"}
          </button>
        )}

        {token && (
          <div className="navbar-profile">
            <img src={assets.profile_icon} alt="Profile" />
            <ul className="navbar-profile-dropdown">
              <li onClick={() => navigate(getAppointmentPath())}>
                <img src={assets.appointment} alt="Appointment" />
                <p>
                  {userType === "Admin"
                    ? "Admin Dashboard"
                    : userType === "Doctor"
                      ? "Doctor Dashboard"
                      : "Appointment Form"}
                </p>
              </li>
              <hr />
              <li onClick={logout}>
                <img src={assets.logout_icon} alt="Logout" />
                <p>Logout</p>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Mobile dropdown menu - Enhanced with all user type options */}
      {menuOpen && (
        <ul className="mobile-menu">
          {/* Navigation Links */}
          <li onClick={() => { setMenuOpen(false); navigate("/product-overview"); }}>Products</li>
          <li onClick={() => { setMenuOpen(false); navigate("/about-us"); }}>About Us</li>
          <li onClick={() => { setMenuOpen(false); navigate("/resources"); }}>Resources</li>

          {/* Conditional buttons based on login status and user type */}
          {!token ? (
            // Not logged in
            <>
              <li onClick={() => { setShowLogin(true); setMenuOpen(false); }}>
                <button className="btn-signin">Sign In</button>
              </li>
              <li onClick={() => { setMenuOpen(false); navigate("/contact"); }}>
                <button className="btn-contact">Contact Us</button>
              </li>
            </>
          ) : (
            // Logged in - Show user-specific options
            <>
              {/* Dashboard Button */}
              <li onClick={() => { navigate(getDashboardPath()); setMenuOpen(false); }}>
                <button className="btn-signin">
                  {userType === "Admin" 
                    ? "Admin Dashboard" 
                    : userType === "Doctor" 
                      ? "Doctor Dashboard" 
                      : "View Appointment"}
                </button>
              </li>

              {/* Appointment/Profile Section for Patient */}
              {userType === "Patient" && (
                <>
                  <li onClick={() => { navigate("/appointment-form"); setMenuOpen(false); }}>
                    <button className="btn-contact">Book Appointment</button>
                  </li>
                  <li onClick={() => { navigate("/view-doctor"); setMenuOpen(false); }}>
                    <button className="btn-contact">View Doctors</button>
                  </li>
                </>
              )}

              {/* Doctor Specific Options */}
              {userType === "Doctor" && (
                <>
                  <li onClick={() => { navigate("/doctor-dashboard"); setMenuOpen(false); }}>
                    <button className="btn-contact">My Appointments</button>
                  </li>
                  <li onClick={() => { navigate("/contact"); setMenuOpen(false); }}>
                    <button className="btn-contact">Contact Support</button>
                  </li>
                </>
              )}

              {/* Admin Specific Options */}
              {userType === "Admin" && (
                <>
                  <li onClick={() => { navigate("/admin-dashboard"); setMenuOpen(false); }}>
                    <button className="btn-contact">Manage Users</button>
                  </li>
                  <li onClick={() => { navigate("/admin-dashboard"); setMenuOpen(false); }}>
                    <button className="btn-contact">View Reports</button>
                  </li>
                </>
              )}

              {/* Common Contact Option (for Doctor/Admin if needed) */}
              {userType !== "Patient" && (
                <li onClick={() => { navigate("/contact"); setMenuOpen(false); }}>
                  <button className="btn-contact">Contact Us</button>
                </li>
              )}

              {/* Logout Option */}
              <li onClick={logout}>
                <button className="btn-signin" style={{ backgroundColor: '#dc3545', color: 'white' }}>
                  Logout
                </button>
              </li>
            </>
          )}
        </ul>
      )}
    </div>
  );
};

export default Navbar;