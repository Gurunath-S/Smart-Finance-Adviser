import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "./config";
import styled from "styled-components";



const Signup = () => {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateFields = () => {
    const { username, email, password } = formData;

    if (!username.trim()) return "Username is required";
    if (username.length < 6) return "Username must be at least 6 characters long";
    if (username.length > 20) return "Username must be less than 20 characters";
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return "Username can only contain letters, numbers, and underscores";

    if (!email.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address";

    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters long";

    return "";
  };

  const showValidationMessage = (msg) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage("");

    const validationError = validateFields();
    if (validationError) {
      showValidationMessage(validationError);
      return;
    }

    setIsLoading(true);

    try {
      await axios.post(`${API_BASE_URL}/auth/signup`, formData);
      setSuccessMessage("Signup successful! Redirecting to login...");
      setFormData({ username: "", email: "", password: "" });
      localStorage.removeItem("token");
      setTimeout(() => navigate("/login", window.location.reload(), { replace: true }), 1000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Signup failed. Please try again.";
      showValidationMessage(errorMsg);
      setIsLoading(false);
    }
  };

  return (
    <>
      <form className="sign-up-form" onSubmit={handleSubmit}>
        <h2 className="title">Sign up</h2>
        
        {errorMessage && <div className="error-text">{errorMessage}</div>}
        {successMessage && <div className="success-text">{successMessage}</div>}

        <div className="input-field">
          <i className="fas fa-user"></i>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>
        <div className="input-field">
          <i className="fas fa-envelope"></i>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>
        <div className="input-field">
          <i className="fas fa-lock"></i>
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>
        <input 
          type="submit" 
          className={`btn ${isLoading ? "loading" : ""}`} 
          value={isLoading ? "Signing up..." : "Sign up"} 
          disabled={isLoading} 
        />
      </form>
    </>
  );
};

export default Signup;
