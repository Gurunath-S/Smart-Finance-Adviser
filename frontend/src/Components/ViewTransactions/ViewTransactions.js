import React, { useState } from 'react';
import styled from 'styled-components';
import * as XLSX from 'xlsx';
import { useGlobalContext } from '../../context/globalContext';

function AllHistory() {
    const { incomes, expenses } = useGlobalContext();
    const [showSeparate, setShowSeparate] = useState(false);
    const [dateFilter, setDateFilter] = useState({
        startDate: '',
        endDate: ''
    });

    // Function to clear date range filter
    const clearDateFilter = () => {
        setDateFilter({
            startDate: '',
            endDate: ''
        });
    };

    // Function to filter transactions based on date range
    const filterTransactionsByDateRange = (transactions) => {
        const { startDate, endDate } = dateFilter;
        
        if (!startDate && !endDate) return transactions;
    
        return transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;
    
            if (start && end) {
                return transactionDate >= start && transactionDate <= end;
            } else if (start) {
                return transactionDate >= start;
            } else if (end) {
                return transactionDate <= end;
            }
    
            return true;
        });
    };

    // Download function for Excel
    const downloadToExcel = (data, filename) => {
        // Transform data for better Excel export
        const exportData = data.map(item => ({
            Title: item.title,
            Description: item.description || 'No description',
            Category: item.category || 'Uncategorized',
            Date: new Date(item.date).toLocaleDateString(),
            Amount: item.amount
        }));
    
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
        
        XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
    };
    // Combined filtered transactions
    const filteredCombinedTransactions = filterTransactionsByDateRange([...expenses, ...incomes]);
    const filteredExpenses = filterTransactionsByDateRange(expenses);
    const filteredIncomes = filterTransactionsByDateRange(incomes);

    return (
        <AllHistoryStyled>
            <h2>All History</h2>
            
            {/* Date Range Filter */}
            <div className="date-filter">
                <div className="date-input-container">
                    <label>
                        From:
                        <input 
                            type="date" 
                            value={dateFilter.startDate}
                            onChange={(e) => setDateFilter(prev => ({
                                ...prev, 
                                startDate: e.target.value
                            }))}
                        />
                    </label>
                    <label>
                        To:
                        <input 
                            type="date" 
                            value={dateFilter.endDate}
                            onChange={(e) => setDateFilter(prev => ({
                                ...prev, 
                                endDate: e.target.value
                            }))}
                        />
                    </label>
                    {(dateFilter.startDate || dateFilter.endDate) && (
                        <button 
                            className="clear-date-btn" 
                            onClick={clearDateFilter}
                            title="Clear Date Range"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* Download Buttons */}
            <div className="download-buttons">
                <button 
                    className="download-btn" 
                    onClick={() => downloadToExcel(filteredCombinedTransactions, 'all_transactions')}
                >
                    Download All Transactions
                </button>
                <button 
                    className="download-btn" 
                    onClick={() => downloadToExcel(filteredExpenses, 'expenses')}
                >
                    Download Expenses
                </button>
                <button 
                    className="download-btn" 
                    onClick={() => downloadToExcel(filteredIncomes, 'incomes')}
                >
                    Download Incomes
                </button>
            </div>

            <button className="toggle-btn" onClick={() => setShowSeparate(!showSeparate)}>
                {showSeparate ? 'Show All in One Table' : 'Show Separately'}
            </button>
            
            {showSeparate ? (
                <div className="history-container">
                    {/* Expenses Section */}
                    {filteredExpenses.length === 0 ? (
    <p className="no-transaction-message">No expenses available</p>
) : (
                    <div className="history-section">
                        <h3 id='expenseh3'>Expenses</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Description</th>
                                    <th>Category</th>
                                    <th>Date</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                            {filteredExpenses.map(({ _id, title, amount, category, description, date }) => (
                                <tr key={_id}>
                                    <td>{title}</td>
                                    <td>{description || "No description"}</td>
                                    <td>{category || "Uncategorized"}</td>
                                    <td>{new Date(date).toLocaleDateString()}</td>
                                    <td style={{ color: 'red' }}>-{Math.abs(amount)}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
)}
                    {/* Incomes Section */}
                    {filteredIncomes.length === 0 ? (
    <p className="no-transaction-message">No incomes available</p>
) : (
                    <div className="history-section">
                        <h3 id='incomeh3'>Incomes</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Description</th>
                                    <th>Category</th>
                                    <th>Date</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                            {filteredIncomes.map(({ _id, title, amount, category, description, date }) => (
                                <tr key={_id}>
                                    <td>{title}</td>
                                    <td>{description || "No description"}</td>
                                    <td>{category || "Uncategorized"}</td>
                                    <td>{new Date(date).toLocaleDateString()}</td>
                                    <td style={{ color: 'var(--color-green)' }}>+{Math.abs(amount)}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                     </div>
                    )}  </div>
            ) : (
                filteredCombinedTransactions.length === 0 ? (
                    <p className="no-transaction-message">No transactions available</p>
                ) : (
                    <div className="history-section">
                        <table>
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Description</th>
                                    <th>Category</th>
                                    <th>Date</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCombinedTransactions.map((transaction) => {
                                    const { _id, title, amount, category, description, date } = transaction;
                                    const isExpense = expenses.some(item => item._id === _id);
                                    
                                    return (
                                        <tr key={_id}>
                                            <td>{title}</td>
                                            <td>{description || "No description"}</td>
                                            <td>{category || "Uncategorized"}</td>
                                            <td>{new Date(date).toLocaleDateString()}</td>
                                            <td style={{ color: isExpense ? 'red' : 'var(--color-green)' }}>
                                                {isExpense ? `-${Math.abs(amount)}` : `+${Math.abs(amount)}`}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )
            )}
        </AllHistoryStyled>
    );
}

const AllHistoryStyled = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    align-items: center;
    padding: 2rem;

    .date-filter {
        display: flex;
        justify-content: center;
        margin-bottom: 1rem;

        .date-input-container {
            display: flex;
            align-items: center;
            gap: 1rem;
            position: relative;
        }

        label {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        input {
            padding: 0.5rem;
            border: 1px solid #ccc;
            border-radius: 4px;
        }

        .clear-date-btn {
            background-color: #ff4d4d;
            color: white;
            border: none;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            position: absolute;
            right: -40px;
            top: 50%;
            transform: translateY(-50%);
            transition: background-color 0.3s ease;

            &:hover {
                background-color: #ff6666;
            }

            &:active {
                background-color: #ff3333;
            }
        }
    }

    .download-buttons {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;
    }

    .download-btn {
        padding: 0.8rem 1.5rem;
        font-size: 1.1rem;
        cursor: pointer;
        background-color: rgb(243, 220, 242);
        color: var(--color-primary);
        border: none;
        border-radius: 12px;
        transition: background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;

        &:hover {
            background-color: pink;
            box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.2);
            transform: translateY(-2px);
        }

        &:active {
            transform: translateY(0);
        }
    }

    #incomeh3 {
        color: green;
        text-align: center;
    }
    #expenseh3 {
        color: red;
        text-align: center;
    }

    .toggle-btn {
        padding: 0.8rem 1.5rem;
        font-size: 1.1rem;
        cursor: pointer;
        background-color: rgb(243, 220, 242);
        color: var(--color-primary);
        border: none;
        border-radius: 12px;
        margin-bottom: 1.5rem;
        transition: background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;

        &:hover {
            background-color: pink;
            box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.2);
            transform: translateY(-2px);
        }

        &:active {
            transform: translateY(0);
        }
    }

    .history-container {
        display: flex;
        gap: 2rem;
        width: 100%;
        justify-content: space-between;

        @media (max-width: 768px) {
            flex-direction: column;
        }
    }

    .history-section {
        flex: 1;
        border-radius: 16px;
        padding: 1.5rem;
        box-shadow: 0px 6px 20px rgba(0, 0, 0, 0.1);
        transition: transform 0.3s ease;

        &:hover {
            transform: translateY(-5px);
        }

        h3 {
            font-size: 1.5rem;
            margin-bottom: 1rem;
            text-align: center;
        }
    }

    table {
        width: 100%;
        border-collapse: collapse;
        background: rgb(243, 220, 242);
        border-radius: 12px;
        overflow: hidden;

        th, td {
            padding: 0.8rem;
            text-align: left;
            border-bottom: 1px solid rgb(15, 122, 230);
        }

        th {
            background: pink;
            font-weight: bold;
        }

        td {
            font-size: 0.95rem;
            color: #444;
            word-break: break-word;
        }

        tbody tr:hover {
            background-color:rgb(228, 200, 245)
        }

        tbody tr:last-child td {
            border-bottom: none;
        }
    }

    td:nth-child(5) {
        font-weight: bold;
    }

    td[style*="color: red"] {
        color: #d9534f !important;
    }

    td[style*="color: var(--color-green)"] {
        color: #5cb85c !important;
    }
    .no-transaction-message {
    text-align: center;
    font-size: 1.2rem;
    font-weight: bold;
    color: gray;
    margin-top: 1rem;
}

`;

export default AllHistory;