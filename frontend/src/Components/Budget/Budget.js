import React, { useState, useEffect } from "react";
import { useGlobalContext } from "../../context/globalContext";
import styled from "styled-components";
import { FiPlusCircle, FiTrash2, FiAlertTriangle, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

const EXPENSE_CATEGORIES = [
    "Food", "Transport", "Entertainment", "Healthcare", "Shopping", "Education", "Utilities", "Other"
];

const getCurrentMonth = () => new Date().toISOString().slice(0, 7);

const Budget = () => {
    const { budgets, getBudgets, saveBudget, deleteBudget } = useGlobalContext();
    const [month, setMonth] = useState(getCurrentMonth());
    const [form, setForm] = useState({ category: "", limit: "" });

    useEffect(() => { getBudgets(month); }, [month]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.category || !form.limit) return;
        await saveBudget({ category: form.category, limit: parseFloat(form.limit), month });
        setForm({ category: "", limit: "" });
    };

    const getStatus = (spent, limit) => {
        const pct = (spent / limit) * 100;
        if (pct >= 100) return "over";
        if (pct >= 80) return "warning";
        return "ok";
    };

    return (
        <BudgetStyled>
            <div className="page-header">
                <h1>Budget Planner</h1>
                <label className="month-picker">
                    <span>Month</span>
                    <input type="month" value={month} onChange={e => setMonth(e.target.value)} />
                </label>
            </div>

            <form className="add-form" onSubmit={handleSubmit}>
                <h3>Set a Budget Limit</h3>
                <div className="form-row">
                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required>
                        <option value="">Select Category</option>
                        {EXPENSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                    <input
                        type="number" placeholder="Monthly limit (₹)"
                        value={form.limit} onChange={e => setForm({ ...form, limit: e.target.value })}
                        min="1" required
                    />
                    <button type="submit">
                        <FiPlusCircle size={16} /> Add Budget
                    </button>
                </div>
            </form>

            {budgets.length === 0 ? (
                <div className="empty">No budgets set for {month}. Add one above to get started.</div>
            ) : (
                <div className="budget-list">
                    {budgets.map(b => {
                        const pct = Math.min((b.spent / b.limit) * 100, 100);
                        const status = getStatus(b.spent, b.limit);
                        const StatusIcon = status === 'over' ? FiAlertTriangle
                            : status === 'warning' ? FiAlertCircle
                                : FiCheckCircle;
                        return (
                            <div key={b._id} className={`budget-item ${status}`}>
                                <div className="item-header">
                                    <span className="category">{b.category}</span>
                                    <div className="amounts">
                                        <span className="spent">₹{b.spent.toFixed(0)}</span>
                                        <span className="separator">/</span>
                                        <span className="limit">₹{b.limit}</span>
                                    </div>
                                    <button className="delete-btn" onClick={() => deleteBudget(b._id, month)} title="Remove budget">
                                        <FiTrash2 size={14} />
                                    </button>
                                </div>
                                <div className="progress-bar">
                                    <div className="fill" style={{ width: `${pct}%` }} />
                                </div>
                                <div className={`status-label ${status}`}>
                                    <StatusIcon size={13} />
                                    {status === 'over'
                                        ? `Over by ₹${(b.spent - b.limit).toFixed(0)}`
                                        : status === 'warning'
                                            ? `${pct.toFixed(0)}% used — getting close`
                                            : `₹${(b.limit - b.spent).toFixed(0)} remaining`}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </BudgetStyled>
    );
};

const BudgetStyled = styled.div`
    padding: 2rem;
    color: var(--text-primary);

    .page-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
        gap: 1rem;

        h1 { font-size: 2rem; color: var(--text-heading); }

        .month-picker {
            display: flex;
            align-items: center;
            gap: 0.6rem;
            font-size: 0.9rem;
            font-weight: 600;
            color: var(--text-muted);

            input[type="month"] {
                padding: 0.5rem 0.75rem;
                border: 2px solid var(--border-light);
                border-radius: 10px;
                font-size: 0.9rem;
                background: var(--bg-input);
                color: var(--text-heading);
                &:focus { border-color: var(--primary-color); outline: none; }
            }
        }
    }

    .add-form {
        background: var(--bg-card);
        border: 2px solid var(--border-color);
        box-shadow: 0 4px 15px rgba(0,0,0,0.06);
        border-radius: 16px;
        padding: 1.5rem;
        margin-bottom: 2rem;
        transition: background 0.3s, border-color 0.3s;

        h3 { margin-bottom: 1rem; color: var(--text-heading); font-size: 1.1rem; }

        .form-row {
            display: flex;
            gap: 0.75rem;
            flex-wrap: wrap;
        }

        select, input[type="number"] {
            flex: 1;
            min-width: 160px;
            padding: 0.75rem;
            border: 2px solid var(--border-light);
            border-radius: 10px;
            font-size: 0.95rem;
            background: var(--bg-input);
            color: var(--text-heading);
            &:focus { border-color: var(--primary-color); outline: none; }
        }

        button {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            background: linear-gradient(135deg, #1a1a4e, #3b3b9e);
            color: white;
            border: none;
            border-radius: 10px;
            font-weight: 600;
            cursor: pointer;
            white-space: nowrap;
            transition: opacity 0.2s;
            &:hover { opacity: 0.9; }
        }
    }

    .empty {
        text-align: center;
        color: var(--text-muted);
        padding: 3rem;
        font-size: 1rem;
        border: 2px dashed var(--border-light);
        border-radius: 16px;
    }

    .budget-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .budget-item {
        background: var(--bg-card);
        border: 2px solid var(--border-color);
        border-radius: 16px;
        padding: 1.25rem;
        box-shadow: 0 4px 15px rgba(0,0,0,0.04);
        transition: background 0.3s, border-color 0.3s;

        &.warning { border-color: #ffc107; }
        &.over    { border-color: #dc3545; }

        .item-header {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 0.8rem;

            .category {
                font-weight: 700;
                font-size: 1.05rem;
                color: var(--text-heading);
                flex: 1;
            }

            .amounts {
                display: flex;
                align-items: center;
                gap: 0.3rem;
                font-size: 0.9rem;
                .spent { font-weight: 700; color: var(--text-heading); }
                .separator { color: var(--text-muted); }
                .limit { color: var(--text-muted); }
            }

            .delete-btn {
                background: none;
                border: none;
                color: var(--text-muted);
                cursor: pointer;
                padding: 0.3rem;
                border-radius: 6px;
                display: flex;
                align-items: center;
                transition: color 0.2s, background 0.2s;
                &:hover { color: #dc3545; background: rgba(220,53,69,0.08); }
            }
        }

        .progress-bar {
            height: 8px;
            background: var(--border-light);
            border-radius: 10px;
            overflow: hidden;
            margin-bottom: 0.6rem;

            .fill {
                height: 100%;
                border-radius: 10px;
                background: var(--color-green);
                transition: width 0.5s ease;
            }
        }

        &.warning .fill { background: #ffc107; }
        &.over    .fill { background: #dc3545; }

        .status-label {
            display: flex;
            align-items: center;
            gap: 0.4rem;
            font-size: 0.82rem;
            color: var(--text-muted);
            &.ok      { color: var(--color-green); }
            &.warning { color: #e6a800; }
            &.over    { color: #dc3545; }
        }
    }
`;

export default Budget;
