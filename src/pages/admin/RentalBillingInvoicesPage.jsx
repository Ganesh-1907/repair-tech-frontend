import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  FilePlus, 
  CreditCard, 
  Download, 
  RefreshCcw, 
  Eye, 
  FileText, 
  BellRing, 
  X,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  User,
  LayoutGrid,
  Wallet,
  CalendarDays,
  FileDown,
  Trash2,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './RentalBillingInvoices.css';

const RentalBillingInvoicesPage = () => {
  // --- Local State ---
  const [invoices, setInvoices] = useState([
    { id: 'INV-260401', customer: 'Global Tech Solutions', month: '2026-04', total: 23151.6, paid: 18000, status: 'Partially Paid', notes: '' },
    { id: 'INV-260402', customer: 'Stellar Bank', month: '2026-04', total: 42500, paid: 42500, status: 'Paid', notes: 'Full payment received via NEFT.' },
    { id: 'INV-260403', customer: 'Apex Retail', month: '2026-04', total: 18750, paid: 0, status: 'Overdue', notes: 'Payment follow-up required.' },
    { id: 'INV-260404', customer: 'Modern School', month: '2026-04', total: 12900, paid: 4000, status: 'Unpaid', notes: '' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [monthFilter, setMonthFilter] = useState('All Months');
  const [customerFilter, setCustomerFilter] = useState('All Customers');
  const [openMenuId, setOpenMenuId] = useState(null);

  // Modal State
  const [activeModal, setActiveModal] = useState(null); // { type: 'Generate'|'Payment'|'Detail', data?: any }
  const [toasts, setToasts] = useState([]);

  // --- Helpers ---
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const formatCurrency = (val) => `₹${Number(val).toLocaleString('en-IN', { maximumFractionDigits: 1 })}`;

  const stats = useMemo(() => {
    return {
      totalCount: invoices.length,
      paidTotal: invoices.reduce((acc, curr) => acc + curr.paid, 0),
      outstanding: invoices.reduce((acc, curr) => acc + (curr.total - curr.paid), 0),
      overdue: invoices.filter(i => i.status === 'Overdue').reduce((acc, curr) => acc + (curr.total - curr.paid), 0),
    };
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const searchStr = `${inv.id} ${inv.customer} ${inv.month} ${inv.status}`.toLowerCase();
      const matchSearch = searchStr.includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'All Status' || inv.status === statusFilter;
      const matchMonth = monthFilter === 'All Months' || inv.month === monthFilter;
      const matchCust = customerFilter === 'All Customers' || inv.customer === customerFilter;
      
      return matchSearch && matchStatus && matchMonth && matchCust;
    });
  }, [invoices, searchTerm, statusFilter, monthFilter, customerFilter]);

  const handleExport = () => {
    const headers = ['Invoice ID', 'Customer Name', 'Billing Month', 'Total Amount', 'Paid Amount', 'Outstanding', 'Payment Status'];
    const rows = filteredInvoices.map(i => [i.id, i.customer, i.month, i.total, i.paid, (i.total - i.paid), i.status]);
    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rental-invoices.csv';
    a.click();
    addToast('Invoice records exported');
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('All Status');
    setMonthFilter('All Months');
    setCustomerFilter('All Customers');
    addToast('Filters reset', 'info');
  };

  const handleSaveInvoice = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    const total = parseFloat(data.total);
    const paid = parseFloat(data.paid || 0);
    
    const newInvoice = {
      id: activeModal.mode === 'Edit' ? activeModal.data.id : (data.id || `INV-${Math.floor(100000 + Math.random() * 900000)}`),
      customer: data.customer,
      month: data.month,
      total,
      paid,
      status: data.status,
      notes: data.notes
    };

    if (activeModal.mode === 'Edit') {
      setInvoices(prev => prev.map(i => i.id === newInvoice.id ? newInvoice : i));
      addToast('Invoice updated successfully');
    } else {
      setInvoices(prev => [newInvoice, ...prev]);
      addToast('Invoice generated successfully');
    }
    setActiveModal(null);
  };

  const handleRecordPayment = (e) => {
    e.preventDefault();
    const amount = parseFloat(e.target.amount.value);
    const targetInvoiceId = e.target.invoiceId.value;

    setInvoices(prev => prev.map(inv => {
      if (inv.id === targetInvoiceId) {
        const newPaid = inv.paid + amount;
        let newStatus = inv.status;
        if (newPaid >= inv.total) {
          newStatus = 'Paid';
        } else if (newPaid > 0) {
          newStatus = 'Partially Paid';
        }
        return { ...inv, paid: newPaid, status: newStatus };
      }
      return inv;
    }));

    addToast(`Payment of ${formatCurrency(amount)} recorded`);
    setActiveModal(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      setInvoices(prev => prev.filter(i => i.id !== id));
      addToast('Invoice deleted', 'info');
    }
  };

  return (
    <div className="billing-page">
      {/* --- Breadcrumb Card --- */}
      <section className="breadcrumb-card">
        <div className="breadcrumb">
          <span>Admin</span> <ChevronRight size={14} /> 
          <span>Rental Management</span> <ChevronRight size={14} /> 
          <strong>Billing & Invoices</strong>
        </div>
        <h2>Billing & Invoices</h2>
        <p>Comprehensive management of monthly rental invoices, meter billings, and payment collections.</p>
        <div className="billing-actions">
          <button className="primary-button" onClick={() => setActiveModal({ type: 'Generate', mode: 'Generate' })}>
            <FilePlus size={18} /> Generate Invoice
          </button>
          <button className="secondary-button" onClick={() => setActiveModal({ type: 'Payment' })}>
            <CreditCard size={18} /> Record Payment
          </button>
          <button className="secondary-button" onClick={handleExport}>
            <Download size={18} /> Export
          </button>
        </div>
      </section>

      {/* --- Stats Grid --- */}
      <section className="stats-grid">
        <StatCard label="Total Invoices" value={stats.totalCount} icon={<LayoutGrid size={22} />} />
        <StatCard label="Paid Amount" value={`₹${(stats.paidTotal / 100000).toFixed(1)}L`} icon={<CheckCircle2 size={22} />} color="#10b981" />
        <StatCard label="Outstanding" value={`₹${(stats.outstanding / 100000).toFixed(1)}L`} icon={<Wallet size={22} />} color="#f59e0b" />
        <StatCard label="Overdue" value={`₹${(stats.overdue / 100000).toFixed(1)}L`} icon={<Clock size={22} />} color="#ef4444" />
      </section>

      {/* --- Filter Card --- */}
      <section className="filter-card">
        <div className="relative flex-1 min-w-[320px]">
          <input 
            type="text" 
            className="filter-search" 
            placeholder="Search by invoice ID, customer name, billing month..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        </div>
        <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option>All Status</option>
          <option>Paid</option>
          <option>Partially Paid</option>
          <option>Unpaid</option>
          <option>Overdue</option>
        </select>
        <select className="filter-select" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}>
          <option>All Months</option>
          <option>2026-04</option>
          <option>2026-03</option>
        </select>
        <select className="filter-select" value={customerFilter} onChange={(e) => setCustomerFilter(e.target.value)}>
          <option>All Customers</option>
          {Array.from(new Set(invoices.map(i => i.customer))).map(c => <option key={c}>{c}</option>)}
        </select>
        <button className="icon-button" onClick={resetFilters} title="Reset Filters">
          <RefreshCcw size={18} />
        </button>
      </section>

      {/* --- Table Card --- */}
      <section className="table-card">
        <div className="table-toolbar">
          <div>
            <h3 className="table-title">Invoice Registry</h3>
            <p className="table-subtitle">Track rental invoice generation, payments, and outstanding balances.</p>
          </div>
          <div className="text-xs font-bold text-slate-400 uppercase">
            {filteredInvoices.length} invoices found
          </div>
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Customer Name</th>
                <th>Billing Month</th>
                <th>Total Amount</th>
                <th>Paid Amount</th>
                <th>Outstanding</th>
                <th>Payment Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length > 0 ? filteredInvoices.map(row => (
                <tr key={row.id}>
                  <td className="font-mono text-xs font-black text-indigo-600">{row.id}</td>
                  <td>
                    <div className="primary-text">{row.customer}</div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5 text-slate-500 font-bold uppercase text-xs">
                      <CalendarDays size={12} className="text-slate-300" /> {row.month}
                    </div>
                  </td>
                  <td className="font-bold text-slate-900">{formatCurrency(row.total)}</td>
                  <td className="font-bold text-emerald-600">{formatCurrency(row.paid)}</td>
                  <td className="font-bold text-rose-500">{formatCurrency(row.total - row.paid)}</td>
                  <td>
                    <span className={`status-badge status-${row.status.toLowerCase().replace(' ', '-')}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="text-center">
                    <div className="actions-menu">
                      <button 
                        className="icon-button mx-auto" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === row.id ? null : row.id);
                        }}
                      >
                        <MoreVertical size={18} />
                      </button>
                      
                      {openMenuId === row.id && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          className="menu-panel"
                        >
                          <button className="menu-item" onClick={() => { setActiveModal({ type: 'Detail', data: row }); setOpenMenuId(null); }}>
                            <Eye size={14} /> View Invoice
                          </button>
                          <button className="menu-item" onClick={() => { setActiveModal({ type: 'Generate', mode: 'Edit', data: row }); setOpenMenuId(null); }}>
                            <FileText size={14} /> Edit Invoice
                          </button>
                          <button className="menu-item" onClick={() => { setActiveModal({ type: 'Payment', data: row }); setOpenMenuId(null); }}>
                            <CreditCard size={14} /> Record Payment
                          </button>
                          <button className="menu-item" onClick={() => { addToast(`Reminder sent to ${row.customer}`); setOpenMenuId(null); }}>
                            <BellRing size={14} /> Send Reminder
                          </button>
                          <button className="menu-item" onClick={() => { addToast('Downloading PDF...'); setOpenMenuId(null); }}>
                            <FileDown size={14} /> Download PDF
                          </button>
                          <div className="h-px bg-slate-100 my-1"></div>
                          <button className="menu-item danger" onClick={() => { handleDelete(row.id); setOpenMenuId(null); }}>
                            <Trash2 size={14} /> Delete
                          </button>
                        </motion.div>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={8} className="text-center py-20 text-slate-400 italic font-bold">No invoices found matching your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* --- Modals --- */}
      <AnimatePresence>
        {activeModal && (
          <div className="modal-overlay" onClick={() => setActiveModal(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="modal-card" 
              onClick={e => e.stopPropagation()}
            >
              {activeModal.type === 'Generate' && (
                <>
                  <h2>{activeModal.mode} Invoice</h2>
                  <p>Generate a new rental invoice for asset usage and service billing.</p>
                  <form onSubmit={handleSaveInvoice}>
                    <div className="form-grid">
                      <div className="form-field">
                        <label>Invoice ID</label>
                        <input name="id" defaultValue={activeModal.data?.id || ''} placeholder="e.g. INV-260401" />
                      </div>
                      <div className="form-field">
                        <label>Customer</label>
                        <input name="customer" required defaultValue={activeModal.data?.customer || ''} />
                      </div>
                      <div className="form-field">
                        <label>Billing Month</label>
                        <input name="month" required defaultValue={activeModal.data?.month || '2026-04'} placeholder="YYYY-MM" />
                      </div>
                      <div className="form-field">
                        <label>Total Amount (₹)</label>
                        <input type="number" step="0.1" name="total" required defaultValue={activeModal.data?.total || ''} />
                      </div>
                      <div className="form-field">
                        <label>Paid Amount (₹)</label>
                        <input type="number" step="0.1" name="paid" defaultValue={activeModal.data?.paid || 0} />
                      </div>
                      <div className="form-field">
                        <label>Payment Status</label>
                        <select name="status" defaultValue={activeModal.data?.status || 'Unpaid'}>
                          <option>Paid</option>
                          <option>Partially Paid</option>
                          <option>Unpaid</option>
                          <option>Overdue</option>
                        </select>
                      </div>
                      <div className="form-field full">
                        <label>Notes</label>
                        <textarea name="notes" defaultValue={activeModal.data?.notes || ''}></textarea>
                      </div>
                    </div>
                    <div className="modal-actions">
                      <button type="button" className="secondary-button" onClick={() => setActiveModal(null)}>Cancel</button>
                      <button type="submit" className="primary-button">{activeModal.mode} Invoice</button>
                    </div>
                  </form>
                </>
              )}

              {activeModal.type === 'Payment' && (
                <>
                  <h2>Record Payment</h2>
                  <p>Update the payment status and outstanding balance for an invoice.</p>
                  <form onSubmit={handleRecordPayment}>
                    <div className="form-grid">
                      <div className="form-field full">
                        <label>Select Invoice</label>
                        <select name="invoiceId" defaultValue={activeModal.data?.id || ''}>
                          {invoices.map(i => <option key={i.id} value={i.id}>{i.id} - {i.customer} ({formatCurrency(i.total - i.paid)} Due)</option>)}
                        </select>
                      </div>
                      <div className="form-field">
                        <label>Payment Amount (₹)</label>
                        <input type="number" step="0.1" name="amount" required placeholder="0.00" />
                      </div>
                      <div className="form-field">
                        <label>Payment Date</label>
                        <input type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
                      </div>
                      <div className="form-field">
                        <label>Payment Method</label>
                        <select name="method">
                          <option>Bank Transfer / NEFT</option>
                          <option>Credit Card</option>
                          <option>UPI</option>
                          <option>Cheque</option>
                          <option>Cash</option>
                        </select>
                      </div>
                      <div className="form-field full">
                        <label>Payment Notes</label>
                        <textarea name="notes" placeholder="Transaction ID: #9901-2234..."></textarea>
                      </div>
                    </div>
                    <div className="modal-actions">
                      <button type="button" className="secondary-button" onClick={() => setActiveModal(null)}>Cancel</button>
                      <button type="submit" className="primary-button">Confirm Payment</button>
                    </div>
                  </form>
                </>
              )}

              {activeModal.type === 'Detail' && (
                <>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2>Invoice Details</h2>
                      <p>Complete financial record for <strong>{activeModal.data?.id}</strong></p>
                    </div>
                    <span className={`status-badge status-${activeModal.data?.status.toLowerCase().replace(' ', '-')}`}>
                      {activeModal.data?.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <DetailRow label="Customer" value={activeModal.data?.customer} />
                      <DetailRow label="Billing Month" value={activeModal.data?.month} />
                      <DetailRow label="Total Amount" value={formatCurrency(activeModal.data?.total)} />
                    </div>
                    <div className="space-y-4">
                      <DetailRow label="Paid Amount" value={formatCurrency(activeModal.data?.paid)} />
                      <DetailRow label="Outstanding" value={formatCurrency(activeModal.data?.total - activeModal.data?.paid)} />
                      <DetailRow label="Last Activity" value="2026-04-25" />
                    </div>
                  </div>
                  <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <h4 className="text-xs font-black text-slate-400 uppercase mb-2">Billing Notes</h4>
                    <p className="text-sm text-slate-600 italic">"{activeModal.data?.notes || 'No specific notes recorded for this invoice.'}"</p>
                  </div>
                  <div className="modal-actions">
                    <button className="secondary-button" onClick={() => setActiveModal(null)}>Close</button>
                    <button className="primary-button" onClick={() => addToast('Downloading PDF...')}>
                      <FileDown size={18} /> Download
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- Toasts --- */}
      <div className="fixed top-6 right-6 z-[2000] flex flex-col gap-3">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div 
              key={t.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="toast"
            >
              {t.type === 'success' ? <CheckCircle2 size={18} className="text-emerald-400" /> : <RefreshCcw size={18} className="text-sky-400" />}
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

/* --- Sub-components --- */

const StatCard = ({ label, value, icon, color = '#4f46e5' }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ backgroundColor: `${color}15`, color }}>
      {icon}
    </div>
    <div className="stat-details">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  </div>
);

const DetailRow = ({ label, value }) => (
  <div className="border-b border-slate-100 pb-2">
    <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">{label}</span>
    <span className="text-sm font-bold text-slate-800">{value}</span>
  </div>
);

export default RentalBillingInvoicesPage;
