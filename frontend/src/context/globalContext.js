import React, { useContext, useState } from "react";
import axios from 'axios';

const BASE_URL = "https://sfa-backend-1.onrender.com/api/v1/";

const GlobalContext = React.createContext();

export const GlobalProvider = ({ children ,  manId, setManId}) => {
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);  // Store token in local storage or state
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState(null);
  console.log(token);
  
  // Helper function to add token to headers
  const getAuthHeaders = () => {
    return {
      headers: {
        Authorization: `Bearer ${token} || localStorage.getItem("token")` // Include token in Authorization header
      }
    };
  };

  // Check if token is valid
  const isTokenValid = token && token.trim() !== "";

  // Add Income function
  const addIncome = async (income) => {
    if (!isTokenValid) {
      setError("Authorization token is missing or invalid.");
      return;
    }

    const { amount } = income;
    try {
      const response = await axios.post(`${BASE_URL}add-income`, income, getAuthHeaders());
      getIncomes();
    } catch (err) {
      setError(err.response?.data?.message || 'Server is Error');
    }
  };

  // Get Incomes function
  const getIncomes = async () => {
    if (!isTokenValid) {
      setError("Authorization token is missing or invalid.");
      return;
    }

    try {
      const response = await axios.get(`${BASE_URL}get-incomes`, getAuthHeaders());
      setIncomes(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Server Error');
    }
  };

  // Delete Income function
  const deleteIncome = async (id) => {
    if (!isTokenValid) {
      setError("Authorization token is missing or invalid.");
      return;
    }

    try {
      const response = await axios.delete(`${BASE_URL}delete-income/${id}`, getAuthHeaders());
      getIncomes();
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
      return;
    }

    if (!isTokenValid) {
      setError("Authorization token is missing or invalid.");
      return;
    }

    try {
      const response = await axios.post(`${BASE_URL}add-expense`, expense, getAuthHeaders());
      getExpenses();
    } catch (err) {
      setError(err.response?.data?.message || 'Server Error');
    }
  };

  // Get Expenses function
  const getExpenses = async () => {
    if (!isTokenValid) {
      setError("Authorization token is missing or invalid.");
      return;
    }

    try {
      const response = await axios.get(`${BASE_URL}get-expenses`, getAuthHeaders());
      setExpenses(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Server Error');
    }
  };

  // Delete Expense function
  const deleteExpense = async (id) => {
    if (!isTokenValid) {
      setError("Authorization token is missing or invalid.");
      return;
    }

    try {
      const res = await axios.delete(`${BASE_URL}delete-expense/${id}`, getAuthHeaders());
      getExpenses();
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

  // Transaction history
  const transactionHistory = () => {
    const history = [...incomes, ...expenses];
    history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return history.slice(0, 5);
  };


const getUsers = async () => {
    try {
      const response = await axios.get(`${BASE_URL}get-users`, getAuthHeaders());
      setUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Server Error");
    }
  };

  // Add a new user
  const addUser = async (newUser) => {
    if (!newUser.username || !newUser.email || !newUser.password) {
      setError("All fields are required");
      return;
    }

    try {
      const response = await axios.post(`${BASE_URL}add-users`, newUser);
      setUsers([...users, response.data]);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Error adding user");
    }
  };

  // Delete a user
  const deleteUser = async (id) => {
    try {
      await axios.delete(`${BASE_URL}delete-users/${id}`);
      setUsers(users.filter((user) => user._id !== id));
      setError("");
    } catch (err) {
      setError( "Error deleting user");
    }
  };

  const fetchUserTransactions = async (userId) => {
    try {
      const response = await fetch(`${BASE_URL}get-user-transactions/${userId}`, {  // Ensure correct URL
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch user transactions');
      }
  
      const data = await response.json(); // Parse the JSON response
      console.log("📥 Fetched Data:", data);
      setTransactions(data)

    } catch (err) {
      setError(err.message || "An error occurred while fetching transactions.");
    }
};
//sugesstion module

const fetchSuggestions = async (balance, income, expenses) => {
  try {
    console.log("Sending request to backend with:", { balance, income, expenses });
    
    const response = await fetch(`${BASE_URL}get-suggestions`, {  
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ balance, income, expenses })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Backend returned error:", errorData);
      throw new Error(errorData.message || 'Network response was not ok');
    }

    const data = await response.json();
    console.log("Fetched Data:", data);
    return data;
  } catch (error) {
    console.error("Error during fetch:", error.message);
    throw error;
  }
};


const saveSuggestions = async (suggestionsArray) => {
  try {
    const response = await fetch(`${BASE_URL}saveSuggestions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        suggestions: suggestionsArray,
        itemsUsedCount: suggestionsArray.length
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Error saving suggestions:", data.error);
    } else {
      console.log("Suggestions saved successfully.");
    }
  } catch (error) {
    console.error("Failed to save suggestions:", error);
  }
};








  // Set token and store in localStorage
  const setTokenAndSave = (newToken) => {
    setToken(newToken);
    localStorage.setItem("token", newToken); // Store token in localStorage for persistence
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
        token, // Add token to context
        setTokenAndSave, // Add setTokenAndSave to context
        getUsers, // Expose getUsers in context
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
