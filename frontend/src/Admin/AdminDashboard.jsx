import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobalContext } from "../context/globalContext";
import * as XLSX from "xlsx";
import axios from "axios";
import { API_BASE_URL } from "../config";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const { getUsers, users, addUser, deleteUser, fetchUserTransactions, transactions } = useGlobalContext();
  const navigate = useNavigate();

  const [newUser, setNewUser] = useState({ username: "", email: "", password: "" });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showTransactions, setShowTransactions] = useState(false);
  const [reportType, setReportType] = useState("yearly");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [combinedView, setCombinedView] = useState(true);
  const [emailDetails, setEmailDetails] = useState({
    email: "",
    subject: "",
    message: "",
  });
  
  useEffect(() => {
    getUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEmailChange = (e) => {
    setEmailDetails({ ...emailDetails, [e.target.name]: e.target.value });
  };
  
  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUser.username || !newUser.email || !newUser.password) {
      alert("All fields are required!");
      return;
    }
    addUser(newUser);
    setNewUser({ username: "", email: "", password: "" });
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      await deleteUser(userId);
      getUsers();
    }
  };

  const handleShowTransactions = async (userId) => {
    fetchUserTransactions(userId);
    const user = users.find(user => user._id === userId);
    setSelectedUser(user);
    setShowTransactions(true);
    setReportType("yearly"); // Display yearly report by default
  };

  const handleCloseTransactions = () => {
    setShowTransactions(false);
    setFromDate("");
    setToDate("");
  };

  const handleGenerateReport = (type) => {
    setReportType(type);
    setFromDate("");
    setToDate("");
  };

  const filterTransactionsByDate = (transactionsList, type) => {
    if (!Array.isArray(transactionsList)) return [];
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      return transactionsList.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= from && transactionDate <= to;
      });
    }

    const now = new Date();
    let startDate;

    switch (type) {
      case "weekly":
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case "monthly":
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case "yearly":
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = now;
    }

    return transactionsList.filter(transaction => new Date(transaction.date) >= startDate);
  };

  const combinedTransactions = () => {
    if (!transactions?.expenses || !transactions?.incomes) return [];
    const allTransactions = [...transactions.expenses, ...transactions.incomes];
    return allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const downloadExcelReport = (data, type, customUsername = null) => {
    if (!data || data.length === 0) {
      alert("No transactions available to download for this report.");
      return;
    }
    const targetUsername = customUsername || selectedUser?.username || "User";
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${type} Report`);
    XLSX.writeFile(wb, `${targetUsername}_${type}_report.xlsx`);
  };

  const handleDownloadUserReport = async (user) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE_URL}/users/get-user-transactions/${user._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const userTransactions = response.data;
      const allTx = [
        ...(userTransactions?.expenses || []),
        ...(userTransactions?.incomes || []),
      ].sort((a, b) => new Date(b.date) - new Date(a.date));

      if (allTx.length === 0) {
        alert(`No transactions found for user ${user.username}`);
        return;
      }
      downloadExcelReport(allTx, "All_Transactions", user.username);
    } catch (err) {
      alert("Error fetching user transactions for report");
    }
  };

  const sendEmail = async (e) => {
    e.preventDefault();
  
    if (!emailDetails.email || !emailDetails.subject || !emailDetails.message) {
      alert("All fields are required!");
      return;
    }
  
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailDetails.email)) {
      alert("Please enter a valid email address!");
      return;
    }
  
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          to: emailDetails.email,
          subject: emailDetails.subject,
          text: emailDetails.message,
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        alert("Email sent successfully!");
        setEmailDetails({ email: "", subject: "", message: "" });
      } else {
        alert(data.message || "Failed to send email.");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Something went wrong. Please try again.");
    }
  };
  
  return (
    <div className="admin-dashboard">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2>Admin Dashboard</h2>
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            backgroundColor: "#222260",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "0.6rem 1.2rem",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "0.95rem"
          }}
        >
          ← Back to Dashboard
        </button>
      </div>

      <div>
        <h3>Add New User</h3>
        <form onSubmit={handleAddUser}>
          <input type="text" placeholder="Username" value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} />
          <input type="email" placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
          <input type="password" placeholder="Password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
          <button type="submit">Add User</button>
        </form>
      </div>
      
      <div>
        <h3>Send Email to User</h3>
        <form onSubmit={sendEmail}>
          <input
            type="email"
            name="email"
            placeholder="User Email"
            value={emailDetails.email}
            onChange={handleEmailChange}
          />
          <input
            type="text"
            name="subject"
            placeholder="Subject"
            value={emailDetails.subject}
            onChange={handleEmailChange}
          />
          <textarea
            name="message"
            placeholder="Message"
            value={emailDetails.message}
            onChange={handleEmailChange}
          ></textarea>
          <button type="submit">Send Email</button>
        </form>
      </div>

      <div>
  <h3>Users List</h3>
  {users.length === 0 ? (
    <p>No users found</p>
  ) : (
    <div style={{ maxHeight: "400px", overflowY: "auto", border: "1px solid #ccc", borderRadius: "8px" }}>
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>
                <button onClick={() => handleDeleteUser(user._id)}>Delete</button>
                <button onClick={() => handleShowTransactions(user._id)}>View Transactions</button>
                <button
                  onClick={() => {
                    setEmailDetails({ ...emailDetails, email: user.email });
                    const emailForm = document.querySelector(".admin-dashboard form");
                    if (emailForm) {
                      emailForm.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                >
                  Email User
                </button>
                <button onClick={() => handleDownloadUserReport(user)}>
                  Download Report
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>


      {showTransactions && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Transactions for {selectedUser?.username}</h3>
            <button className="close-modal-btn" onClick={handleCloseTransactions}>Close</button>

            <div>
              <button onClick={() => handleGenerateReport("weekly")}>Weekly</button>
              <button onClick={() => handleGenerateReport("monthly")}>Monthly</button>
              <button onClick={() => handleGenerateReport("yearly")}>Yearly</button>
              <button onClick={() => setCombinedView(!combinedView)}>
                {combinedView ? "Show Separately" : "Show Combined"}
              </button>
              <button onClick={() => downloadExcelReport(
                filterTransactionsByDate(combinedView ? combinedTransactions() : [...(transactions.incomes || []), ...(transactions.expenses || [])], reportType),
                reportType
              )}>
                Download Excel
              </button>
            </div>

            {combinedView ? (
              <TransactionTable title="Combined Transactions" transactions={filterTransactionsByDate(combinedTransactions(), reportType)} />
            ) : (
              <>
                <TransactionTable title="Income Transactions" transactions={filterTransactionsByDate(transactions.incomes || [], reportType)} />
                <TransactionTable title="Expense Transactions" transactions={filterTransactionsByDate(transactions.expenses || [], reportType)} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const TransactionTable = ({ title, transactions }) => (
  <div>
    <h4>{title}</h4>
    <div className="transaction-table-container">
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Category</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction._id}>
              <td>{transaction.title}</td>
              <td>{transaction.type}</td>
              <td>${transaction.amount}</td>
              <td>{new Date(transaction.date).toLocaleDateString()}</td>
              <td>{transaction.category}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default AdminDashboard;