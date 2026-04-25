import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  X
} from 'lucide-react';
import { usePrivacy } from '../context/PrivacyContext';

const Expenses = () => {
  const { formatCurrency, isPrivacyOn } = usePrivacy();
  const [searchParams, setSearchParams] = useSearchParams();
  const [expenseForm, setExpenseForm] = useState({ category: '', amount: '', note: '' });
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState('');
  const isFormOpen = searchParams.get('add') === '1';

  const cashFlowData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Income',
        data: [45000, 52000, 48000, 61000, 55000, 67000],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Expenses',
        data: [32000, 35000, 31000, 38000, 34000, 40000],
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const summary = [
    { label: 'Total Income', value: 328000, icon: ArrowUpRight, color: 'success' },
    { label: 'Total Expenses', value: 210000, icon: ArrowDownRight, color: 'danger' },
    { label: 'Net Profit', value: 118000, icon: DollarSign, color: 'primary' },
  ];

  const updateExpenseForm = (field, value) => {
    setExpenseForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  };

  const submitExpense = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!expenseForm.category.trim()) nextErrors.category = 'Category is required.';
    if (!Number(expenseForm.amount) || Number(expenseForm.amount) <= 0) nextErrors.amount = 'Amount must be greater than zero.';

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setNotice(`${expenseForm.category} expense captured for ${formatCurrency(Number(expenseForm.amount))}.`);
    setExpenseForm({ category: '', amount: '', note: '' });
    closeExpenseForm();
  };

  const closeExpenseForm = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('add');
    setSearchParams(nextParams);
  };

  return (
    <div className="expenses-page">
      {notice && (
        <div className="success-banner" role="status">
          <span>{notice}</span>
          <button className="icon-btn" onClick={() => setNotice('')} aria-label="Dismiss expense message">
            <X size={16} />
          </button>
        </div>
      )}

      {isFormOpen && (
        <div className="card billing-section">
          <div className="section-header">
            <h3>Add Expense</h3>
            <button className="icon-btn" onClick={closeExpenseForm} aria-label="Close expense form">
              <X size={16} />
            </button>
          </div>
          <form className="form-grid" onSubmit={submitExpense}>
            <div className="form-group">
              <label htmlFor="expense-category">Category</label>
              <input id="expense-category" type="text" value={expenseForm.category} onChange={(event) => updateExpenseForm('category', event.target.value)} aria-invalid={Boolean(errors.category)} />
              {errors.category && <span className="form-error">{errors.category}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="expense-amount">Amount</label>
              <input id="expense-amount" type="number" min="1" value={expenseForm.amount} onChange={(event) => updateExpenseForm('amount', event.target.value)} aria-invalid={Boolean(errors.amount)} />
              {errors.amount && <span className="form-error">{errors.amount}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="expense-note">Note</label>
              <input id="expense-note" type="text" value={expenseForm.note} onChange={(event) => updateExpenseForm('note', event.target.value)} />
            </div>
            <div className="form-actions-span">
              <button className="btn btn-primary" type="submit">Save Expense</button>
            </div>
          </form>
        </div>
      )}

      <div className="summary-grid">
        {summary.map((item) => (
          <div key={item.label} className="card summary-card">
            <div className={`summary-icon-container ${item.color}`}>
              <item.icon size={24} />
            </div>
            <div className="summary-details">
              <span className="summary-label">{item.label}</span>
              <h3 className="summary-value">{formatCurrency(item.value)}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="card chart-card">
        <div className="card-header">
          <div>
            <h3>Income vs Expense Graph</h3>
            <p>Six-month cash flow trend.</p>
          </div>
        </div>
        <div className={`chart-container ${isPrivacyOn ? 'privacy-blur' : ''}`}>
          <Line
            data={cashFlowData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: 'top' } }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Expenses;
