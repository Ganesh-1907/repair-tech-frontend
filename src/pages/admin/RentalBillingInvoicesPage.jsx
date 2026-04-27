import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellRing, FilePlus, Search } from 'lucide-react';
import AdminPageHeader from '../../components/common/AdminPageHeader';
import { rentalBillingService } from '../../services/rentalBillingService';
import { paymentTrackingService } from '../../services/paymentTrackingService';
import './RentalPremiumStyles.css';

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const RentalBillingInvoicesPage = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');

  const refresh = async () => setInvoices(await rentalBillingService.listInvoices());
  useEffect(() => { refresh(); }, []);

  const remind = async (invoiceId) => {
    const response = await paymentTrackingService.sendPaymentReminder(invoiceId);
    setNotice(response.message);
    setTimeout(() => setNotice(''), 3000);
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.id.toLowerCase().includes(search.toLowerCase()) || 
    inv.customerName.toLowerCase().includes(search.toLowerCase())
  );

  const headerActions = [
    { label: 'Generate Invoice', icon: FilePlus, onClick: () => navigate('/admin/rental/billing/generate'), primary: true }
  ];

  return (
    <div className="admin-module-page rental-dashboard-page">
      {notice ? <div className="success-banner fixed top-24 right-8 z-50 animate-in fade-in slide-in-from-right-4" role="status"><span>{notice}</span></div> : null}
      <AdminPageHeader
        title="Billing & Invoices"
        description="Comprehensive management of monthly rental invoices, meter billings, and payment collections."
        breadcrumbs={['Admin', 'Rental Management', 'Billing & Invoices']}
        actions={headerActions}
      />

      <div className="card p-6 border-0 shadow-sm bg-card mb-6">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
            <input 
              className="table-input pl-10 w-full h-11" 
              placeholder="Search by invoice ID or customer name..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm bg-card overflow-hidden p-6">
        <table className="leads-table">
          <thead>
            <tr>
              <th>Invoice ID</th>
              <th>Customer Name</th>
              <th>Billing Month</th>
              <th>Total Amount</th>
              <th>Paid Amount</th>
              <th>Outstanding</th>
              <th>Payment Status</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map((invoice) => (
              <tr key={invoice.id}>
                <td className="font-mono text-xs font-bold text-main">{invoice.id}</td>
                <td className="font-bold">{invoice.customerName}</td>
                <td className="font-medium text-sm text-muted uppercase">{invoice.billingMonth}</td>
                <td className="font-bold">{formatCurrency(invoice.total)}</td>
                <td className="font-bold text-success">{formatCurrency(invoice.paidAmount)}</td>
                <td className="font-bold text-danger">{formatCurrency(invoice.outstanding)}</td>
                <td>
                  <span className={`status-pill status-${invoice.paymentStatus === 'Paid' ? 'success' : 'warning'}`}>
                    {invoice.paymentStatus}
                  </span>
                </td>
                <td className="text-center">
                  <button 
                    className="icon-btn h-9 px-4 rounded-full hover:bg-primary/10 transition-all flex items-center gap-2 text-xs font-bold" 
                    onClick={() => remind(invoice.id)}
                  >
                    <BellRing size={14} className="text-primary" /> Remind
                  </button>
                </td>
              </tr>
            ))}
            {filteredInvoices.length === 0 && (
              <tr><td colSpan="8" className="text-center py-12 text-muted italic font-medium">No invoices found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RentalBillingInvoicesPage;
