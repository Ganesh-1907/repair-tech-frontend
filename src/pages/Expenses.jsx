import React from 'react';
import { motion } from 'framer-motion';
import { Line, Bar } from 'react-chartjs-2';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Plus
} from 'lucide-react';
import { usePrivacy } from '../context/PrivacyContext';

const Expenses = () => {
  const { formatCurrency, isPrivacyOn } = usePrivacy();

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

  return (
    <div className="expenses-page">
      <header className="page-header">
        <div>
          <h1>Expenses & Cash Flow</h1>
          <p>Monitor your revenue and overheads.</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={18} />
          <span>Add Expense</span>
        </button>
      </header>

      <div className="summary-grid">
        {summary.map((item, i) => (
          <div key={i} className="card summary-card">
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
          <h3>Income vs Expense Graph</h3>
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
