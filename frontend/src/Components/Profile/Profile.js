import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import axios from "axios";
import defaultAvatar from "../../img/avatar.png";
import { API_BASE_URL } from "../../config";
import { useGlobalContext } from "../../context/globalContext";

const Profile = ({ setActive }) => {
  const {
    currentUser,
    setCurrentUser,
    totalIncome,
    totalExpenses,
    totalBalance,
    incomes,
    expenses,
    currencySymbol = "$",
    logoutSession
  } = useGlobalContext();

  const [activeTab, setActiveTab] = useState("info"); // 'info' | 'security' | 'activity'
  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
    userId: "",
    role: "user",
    authProvider: "local",
    createdAt: "",
    profileImage: ""
  });

  const [avatarPreview, setAvatarPreview] = useState(defaultAvatar);
  const [isUploadingImg, setIsUploadingImg] = useState(false);

  // Form states
  const [usernameInput, setUsernameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [isUpdatingInfo, setIsUpdatingInfo] = useState(false);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Alert feedback
  const [alert, setAlert] = useState({ type: "", message: "" });
  const fileInputRef = useRef(null);

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => {
      setAlert({ type: "", message: "" });
    }, 4500);
  };

  // Helper for auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return { headers };
  };

  // Fetch full user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/users/profile`, getAuthHeaders());
        if (response.data) {
          const user = response.data;
          setProfileData(user);
          setUsernameInput(user.username || "");
          setEmailInput(user.email || "");

          if (user.profileImage) {
            setAvatarPreview(
              user.profileImage.startsWith("http")
                ? user.profileImage
                : `${API_BASE_URL.replace("/api", "")}${user.profileImage}`
            );
          } else {
            setAvatarPreview(defaultAvatar);
          }
        }
      } catch (err) {
        // Fallback to local storage or currentUser from context
        const localUser = localStorage.getItem("username") || currentUser?.username || "Finance Member";
        const localImg = localStorage.getItem("profileImage") || currentUser?.profileImage || "";
        const localRole = localStorage.getItem("role") || currentUser?.role || "user";

        setProfileData((prev) => ({
          ...prev,
          username: localUser,
          role: localRole,
          email: currentUser?.email || "user@smartfinance.ai",
          userId: currentUser?.userId || "N/A"
        }));
        setUsernameInput(localUser);
        setEmailInput(currentUser?.email || "");

        if (localImg) {
          setAvatarPreview(
            localImg.startsWith("http") ? localImg : `${API_BASE_URL.replace("/api", "")}${localImg}`
          );
        }
      }
    };

    fetchProfile();
  }, [currentUser]);

  // Handle avatar upload
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
      showAlert("error", "Please select a valid image file (PNG, JPG, or WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showAlert("error", "Image size exceeds 5MB limit.");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    setIsUploadingImg(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`${API_BASE_URL}/users/update-profile-image`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      const newUrl = res.data.profileImage;
      localStorage.setItem("profileImage", newUrl);
      setAvatarPreview(newUrl.startsWith("http") ? newUrl : `${API_BASE_URL.replace("/api", "")}${newUrl}`);
      if (setCurrentUser) {
        setCurrentUser((prev) => (prev ? { ...prev, profileImage: newUrl } : prev));
      }
      showAlert("success", "Profile picture updated successfully!");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to upload image. Please try again.";
      showAlert("error", msg);
    } finally {
      setIsUploadingImg(false);
    }
  };

  // Handle personal info update
  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    if (!usernameInput.trim()) {
      showAlert("error", "Username cannot be empty.");
      return;
    }

    setIsUpdatingInfo(true);
    try {
      const res = await axios.put(
        `${API_BASE_URL}/users/profile`,
        { username: usernameInput.trim(), email: emailInput.trim() },
        getAuthHeaders()
      );

      const updated = res.data.user;
      localStorage.setItem("username", updated.username);
      setProfileData((prev) => ({ ...prev, ...updated }));
      if (setCurrentUser) {
        setCurrentUser((prev) => (prev ? { ...prev, ...updated } : prev));
      }
      showAlert("success", "Profile details updated successfully!");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update profile. Please try again.";
      showAlert("error", msg);
    } finally {
      setIsUpdatingInfo(false);
    }
  };

  // Handle password change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      showAlert("error", "Please enter your current password.");
      return;
    }
    if (newPassword.length < 6) {
      showAlert("error", "New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      showAlert("error", "New passwords do not match.");
      return;
    }

    setIsChangingPassword(true);
    try {
      await axios.put(
        `${API_BASE_URL}/users/change-password`,
        { currentPassword, newPassword },
        getAuthHeaders()
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showAlert("success", "Password updated successfully!");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to change password.";
      showAlert("error", msg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Calculate savings rate
  const incomeVal = totalIncome();
  const expenseVal = totalExpenses();
  const balanceVal = totalBalance();
  const savingsRate = incomeVal > 0 ? Math.max(0, Math.round((balanceVal / incomeVal) * 100)) : 0;
  const totalTxCount = incomes.length + expenses.length;

  return (
    <ProfileStyled
      as={motion.div}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
    >
      {/* Alert Banner */}
      {alert.message && (
        <AlertBanner className={alert.type}>
          <i className={alert.type === "success" ? "fa-solid fa-circle-check" : "fa-solid fa-triangle-exclamation"}></i>
          <span>{alert.message}</span>
        </AlertBanner>
      )}

      {/* Hero Profile Card */}
      <div className="hero-card">
        <div className="hero-avatar-area">
          <div className="avatar-frame">
            <img src={avatarPreview} alt="User Avatar" />
            {isUploadingImg && (
              <div className="avatar-loading-overlay">
                <i className="fa-solid fa-spinner fa-spin"></i>
              </div>
            )}
            <button
              type="button"
              className="change-avatar-btn"
              onClick={() => fileInputRef.current?.click()}
              title="Change Profile Picture"
              disabled={isUploadingImg}
            >
              <i className="fa-solid fa-camera"></i>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              accept="image/*"
              onChange={handleAvatarChange}
            />
          </div>
        </div>

        <div className="hero-info-area">
          <div className="hero-badge-row">
            <span className={`role-badge ${profileData.role === "admin" ? "admin" : "user"}`}>
              <i className={profileData.role === "admin" ? "fa-solid fa-shield-halved" : "fa-solid fa-user-check"}></i>
              {profileData.role === "admin" ? "ADMINISTRATOR" : "PERSONAL MEMBER"}
            </span>

            {profileData.authProvider === "google" ? (
              <span className="auth-badge google">
                <i className="fa-brands fa-google"></i> Google Linked
              </span>
            ) : (
              <span className="auth-badge local">
                <i className="fa-solid fa-lock"></i> Secured Account
              </span>
            )}
          </div>

          <h1 className="hero-username">{profileData.username || "Finance Member"}</h1>
          <p className="hero-email">{profileData.email || "user@smartfinance.ai"}</p>

          <div className="meta-info-row">
            <span>
              <i className="fa-regular fa-calendar"></i> Joined:{" "}
              {profileData.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : "Active Member"}
            </span>
            <span>
              <i className="fa-solid fa-fingerprint"></i> ID: {profileData.userId || "usr-01"}
            </span>
          </div>
        </div>
      </div>

      {/* Financial Health Snapshot */}
      <div className="stats-row">
        <div className="stat-card income">
          <div className="icon-wrap">
            <i className="fa-solid fa-arrow-trend-up"></i>
          </div>
          <div className="stat-text">
            <span className="label">Total Incomes</span>
            <h3>
              {currencySymbol} {incomeVal.toLocaleString()}
            </h3>
          </div>
        </div>

        <div className="stat-card expense">
          <div className="icon-wrap">
            <i className="fa-solid fa-arrow-trend-down"></i>
          </div>
          <div className="stat-text">
            <span className="label">Total Expenses</span>
            <h3>
              {currencySymbol} {expenseVal.toLocaleString()}
            </h3>
          </div>
        </div>

        <div className="stat-card balance">
          <div className="icon-wrap">
            <i className="fa-solid fa-vault"></i>
          </div>
          <div className="stat-text">
            <span className="label">Net Savings</span>
            <h3>
              {currencySymbol} {balanceVal.toLocaleString()}
            </h3>
          </div>
        </div>

        <div className="stat-card rate">
          <div className="icon-wrap">
            <i className="fa-solid fa-chart-pie"></i>
          </div>
          <div className="stat-text">
            <span className="label">Savings Rate</span>
            <h3>{savingsRate}%</h3>
            <div className="progress-bg">
              <div className="progress-bar" style={{ width: `${Math.min(savingsRate, 100)}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="tabs-container">
        <div className="tab-buttons">
          <button
            type="button"
            className={activeTab === "info" ? "tab-btn active" : "tab-btn"}
            onClick={() => setActiveTab("info")}
          >
            <i className="fa-solid fa-user-pen"></i> Account Details
          </button>
          <button
            type="button"
            className={activeTab === "security" ? "tab-btn active" : "tab-btn"}
            onClick={() => setActiveTab("security")}
          >
            <i className="fa-solid fa-shield-halved"></i> Security & Password
          </button>
          <button
            type="button"
            className={activeTab === "activity" ? "tab-btn active" : "tab-btn"}
            onClick={() => setActiveTab("activity")}
          >
            <i className="fa-solid fa-bolt"></i> Shortcuts & Session
          </button>
        </div>

        <div className="tab-content">
          {/* TAB 1: Account Information */}
          {activeTab === "info" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="tab-pane"
            >
              <h3>Personal Information</h3>
              <p className="tab-desc">Update your display name and email address associated with your portfolio.</p>

              <form onSubmit={handleUpdateInfo} className="form-grid">
                <div className="form-group">
                  <label htmlFor="input-username">Username</label>
                  <div className="input-wrap">
                    <i className="fa-solid fa-user"></i>
                    <input
                      id="input-username"
                      type="text"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      placeholder="Enter username"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="input-email">Email Address</label>
                  <div className="input-wrap">
                    <i className="fa-solid fa-envelope"></i>
                    <input
                      id="input-email"
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                </div>

                <div className="form-group full-width">
                  <button type="submit" className="save-btn" disabled={isUpdatingInfo}>
                    {isUpdatingInfo ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin"></i> Saving Changes...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-floppy-disk"></i> Save Profile Details
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* TAB 2: Security & Password */}
          {activeTab === "security" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="tab-pane"
            >
              <h3>Password & Security</h3>

              {profileData.authProvider === "google" ? (
                <div className="oauth-notice">
                  <div className="notice-icon">
                    <i className="fa-brands fa-google"></i>
                  </div>
                  <div>
                    <h4>Google Managed Authentication</h4>
                    <p>
                      Your account was authenticated securely using Google Sign-In. Password changes and two-factor
                      authentication are managed directly through your Google Account settings.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <p className="tab-desc">
                    Ensure your account stays secure by using a strong password with at least 6 characters.
                  </p>

                  <form onSubmit={handleChangePassword} className="form-grid">
                    <div className="form-group full-width">
                      <label htmlFor="input-curr-pw">Current Password</label>
                      <div className="input-wrap">
                        <i className="fa-solid fa-lock"></i>
                        <input
                          id="input-curr-pw"
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter your current password"
                          required
                        />
                        <button
                          type="button"
                          className="pw-toggle-btn"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          <i className={showCurrentPassword ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"}></i>
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="input-new-pw">New Password</label>
                      <div className="input-wrap">
                        <i className="fa-solid fa-key"></i>
                        <input
                          id="input-new-pw"
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Minimum 6 characters"
                          required
                        />
                        <button
                          type="button"
                          className="pw-toggle-btn"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          <i className={showNewPassword ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"}></i>
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="input-conf-pw">Confirm New Password</label>
                      <div className="input-wrap">
                        <i className="fa-solid fa-check-double"></i>
                        <input
                          id="input-conf-pw"
                          type={showNewPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter new password"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group full-width">
                      <button type="submit" className="save-btn" disabled={isChangingPassword}>
                        {isChangingPassword ? (
                          <>
                            <i className="fa-solid fa-spinner fa-spin"></i> Updating Password...
                          </>
                        ) : (
                          <>
                            <i className="fa-solid fa-shield-halved"></i> Update Password
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          )}

          {/* TAB 3: Shortcuts & Session */}
          {activeTab === "activity" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="tab-pane"
            >
              <h3>Quick Navigation & Session</h3>
              <p className="tab-desc">Access related areas of your portfolio or manage your active session.</p>

              <div className="shortcut-cards">
                <div
                  className="shortcut-card"
                  onClick={() => setActive && setActive(7)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="sc-icon blue">
                    <i className="fa-solid fa-gear"></i>
                  </div>
                  <div className="sc-details">
                    <h4>Application Settings</h4>
                    <p>Customize currencies, themes, alerts, and system parameters.</p>
                  </div>
                  <i className="fa-solid fa-chevron-right arrow"></i>
                </div>

                <div
                  className="shortcut-card"
                  onClick={() => setActive && setActive(4)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="sc-icon green">
                    <i className="fa-solid fa-credit-card"></i>
                  </div>
                  <div className="sc-details">
                    <h4>Transaction Records</h4>
                    <p>Review all {totalTxCount} logged financial entries with filters & search.</p>
                  </div>
                  <i className="fa-solid fa-chevron-right arrow"></i>
                </div>

                <div
                  className="shortcut-card"
                  onClick={() => setActive && setActive(5)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="sc-icon purple">
                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                  </div>
                  <div className="sc-details">
                    <h4>AI Financial Suggestions</h4>
                    <p>Inspect intelligent budgeting tips and automated saving analysis.</p>
                  </div>
                  <i className="fa-solid fa-chevron-right arrow"></i>
                </div>
              </div>

              <div className="session-card">
                <div className="session-info">
                  <h4>Active Login Session</h4>
                  <p>Authenticated on this client device via secure session token.</p>
                </div>
                <button
                  type="button"
                  className="logout-action-btn"
                  onClick={async () => {
                    if (window.confirm("Are you sure you want to log out of your account?")) {
                      if (logoutSession) await logoutSession();
                      window.location.href = "/login";
                    }
                  }}
                >
                  <i className="fa-solid fa-right-from-bracket"></i> Sign Out
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </ProfileStyled>
  );
};

const AlertBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1.25rem;
  border-radius: 14px;
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);

  &.success {
    background: rgba(16, 185, 129, 0.15);
    border: 1px solid rgba(16, 185, 129, 0.4);
    color: #065f46;
  }

  &.error {
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.4);
    color: #991b1b;
  }
`;

const ProfileStyled = styled.div`
  padding: 1.5rem;
  max-width: 1100px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 1rem;
  }

  /* Hero Card */
  .hero-card {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(12px);
    border: 2px solid #ffffff;
    border-radius: 24px;
    padding: 2rem;
    display: flex;
    align-items: center;
    gap: 2rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
    margin-bottom: 2rem;

    @media (max-width: 768px) {
      flex-direction: column;
      text-align: center;
      gap: 1.25rem;
      padding: 1.5rem;
    }
  }

  .hero-avatar-area {
    position: relative;
    flex-shrink: 0;

    .avatar-frame {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      border: 4px solid #ffffff;
      box-shadow: 0 8px 24px rgba(16, 185, 129, 0.25);
      position: relative;
      overflow: hidden;
      background: #f1f5f9;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .avatar-loading-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
      }
    }

    .change-avatar-btn {
      position: absolute;
      bottom: 2px;
      right: 2px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      border: 2px solid #ffffff;
      border-radius: 50%;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
      transition: all 0.2s ease;

      &:hover {
        transform: scale(1.1);
        background: #047857;
      }
    }
  }

  .hero-info-area {
    flex: 1;

    .hero-badge-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.5rem;
      flex-wrap: wrap;

      @media (max-width: 768px) {
        justify-content: center;
      }

      .role-badge {
        font-size: 0.75rem;
        font-weight: 800;
        letter-spacing: 0.5px;
        padding: 0.3rem 0.75rem;
        border-radius: 20px;
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;

        &.admin {
          background: rgba(99, 102, 241, 0.15);
          color: #4f46e5;
          border: 1px solid rgba(99, 102, 241, 0.3);
        }

        &.user {
          background: rgba(16, 185, 129, 0.15);
          color: #059669;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
      }

      .auth-badge {
        font-size: 0.75rem;
        font-weight: 700;
        padding: 0.3rem 0.75rem;
        border-radius: 20px;
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;

        &.google {
          background: rgba(234, 67, 53, 0.1);
          color: #c5221f;
          border: 1px solid rgba(234, 67, 53, 0.25);
        }

        &.local {
          background: rgba(100, 116, 139, 0.1);
          color: #475569;
          border: 1px solid rgba(100, 116, 139, 0.25);
        }
      }
    }

    .hero-username {
      font-size: 1.85rem;
      font-weight: 800;
      color: #1e293b;
      margin: 0.25rem 0;
    }

    .hero-email {
      font-size: 1rem;
      color: #64748b;
      margin-bottom: 0.75rem;
    }

    .meta-info-row {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      font-size: 0.85rem;
      color: #94a3b8;
      font-weight: 600;

      @media (max-width: 768px) {
        justify-content: center;
        flex-wrap: wrap;
        gap: 0.75rem;
      }

      span {
        display: flex;
        align-items: center;
        gap: 0.4rem;
      }
    }
  }

  /* Stats Row */
  .stats-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.25rem;
    margin-bottom: 2rem;

    @media (max-width: 992px) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: 540px) {
      grid-template-columns: 1fr;
    }

    .stat-card {
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(10px);
      border: 2px solid #ffffff;
      border-radius: 20px;
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
      transition: transform 0.2s ease;

      &:hover {
        transform: translateY(-3px);
      }

      .icon-wrap {
        width: 48px;
        height: 48px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.25rem;
        flex-shrink: 0;
      }

      .stat-text {
        flex: 1;

        .label {
          font-size: 0.8rem;
          color: #64748b;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        h3 {
          font-size: 1.35rem;
          font-weight: 800;
          color: #1e293b;
          margin-top: 0.2rem;
        }

        .progress-bg {
          width: 100%;
          height: 6px;
          background: #e2e8f0;
          border-radius: 4px;
          margin-top: 0.4rem;
          overflow: hidden;

          .progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #10b981 0%, #06b6d4 100%);
            border-radius: 4px;
            transition: width 0.4s ease;
          }
        }
      }

      &.income .icon-wrap {
        background: rgba(16, 185, 129, 0.15);
        color: #059669;
      }

      &.expense .icon-wrap {
        background: rgba(239, 68, 68, 0.15);
        color: #dc2626;
      }

      &.balance .icon-wrap {
        background: rgba(99, 102, 241, 0.15);
        color: #4f46e5;
      }

      &.rate .icon-wrap {
        background: rgba(14, 165, 233, 0.15);
        color: #0284c7;
      }
    }
  }

  /* Tabs */
  .tabs-container {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(12px);
    border: 2px solid #ffffff;
    border-radius: 24px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
    overflow: hidden;

    .tab-buttons {
      display: flex;
      border-bottom: 2px solid rgba(226, 232, 240, 0.6);
      background: rgba(248, 250, 252, 0.5);

      @media (max-width: 650px) {
        flex-direction: column;
      }

      .tab-btn {
        flex: 1;
        padding: 1.15rem 1.5rem;
        border: none;
        background: transparent;
        font-size: 0.95rem;
        font-weight: 700;
        color: #64748b;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.6rem;
        transition: all 0.2s ease;
        border-bottom: 3px solid transparent;

        &:hover {
          color: #1e293b;
          background: rgba(255, 255, 255, 0.6);
        }

        &.active {
          color: #059669;
          background: #ffffff;
          border-bottom: 3px solid #10b981;
        }
      }
    }

    .tab-content {
      padding: 2rem;

      @media (max-width: 768px) {
        padding: 1.5rem;
      }

      .tab-pane {
        h3 {
          font-size: 1.35rem;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 0.35rem;
        }

        .tab-desc {
          font-size: 0.95rem;
          color: #64748b;
          margin-bottom: 1.75rem;
        }
      }
    }
  }

  /* Form Styles */
  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;

    @media (max-width: 650px) {
      grid-template-columns: 1fr;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      &.full-width {
        grid-column: 1 / -1;
      }

      label {
        font-size: 0.85rem;
        font-weight: 700;
        color: #334155;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .input-wrap {
        display: flex;
        align-items: center;
        background: #f8fafc;
        border: 2px solid #e2e8f0;
        border-radius: 14px;
        padding: 0.75rem 1rem;
        gap: 0.75rem;
        transition: all 0.2s ease;

        &:focus-within {
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
          background: #ffffff;
        }

        i {
          color: #94a3b8;
          font-size: 1rem;
        }

        input {
          border: none;
          background: transparent;
          width: 100%;
          outline: none;
          font-size: 0.95rem;
          color: #1e293b;
          font-weight: 600;

          &::placeholder {
            color: #94a3b8;
            font-weight: 500;
          }
        }

        .pw-toggle-btn {
          border: none;
          background: transparent;
          color: #94a3b8;
          cursor: pointer;
          font-size: 1rem;
          padding: 0;

          &:hover {
            color: #475569;
          }
        }
      }
    }

    .save-btn {
      padding: 0.9rem 1.75rem;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      border: none;
      border-radius: 14px;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      transition: all 0.2s ease;
      box-shadow: 0 4px 15px rgba(16, 185, 129, 0.25);
      margin-top: 0.5rem;

      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35);
      }

      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
    }
  }

  .oauth-notice {
    background: rgba(234, 67, 53, 0.08);
    border: 1px solid rgba(234, 67, 53, 0.25);
    border-radius: 16px;
    padding: 1.5rem;
    display: flex;
    gap: 1.25rem;
    align-items: center;

    .notice-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #ffffff;
      color: #ea4335;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(234, 67, 53, 0.15);
    }

    h4 {
      font-size: 1.1rem;
      font-weight: 800;
      color: #1e293b;
      margin-bottom: 0.25rem;
    }

    p {
      font-size: 0.9rem;
      color: #64748b;
      line-height: 1.5;
    }
  }

  /* Shortcuts */
  .shortcut-cards {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;

    .shortcut-card {
      background: #f8fafc;
      border: 2px solid #e2e8f0;
      border-radius: 16px;
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 1.25rem;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: #ffffff;
        border-color: #cbd5e1;
        transform: translateX(4px);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);

        .arrow {
          transform: translateX(4px);
          color: #059669;
        }
      }

      .sc-icon {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        flex-shrink: 0;

        &.blue {
          background: rgba(99, 102, 241, 0.15);
          color: #4f46e5;
        }

        &.green {
          background: rgba(16, 185, 129, 0.15);
          color: #059669;
        }

        &.purple {
          background: rgba(168, 85, 247, 0.15);
          color: #9333ea;
        }
      }

      .sc-details {
        flex: 1;

        h4 {
          font-size: 1.05rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 0.2rem;
        }

        p {
          font-size: 0.85rem;
          color: #64748b;
        }
      }

      .arrow {
        color: #94a3b8;
        transition: transform 0.2s ease, color 0.2s ease;
      }
    }
  }

  .session-card {
    background: rgba(254, 242, 242, 0.8);
    border: 2px solid rgba(254, 202, 202, 0.8);
    border-radius: 18px;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;

    @media (max-width: 600px) {
      flex-direction: column;
      align-items: stretch;
      text-align: center;
    }

    .session-info {
      h4 {
        font-size: 1.05rem;
        font-weight: 800;
        color: #991b1b;
        margin-bottom: 0.25rem;
      }

      p {
        font-size: 0.85rem;
        color: #b91c1c;
      }
    }

    .logout-action-btn {
      padding: 0.75rem 1.5rem;
      background: #ef4444;
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 0.95rem;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: all 0.2s ease;
      flex-shrink: 0;

      &:hover {
        background: #dc2626;
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
      }
    }
  }
`;

export default Profile;
