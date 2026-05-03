import React, { useContext, useState, useCallback } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_BASE_URL } from "../config";

const GlobalContext = React.createContext();

export const GlobalProvider = ({ children }) => {
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);

  // Auth headers helper
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    return {
        headers: { Authorization: `Bearer ${token}` }
    };
  }, []);

  // ── Income ────────────────────────────────────────────────────

  const addIncome = async (income) => {
    try {
      await axios.post(`${API_BASE_URL}/transactions/add-income`, income, getAuthHeaders());
      toast.success("Income added!");
      getIncomes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add income');
    }
  };

  const getIncomes = async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/transactions/get-incomes`, { ...getAuthHeaders(), params });
      setIncomes(response.data.data ?? response.data);
      return response.data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch incomes');
    }
  };

  const updateIncome = async (id, updatedData) => {
    try {
      await axios.put(`${API_BASE_URL}/transactions/update-income/${id}`, updatedData, getAuthHeaders());
      toast.success("Income updated!");
      getIncomes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update income');
    }
  };

  const deleteIncome = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/transactions/delete-income/${id}`, getAuthHeaders());
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
    try {
      await axios.post(`${API_BASE_URL}/transactions/add-expense`, expense, getAuthHeaders());
      toast.success("Expense added!");
      getExpenses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add expense');
    }
  };

  const getExpenses = async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/transactions/get-expenses`, { ...getAuthHeaders(), params });
      setExpenses(response.data.data ?? response.data);
      return response.data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch expenses');
    }
  };

  const updateExpense = async (id, updatedData) => {
    try {
      await axios.put(`${API_BASE_URL}/transactions/update-expense/${id}`, updatedData, getAuthHeaders());
      toast.success("Expense updated!");
      getExpenses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update expense');
    }
  };

  const deleteExpense = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/transactions/delete-expense/${id}`, getAuthHeaders());
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
    try {
      const response = await axios.get(`${API_BASE_URL}/budgets`, { ...getAuthHeaders(), params: { month } });
      setBudgets(response.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch budgets');
    }
  };

  const saveBudget = async ({ category, limit, month }) => {
    try {
      await axios.post(`${API_BASE_URL}/budgets`, { category, limit, month }, getAuthHeaders());
      toast.success("Budget saved!");
      getBudgets(month);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save budget');
    }
  };

  const deleteBudget = async (id, month) => {
    try {
      await axios.delete(`${API_BASE_URL}/budgets/${id}`, getAuthHeaders());
      toast.success("Budget removed.");
      getBudgets(month);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete budget');
    }
  };

  // ── Admin / User Management ───────────────────────────────────

  const getUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/get-users`, getAuthHeaders());
      setUsers(response.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Server Error");
    }
  };

  const addUser = async (newUser) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/users/add-users`, newUser, getAuthHeaders());
      setUsers([...users, response.data]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error adding user");
    }
  };

  const deleteUser = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/users/delete-users/${id}`, getAuthHeaders());
      setUsers(users.filter((user) => user._id !== id));
    } catch (err) {
      toast.error("Error deleting user");
    }
  };

  const fetchUserTransactions = async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/transactions/get-user-transactions/${userId}`, getAuthHeaders());
      setTransactions(response.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "An error occurred while fetching transactions.");
    }
  };

  // ── Profile ───────────────────────────────────────────────────

  const updateProfile = async (data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/users/profile`, data, getAuthHeaders());
      toast.success("Profile updated successfully!");
      return response.data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
  };

  // ── AI Suggestions ────────────────────────────────────────────

  const fetchSuggestions = async (balance, income, expenses) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/suggestions/get-suggestions`, { balance, income, expenses }, getAuthHeaders());
      return response.data;
    } catch (error) {
      toast.error("Error fetching suggestions.");
      throw error;
    }
  };

  const saveSuggestions = async (suggestionsArray) => {
    try {
      await axios.post(`${API_BASE_URL}/suggestions/saveSuggestions`, { suggestions: suggestionsArray, itemsUsedCount: suggestionsArray.length }, getAuthHeaders());
    } catch (error) {
      console.error("Failed to save suggestions:", error);
    }
  };

  return (
    <GlobalContext.Provider value={{
      addIncome, getIncomes, updateIncome, incomes, deleteIncome,
      expenses, totalIncome, addExpense, getExpenses, updateExpense,
      deleteExpense, totalExpenses, totalBalance, transactionHistory,
      getUsers, users, addUser, deleteUser, fetchUserTransactions, transactions,
      budgets, getBudgets, saveBudget, deleteBudget,
      fetchSuggestions, saveSuggestions,
      updateProfile,
    }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);
