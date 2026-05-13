import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  AlertCircle, CheckCircle2, CreditCard, IndianRupee, MessageSquare,
  Search, Wallet, X, Download, ArrowRight, RefreshCcw, Loader2,
  ChevronRight,
} from 'lucide-react';
import { billingService } from '../../services/campaignServices';
import './CampaignModule.css';

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const downloadInvoicePdf = async (invoice) => {
  const el = document.getElementById(`inv-row-${invoice.invoiceNo}`);
  if (!el) return;
  const html2pdf = (await import('html2pdf.js')).default;
  html2pdf().set({ margin: 8, filename: `${invoice.invoiceNo}.pdf`, html2canvas: { scale: 2 }, jsPDF: { format: 'a5' } }).from(el).save();
};

const STATUS_STYLE = {
  'Paid':           'bg-emerald-50 text-emerald-700',
  'Partially Paid': 'bg-amber-50 text-amber-700',
  'Unpaid':         'bg-red-50 text-red-700',
};

const CampaignBillingPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);

  const [payModal, setPayModal] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMode, setPayMode] = useState('UPI');
  const [payLoading, setPayLoading] = useState(false);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await billingService.listInvoices();
      setInvoices(list);
    } catch {
      showToast('Failed to load invoices.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const handleCollectPayment = async () => {
    if (!payAmount || Number(payAmount) <= 0) return showToast('Enter a valid amount.', 'error');
    setPayLoading(true);
    try {
      await billingService.collectPayment(payModal.jobCardId, Number(payAmount), payMode);
      setPayModal(null);
      setPayAmount('');
      showToast(`Payment of ${formatCurrency(payAmount)} recorded.`);
      await load();
    } catch (e) {
      showToast(e.message || 'Payment failed.', 'error');
    } finally {
      setPayLoading(false);
    }
  };

  const handleExport = () => {
    const rows = filteredInvoices.map((inv) => [inv.invoiceNo, inv.jobCardId, inv.customer, inv.campaign, inv.totalAmount, inv.paidAmount, inv.balance, inv.paymentStatus, inv.paymentMode]);
    const csv = [['Invoice', 'Job Card', 'Customer', 'Campaign', 'Total', 'Paid', 'Balance', 'Status', 'Mode'], ...rows].map((r) => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'campaign_billing.csv'; a.click();
  };

  const filteredInvoices = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return invoices;
    return invoices.filter((inv) =>
      [inv.invoiceNo, inv.jobCardId, inv.customer, inv.campaign, inv.paymentStatus, inv.paymentMode]
        .some((v) => String(v || '').toLowerCase().includes(q))
    );
  }, [invoices, search]);

  const summary = useMemo(() => ({
    total: invoices.length,
    collected: invoices.reduce((s, i) => s + i.paidAmount, 0),
    pending: invoices.reduce((s, i) => s + i.balance, 0),
    unpaid: invoices.filter((i) => i.paymentStatus === 'Unpaid').length,
  }), [invoices]);

  return (
    <div className="campaign-page">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
            className={`fixed bottom-6 right-6 z-[9999] px-5 py-3 rounded-xl shadow-xl text-sm font-semibold flex items-center gap-2 ${toast.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
            {toast.type === 'error' ? <X size={16}/> : <CheckCircle2 size={16}/>} {toast.msg}
          </Motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <section className="breadcrumb-card">
        <div className="breadcrumb">
          <span>Admin</span><ChevronRight size={14}/><span>Campaign</span><ChevronRight size={14}/><strong>Billing & Payments</strong>
        </div>
        <div className="flex justify-between items-end flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black text-slate-900 m-0">Billing & Payments</h1>
            <p className="text-slate-500 text-sm m-0 mt-1">Campaign invoices, payment collection, UPI/Cash/Online tracking.</p>
          </div>
          <div className="flex gap-3">
            <button className="icon-button" onClick={load}><RefreshCcw size={18} className={loading ? 'animate-spin' : ''}/></button>
            <button className="secondary-button !h-10 !px-4 text-xs" onClick={() => showToast('Bulk reminder sent (placeholder).')}>
              <MessageSquare size={16}/> Bulk Reminders
            </button>
            <button className="primary-button !h-10 !px-4 text-xs" onClick={handleExport}>
              <Download size={16}/> Export CSV
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-grid">
        {[
          { label: 'Total Invoices',  value: loading ? '—' : summary.total,                    color: '#4f46e5', icon: <CreditCard size={16}/> },
          { label: 'Collected',       value: loading ? '—' : formatCurrency(summary.collected), color: '#10b981', icon: <Wallet size={16}/> },
          { label: 'Pending Balance', value: loading ? '—' : formatCurrency(summary.pending),   color: '#f59e0b', icon: <IndianRupee size={16}/> },
          { label: 'Unpaid Jobs',     value: loading ? '—' : summary.unpaid,                   color: '#ef4444', icon: <AlertCircle size={16}/> },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="stat-label">{s.label}</span>
              <span style={{ color: s.color }}>{s.icon}</span>
            </div>
            <span className="stat-value" style={{ color: s.color }}>{s.value}</span>
          </div>
        ))}
      </section>

      {/* Table */}
      <section className="table-card">
        <div className="table-toolbar">
          <div className="relative">
            <input type="text" placeholder="Search invoice, job, customer..."
              className="h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm w-72"
              value={search} onChange={(e) => setSearch(e.target.value)}/>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
            <Loader2 size={20} className="animate-spin"/> Loading invoices...
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <CreditCard size={36} className="mb-2 opacity-30"/>
            <p className="text-sm font-semibold">No invoices found.</p>
          </div>
        ) : (
          <div className="campaign-table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Job Card</th>
                  <th>Customer</th>
                  <th>Campaign</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th>Mode</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.invoiceNo} id={`inv-row-${invoice.invoiceNo}`}>
                    <td className="font-mono text-xs font-black text-indigo-600">{invoice.invoiceNo}</td>
                    <td>
                      <Link className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
                        to={`/admin/campaign/jobs?ticketId=${invoice.jobCardId}`}>
                        {invoice.jobCardId}
                      </Link>
                    </td>
                    <td className="font-semibold text-slate-800 text-sm">{invoice.customer}</td>
                    <td className="text-xs text-slate-500 max-w-[120px] truncate">{invoice.campaign || '—'}</td>
                    <td className="font-black text-slate-900">{formatCurrency(invoice.totalAmount)}</td>
                    <td className="font-semibold text-emerald-700">{formatCurrency(invoice.paidAmount)}</td>
                    <td>
                      <span className={`font-black text-sm ${invoice.balance > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                        {formatCurrency(invoice.balance)}
                      </span>
                    </td>
                    <td>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_STYLE[invoice.paymentStatus] || 'bg-slate-50 text-slate-500'}`}>
                        {invoice.paymentStatus}
                      </span>
                    </td>
                    <td className="text-xs font-semibold text-slate-500">{invoice.paymentMode || '—'}</td>
                    <td className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Link className="w-8 h-8 flex items-center justify-center bg-slate-50 rounded-lg hover:text-indigo-600 transition-all"
                          to={`/admin/campaign/jobs?ticketId=${invoice.jobCardId}`} title="Open Job">
                          <ArrowRight size={14}/>
                        </Link>
                        {invoice.balance > 0 && (
                          <button className="w-8 h-8 flex items-center justify-center bg-slate-50 rounded-lg hover:text-emerald-600 transition-all"
                            onClick={() => { setPayModal(invoice); setPayAmount(String(invoice.balance)); setPayMode('UPI'); }}
                            title="Collect Payment">
                            <CheckCircle2 size={14}/>
                          </button>
                        )}
                        <button className="w-8 h-8 flex items-center justify-center bg-slate-50 rounded-lg hover:text-indigo-600 transition-all"
                          onClick={() => downloadInvoicePdf(invoice)} title="Download PDF">
                          <Download size={14}/>
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center bg-slate-50 rounded-lg hover:text-slate-700 transition-all"
                          onClick={() => showToast(`Reminder sent to ${invoice.customer}.`)} title="Send Reminder">
                          <MessageSquare size={14}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Collect Payment Modal */}
      <AnimatePresence>
        {payModal && (
          <div className="modal-overlay" onClick={() => setPayModal(null)}>
            <Motion.div className="modal-card !max-w-sm"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}>
              <div className="modal-header">
                <h3 className="text-lg font-black text-slate-900">Collect Payment</h3>
                <button className="icon-button !border-none" onClick={() => setPayModal(null)}><X size={18}/></button>
              </div>
              <div className="modal-body space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl text-sm space-y-2">
                  <div className="flex justify-between"><span className="text-slate-500 font-semibold">Customer</span><span className="font-black text-slate-900">{payModal.customer}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500 font-semibold">Invoice</span><span className="font-mono text-indigo-600 font-bold">{payModal.invoiceNo}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500 font-semibold">Balance</span><span className="font-black text-rose-600">{formatCurrency(payModal.balance)}</span></div>
                </div>
                <div className="flex gap-2">
                  {['UPI', 'Cash', 'Online Link'].map((m) => (
                    <button key={m} onClick={() => setPayMode(m)}
                      className={`flex-1 h-10 rounded-xl border text-xs font-bold transition-colors ${payMode === m ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                      {m}
                    </button>
                  ))}
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Amount (₹)</label>
                  <input type="number" className="px-4 h-11 text-sm font-bold w-full"
                    value={payAmount} onChange={(e) => setPayAmount(e.target.value)}/>
                </div>
              </div>
              <div className="modal-footer">
                <button className="primary-button w-full !h-11" onClick={handleCollectPayment} disabled={payLoading}>
                  {payLoading ? <Loader2 size={16} className="animate-spin"/> : <CheckCircle2 size={16}/>} Record Payment
                </button>
              </div>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CampaignBillingPage;
