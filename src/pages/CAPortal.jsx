import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Download, 
  BarChart, 
  PieChart, 
  Calendar,
  Lock,
  ArrowRight,
  Calculator,
  ShieldCheck,
  TrendingUp,
  CreditCard
} from 'lucide-react';
import { usePrivacy } from '../context/PrivacyContext';

const CAPortal = () => {
  const { formatCurrency, isPrivacyOn } = usePrivacy();

  const reportCategories = [
    { title: 'Tax & Compliance', icon: Calculator, reports: ['GST GSTR-3B Summary', 'TDS Deduction Report', 'Tax Audit Trail'] },
    { title: 'Financial Statements', icon: BarChart, reports: ['Profit & Loss (P&L)', 'Balance Sheet', 'Cash Flow Statement'] },
    { title: 'Sales & Billing', icon: FileText, reports: ['Sales Register', 'Customer Outstanding', 'Credit/Debit Note Summary'] },
    { title: 'Expenses & Payroll', icon: CreditCard, reports: ['Expense Analysis', 'Payroll Summary', 'Supplier Outstanding'] },
  ];

  const financialSummary = [
    { label: 'Total Sales (FY 2024)', value: 4500000, color: 'primary' },
    { label: 'Total GST Collected', value: 810000, color: 'success' },
    { label: 'Total Expenses', value: 1200000, color: 'danger' },
    { label: 'Net Taxable Profit', value: 3300000, color: 'warning' },
  ];

  return (
    <div className="ca-portal-page">
      <header className="page-header">
        <div>
          <div className="title-row">
            <h1>Chartered Accountant Portal</h1>
            <ShieldCheck className="icon-success" size={24} />
          </div>
          <p>Read-only access to financial records and tax compliance reporting.</p>
        </div>
        <div className="header-actions">
            <button className="btn btn-secondary">
                <Calendar size={18} />
                <span>FY 2024-25</span>
            </button>
            <button className="btn btn-primary">
                <Download size={18} />
                <span>Export Audit Batch</span>
            </button>
        </div>
      </header>

      <div className="summary-grid">
        {financialSummary.map((s, i) => (
          <div key={i} className="card summary-card ca-stat">
            <p className="summary-label">{s.label}</p>
            <h3 className={`summary-value ${isPrivacyOn ? 'privacy-blur' : ''}`}>
                {formatCurrency(s.value)}
            </h3>
            <div className={`stat-trend ${s.color}`}>
                <TrendingUp size={14} />
                <span>+15% vs LY</span>
            </div>
          </div>
        ))}
      </div>

      <div className="ca-main-content">
        <div className="card report-explorer">
            <div className="section-header">
                <h3>Report Explorer</h3>
                <span className="badge badge-info">Audit Ready</span>
            </div>
            <div className="report-cat-grid">
                {reportCategories.map((cat, i) => (
                    <div key={i} className="report-cat-card">
                        <div className="cat-header">
                            <cat.icon size={20} className="icon-primary" />
                            <h4>{cat.title}</h4>
                        </div>
                        <ul className="report-list">
                            {cat.reports.map((report, ri) => (
                                <li key={ri} className="report-link">
                                    <span>{report}</span>
                                    <div className="link-actions">
                                        <button className="btn-icon-sm" title="Preview"><FileText size={14} /></button>
                                        <button className="btn-icon-sm" title="Download Excel"><Download size={14} /></button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>

        <div className="side-panels">
            <div className="card access-card">
                <Lock className="icon-warning" size={32} />
                <h3>Secure Access</h3>
                <p>You have restricted <strong>read-only</strong> access to this workspace. Deleting or editing records is disabled for auditing integrity.</p>
                <div className="audit-label">
                    <ShieldCheck size={16} />
                    <span>Compliance Verified</span>
                </div>
            </div>

            <div className="card quick-actions-card">
                <h3>Quick Downloads</h3>
                <div className="actions-list">
                    <button className="action-item">
                        <div className="action-info">
                            <BarChart size={18} />
                            <span>Monthly Sales Report</span>
                        </div>
                        <ArrowRight size={14} />
                    </button>
                    <button className="action-item">
                        <div className="action-info">
                            <PieChart size={18} />
                            <span>Expense Breakdown</span>
                        </div>
                        <ArrowRight size={14} />
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CAPortal;
