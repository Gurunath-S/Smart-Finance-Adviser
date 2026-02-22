import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useGlobalContext } from "./context/globalContext";
import styled from "styled-components";

const ForgotPassword = () => {
    const { forgotPassword } = useGlobalContext();
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await forgotPassword(email);
        setSubmitted(true);
    };

    return (
        <Styled>
            <div className="card">
                <h2>Forgot Password</h2>
                {submitted ? (
                    <p className="success-msg">
                        If that email is registered, a reset link has been sent. Check your inbox.
                    </p>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <p className="subtitle">Enter your registered email and we'll send you a reset link.</p>
                        <input
                            type="email"
                            placeholder="Your email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <button type="submit">Send Reset Link</button>
                    </form>
                )}
                <Link to="/" className="back-link">← Back to Login</Link>
            </div>
        </Styled>
    );
};

const Styled = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a4e, #3b3b9e);

  .card {
    background: white;
    border-radius: 20px;
    padding: 2.5rem;
    width: 100%;
    max-width: 420px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);

    h2 { font-size: 1.8rem; color: #1a1a4e; margin-bottom: 0.5rem; }
    .subtitle { color: #666; font-size: 0.95rem; margin-bottom: 1.5rem; }

    input {
      width: 100%;
      padding: 0.9rem 1rem;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      font-size: 1rem;
      margin-bottom: 1rem;
      box-sizing: border-box;
      transition: border 0.2s;
      &:focus { border-color: #3b3b9e; outline: none; }
    }

    button {
      width: 100%;
      padding: 0.9rem;
      background: linear-gradient(135deg, #1a1a4e, #3b3b9e);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.2s;
      &:hover { opacity: 0.9; }
    }

    .success-msg {
      background: #d4edda;
      color: #155724;
      border-radius: 10px;
      padding: 1rem;
      margin-bottom: 1rem;
    }

    .back-link {
      display: block;
      text-align: center;
      margin-top: 1.2rem;
      color: #3b3b9e;
      font-size: 0.9rem;
      text-decoration: none;
      &:hover { text-decoration: underline; }
    }
  }
`;

export default ForgotPassword;
