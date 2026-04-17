import React, { useState } from "react";
import styled from "styled-components";
import { FiX, FiSave } from "react-icons/fi";

/**
 * Reusable edit modal for both income and expense transactions.
 */
const EditTransactionModal = ({ item, type, onSave, onClose }) => {
  const [form, setForm] = useState({
    title: item.title || "",
    amount: item.amount || "",
    category: item.category || "",
    description: item.description || "",
    date: item.date ? new Date(item.date).toISOString().slice(0, 10) : "",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(item._id, { ...form, amount: parseFloat(form.amount) });
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit {type === 'income' ? 'Income' : 'Expense'}</h3>
          <button className="close-btn" onClick={onClose}><FiX size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Title</label>
            <input name="title" value={form.title} onChange={handleChange} required />
          </div>
          <div className="field">
            <label>Amount (₹)</label>
            <input name="amount" type="number" min="0.01" step="0.01" value={form.amount} onChange={handleChange} required />
          </div>
          <div className="field">
            <label>Category</label>
            <input name="category" value={form.category} onChange={handleChange} required />
          </div>
          <div className="field">
            <label>Date</label>
            <input name="date" type="date" value={form.date} onChange={handleChange} required />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} />
          </div>
          <div className="modal-actions">
            <button type="button" className="cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="save"><FiSave size={14} /> Save Changes</button>
          </div>
        </form>
      </Modal>
    </Overlay>
  );
};

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const Modal = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: 20px;
  padding: 2rem;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  animation: slideIn 0.22s ease;
  @keyframes slideIn {
    from { opacity: 0; transform: scale(0.94); }
    to   { opacity: 1; transform: scale(1); }
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
    h3 { font-size: 1.3rem; color: var(--text-heading); }
    .close-btn {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 6px;
      display: flex;
      align-items: center;
      transition: color 0.2s, background 0.2s;
      &:hover { color: var(--text-heading); background: var(--border-light); }
    }
  }

  .field {
    margin-bottom: 1rem;
    label {
      display: block;
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-bottom: 0.35rem;
    }
    input, textarea {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid var(--border-light);
      border-radius: 10px;
      font-size: 0.95rem;
      box-sizing: border-box;
      font-family: inherit;
      background: var(--bg-input);
      color: var(--text-heading);
      transition: border 0.2s, background 0.3s;
      &:focus { border-color: var(--primary-color); outline: none; }
    }
    textarea { resize: vertical; }
  }

  .modal-actions {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
    button {
      flex: 1;
      padding: 0.8rem;
      border-radius: 10px;
      font-size: 0.95rem;
      font-weight: 600;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      transition: opacity 0.2s, transform 0.1s;
      &:hover { opacity: 0.9; }
      &:active { transform: scale(0.98); }
    }
    .cancel {
      background: var(--border-light);
      color: var(--text-primary);
    }
    .save {
      background: linear-gradient(135deg, #1a1a4e, #3b3b9e);
      color: white;
    }
  }
`;

export default EditTransactionModal;
