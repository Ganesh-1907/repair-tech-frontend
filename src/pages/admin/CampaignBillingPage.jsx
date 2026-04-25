import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle, CreditCard, IndianRupee, MessageSquare, Printer, Search, Wallet, X } from 'lucide-react';
import AdminPageHeader from '../../components/common/AdminPageHeader';
import { billingService } from '../../services/campaignServices';

const formatCurrency = (value) => `INR ${Number(value || 0).toLocaleString('en-IN')}`;
const paymentClass = {
  Paid: 'payment-paid',
  'Partially Paid': 'payment-partial',
  Unpaid: 'payment-unpaid',
};

const CampaignBillingPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    billingService.listInvoices().then(setInvoices);
  }, []);

  const filteredInvoices = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return invoices;
    return invoices.filter((invoice) => [
      invoice.invoiceNo,
      invoice.jobCardId,
      invoice.customer,
      invoice.campaign,
      invoice.paymentStatus,
      invoice.paymentMode,
    ].some((value) => String(value || '').toLowerCase().includes(query)));
  }, [invoices, search]);

  const summary = useMemo(() => {
    const paidAmount = invoices.reduce((sum, invoice) => sum + invoice.paidAmount, 0);
    const pendingAmount = invoices.reduce((sum, invoice) => sum + invoice.balance, 0);
    const overdueAmount = invoices
      .filter((invoice) => invoice.paymentStatus !== 'Paid')
      .reduce((sum, invoice) => sum + invoice.balance, 0);
    const upiAmount = invoices.filter((invoice) => invoice.paymentMode === 'UPI').reduce((sum, invoice) => sum + invoice.paidAmount, 0);
    return { totalInvoices: invoices.length, paidAmount, pendingAmount, overdueAmount, upiAmount };
  }, [invoices]);

  return (
    <div className="admin-module-page campaign-billing-page">
      {notice && (
        <div className="success-banner" role="status">
          <span>{notice}</span>
          <button className="icon-btn" onClick={() => setNotice('')} aria-label="Dismiss campaign billing message"><X size={16} /></button>
        </div>
      )}

      <AdminPageHeader
        title="Billing"
        description="Accounts summary across campaign jobs. Job-level invoice work remains inside Job Detail."
        breadcrumbs={['Admin', 'Campaign Module', 'Billing']}
        actions={[
          { label: 'Send Reminder', icon: MessageSquare, onClick: () => setNotice('Reminder placeholder prepared for selected campaign invoices.') },
          { label: 'Print Summary', variant: 'secondary', icon: Printer, onClick: () => window.print() },
        ]}
      />

      <div className="billing-kpi-grid">
        <div className="card billing-kpi-card"><div className="billing-kpi-icon"><CreditCard size={20} /></div><div className="billing-kpi-copy"><span>Total invoices</span><strong>{summary.totalInvoices}</strong></div></div>
        <div className="card billing-kpi-card"><div className="billing-kpi-icon success"><Wallet size={20} /></div><div className="billing-kpi-copy"><span>Paid amount</span><strong>{formatCurrency(summary.paidAmount)}</strong></div></div>
        <div className="card billing-kpi-card"><div className="billing-kpi-icon warning"><IndianRupee size={20} /></div><div className="billing-kpi-copy"><span>Pending amount</span><strong>{formatCurrency(summary.pendingAmount)}</strong></div></div>
        <div className="card billing-kpi-card"><div className="billing-kpi-icon danger"><AlertCircle size={20} /></div><div className="billing-kpi-copy"><span>Overdue amount</span><strong>{formatCurrency(summary.overdueAmount)}</strong></div></div>
      </div>

      <div className="card campaign-payment-mode-card">
        <div className="card-header"><div><h3>Payment Collection by Mode</h3><p>Mock aggregation ready for payment API integration.</p></div></div>
        <div className="mode-bars">
          <div><span>UPI</span><strong>{formatCurrency(summary.upiAmount)}</strong></div>
          <div><span>Cash</span><strong>{formatCurrency(0)}</strong></div>
          <div><span>Online link</span><strong>{formatCurrency(0)}</strong></div>
        </div>
      </div>

      <div className="card table-controls">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search invoice, job, customer, campaign..." />
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="leads-table">
          <thead>
            <tr>
              <th>Invoice No</th>
              <th>Job Card ID</th>
              <th>Customer</th>
              <th>Campaign</th>
              <th>Total Amount</th>
              <th>Paid Amount</th>
              <th>Balance</th>
              <th>Payment Status</th>
              <th>Payment Mode</th>
              <th>Created Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map((invoice) => (
              <tr key={invoice.invoiceNo}>
                <td className="bold">{invoice.invoiceNo}</td>
                <td>{invoice.jobCardId}</td>
                <td>{invoice.customer}</td>
                <td>{invoice.campaign}</td>
                <td>{formatCurrency(invoice.totalAmount)}</td>
                <td>{formatCurrency(invoice.paidAmount)}</td>
                <td>{formatCurrency(invoice.balance)}</td>
                <td><span className={`status-pill ${paymentClass[invoice.paymentStatus] || 'payment-unpaid'}`}>{invoice.paymentStatus}</span></td>
                <td>{invoice.paymentMode}</td>
                <td>{invoice.createdDate}</td>
                <td>
                  <div className="action-btns">
                    <Link className="btn btn-sm btn-primary" to={`/admin/campaign/jobs/${invoice.jobCardId}`}>Open Job Detail</Link>
                    <button className="icon-btn" onClick={() => setNotice(`Reminder queued for ${invoice.invoiceNo}.`)} title="Send Reminder"><MessageSquare size={16} /></button>
                    <button className="icon-btn" onClick={() => setNotice(`${invoice.invoiceNo} marked for collection.`)} title="Collect Payment"><CheckCircle size={16} /></button>
                    <button className="icon-btn" onClick={() => window.print()} title="Print Invoice"><Printer size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CampaignBillingPage;
