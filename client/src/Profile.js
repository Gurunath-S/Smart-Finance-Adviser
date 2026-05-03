import React, { useState, useEffect } from "react";
import { useGlobalContext } from "./context/globalContext";
import styled from "styled-components";
import { FiUser, FiMail, FiLock, FiCamera, FiCheck } from "react-icons/fi";
import { toast } from "react-toastify";

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Profile = () => {
  const { updateProfile } = useGlobalContext();
  const storedUsername = localStorage.getItem("username") || "";
  const [form, setForm] = useState({ username: storedUsername, email: "", password: "", confirmPassword: "" });
  const [saved, setSaved] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Load existing avatar from server
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch(`${API_BASE}/api/users/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(data => {
          if (data.avatar) setAvatarPreview(`${API_BASE}${data.avatar}`);
          if (data.email) setForm(f => ({ ...f, email: data.email }));
        })
        .catch(() => { });
    }
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Image must be under 2MB"); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("avatar", avatarFile);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/api/users/upload-avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Profile image updated!");
        setAvatarPreview(`${API_BASE}${data.avatarUrl}`);
        setAvatarFile(null);
      } else {
        toast.error(data.message || "Upload failed");
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password && form.password !== form.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    const payload = {};
    if (form.username) payload.username = form.username;
    if (form.email) payload.email = form.email;
    if (form.password) payload.password = form.password;
    const result = await updateProfile(payload);
    if (result) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
  };

  return (
    <ProfileStyled>
      <div className="profile-card">
        {/* Avatar section */}
        <div className="avatar-section">
          <label className="avatar-wrapper" title="Click to change photo">
            <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
            {avatarPreview
              ? <img src={avatarPreview} alt="avatar" className="avatar-img" />
              : <div className="avatar-initial">{storedUsername ? storedUsername[0].toUpperCase() : 'U'}</div>
            }
            <div className="camera-overlay">
              <FiCamera size={22} />
            </div>
          </label>
          {avatarFile && (
            <button className="upload-btn" onClick={handleUploadAvatar} disabled={uploading}>
              {uploading ? 'Uploading...' : 'Save Photo'}
            </button>
          )}
        </div>

        <h2>{storedUsername}</h2>
        <p className="subtitle">Manage your account</p>

        {saved && (
          <div className="success-banner">
            <FiCheck size={16} /> Profile updated successfully
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="field-group">
            <label><FiUser size={14} /> Username</label>
            <input name="username" value={form.username} onChange={handleChange} placeholder="Username" />
          </div>
          <div className="field-group">
            <label><FiMail size={14} /> Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" />
          </div>

          <div className="divider"><span>Change Password</span></div>

          <div className="field-group">
            <label><FiLock size={14} /> New Password</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Leave blank to keep current" minLength={8} />
          </div>
          <div className="field-group">
            <label><FiLock size={14} /> Confirm Password</label>
            <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Confirm new password" />
          </div>
          <button type="submit" className="save-btn">Save Changes</button>
        </form>
      </div>
    </ProfileStyled>
  );
};

const ProfileStyled = styled.div`
    padding: 2rem;
    display: flex;
    justify-content: center;
    overflow-y: auto;
    background: transparent;

    .profile-card {
        background: var(--bg-card);
        border: 2px solid var(--border-color);
        box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        border-radius: 20px;
        padding: 2.5rem;
        width: 100%;
        max-width: 500px;
        text-align: center;
        transition: background 0.3s, border-color 0.3s;

        h2 { font-size: 1.6rem; color: var(--text-heading); margin-bottom: 0.25rem; }
        .subtitle { color: var(--text-muted); margin-bottom: 1.5rem; font-size: 0.9rem; }
    }

    /* ── Avatar ── */
    .avatar-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 1.25rem;
    }

    .avatar-wrapper {
        position: relative;
        width: 96px;
        height: 96px;
        border-radius: 50%;
        cursor: pointer;
        display: block;

        .avatar-img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            object-fit: cover;
            border: 3px solid var(--border-light);
        }

        .avatar-initial {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: linear-gradient(135deg, #1a1a4e, #3b3b9e);
            color: #FFD700;
            font-size: 2.5rem;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .camera-overlay {
            position: absolute;
            bottom: 2px;
            right: 2px;
            width: 28px;
            height: 28px;
            background: var(--primary-color);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }

        &:hover .camera-overlay { background: var(--color-accent); }
    }

    .upload-btn {
        padding: 0.45rem 1.2rem;
        background: var(--color-accent);
        color: white;
        border: none;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 600;
        cursor: pointer;
        &:disabled { opacity: 0.6; cursor: not-allowed; }
        &:hover:not(:disabled) { opacity: 0.9; }
    }

    /* ── Form ── */
    .success-banner {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        justify-content: center;
        background: rgba(66,173,0,0.12);
        color: var(--color-green);
        border-radius: 10px;
        padding: 0.75rem;
        margin-bottom: 1rem;
        font-size: 0.95rem;
    }

    .field-group {
        text-align: left;
        margin-bottom: 1rem;

        label {
            display: flex;
            align-items: center;
            gap: 0.4rem;
            font-size: 0.82rem;
            font-weight: 700;
            color: var(--text-secondary);
            margin-bottom: 0.35rem;
            text-transform: uppercase;
            letter-spacing: 0.04em;
        }

        input {
            width: 100%;
            padding: 0.8rem 1rem;
            border: 2px solid var(--border-light);
            border-radius: 10px;
            font-size: 0.95rem;
            box-sizing: border-box;
            background: var(--bg-input);
            color: var(--text-heading);
            transition: border 0.2s, background 0.3s;
            &:focus { border-color: var(--primary-color); outline: none; }
        }
    }

    .divider {
        position: relative;
        text-align: center;
        margin: 1.5rem 0 1rem;
        &::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 0;
            right: 0;
            border-top: 1px solid var(--border-light);
        }
        span {
            background: var(--bg-card);
            padding: 0 1rem;
            font-size: 0.82rem;
            color: var(--text-muted);
            position: relative;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
    }

    .save-btn {
        width: 100%;
        padding: 0.9rem;
        background: linear-gradient(135deg, #1a1a4e, #3b3b9e);
        color: white;
        border: none;
        border-radius: 12px;
        font-size: 1rem;
        font-weight: 700;
        cursor: pointer;
        margin-top: 0.5rem;
        letter-spacing: 0.02em;
        transition: opacity 0.2s, transform 0.1s;
        &:hover { opacity: 0.9; transform: translateY(-1px); }
        &:active { transform: scale(0.98); }
    }
`;

export default Profile;
