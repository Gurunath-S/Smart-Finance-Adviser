import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "./config";
import styled from "styled-components";

const ValidationPopup = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: #ff6b6b;
  color: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

const Signup = () => {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [validationMessage, setValidationMessage] = useState(null);
  const [message, setMessage] = useState("");
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

  const showValidationMessage = (message) => {
    setValidationMessage(message);
    setTimeout(() => setValidationMessage(null), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errorMessage = validateFields();
    if (errorMessage) {
      showValidationMessage(errorMessage);
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/auth/signup`, formData);
      setMessage("Signup successful! Redirecting to login...");
      setFormData({ username: "", email: "", password: "" });
      localStorage.removeItem("token");
      setTimeout(() => navigate("/login", window.location.reload(), { replace: true }), 1000);
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Signup failed. Please try again.";
      showValidationMessage(errorMessage);
    }
  };

  return (
    <>
      {validationMessage && <ValidationPopup>{validationMessage}</ValidationPopup>}
      <form className="sign-up-form" onSubmit={handleSubmit}>
        <h2 className="title">Sign up</h2>
        <div className="input-field">
          <i className="fas fa-user"></i>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
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
          />
        </div>
        <input type="submit" className="btn" value="Sign up" />
        {message && <p>{message}</p>}
      </form>
    </>
  );
};

export default Signup;
