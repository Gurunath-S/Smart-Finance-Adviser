import React, { useEffect, useState } from "react";
import { useGlobalContext } from "../context/globalContext";
import * as XLSX from "xlsx";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const { getUsers, users, addUser, deleteUser, fetchUserTransactions, getExpenses, transactions } = useGlobalContext();

  const [newUser, setNewUser] = useState({ username: "", email: "", password: "" });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showTransactions, setShowTransactions] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
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
    getExpenses();
    
  }, [getUsers, getExpenses]);

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

  const handleDeleteUser = (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      deleteUser(userId);
      getUsers();
      window.location.reload();
    }
  };

  const handleShowTransactions = async (userId) => {
    fetchUserTransactions(userId);
    const user = users.find(user => user._id === userId);
    setSelectedUser(user);
    setShowTransactions(true);
    setShowAllTransactions(false);
    console.log(showAllTransactions)
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

  const filterTransactionsByDate = (transactions, type) => {
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      return transactions.filter(transaction => {
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

    return transactions.filter(transaction => new Date(transaction.date) >= startDate);
  };

  const combinedTransactions = () => {
    if (!transactions?.expenses || !transactions?.incomes) return [];
    const allTransactions = [...transactions.expenses, ...transactions.incomes];
    return allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const downloadExcelReport = (data, type) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${type} Report`);
    XLSX.writeFile(wb, `${selectedUser.username}_${type}_report.xlsx`);
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
      const response = await fetch("https://sfa-backend-1.onrender.com/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: emailDetails.email,      // Map 'email' to 'to'
          subject: emailDetails.subject,
          text: emailDetails.message,  // Map 'message' to 'text'
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
      <h2>Admin Dashboard</h2>

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
                    window.scrollTo({
                      top: document.querySelector(".admin-dashboard form[onSubmit='sendEmail']").offsetTop,
                      behavior: "smooth",
                    });
                  }}
                >
                  Email User
                </button>
                <button
                  onClick={() =>
                    downloadExcelReport(
                      filterTransactionsByDate(combinedTransactions(), reportType),
                      "Transactions"
                    )
                  }
                >
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