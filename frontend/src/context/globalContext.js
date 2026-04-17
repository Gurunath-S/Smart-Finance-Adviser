import React, { useContext, useState, useEffect, useCallback } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_BASE_URL } from "../config";

const V1_URL = `${API_BASE_URL}/v1/`;
const ADMIN_URL = `${API_BASE_URL}/users/`;
const AUTH_URL = `${API_BASE_URL}/auth/`;

const GlobalContext = React.createContext();

export const GlobalProvider = ({ children, manId, setManId }) => {
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");

  // Apply dark mode class to document root
  useEffect(() => {
    document.documentElement.classList.toggle("dark-mode", darkMode);
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  // Auth headers helper
  const getAuthHeaders = useCallback(() => ({
    headers: { Authorization: `Bearer ${token || localStorage.getItem("token")}` }
  }), [token]);

  // Decode JWT exp without a library (base64 payload)
  const getTokenExpiry = (t) => {
    try {
      const payload = JSON.parse(atob(t.split(".")[1]));
      return payload.exp ? payload.exp * 1000 : null;
    } catch { return null; }
  };

  const doLogout = (msg = "Session expired. Please log in again.") => {
    toast.error(msg);
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setToken(null);
    window.location.href = "/";
  };

  // Proactive check: poll every 60s so idle users get redirected without needing an API call
  useEffect(() => {
    const check = () => {
      const t = localStorage.getItem("token");
      if (!t) return;
      const exp = getTokenExpiry(t);
      if (exp && exp < Date.now()) doLogout();
    };
    const id = setInterval(check, 60_000);
    check(); // also run immediately on mount
    return () => clearInterval(id);
  }, []);

  // 401 interceptor — catches expired tokens during active API calls
  useEffect(() => {
    let isRedirecting = false;
    const interceptor = axios.interceptors.response.use(
      res => res,
      err => {
        if (err.response?.status === 401 && !isRedirecting) {
          isRedirecting = true;
          doLogout();
        }
        return Promise.reject(err);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  const isTokenValid = token && token.trim() !== "";

  // ── Income ────────────────────────────────────────────────────

  const addIncome = async (income) => {
    if (!isTokenValid) return toast.error("Not authenticated.");
    try {
      await axios.post(`${V1_URL}add-income`, income, getAuthHeaders());
      toast.success("Income added!");
      getIncomes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add income');
    }
  };

  const getIncomes = async (params = {}) => {
    if (!isTokenValid) return;
    try {
      const response = await axios.get(`${V1_URL}get-incomes`, { ...getAuthHeaders(), params });
      // Handle both paginated {data, total} and legacy array response
      setIncomes(response.data.data ?? response.data);
      return response.data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch incomes');
    }
  };

  const updateIncome = async (id, updatedData) => {
    if (!isTokenValid) return toast.error("Not authenticated.");
    try {
      await axios.put(`${V1_URL}update-income/${id}`, updatedData, getAuthHeaders());
      toast.success("Income updated!");
      getIncomes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update income');
    }
  };

  const deleteIncome = async (id) => {
    if (!isTokenValid) return toast.error("Not authenticated.");
    try {
      await axios.delete(`${V1_URL}delete-income/${id}`, getAuthHeaders());
      toast.success("Income deleted.");
      getIncomes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete income');
    }
  };

  const totalIncome = () => incomes.reduce((total, income) => total + income.amount, 0);

  // ── Expenses ──────────────────────────────────────────────────

  const addExpense = async (expense) => {
    if (expense.amount <= 0) return toast.error("Amount must be a positive number!");
    if (!isTokenValid) return toast.error("Not authenticated.");
    try {
      await axios.post(`${V1_URL}add-expense`, expense, getAuthHeaders());
      toast.success("Expense added!");
      getExpenses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add expense');
    }
  };

  const getExpenses = async (params = {}) => {
    if (!isTokenValid) return;
    try {
      const response = await axios.get(`${V1_URL}get-expenses`, { ...getAuthHeaders(), params });
      setExpenses(response.data.data ?? response.data);
      return response.data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch expenses');
    }
  };

  const updateExpense = async (id, updatedData) => {
    if (!isTokenValid) return toast.error("Not authenticated.");
    try {
      await axios.put(`${V1_URL}update-expense/${id}`, updatedData, getAuthHeaders());
      toast.success("Expense updated!");
      getExpenses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update expense');
    }
  };

  const deleteExpense = async (id) => {
    if (!isTokenValid) return toast.error("Not authenticated.");
    try {
      await axios.delete(`${V1_URL}delete-expense/${id}`, getAuthHeaders());
      toast.success("Expense deleted.");
      getExpenses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete expense');
    }
  };

  const totalExpenses = () => expenses.reduce((total, expense) => total + expense.amount, 0);
  const totalBalance = () => totalIncome() - totalExpenses();

  const transactionHistory = () => {
    const history = [...incomes, ...expenses];
    history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return history.slice(0, 5);
  };

  // ── Budgets ───────────────────────────────────────────────────

  const getBudgets = async (month) => {
    if (!isTokenValid) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/v1/budgets`, { ...getAuthHeaders(), params: { month } });
      setBudgets(response.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch budgets');
    }
  };

  const saveBudget = async ({ category, limit, month }) => {
    if (!isTokenValid) return toast.error("Not authenticated.");
    try {
      await axios.post(`${API_BASE_URL}/v1/budgets`, { category, limit, month }, getAuthHeaders());
      toast.success("Budget saved!");
      getBudgets(month);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save budget');
    }
  };

  const deleteBudget = async (id, month) => {
    if (!isTokenValid) return toast.error("Not authenticated.");
    try {
      await axios.delete(`${API_BASE_URL}/v1/budgets/${id}`, getAuthHeaders());
      toast.success("Budget removed.");
      getBudgets(month);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete budget');
    }
  };

  // ── Admin / User Management ───────────────────────────────────

  const getUsers = async () => {
    try {
      const response = await axios.get(`${ADMIN_URL}get-users`, getAuthHeaders());
      setUsers(response.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Server Error");
    }
  };

  const addUser = async (newUser) => {
    if (!newUser.username || !newUser.email || !newUser.password) {
      return toast.error("All fields are required");
    }
    try {
      const response = await axios.post(`${ADMIN_URL}add-users`, newUser, getAuthHeaders());
      setUsers([...users, response.data]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error adding user");
    }
  };

  const deleteUser = async (id) => {
    try {
      await axios.delete(`${ADMIN_URL}delete-users/${id}`, getAuthHeaders());
      setUsers(users.filter((user) => user._id !== id));
    } catch (err) {
      toast.error("Error deleting user");
    }
  };

  const fetchUserTransactions = async (userId) => {
    try {
      const response = await axios.get(`${ADMIN_URL}get-user-transactions/${userId}`, getAuthHeaders());
      setTransactions(response.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "An error occurred while fetching transactions.");
    }
  };

  // ── Profile ───────────────────────────────────────────────────

  const updateProfile = async (data) => {
    if (!isTokenValid) return toast.error("Not authenticated.");
    try {
      const response = await axios.put(`${ADMIN_URL}profile`, data, getAuthHeaders());
      toast.success("Profile updated successfully!");
      if (data.username) localStorage.setItem("username", data.username);
      return response.data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
  };

  // ── Auth (Forgot/Reset Password) ──────────────────────────────

  const forgotPassword = async (email) => {
    try {
      await axios.post(`${AUTH_URL}forgot-password`, { email });
      toast.success("If that email exists, a reset link has been sent.");
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error sending reset email');
    }
  };

  const resetPassword = async (token, userId, newPassword) => {
    try {
      await axios.post(`${AUTH_URL}reset-password`, { token, userId, newPassword });
      toast.success("Password reset! Please log in.");
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired token');
      return false;
    }
  };

  // ── AI Suggestions ────────────────────────────────────────────

  const fetchSuggestions = async (balance, income, expenses) => {
    try {
      const response = await axios.post(`${V1_URL}get-suggestions`, { balance, income, expenses }, getAuthHeaders());
      return response.data;
    } catch (error) {
      toast.error("Error fetching suggestions.");
      throw error;
    }
  };

  const saveSuggestions = async (suggestionsArray) => {
    try {
      await axios.post(`${V1_URL}saveSuggestions`, { suggestions: suggestionsArray, itemsUsedCount: suggestionsArray.length }, getAuthHeaders());
    } catch (error) {
      console.error("Failed to save suggestions:", error);
    }
  };

  // ── Token ─────────────────────────────────────────────────────

  const setTokenAndSave = (newToken) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);
  };

  return (
    <GlobalContext.Provider value={{
      addIncome, getIncomes, updateIncome, incomes, deleteIncome,
      expenses, totalIncome, addExpense, getExpenses, updateExpense,
      deleteExpense, totalExpenses, totalBalance, transactionHistory,
      error, setError,
      token, setTokenAndSave,
      getUsers, users, addUser, deleteUser, fetchUserTransactions, transactions,
      budgets, getBudgets, saveBudget, deleteBudget,
      fetchSuggestions, saveSuggestions,
      updateProfile, forgotPassword, resetPassword,
      darkMode, toggleDarkMode,
    }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);
