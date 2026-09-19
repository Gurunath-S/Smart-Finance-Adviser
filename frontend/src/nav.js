import React from "react";
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import SideNav from "./into";
import AdminDashboard from "./Admin/AdminDashboard";
import Homelog from "./App";
import { useGlobalContext } from "./context/globalContext";

const LoadingScreen = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: '#1a1a2e',
    color: '#fff',
    fontFamily: 'sans-serif'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '4px solid rgba(255,255,255,0.1)',
        borderTopColor: '#22c55e',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        margin: '0 auto 16px',
      }} />
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      <p style={{ opacity: 0.8, fontSize: '0.95rem' }}>Verifying session...</p>
    </div>
  </div>
);

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAuthChecking, currentUser } = useGlobalContext();
  const role = currentUser?.role || localStorage.getItem("role");

  if (isAuthChecking) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const Nav = () => {
  const { isAuthenticated, isAuthChecking } = useGlobalContext();

  if (isAuthChecking) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Homelog />} />
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Homelog />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <SideNav />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default Nav;
