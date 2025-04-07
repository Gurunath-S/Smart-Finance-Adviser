import React, { useState, useEffect } from "react";
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Login from "./Login";
import SideNav from "./into";
import AdminDashboard from "./Admin/AdminDashboard";
import Homelog from "./App";

const ScreenSizeWarning = () => {
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 1200); // Change this width if needed
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  if (isSmallScreen) {
    return (
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100vh",
        backgroundColor: "black",
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "20px",
        textAlign: "center",
        zIndex: 9999,
      }}>
        This website is not supported on small screens.
      </div>
    );
  }

  return null;
};

const Nav = () => {
  const isAuthenticated = localStorage.getItem("token");

  return (
    <Router>
      <ScreenSizeWarning />  {/* Small screen message */}
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Homelog />} />
        <Route path="/" element={<Homelog />} />
        <Route path="/dashboard" element={<SideNav />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
};

export default Nav;
