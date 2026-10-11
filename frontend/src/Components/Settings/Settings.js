import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import { useGlobalContext } from "../../context/globalContext";

const Settings = () => {
  const {
    currencySymbol = "$",
    updateCurrency,
    incomes,
    expenses,
    currentUser
  } = useGlobalContext();

  // Settings State initialized from localStorage
  const [selectedCurrency, setSelectedCurrency] = useState(
    localStorage.getItem("app_currency") || currencySymbol || "$"
  );
  const [numberFormat, setNumberFormat] = useState(
    localStorage.getItem("app_number_format") || "standard"
  );
  const [dateFormat, setDateFormat] = useState(
    localStorage.getItem("app_date_format") || "DD/MM/YYYY"
  );
  const [themeColor, setThemeColor] = useState(
    localStorage.getItem("app_theme_color") || "emerald"
  );
  const [orbEnabled, setOrbEnabled] = useState(
    localStorage.getItem("app_orb_enabled") !== "false"
  );
  const [budgetThreshold, setBudgetThreshold] = useState(
    Number(localStorage.getItem("app_budget_threshold")) || 80
  );
  const [largeTxWarning, setLargeTxWarning] = useState(
    Number(localStorage.getItem("app_large_tx_warning")) || 10000
  );
  const [emailAlerts, setEmailAlerts] = useState(
    localStorage.getItem("app_email_alerts") === "true"
  );
  const [smartTips, setSmartTips] = useState(
    localStorage.getItem("app_smart_tips") !== "false"
  );

  // Diagnostics State
  const [isTestingConn, setIsTestingConn] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Apply theme color tokens
  const applyThemeColor = (color) => {
    setThemeColor(color);
    localStorage.setItem("app_theme_color", color);

    const root = document.documentElement;
    if (color === "emerald") {
      root.style.setProperty("--primary-color", "#10b981");
      root.style.setProperty("--primary-color3", "rgba(16, 185, 129, 0.4)");
    } else if (color === "indigo") {
      root.style.setProperty("--primary-color", "#6366f1");
      root.style.setProperty("--primary-color3", "rgba(99, 102, 241, 0.4)");
    } else if (color === "purple") {
      root.style.setProperty("--primary-color", "#8b5cf6");
      root.style.setProperty("--primary-color3", "rgba(139, 92, 246, 0.4)");
    } else if (color === "rose") {
      root.style.setProperty("--primary-color", "#f43f5e");
      root.style.setProperty("--primary-color3", "rgba(244, 63, 94, 0.4)");
    } else if (color === "cyan") {
      root.style.setProperty("--primary-color", "#06b6d4");
      root.style.setProperty("--primary-color3", "rgba(6, 182, 212, 0.4)");
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("app_theme_color");
    if (saved) applyThemeColor(saved);
  }, []);

  // Save changes handler
  const handleSaveSettings = () => {
    localStorage.setItem("app_currency", selectedCurrency);
    if (updateCurrency) updateCurrency(selectedCurrency);

    localStorage.setItem("app_number_format", numberFormat);
    localStorage.setItem("app_date_format", dateFormat);
    localStorage.setItem("app_orb_enabled", String(orbEnabled));
    localStorage.setItem("app_budget_threshold", String(budgetThreshold));
    localStorage.setItem("app_large_tx_warning", String(largeTxWarning));
    localStorage.setItem("app_email_alerts", String(emailAlerts));
    localStorage.setItem("app_smart_tips", String(smartTips));

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  // Connection Diagnostics
  const handleTestConnection = async () => {
    setIsTestingConn(true);
    setTestResult(null);
    const start = performance.now();
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers,
        timeout: 6000
      });
      const latency = Math.round(performance.now() - start);

      setTestResult({
        success: true,
        latency,
        message: `Connected successfully (${latency}ms latency). Server returned status ${res.status}.`
      });
    } catch (err) {
      const latency = Math.round(performance.now() - start);
      if (err.response) {
        setTestResult({
          success: true,
          latency,
          message: `Server responded with HTTP ${err.response.status} (${latency}ms). Endpoint reachable.`
        });
      } else {
        setTestResult({
          success: false,
          latency: null,
          message: `Connection failed: ${err.message}. Check backend server on port 5000.`
        });
      }
    } finally {
      setIsTestingConn(false);
    }
  };

  // Data Export to JSON
  const handleExportData = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      user: currentUser?.username || localStorage.getItem("username") || "user",
      settings: {
        currency: selectedCurrency,
        budgetThreshold,
        dateFormat,
        themeColor
      },
      incomes,
      expenses
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `finance_backup_${new Date().toISOString().split("T")[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Reset Preferences
  const handleResetDefaults = () => {
    if (window.confirm("Reset all settings to default values?")) {
      setSelectedCurrency("$");
      if (updateCurrency) updateCurrency("$");
      setNumberFormat("standard");
      setDateFormat("DD/MM/YYYY");
      applyThemeColor("emerald");
      setOrbEnabled(true);
      setBudgetThreshold(80);
      setLargeTxWarning(10000);
      setEmailAlerts(false);
      setSmartTips(true);

      localStorage.removeItem("app_currency");
      localStorage.removeItem("app_number_format");
      localStorage.removeItem("app_date_format");
      localStorage.removeItem("app_theme_color");
      localStorage.removeItem("app_orb_enabled");
      localStorage.removeItem("app_budget_threshold");
      localStorage.removeItem("app_large_tx_warning");
      localStorage.removeItem("app_email_alerts");
      localStorage.removeItem("app_smart_tips");

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  return (
    <SettingsStyled
      as={motion.div}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
    >
      <div className="header-box">
        <div className="title-area">
          <h1>
            <i className="fa-solid fa-gear"></i> Preferences & Settings
          </h1>
          <p>Configure financial display units, interface themes, alerts, and system parameters.</p>
        </div>

        <button type="button" className="save-all-btn" onClick={handleSaveSettings}>
          <i className="fa-solid fa-check"></i> Save Preferences
        </button>
      </div>

      {saveSuccess && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="save-banner"
        >
          <i className="fa-solid fa-circle-check"></i> Preferences saved successfully!
        </motion.div>
      )}

      <div className="settings-grid">
        {/* Card 1: Regional & Currency */}
        <div className="settings-card">
          <div className="card-header">
            <div className="icon-badge emerald">
              <i className="fa-solid fa-coins"></i>
            </div>
            <div>
              <h3>Currency & Units</h3>
              <p>Choose your primary monetary denomination.</p>
            </div>
          </div>

          <div className="card-body">
            <div className="setting-item">
              <label htmlFor="currency-select">Primary Currency</label>
              <select
                id="currency-select"
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
              >
                <option value="₹">₹ INR (Indian Rupee)</option>
                <option value="$">$ USD (US Dollar)</option>
                <option value="€">€ EUR (Euro)</option>
                <option value="£">£ GBP (British Pound)</option>
                <option value="¥">¥ JPY (Japanese Yen)</option>
                <option value="C$">C$ CAD (Canadian Dollar)</option>
                <option value="A$">A$ AUD (Australian Dollar)</option>
              </select>
            </div>

            <div className="setting-item">
              <label htmlFor="number-fmt">Number Format</label>
              <select
                id="number-fmt"
                value={numberFormat}
                onChange={(e) => setNumberFormat(e.target.value)}
              >
                <option value="standard">Standard (e.g., 1,50,000.00)</option>
                <option value="compact">Compact (e.g., 1.5L / 150K)</option>
              </select>
            </div>

            <div className="setting-item">
              <label htmlFor="date-fmt">Date Representation</label>
              <select
                id="date-fmt"
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY (e.g., 25/12/2026)</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY (e.g., 12/25/2026)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (e.g., 2026-12-25)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Card 2: Appearance & Theme */}
        <div className="settings-card">
          <div className="card-header">
            <div className="icon-badge indigo">
              <i className="fa-solid fa-palette"></i>
            </div>
            <div>
              <h3>Appearance & Theme</h3>
              <p>Personalize accent colors and visual animations.</p>
            </div>
          </div>

          <div className="card-body">
            <div className="setting-item">
              <label>Accent Glow Color</label>
              <div className="theme-pills">
                <button
                  type="button"
                  className={`color-pill emerald ${themeColor === "emerald" ? "active" : ""}`}
                  onClick={() => applyThemeColor("emerald")}
                  title="Emerald Green"
                >
                  <span className="dot" style={{ background: "#10b981" }}></span> Emerald
                </button>
                <button
                  type="button"
                  className={`color-pill indigo ${themeColor === "indigo" ? "active" : ""}`}
                  onClick={() => applyThemeColor("indigo")}
                  title="Royal Indigo"
                >
                  <span className="dot" style={{ background: "#6366f1" }}></span> Indigo
                </button>
                <button
                  type="button"
                  className={`color-pill purple ${themeColor === "purple" ? "active" : ""}`}
                  onClick={() => applyThemeColor("purple")}
                  title="Electric Purple"
                >
                  <span className="dot" style={{ background: "#8b5cf6" }}></span> Purple
                </button>
                <button
                  type="button"
                  className={`color-pill rose ${themeColor === "rose" ? "active" : ""}`}
                  onClick={() => applyThemeColor("rose")}
                  title="Sunset Rose"
                >
                  <span className="dot" style={{ background: "#f43f5e" }}></span> Rose
                </button>
              </div>
            </div>

            <div className="setting-item toggle-row">
              <div className="toggle-label">
                <strong>Ambient Floating Orb</strong>
                <span>Renders smooth 3D animated background light.</span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={orbEnabled}
                  onChange={(e) => setOrbEnabled(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Card 3: Financial Guardrails & Alerts */}
        <div className="settings-card">
          <div className="card-header">
            <div className="icon-badge rose">
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            <div>
              <h3>Budget Guardrails</h3>
              <p>Threshold alerts for monthly spending control.</p>
            </div>
          </div>

          <div className="card-body">
            <div className="setting-item">
              <div className="slider-header">
                <label htmlFor="budget-slider">Monthly Spending Alert Threshold</label>
                <span className="slider-val">{budgetThreshold}% of Income</span>
              </div>
              <input
                id="budget-slider"
                type="range"
                min="50"
                max="100"
                step="5"
                value={budgetThreshold}
                onChange={(e) => setBudgetThreshold(Number(e.target.value))}
                className="range-input"
              />
              <span className="range-hint">Warns when your monthly expenses exceed this ratio.</span>
            </div>

            <div className="setting-item">
              <label htmlFor="large-tx">Large Transaction Alert ({selectedCurrency})</label>
              <input
                id="large-tx"
                type="number"
                min="1000"
                step="500"
                value={largeTxWarning}
                onChange={(e) => setLargeTxWarning(Number(e.target.value))}
                className="text-input"
                placeholder="10000"
              />
              <span className="range-hint">Highlights single transactions that exceed this amount.</span>
            </div>

            <div className="setting-item toggle-row">
              <div className="toggle-label">
                <strong>AI Smart Spending Suggestions</strong>
                <span>Analyze transaction trends and suggest savings.</span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={smartTips}
                  onChange={(e) => setSmartTips(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Card 4: Backup, Export & Diagnostics */}
        <div className="settings-card">
          <div className="card-header">
            <div className="icon-badge cyan">
              <i className="fa-solid fa-server"></i>
            </div>
            <div>
              <h3>Data & Diagnostics</h3>
              <p>Verify backend connectivity and export your ledger.</p>
            </div>
          </div>

          <div className="card-body">
            <div className="setting-item">
              <label>API Endpoint Diagnostics</label>
              <div className="endpoint-box">
                <span className="url-text">{API_BASE_URL}</span>
                <button
                  type="button"
                  className="test-btn"
                  onClick={handleTestConnection}
                  disabled={isTestingConn}
                >
                  {isTestingConn ? (
                    <i className="fa-solid fa-spinner fa-spin"></i>
                  ) : (
                    <i className="fa-solid fa-bolt"></i>
                  )}
                  {isTestingConn ? "Testing..." : "Ping Server"}
                </button>
              </div>

              {testResult && (
                <div className={`diagnostic-pill ${testResult.success ? "success" : "error"}`}>
                  <i
                    className={
                      testResult.success
                        ? "fa-solid fa-circle-check"
                        : "fa-solid fa-circle-xmark"
                    }
                  ></i>
                  <span>{testResult.message}</span>
                </div>
              )}
            </div>

            <div className="data-actions-row">
              <button type="button" className="action-btn export" onClick={handleExportData}>
                <i className="fa-solid fa-download"></i> Export Data (JSON)
              </button>
              <button type="button" className="action-btn reset" onClick={handleResetDefaults}>
                <i className="fa-solid fa-rotate-left"></i> Reset Defaults
              </button>
            </div>
          </div>
        </div>
      </div>
    </SettingsStyled>
  );
};

const SettingsStyled = styled.div`
  padding: 1.5rem;
  max-width: 1100px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 1rem;
  }

  .header-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
    gap: 1rem;
    flex-wrap: wrap;

    .title-area {
      h1 {
        font-size: 1.85rem;
        font-weight: 800;
        color: #1e293b;
        display: flex;
        align-items: center;
        gap: 0.65rem;

        i {
          color: #6366f1;
        }
      }

      p {
        font-size: 0.95rem;
        color: #64748b;
        margin-top: 0.25rem;
      }
    }

    .save-all-btn {
      padding: 0.85rem 1.75rem;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      border: none;
      border-radius: 14px;
      font-size: 0.95rem;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 4px 15px rgba(16, 185, 129, 0.25);
      transition: all 0.2s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35);
      }
    }
  }

  .save-banner {
    background: rgba(16, 185, 129, 0.15);
    border: 1px solid rgba(16, 185, 129, 0.4);
    color: #065f46;
    padding: 0.85rem 1.25rem;
    border-radius: 14px;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.65rem;
    margin-bottom: 1.5rem;
  }

  .settings-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;

    @media (max-width: 900px) {
      grid-template-columns: 1fr;
    }
  }

  .settings-card {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(12px);
    border: 2px solid #ffffff;
    border-radius: 22px;
    padding: 1.75rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
    display: flex;
    flex-direction: column;

    .card-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid rgba(226, 232, 240, 0.6);

      .icon-badge {
        width: 46px;
        height: 46px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.25rem;
        flex-shrink: 0;

        &.emerald {
          background: rgba(16, 185, 129, 0.15);
          color: #059669;
        }

        &.indigo {
          background: rgba(99, 102, 241, 0.15);
          color: #4f46e5;
        }

        &.rose {
          background: rgba(244, 63, 94, 0.15);
          color: #e11d48;
        }

        &.cyan {
          background: rgba(6, 182, 212, 0.15);
          color: #0891b2;
        }
      }

      h3 {
        font-size: 1.2rem;
        font-weight: 800;
        color: #1e293b;
      }

      p {
        font-size: 0.85rem;
        color: #64748b;
      }
    }

    .card-body {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .setting-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      label {
        font-size: 0.85rem;
        font-weight: 700;
        color: #334155;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      select,
      .text-input {
        background: #f8fafc;
        border: 2px solid #e2e8f0;
        border-radius: 12px;
        padding: 0.75rem 1rem;
        font-size: 0.95rem;
        font-weight: 600;
        color: #1e293b;
        outline: none;
        transition: all 0.2s ease;

        &:focus {
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
          background: #ffffff;
        }
      }

      .slider-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .slider-val {
          font-weight: 800;
          color: #e11d48;
          font-size: 0.95rem;
        }
      }

      .range-input {
        accent-color: #10b981;
        cursor: pointer;
        height: 6px;
      }

      .range-hint {
        font-size: 0.8rem;
        color: #94a3b8;
      }
    }

    .toggle-row {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      padding: 0.5rem 0;

      .toggle-label {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;

        strong {
          font-size: 0.95rem;
          color: #1e293b;
        }

        span {
          font-size: 0.8rem;
          color: #64748b;
        }
      }
    }

    .theme-pills {
      display: flex;
      gap: 0.65rem;
      flex-wrap: wrap;

      .color-pill {
        border: 2px solid #e2e8f0;
        background: #f8fafc;
        padding: 0.5rem 0.85rem;
        border-radius: 12px;
        font-size: 0.85rem;
        font-weight: 700;
        color: #334155;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.45rem;
        transition: all 0.2s ease;

        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        &:hover {
          border-color: #cbd5e1;
        }

        &.active {
          border-color: #10b981;
          background: #ffffff;
          box-shadow: 0 2px 10px rgba(16, 185, 129, 0.15);
        }
      }
    }

    .endpoint-box {
      display: flex;
      align-items: center;
      background: #f8fafc;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      padding: 0.6rem 0.85rem;
      gap: 0.75rem;

      .url-text {
        flex: 1;
        font-family: monospace;
        font-size: 0.85rem;
        color: #334155;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .test-btn {
        padding: 0.45rem 0.85rem;
        background: #6366f1;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 0.8rem;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.35rem;
        flex-shrink: 0;
        transition: all 0.2s ease;

        &:hover:not(:disabled) {
          background: #4f46e5;
        }

        &:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      }
    }

    .diagnostic-pill {
      font-size: 0.85rem;
      font-weight: 600;
      padding: 0.65rem 0.85rem;
      border-radius: 10px;
      display: flex;
      align-items: center;
      gap: 0.5rem;

      &.success {
        background: rgba(16, 185, 129, 0.15);
        color: #065f46;
      }

      &.error {
        background: rgba(239, 68, 68, 0.15);
        color: #991b1b;
      }
    }

    .data-actions-row {
      display: flex;
      gap: 0.75rem;
      margin-top: 0.5rem;
      flex-wrap: wrap;

      .action-btn {
        flex: 1;
        padding: 0.75rem 1rem;
        border-radius: 12px;
        font-size: 0.85rem;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        transition: all 0.2s ease;

        &.export {
          background: #0ea5e9;
          color: white;
          border: none;

          &:hover {
            background: #0284c7;
          }
        }

        &.reset {
          background: transparent;
          color: #64748b;
          border: 2px solid #e2e8f0;

          &:hover {
            background: #f1f5f9;
            color: #1e293b;
          }
        }
      }
    }
  }

  /* Custom Switch */
  .switch {
    position: relative;
    display: inline-block;
    width: 44px;
    height: 24px;
    flex-shrink: 0;

    input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #cbd5e1;
      transition: 0.3s;
      border-radius: 24px;

      &:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: 0.3s;
        border-radius: 50%;
      }
    }

    input:checked + .slider {
      background-color: #10b981;
    }

    input:checked + .slider:before {
      transform: translateX(20px);
    }
  }
`;

export default Settings;
