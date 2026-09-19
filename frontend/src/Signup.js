import React, { useState } from "react";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "./config";
import { useGlobalContext } from "./context/globalContext";

const Signup = ({ onSignupSuccess }) => {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setTokenAndSave } = useGlobalContext();

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/google`, {
        credential: credentialResponse.credential,
      });
      const { token, user } = response.data;
      setSuccessMessage("Google signup successful!");
      setTokenAndSave(token, user);
      navigate("/dashboard");
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Google signup failed. Please try again.";
      showValidationMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    showValidationMessage("Google signup could not be completed.");
  };

  const validateFields = () => {
    const { username, email, password } = formData;

    if (!username.trim()) return "Username is required";
    if (username.length < 3) return "Username must be at least 3 characters long";
    if (username.length > 20) return "Username must be less than 20 characters";
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return "Username can only contain letters, numbers, and underscores";

    if (!email.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address";

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
      await axios.post(`${API_BASE_URL}/auth/signup`, formData);
      setSuccessMessage("Signup successful! You can now sign in.");
      setFormData({ username: "", email: "", password: "" });
      localStorage.removeItem("token");
      setTimeout(() => {
        setIsLoading(false);
        if (onSignupSuccess) {
          onSignupSuccess();
        } else {
          navigate("/login", { replace: true });
        }
      }, 1200);
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

        <div style={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: '380px', margin: '1rem 0' }}>
          <div style={{ flex: 1, height: '1px', background: '#ccc' }} />
          <span style={{ padding: '0 10px', color: '#777', fontSize: '0.85rem' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: '#ccc' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '1rem' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            shape="pill"
            text="signup_with"
          />
        </div>
      </form>
    </>
  );
};

export default Signup;
