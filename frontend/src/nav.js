import React, { useState, useEffect } from "react";
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Login from "./Login";
import SideNav from "./into";
import AdminDashboard from "./Admin/AdminDashboard";
import Homelog from "./App";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";

/**
 * Check if the JWT token is present AND not expired.
 * Decodes the payload (base64) without any library — no verification needed here,
 * just to read the `exp` field for early client-side redirect.
 */
const isTokenValid = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (!payload.exp) return true; // no expiry field — assume valid
    return payload.exp * 1000 > Date.now(); // exp is in seconds
  } catch {
    return false; // malformed token
  }
};

/** Clears stale token and redirects to login */
const clearAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
};

/**
 * Auth guard — redirects to "/" if token is missing or expired.
 * Rechecks on every render so expiry is caught when navigating back to the tab.
 */
const ProtectedRoute = ({ children }) => {
  if (!isTokenValid()) {
    clearAuth();
    return <Navigate to="/" replace />;
  }
  return children;
};

const ScreenSizeWarning = () => {
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => setIsSmallScreen(window.innerWidth < 1200);
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  if (isSmallScreen) {
    return (
      <div style={{
        position: "fixed", top: 0, left: 0, width: "100%", height: "100vh",
        backgroundColor: "black", color: "white",
        display: "flex", justifyContent: "center", alignItems: "center",
        fontSize: "20px", textAlign: "center", zIndex: 9999,
      }}>
        This website is not supported on small screens.
      </div>
    );
  }
  return null;
};

const Nav = () => {
  return (
    <Router>
      <ScreenSizeWarning />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={isTokenValid() ? <Navigate to="/dashboard" replace /> : <Homelog />} />
        <Route path="/" element={isTokenValid() ? <Navigate to="/dashboard" replace /> : <Homelog />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected routes — redirects to "/" if token is absent or expired */}
        <Route path="/dashboard" element={<ProtectedRoute><SideNav /></ProtectedRoute>} />
        <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
};

export default Nav;
