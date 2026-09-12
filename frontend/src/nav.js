import React from "react";
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import SideNav from "./into";
import AdminDashboard from "./Admin/AdminDashboard";
import Homelog from "./App";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const Nav = () => {
  const token = localStorage.getItem("token");

  return (
    <Router>
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/dashboard" replace /> : <Homelog />} />
        <Route path="/" element={token ? <Navigate to="/dashboard" replace /> : <Homelog />} />
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
