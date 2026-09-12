import React, { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "./config";
import { useNavigate } from "react-router-dom";
import { useGlobalContext } from "./context/globalContext";

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
    const trimmed = username.trim();

    if (!trimmed) return "Username or email is required";

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    const isUsername = /^[a-zA-Z0-9_]{3,30}$/.test(trimmed);
    if (!isEmail && !isUsername) {
      return "Enter a valid username (letters, numbers, underscore) or email";
    }

    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters long";

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
      const { token, user } = response.data;
      setSuccessMessage("Login successful!");
      localStorage.setItem("token", token);
      setTokenAndSave(token);
      localStorage.setItem("username", user?.username || formData.username);
      localStorage.setItem("role", user?.role || "user");
      localStorage.setItem("profileImage", user?.profileImage || "");
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
            placeholder="Username or Email"
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
        
        <button
          type="button"
          className="social-text forgot-password"
          style={{ background: "none", border: "none", cursor: "pointer", padding: "0.5rem 0", color: "#444" }}
          onClick={() => alert("Please contact administrator to reset your password.")}
        >
          Forgot password?
        </button>

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
