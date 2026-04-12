import React, { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "./config";
import { useNavigate } from "react-router-dom";
import { useGlobalContext } from "./context/globalContext";
import styled from "styled-components";



const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setTokenAndSave } = useGlobalContext();

  // Validation functions
  const validateFields = () => {
    const { username, password } = formData;

    if (!username.trim()) return "Username is required";
    if (username.length < 6) return "Username must be at least 6 characters long";
    if (username.length > 20) return "Username must be less than 20 characters";
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return "Username can only contain letters, numbers, and underscores";

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
      const response = await axios.post(`${API_BASE_URL}/auth/login`, formData);
      const { token } = response.data;
      setSuccessMessage("Login successful!");
      localStorage.setItem("token", token);
      setTokenAndSave(token);
      localStorage.setItem("username", formData.username);
      localStorage.setItem("profileImage", response.data.user.profileImage || "");
      navigate("/dashboard");
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Login failed. Please try again.";
      showValidationMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form className="sign-in-form" onSubmit={handleSubmit}>
        <h2 className="title">Sign in</h2>
        
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
        
        <a href="#" className="social-text forgot-password">Forgot password?</a>

        <input 
          type="submit" 
          value={isLoading ? "Logging in..." : "Login"} 
          className={`btn solid ${isLoading ? "loading" : ""}`} 
          disabled={isLoading} 
        />
      </form>
    </>
  );
};

export default Login;
