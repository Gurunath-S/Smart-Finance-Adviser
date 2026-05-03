import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useGlobalContext } from "./context/globalContext";
import styled from "styled-components";

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const { resetPassword } = useGlobalContext();
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState("");
    const [confirm, setConfirm] = useState("");

    const token = searchParams.get("token");
    const userId = searchParams.get("userId");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirm) return alert("Passwords don't match");
        const success = await resetPassword(token, userId, newPassword);
        if (success) navigate("/");
    };

    if (!token || !userId) {
        return (
            <Styled>
                <div className="card">
                    <h2>Invalid Link</h2>
                    <p>This password reset link is invalid or has expired.</p>
                    <Link to="/forgot-password">Request a new one</Link>
                </div>
            </Styled>
        );
    }

    return (
        <Styled>
            <div className="card">
                <h2>Reset Password</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="password"
                        placeholder="New password (min 8 chars)"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        minLength={8}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Confirm new password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        required
                    />
                    <button type="submit">Reset Password</button>
                </form>
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

    h2 { font-size: 1.8rem; color: #1a1a4e; margin-bottom: 1.5rem; }

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
      &:hover { opacity: 0.9; }
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

export default ResetPassword;
