import React, { useState, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import * as XLSX from 'xlsx';
import { useGlobalContext } from '../../context/globalContext';
import Pagination from '../Pagination/Pagination';

function AllHistory() {
    const { incomes, expenses } = useGlobalContext();
    const [showSeparate, setShowSeparate] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState({
        startDate: '',
        endDate: ''
    });

    // Pagination states
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [expensePage, setExpensePage] = useState(1);
    const [incomePage, setIncomePage] = useState(1);

    // Clear date range filter
    const clearDateFilter = () => {
        setDateFilter({
            startDate: '',
            endDate: ''
        });
        setPage(1);
    };

    // Filter by date range and search term
    const filterTransactions = useCallback((transactionsList) => {
        const { startDate, endDate } = dateFilter;
        const query = searchQuery.trim().toLowerCase();

        return transactionsList.filter(transaction => {
            // Search query filter
            if (query) {
                const titleMatch = transaction.title?.toLowerCase().includes(query);
                const categoryMatch = transaction.category?.toLowerCase().includes(query);
                const descMatch = transaction.description?.toLowerCase().includes(query);
                if (!titleMatch && !categoryMatch && !descMatch) return false;
            }

            // Date range filter
            if (!startDate && !endDate) return true;
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
    }, [dateFilter, searchQuery]);

    // Download function for Excel
    const downloadToExcel = (data, filename) => {
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

    // Sort transactions chronologically (newest first)
    const allCombined = useMemo(() => {
        return [...expenses, ...incomes].sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [expenses, incomes]);

    const filteredCombinedTransactions = useMemo(() => filterTransactions(allCombined), [allCombined, filterTransactions]);
    const filteredExpenses = useMemo(() => filterTransactions([...expenses].sort((a, b) => new Date(b.date) - new Date(a.date))), [expenses, filterTransactions]);
    const filteredIncomes = useMemo(() => filterTransactions([...incomes].sort((a, b) => new Date(b.date) - new Date(a.date))), [incomes, filterTransactions]);

    // Paginated slices
    const paginatedCombined = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filteredCombinedTransactions.slice(start, start + pageSize);
    }, [filteredCombinedTransactions, page, pageSize]);

    const paginatedExpenses = useMemo(() => {
        const start = (expensePage - 1) * pageSize;
        return filteredExpenses.slice(start, start + pageSize);
    }, [filteredExpenses, expensePage, pageSize]);

    const paginatedIncomes = useMemo(() => {
        const start = (incomePage - 1) * pageSize;
        return filteredIncomes.slice(start, start + pageSize);
    }, [filteredIncomes, incomePage, pageSize]);

    return (
        <AllHistoryStyled>
            <div className="header-bar">
                <h2>All Transactions History</h2>
                <p className="subtitle">Track, filter, search, and export all your financial movements</p>
            </div>

            {/* Search and Filters Bar */}
            <div className="filters-card">
                <div className="search-box">
                    <i className="fa-solid fa-magnifying-glass search-icon"></i>
                    <input
                        type="text"
                        placeholder="Search by title, category, or note..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setPage(1);
                        }}
                    />
                    {searchQuery && (
                        <button className="clear-search-btn" onClick={() => setSearchQuery('')}>✕</button>
                    )}
                </div>

                <div className="date-filter-group">
                    <div className="date-field">
                        <span>From:</span>
                        <input
                            type="date"
                            value={dateFilter.startDate}
                            onChange={(e) => {
                                setDateFilter(prev => ({ ...prev, startDate: e.target.value }));
                                setPage(1);
                            }}
                        />
                    </div>
                    <div className="date-field">
                        <span>To:</span>
                        <input
                            type="date"
                            value={dateFilter.endDate}
                            onChange={(e) => {
                                setDateFilter(prev => ({ ...prev, endDate: e.target.value }));
                                setPage(1);
                            }}
                        />
                    </div>
                    {(dateFilter.startDate || dateFilter.endDate) && (
                        <button
                            type="button"
                            className="clear-date-btn"
                            onClick={clearDateFilter}
                            title="Reset date range"
                        >
                            Reset Dates
                        </button>
                    )}
                </div>
            </div>

            {/* Action Buttons & View Mode Toggle */}
            <div className="actions-toolbar">
                <div className="view-toggle">
                    <button
                        type="button"
                        className={`toggle-tab ${!showSeparate ? 'active' : ''}`}
                        onClick={() => setShowSeparate(false)}
                    >
                        Combined View
                    </button>
                    <button
                        type="button"
                        className={`toggle-tab ${showSeparate ? 'active' : ''}`}
                        onClick={() => setShowSeparate(true)}
                    >
                        Split Columns
                    </button>
                </div>

                <div className="download-group">
                    <button
                        type="button"
                        className="export-btn all"
                        onClick={() => downloadToExcel(filteredCombinedTransactions, 'all_transactions')}
                    >
                        <i className="fa-solid fa-file-excel"></i> Export All
                    </button>
                    <button
                        type="button"
                        className="export-btn expense"
                        onClick={() => downloadToExcel(filteredExpenses, 'expenses')}
                    >
                        <i className="fa-solid fa-download"></i> Expenses
                    </button>
                    <button
                        type="button"
                        className="export-btn income"
                        onClick={() => downloadToExcel(filteredIncomes, 'incomes')}
                    >
                        <i className="fa-solid fa-download"></i> Incomes
                    </button>
                </div>
            </div>

            {showSeparate ? (
                <div className="history-container">
                    {/* Expenses Section */}
                    <div className="history-section expense-card">
                        <div className="section-header">
                            <h3 id="expenseh3"><i className="fa-solid fa-arrow-down"></i> Expenses ({filteredExpenses.length})</h3>
                        </div>
                        {filteredExpenses.length === 0 ? (
                            <div className="empty-box">
                                <i className="fa-solid fa-receipt"></i>
                                <p>No matching expenses found</p>
                            </div>
                        ) : (
                            <>
                                <div className="table-wrapper">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Title</th>
                                                <th>Category</th>
                                                <th>Date</th>
                                                <th>Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedExpenses.map(({ _id, title, amount, category, description, date }) => (
                                                <tr key={_id}>
                                                    <td>
                                                        <div className="tx-title">{title}</div>
                                                        {description && <div className="tx-desc">{description}</div>}
                                                    </td>
                                                    <td>
                                                        <span className="badge category-badge">{category || 'General'}</span>
                                                    </td>
                                                    <td>{new Date(date).toLocaleDateString()}</td>
                                                    <td>
                                                        <span className="amount-badge expense">-${Math.abs(amount)}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <Pagination
                                    currentPage={expensePage}
                                    totalItems={filteredExpenses.length}
                                    pageSize={pageSize}
                                    onPageChange={setExpensePage}
                                    onPageSizeChange={setPageSize}
                                />
                            </>
                        )}
                    </div>

                    {/* Incomes Section */}
                    <div className="history-section income-card">
                        <div className="section-header">
                            <h3 id="incomeh3"><i className="fa-solid fa-arrow-up"></i> Incomes ({filteredIncomes.length})</h3>
                        </div>
                        {filteredIncomes.length === 0 ? (
                            <div className="empty-box">
                                <i className="fa-solid fa-wallet"></i>
                                <p>No matching incomes found</p>
                            </div>
                        ) : (
                            <>
                                <div className="table-wrapper">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Title</th>
                                                <th>Category</th>
                                                <th>Date</th>
                                                <th>Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedIncomes.map(({ _id, title, amount, category, description, date }) => (
                                                <tr key={_id}>
                                                    <td>
                                                        <div className="tx-title">{title}</div>
                                                        {description && <div className="tx-desc">{description}</div>}
                                                    </td>
                                                    <td>
                                                        <span className="badge category-badge">{category || 'General'}</span>
                                                    </td>
                                                    <td>{new Date(date).toLocaleDateString()}</td>
                                                    <td>
                                                        <span className="amount-badge income">+${Math.abs(amount)}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <Pagination
                                    currentPage={incomePage}
                                    totalItems={filteredIncomes.length}
                                    pageSize={pageSize}
                                    onPageChange={setIncomePage}
                                    onPageSizeChange={setPageSize}
                                />
                            </>
                        )}
                    </div>
                </div>
            ) : (
                <div className="history-section combined-card">
                    {filteredCombinedTransactions.length === 0 ? (
                        <div className="empty-box">
                            <i className="fa-solid fa-folder-open"></i>
                            <p>No transactions match your current search or date criteria.</p>
                        </div>
                    ) : (
                        <>
                            <div className="table-wrapper">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Type</th>
                                            <th>Title & Reference</th>
                                            <th>Category</th>
                                            <th>Date</th>
                                            <th>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedCombined.map((transaction) => {
                                            const { _id, title, amount, category, description, date } = transaction;
                                            const isExpense = expenses.some(item => item._id === _id);

                                            return (
                                                <tr key={_id}>
                                                    <td>
                                                        <span className={`type-tag ${isExpense ? 'expense' : 'income'}`}>
                                                            {isExpense ? 'Expense' : 'Income'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="tx-title">{title}</div>
                                                        {description && <div className="tx-desc">{description}</div>}
                                                    </td>
                                                    <td>
                                                        <span className="badge category-badge">{category || 'Uncategorized'}</span>
                                                    </td>
                                                    <td>{new Date(date).toLocaleDateString()}</td>
                                                    <td>
                                                        <span className={`amount-badge ${isExpense ? 'expense' : 'income'}`}>
                                                            {isExpense ? `-${Math.abs(amount)}` : `+${Math.abs(amount)}`}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <Pagination
                                currentPage={page}
                                totalItems={filteredCombinedTransactions.length}
                                pageSize={pageSize}
                                onPageChange={setPage}
                                onPageSizeChange={setPageSize}
                            />
                        </>
                    )}
                </div>
            )}
        </AllHistoryStyled>
    );
}

const AllHistoryStyled = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.5rem;
    width: 100%;

    @media (max-width: 768px) {
        padding: 0.5rem 0.2rem;
        gap: 1rem;
    }

    .header-bar {
        text-align: center;
        h2 {
            font-size: clamp(1.4rem, 3vw, 2rem);
            color: #222260;
            font-weight: 800;
        }
        .subtitle {
            color: rgba(34, 34, 96, 0.6);
            font-size: 0.95rem;
            margin-top: 0.3rem;
        }
    }

    .filters-card {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(10px);
        padding: 1rem 1.25rem;
        border-radius: 18px;
        border: 2px solid #FFFFFF;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
        flex-wrap: wrap;

        @media (max-width: 900px) {
            flex-direction: column;
            align-items: stretch;
            padding: 0.8rem;
        }

        .search-box {
            display: flex;
            align-items: center;
            background: #f8fafc;
            border: 1.5px solid #e2e8f0;
            border-radius: 12px;
            padding: 0.5rem 0.8rem;
            flex: 1;
            min-width: 250px;
            transition: all 0.2s ease;

            &:focus-within {
                border-color: #6366f1;
                box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
            }

            .search-icon {
                color: #94a3b8;
                margin-right: 0.6rem;
                font-size: 0.95rem;
            }

            input {
                border: none;
                background: transparent;
                outline: none;
                width: 100%;
                font-size: 0.95rem;
                color: #1e293b;

                &::placeholder {
                    color: #94a3b8;
                }
            }

            .clear-search-btn {
                background: none;
                border: none;
                color: #94a3b8;
                cursor: pointer;
                font-size: 0.85rem;
                padding: 0 0.2rem;
                &:hover {
                    color: #475569;
                }
            }
        }

        .date-filter-group {
            display: flex;
            align-items: center;
            gap: 0.8rem;
            flex-wrap: wrap;

            .date-field {
                display: flex;
                align-items: center;
                gap: 0.4rem;
                font-size: 0.88rem;
                font-weight: 600;
                color: #475569;

                input {
                    padding: 0.45rem 0.6rem;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 10px;
                    background: #f8fafc;
                    font-size: 0.88rem;
                    color: #1e293b;
                    outline: none;

                    &:focus {
                        border-color: #6366f1;
                    }
                }
            }

            .clear-date-btn {
                background: #fee2e2;
                color: #ef4444;
                border: 1px solid #fecaca;
                border-radius: 8px;
                padding: 0.45rem 0.8rem;
                font-size: 0.82rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;

                &:hover {
                    background: #fecaca;
                }
            }
        }
    }

    .actions-toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        flex-wrap: wrap;

        .view-toggle {
            display: inline-flex;
            background: rgba(226, 232, 240, 0.7);
            padding: 4px;
            border-radius: 12px;

            .toggle-tab {
                border: none;
                background: transparent;
                padding: 0.5rem 1rem;
                border-radius: 9px;
                font-weight: 600;
                font-size: 0.9rem;
                color: #64748b;
                cursor: pointer;
                transition: all 0.2s ease;

                &.active {
                    background: #ffffff;
                    color: #222260;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
                }
            }
        }

        .download-group {
            display: flex;
            gap: 0.6rem;
            flex-wrap: wrap;

            .export-btn {
                display: flex;
                align-items: center;
                gap: 0.4rem;
                padding: 0.55rem 1rem;
                border-radius: 10px;
                font-size: 0.88rem;
                font-weight: 600;
                cursor: pointer;
                border: 1px solid transparent;
                transition: all 0.2s ease;

                &.all {
                    background: #e0e7ff;
                    color: #4338ca;
                    border-color: #c7d2fe;
                    &:hover { background: #c7d2fe; }
                }

                &.expense {
                    background: #fee2e2;
                    color: #b91c1c;
                    border-color: #fecaca;
                    &:hover { background: #fecaca; }
                }

                &.income {
                    background: #dcfce7;
                    color: #15803d;
                    border-color: #bbf7d0;
                    &:hover { background: #bbf7d0; }
                }
            }
        }
    }

    .history-container {
        display: flex;
        gap: 1.5rem;
        width: 100%;

        @media (max-width: 992px) {
            flex-direction: column;
        }
    }

    .history-section {
        background: rgba(255, 255, 255, 0.85);
        backdrop-filter: blur(10px);
        border: 2px solid #FFFFFF;
        border-radius: 20px;
        padding: 1.5rem;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
        width: 100%;

        @media (max-width: 576px) {
            padding: 0.8rem 0.5rem;
            border-radius: 16px;
        }

        .section-header {
            margin-bottom: 1rem;
            h3 {
                font-size: 1.25rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-weight: 700;
            }
            #expenseh3 { color: #dc2626; }
            #incomeh3 { color: #16a34a; }
        }

        .empty-box {
            text-align: center;
            padding: 3rem 1rem;
            color: #94a3b8;

            i {
                font-size: 2.8rem;
                margin-bottom: 0.8rem;
                opacity: 0.6;
            }

            p {
                font-size: 1rem;
                font-weight: 500;
            }
        }

        .table-wrapper {
            width: 100%;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
        }

        table {
            width: 100%;
            min-width: 540px;
            border-collapse: separate;
            border-spacing: 0;
            font-size: 0.92rem;

            thead tr {
                background: #f8fafc;
            }

            th {
                padding: 0.8rem 1rem;
                text-align: left;
                font-size: 0.82rem;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                color: #64748b;
                font-weight: 700;
                border-bottom: 1.5px solid #e2e8f0;

                &:first-child { border-top-left-radius: 10px; }
                &:last-child { border-top-right-radius: 10px; }
            }

            tbody tr {
                transition: background 0.15s ease;
                &:hover {
                    background: rgba(241, 245, 249, 0.7);
                }
            }

            td {
                padding: 0.85rem 1rem;
                border-bottom: 1px solid #f1f5f9;
                color: #334155;
                vertical-align: middle;
            }

            .tx-title {
                font-weight: 600;
                color: #1e293b;
            }

            .tx-desc {
                font-size: 0.8rem;
                color: #64748b;
                margin-top: 0.2rem;
            }

            .type-tag {
                display: inline-block;
                padding: 0.2rem 0.55rem;
                border-radius: 6px;
                font-size: 0.75rem;
                font-weight: 700;
                text-transform: uppercase;

                &.income {
                    background: #dcfce7;
                    color: #15803d;
                }
                &.expense {
                    background: #fee2e2;
                    color: #b91c1c;
                }
            }

            .category-badge {
                display: inline-block;
                background: #f1f5f9;
                color: #475569;
                padding: 0.25rem 0.6rem;
                border-radius: 8px;
                font-size: 0.82rem;
                font-weight: 500;
                text-transform: capitalize;
            }

            .amount-badge {
                font-weight: 700;
                font-size: 1rem;

                &.income {
                    color: #16a34a;
                }
                &.expense {
                    color: #dc2626;
                }
            }
        }
    }
`;

export default AllHistory;