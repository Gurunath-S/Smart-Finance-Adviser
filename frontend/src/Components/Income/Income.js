import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useGlobalContext } from '../../context/globalContext';
import { InnerLayout } from '../../styles/Layouts';
import Form from '../Form/Form';
import IncomeItem from '../IncomeItem/IncomeItem';
import EditTransactionModal from '../EditTransactionModal/EditTransactionModal';
import { exportToCSV } from '../../utils/exportCSV';
import { FiDownload } from 'react-icons/fi';

function Income() {
    const { incomes, getIncomes, deleteIncome, updateIncome, totalIncome, expenses } = useGlobalContext();
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [editItem, setEditItem] = useState(null);
    const [page, setPage] = useState(1);
    const LIMIT = 10;

    useEffect(() => {
        getIncomes({ search, category: categoryFilter, from: fromDate, to: toDate, page, limit: LIMIT });
    }, [search, categoryFilter, fromDate, toDate, page]);

    const handleSaveEdit = async (id, data) => {
        await updateIncome(id, data);
        setEditItem(null);
    };

    const categories = [...new Set(incomes.map(i => i.category))].filter(Boolean);

    return (
        <IncomeStyled>
            <InnerLayout>
                <div className="header-row">
                    <h1>Incomes</h1>
                    <button className="export-btn" onClick={() => exportToCSV(incomes, expenses)}>
                        <FiDownload size={15} /> Export CSV
                    </button>
                </div>

                <h2 className="total-income">
                    Total Income: <span>₹{totalIncome()}</span>
                </h2>

                {/* Filters */}
                <div className="filters">
                    <input
                        type="text" placeholder="🔍 Search by title..."
                        value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                    />
                    <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}>
                        <option value="">All Categories</option>
                        {categories.map(c => <option key={c}>{c}</option>)}
                    </select>
                    <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} title="From date" />
                    <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} title="To date" />
                    {(search || categoryFilter || fromDate || toDate) && (
                        <button className="clear-btn" onClick={() => { setSearch(''); setCategoryFilter(''); setFromDate(''); setToDate(''); setPage(1); }}>
                            ✕ Clear
                        </button>
                    )}
                </div>

                <div className="income-content">
                    <div className="form-container"><Form /></div>
                    <div className="incomes">
                        {incomes.length === 0 && <p className="empty">No incomes found.</p>}
                        {incomes.map((income) => {
                            const { _id, title, amount, date, category, description, type } = income;
                            return (
                                <IncomeItem
                                    key={_id} id={_id} title={title} description={description}
                                    amount={amount} date={date} type={type} category={category}
                                    indicatorColor="var(--color-green)"
                                    deleteItem={deleteIncome}
                                    onEdit={() => setEditItem(income)}
                                />
                            );
                        })}

                        {/* Pagination */}
                        <div className="pagination">
                            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                            <span>Page {page}</span>
                            <button disabled={incomes.length < LIMIT} onClick={() => setPage(p => p + 1)}>Next →</button>
                        </div>
                    </div>
                </div>
            </InnerLayout>

            {editItem && (
                <EditTransactionModal
                    item={editItem} type="income"
                    onSave={handleSaveEdit}
                    onClose={() => setEditItem(null)}
                />
            )}
        </IncomeStyled>
    );
}

const IncomeStyled = styled.div`
    display: flex;
    overflow: auto;
    color: var(--text-primary);

    .header-row {
        display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;
        h1 { font-size: 2rem; color: var(--text-heading); }
        .export-btn {
            display: flex; align-items: center; gap: 0.4rem;
            background: #28a745; color: white; border: none; padding: 0.6rem 1.2rem;
            border-radius: 10px; font-size: 0.9rem; font-weight: 600; cursor: pointer;
            &:hover { background: #218838; }
        }
    }

    .total-income {
        display: flex; justify-content: center; align-items: center;
        background: var(--bg-card); border: 2px solid var(--border-color);
        box-shadow: 0px 1px 15px rgba(0, 0, 0, 0.06);
        border-radius: 20px; padding: 1rem; margin: 1rem 0; font-size: 2rem; gap: .5rem;
        transition: background 0.3s, border-color 0.3s;
        span { font-size: 2.5rem; font-weight: 800; color: var(--color-green); }
    }

    .filters {
        display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1.5rem; align-items: center;
        input[type="text"], select, input[type="date"] {
            padding: 0.6rem 0.9rem; border: 2px solid var(--border-light); border-radius: 10px;
            font-size: 0.9rem; background: var(--bg-input); color: var(--text-heading); min-width: 140px;
            transition: background 0.3s, border-color 0.3s;
            &:focus { border-color: var(--primary-color); outline: none; }
        }
        .clear-btn {
            background: var(--border-light); border: none; padding: 0.6rem 1rem; border-radius: 10px;
            cursor: pointer; font-size: 0.85rem; color: var(--text-primary);
            &:hover { background: var(--border-color); }
        }
    }

    .income-content { display: flex; gap: 2rem; .incomes { flex: 1; } }
    .empty { text-align: center; color: var(--text-muted); padding: 2rem; }

    .pagination {
        display: flex; align-items: center; gap: 1rem; justify-content: center; margin-top: 1rem;
        button {
            padding: 0.5rem 1rem; border-radius: 8px; border: 2px solid var(--border-light);
            background: var(--bg-card); cursor: pointer; font-weight: 600; color: var(--text-heading);
            transition: border-color 0.2s;
            &:disabled { opacity: 0.4; cursor: not-allowed; }
            &:hover:not(:disabled) { border-color: var(--primary-color); }
        }
        span { color: var(--text-muted); font-size: 0.9rem; }
    }
`;

export default Income;
