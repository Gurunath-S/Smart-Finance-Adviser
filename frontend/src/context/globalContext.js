import React, { useContext, useState, useEffect, useCallback } from "react";
import axios from 'axios';
import { API_BASE_URL } from "../config";

// Base URLs for different route groups
const V1_URL = `${API_BASE_URL}/v1/`;   // income, expenses, suggestions
const ADMIN_URL = `${API_BASE_URL}/users/`; // user management

const GlobalContext = React.createContext();

export const GlobalProvider = ({ children }) => {
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(localStorage.getItem("token")));
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // Validate session on app launch via /api/auth/me (HTTP-only Cookie or Bearer Token)
  const checkAuthSession = useCallback(async () => {
    setIsAuthChecking(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/me`);
      if (response.data?.user) {
        setCurrentUser(response.data.user);
        setIsAuthenticated(true);
        localStorage.setItem("username", response.data.user.username || "");
        localStorage.setItem("role", response.data.user.role || "user");
        localStorage.setItem("profileImage", response.data.user.profileImage || "");
        return response.data.user;
      }
    } catch (err) {
      setCurrentUser(null);
      setIsAuthenticated(false);
      setToken(null);
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("role");
      localStorage.removeItem("profileImage");
    } finally {
      setIsAuthChecking(false);
    }
  }, []);

  useEffect(() => {
    checkAuthSession();
  }, [checkAuthSession]);

  // Logout session from both server (clears cookie) and client
  const logoutSession = async () => {
    try {
      await axios.post(`${API_BASE_URL}/auth/logout`);
    } catch (e) {
      // Ignore network errors on logout
    }
    setCurrentUser(null);
    setIsAuthenticated(false);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("profileImage");
  };

  // Helper function to add token to headers (fallback when cookies are partitioned)
  const getAuthHeaders = () => {
    const currentToken = token || localStorage.getItem("token");
    const headers = {};
    if (currentToken) {
      headers.Authorization = `Bearer ${currentToken}`;
    }
    return { headers };
  };

  // Check if session is authenticated
  const checkToken = () => {
    const currentToken = token || localStorage.getItem("token");
    return Boolean(isAuthenticated || (currentToken && currentToken.trim() !== ""));
  };

  // Add Income function
  const addIncome = async (income) => {
    if (!checkToken()) {
      setError("Authorization token is missing or invalid.");
      return false;
    }
    try {
      await axios.post(`${V1_URL}add-income`, income, getAuthHeaders());
      await getIncomes();
      setError(null);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Server Error');
      return false;
    }
  };

  // Get Incomes function
  const getIncomes = async () => {
    if (!checkToken()) {
      setError("Authorization token is missing or invalid.");
      return;
    }
    try {
      const response = await axios.get(`${V1_URL}get-incomes`, getAuthHeaders());
      setIncomes(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Server Error');
    }
  };

  // Delete Income function
  const deleteIncome = async (id) => {
    if (!checkToken()) {
      setError("Authorization token is missing or invalid.");
      return;
    }
    try {
      await axios.delete(`${V1_URL}delete-income/${id}`, getAuthHeaders());
      await getIncomes();
    } catch (err) {
      setError(err.response?.data?.message || 'Server Error');
    }
  };

  // Total Income calculation
  const totalIncome = () => {
    return incomes.reduce((total, income) => total + income.amount, 0);
  };

  // Add Expense function
  const addExpense = async (expense) => {
    if (expense.amount <= 0) {
      setError("Amount must be a positive number!");
      return false;
    }
    if (!checkToken()) {
      setError("Authorization token is missing or invalid.");
      return false;
    }
    try {
      await axios.post(`${V1_URL}add-expense`, expense, getAuthHeaders());
      await getExpenses();
      setError(null);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Server Error');
      return false;
    }
  };

  // Get Expenses function
  const getExpenses = async () => {
    if (!checkToken()) {
      setError("Authorization token is missing or invalid.");
      return;
    }
    try {
      const response = await axios.get(`${V1_URL}get-expenses`, getAuthHeaders());
      setExpenses(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Server Error');
    }
  };

  // Delete Expense function
  const deleteExpense = async (id) => {
    if (!checkToken()) {
      setError("Authorization token is missing or invalid.");
      return;
    }
    try {
      await axios.delete(`${V1_URL}delete-expense/${id}`, getAuthHeaders());
      await getExpenses();
    } catch (err) {
      setError(err.response?.data?.message || 'Server Error');
    }
  };

  // Total Expense calculation
  const totalExpenses = () => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  // Total Balance calculation
  const totalBalance = () => {
    return totalIncome() - totalExpenses();
  };

  // Transaction history — last 5 sorted by date
  const transactionHistory = () => {
    const history = [...incomes, ...expenses];
    history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return history.slice(0, 5);
  };

  // ── Admin / User Management ──────────────────────────────────

  const getUsers = async () => {
    try {
      const response = await axios.get(`${ADMIN_URL}get-users`, getAuthHeaders());
      setUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Server Error");
    }
  };

  const addUser = async (newUser) => {
    if (!newUser.username || !newUser.email || !newUser.password) {
      setError("All fields are required");
      return;
    }
    try {
      const response = await axios.post(`${ADMIN_URL}add-users`, newUser, getAuthHeaders());
      setUsers([...users, response.data]);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Error adding user");
    }
  };

  const deleteUser = async (id) => {
    try {
      await axios.delete(`${ADMIN_URL}delete-users/${id}`, getAuthHeaders());
      setUsers((prev) => prev.filter((user) => user._id !== id));
      setError("");
      return true;
    } catch (err) {
      setError("Error deleting user");
      return false;
    }
  };

  const fetchUserTransactions = async (userId) => {
    try {
      const response = await axios.get(
        `${ADMIN_URL}get-user-transactions/${userId}`,
        getAuthHeaders()
      );
      setTransactions(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred while fetching transactions.");
    }
  };

  // ── AI Suggestions ───────────────────────────────────────────

  const fetchSuggestions = async (balance, income, expenses) => {
    try {
      const response = await axios.post(
        `${V1_URL}get-suggestions`,
        { balance, income, expenses },
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching suggestions:", error.message);
      throw error;
    }
  };

  const saveSuggestions = async (suggestionsArray) => {
    try {
      await axios.post(
        `${V1_URL}saveSuggestions`,
        { suggestions: suggestionsArray, itemsUsedCount: suggestionsArray.length },
        getAuthHeaders()
      );
    } catch (error) {
      console.error("Failed to save suggestions:", error);
    }
  };

  // Set token and store user session
  const setTokenAndSave = (newToken, newUser = null) => {
    if (newToken) {
      setToken(newToken);
      localStorage.setItem("token", newToken);
    }
    if (newUser) {
      setCurrentUser(newUser);
      setIsAuthenticated(true);
      localStorage.setItem("username", newUser.username || "");
      localStorage.setItem("role", newUser.role || "user");
      localStorage.setItem("profileImage", newUser.profileImage || "");
    } else {
      setIsAuthenticated(true);
    }
  };

  return (
    <GlobalContext.Provider
      value={{
        addIncome,
        getIncomes,
        incomes,
        deleteIncome,
        expenses,
        totalIncome,
        addExpense,
        getExpenses,
        deleteExpense,
        totalExpenses,
        totalBalance,
        transactionHistory,
        error,
        setError,
        token,
        setTokenAndSave,
        currentUser,
        isAuthenticated,
        isAuthChecking,
        checkAuthSession,
        logoutSession,
        getUsers,
        users,
        addUser,
        deleteUser,
        fetchUserTransactions,
        transactions,
        fetchSuggestions,
        saveSuggestions,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  return useContext(GlobalContext);
};
