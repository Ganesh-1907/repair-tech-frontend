import React, { useMemo, useState } from 'react';
import { ChevronDown, Download, FileCheck2, X } from 'lucide-react';
import {
  AttendanceOverview,
  CashFlowOverview,
  CategoryDonut,
  StatCard,
  StatusBadge,
  TableCard,
} from '../../components/expenses/ExpenseDashboardComponents';
import { usePrivacy } from '../../context/PrivacyContext';
import { getExpensesDashboardData } from '../../services/expensesDashboardService';

const transactionTypeTone = {
  Payment: 'type-payment',
  Expense: 'type-expense',
  Purchase: 'type-purchase',
  Salary: 'type-salary',
  Income: 'type-income',
};

const followupTone = {
  Overdue: 'overdue',
  'Due Soon': 'due-soon',
  Upcoming: 'upcoming',
};

const ExpensesManagementPage = () => {
  const { formatCurrency, isPrivacyOn } = usePrivacy();
  const [notice, setNotice] = useState('');
  const dashboardData = useMemo(() => getExpensesDashboardData(), []);

  const handleDashboardAction = (label) => {
    setNotice(`${label} is ready for backend workflow integration.`);
  };

  return (
    <div className="admin-module-page expenses-management-admin-page">
      {notice && (
        <div className="success-banner" role="status">
          <span>{notice}</span>
          <button className="icon-btn" onClick={() => setNotice('')} aria-label="Dismiss expenses message">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="card expenses-filter-strip">
        <label className="expenses-control-select">
          <span className="sr-only">Business</span>
          <select defaultValue="Saptarishi Solutions">
            <option>Saptarishi Solutions</option>
            <option>Service Center</option>
            <option>Rental Operations</option>
          </select>
          <ChevronDown size={16} />
        </label>
        <label className="expenses-control-select date-range">
          <span className="sr-only">Date range</span>
          <select defaultValue="01 Apr 2026 - 30 Apr 2026">
            <option>01 Apr 2026 - 30 Apr 2026</option>
            <option>01 Mar 2026 - 31 Mar 2026</option>
            <option>01 Feb 2026 - 28 Feb 2026</option>
          </select>
          <ChevronDown size={16} />
        </label>
        <div className="expenses-filter-actions">
          <button className="btn btn-secondary" type="button" onClick={() => handleDashboardAction('Export')}>
            <Download size={16} />
            <span>Export</span>
          </button>
          <button className="btn btn-secondary" type="button" onClick={() => handleDashboardAction('Manage Approvals')}>
            <FileCheck2 size={16} />
            <span>Approvals</span>
          </button>
        </div>
      </div>

      <div className="expenses-stat-grid">
        {dashboardData.summaryCards.map((card) => (
          <StatCard key={card.id} card={card} formatCurrency={formatCurrency} />
        ))}
      </div>

      <div className={`expenses-dashboard-main-grid ${isPrivacyOn ? 'privacy-blur' : ''}`}>
        <CashFlowOverview data={dashboardData.cashFlow} formatCurrency={formatCurrency} />
        <CategoryDonut categories={dashboardData.expenseCategories} formatCurrency={formatCurrency} />
        <AttendanceOverview attendance={dashboardData.attendance} />
      </div>

      <div className="expenses-dashboard-three-grid">
        <TableCard title="Vendors Payables" subtitle="Outstanding and overdue vendor obligations.">
          <div className="expense-payables-summary">
            <span><small>Total Payables</small><strong>{formatCurrency(dashboardData.vendorPayables.total)}</strong></span>
            <span className="danger"><small>Overdue Amount</small><strong>{formatCurrency(dashboardData.vendorPayables.overdue)}</strong></span>
          </div>
          <table className="leads-table expense-compact-table">
            <thead>
              <tr>
                <th>Vendor Name</th>
                <th>Due Date</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.vendorPayables.rows.slice(0, 3).map((payable) => (
                <tr key={payable.id}>
                  <td>{payable.vendor}</td>
                  <td>{payable.dueDate}</td>
                  <td>{formatCurrency(payable.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableCard>

        <TableCard title="Payments Followups" subtitle="Vendor payment commitments by urgency.">
          <div className="expense-list">
            {dashboardData.paymentFollowups.slice(0, 4).map((followup) => (
              <div key={followup.id} className="expense-list-row">
                <div>
                  <strong>{followup.vendor}</strong>
                  <small>{followup.date}</small>
                </div>
                <div className="expense-row-end">
                  <span>{formatCurrency(followup.amount)}</span>
                  <StatusBadge tone={followupTone[followup.status]}>{followup.status}</StatusBadge>
                </div>
              </div>
            ))}
          </div>
        </TableCard>

        <TableCard title="Credit Notes" subtitle="Credits pending settlement or adjustment.">
          <div className="expense-list">
            {dashboardData.creditNotes.slice(0, 3).map((note) => (
              <div key={note.id} className="expense-list-row">
                <div>
                  <strong>{note.id}</strong>
                  <small>{note.vendor} - {note.date}</small>
                </div>
                <span className="expense-negative-amount">{formatCurrency(note.amount)}</span>
              </div>
            ))}
          </div>
        </TableCard>
      </div>

      <div className="expenses-dashboard-bottom-grid">
        <TableCard title="Recent Transactions" subtitle="Latest payments, expenses, purchases, salaries, and income.">
          <table className="leads-table expense-transactions-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Description</th>
                <th>Account</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.recentTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>{transaction.date}</td>
                  <td>
                    <span className={`expense-type-tag ${transactionTypeTone[transaction.type]}`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td>
                    <div className="item-cell">
                      <span className="bold">{transaction.description}</span>
                      <span className="company-name">{transaction.id}</span>
                    </div>
                  </td>
                  <td>{transaction.account}</td>
                  <td>{formatCurrency(transaction.amount)}</td>
                  <td><StatusBadge>{transaction.status}</StatusBadge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableCard>

        <TableCard title="Upcoming Reminders" subtitle="Near-term reminders.">
          <div className="expense-list reminders-list">
            {dashboardData.reminders.map((reminder) => (
              <div key={reminder.id} className="expense-list-row reminder-row">
                <div>
                  <strong>{reminder.title}</strong>
                  <small>{reminder.date}</small>
                </div>
                <StatusBadge tone={reminder.tone}>{reminder.daysLeft} days left</StatusBadge>
              </div>
            ))}
          </div>
        </TableCard>
      </div>
    </div>
  );
};

export default ExpensesManagementPage;
