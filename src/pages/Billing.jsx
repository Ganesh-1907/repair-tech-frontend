import React, { useEffect, useMemo, useState } from 'react';
import { inventoryService } from '../services/inventoryService';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  MessageSquare,
  Plus,
  Printer,
  Search,
  Send,
  Trash2,
  Wallet,
  X,
} from 'lucide-react';

const formatAmount = (value) => `INR ${Number(value || 0).toFixed(2)}`;
const formatDate = (value) => new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));

const createInvoiceNumber = (seed) => `INV-${String(seed).slice(-6)}`;

const addDays = (value, days) => {
  const nextDate = new Date(value);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate.toISOString().slice(0, 10);
};

const defaultTerms = `1. Goods once sold will not be taken back.
2. Subject to local jurisdiction.`;

const initialUsedParts = [
  { id: 1, name: 'Toner Powder', qty: '50g', selected: true, visible: true },
  { id: 2, name: 'Drum', qty: '1', selected: true, visible: true },
  { id: 3, name: 'Wiper', qty: '1', selected: false, visible: true },
];

const initialItems = [
  { id: 1, name: 'Cartridge Refilling', qty: 1, rate: 350, amount: 350 },
];

const initialInvoices = [
  {
    id: 260401,
    invoiceNumber: 'INV-260401',
    customerName: 'Global Tech Solutions Pvt Ltd',
    customerCompany: 'Global Tech Solutions Pvt Ltd',
    issueDate: '2026-04-01',
    dueDate: '2026-04-08',
    status: 'Paid',
    paymentStatus: 'Paid',
    subtotal: 12800,
    gstAmount: 2304,
    total: 15104,
    gstEnabled: true,
    gstOption: 'extra',
    customer: { name: 'Rahul Sharma', company: 'Global Tech Solutions Pvt Ltd', mobile: '9876543210', email: 'rahul@globaltech.com' },
    billToSelf: true,
    sendTo: { name: '', mobile: '', email: '' },
    items: [
      { id: 1, name: 'Printer Cartridge Refill', qty: 2, rate: 2400, amount: 4800 },
      { id: 2, name: 'Maintenance Visit', qty: 1, rate: 8000, amount: 8000 },
    ],
    usedParts: [{ name: 'Toner Powder', qty: '50g', visible: true }],
    terms: defaultTerms,
  },
  {
    id: 260402,
    invoiceNumber: 'INV-260402',
    customerName: 'Spark Solutions',
    customerCompany: 'Spark Solutions',
    issueDate: '2026-04-10',
    dueDate: '2026-04-18',
    status: 'Pending',
    paymentStatus: 'Partially Paid',
    subtotal: 6800,
    gstAmount: 0,
    total: 6800,
    gstEnabled: false,
    gstOption: 'extra',
    customer: { name: 'Priya Verma', company: 'Spark Solutions', mobile: '9988776655', email: 'priya@sparksol.com' },
    billToSelf: true,
    sendTo: { name: '', mobile: '', email: '' },
    items: [{ id: 1, name: 'Onsite Service Call', qty: 1, rate: 6800, amount: 6800 }],
    usedParts: [{ name: 'Drum', qty: '1', visible: true }],
    terms: defaultTerms,
  },
  {
    id: 260403,
    invoiceNumber: 'INV-260403',
    customerName: 'Oceanic Industries',
    customerCompany: 'Oceanic Industries',
    issueDate: '2026-03-25',
    dueDate: '2026-04-02',
    status: 'Overdue',
    paymentStatus: 'Unpaid',
    subtotal: 5200,
    gstAmount: 936,
    total: 6136,
    gstEnabled: true,
    gstOption: 'included',
    customer: { name: 'Amit Singh', company: 'Oceanic Industries', mobile: '8877665544', email: 'amit@oceanic.in' },
    billToSelf: false,
    sendTo: { name: 'Accounts Team', mobile: '7788996655', email: 'accounts@oceanic.in' },
    items: [{ id: 1, name: 'Replacement Kit', qty: 1, rate: 5200, amount: 5200 }],
    usedParts: [{ name: 'Wiper', qty: '1', visible: false }],
    terms: defaultTerms,
  },
  {
    id: 260404,
    invoiceNumber: 'INV-260404',
    customerName: 'Creative Ads',
    customerCompany: 'Creative Ads',
    issueDate: '2026-04-20',
    dueDate: '2026-04-27',
    status: 'Draft',
    paymentStatus: 'Unpaid',
    subtotal: 3500,
    gstAmount: 0,
    total: 3500,
    gstEnabled: false,
    gstOption: 'extra',
    customer: { name: 'Sneha Kapur', company: 'Creative Ads', mobile: '7766554433', email: 'sneha@creativeads.in' },
    billToSelf: true,
    sendTo: { name: '', mobile: '', email: '' },
    items: [{ id: 1, name: 'Draft Service Estimate', qty: 1, rate: 3500, amount: 3500 }],
    usedParts: [],
    terms: defaultTerms,
  },
];

const getInvoiceStatusClass = (status) => {
  switch (status) {
    case 'Paid':
      return 'status-paid';
    case 'Pending':
      return 'status-pending';
    case 'Overdue':
      return 'status-overdue';
    case 'Draft':
      return 'status-draft';
    default:
      return 'status-draft';
  }
};

const getPaymentStatusClass = (status) => {
  switch (status) {
    case 'Paid':
      return 'payment-paid';
    case 'Partially Paid':
      return 'payment-partial';
    case 'Unpaid':
      return 'payment-unpaid';
    default:
      return 'payment-unpaid';
  }
};

const Billing = () => {
  const [isGstEnabled, setIsGstEnabled] = useState(false);
  const [gstOption, setGstOption] = useState('extra');
  const [customer, setCustomer] = useState({
    name: '',
    company: '',
    mobile: '',
    email: '',
  });
  const [billToSelf, setBillToSelf] = useState(true);
  const [sendTo, setSendTo] = useState({
    name: '',
    mobile: '',
    email: '',
  });
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState('');
  const [invoiceTerms, setInvoiceTerms] = useState(defaultTerms);
  const [items, setItems] = useState(initialItems);
  const [usedParts, setUsedParts] = useState(initialUsedParts);
  const [invoices, setInvoices] = useState(initialInvoices);
  const [nextItemId, setNextItemId] = useState(2);
  const [nextInvoiceId, setNextInvoiceId] = useState(Math.max(...initialInvoices.map((invoice) => invoice.id)) + 1);
  const [viewingInvoice, setViewingInvoice] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [customerFilter, setCustomerFilter] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const subtotal = items.reduce((acc, item) => acc + (item.qty * item.rate), 0);
  const gstRate = 0.18;
  const gstAmount = isGstEnabled ? (gstOption === 'extra' ? subtotal * gstRate : subtotal - (subtotal / (1 + gstRate))) : 0;
  const total = isGstEnabled ? (gstOption === 'extra' ? subtotal + gstAmount : subtotal) : subtotal;

  const customerOptions = useMemo(
    () => [...new Set(invoices.map((invoice) => invoice.customerName))].sort((a, b) => a.localeCompare(b)),
    [invoices]
  );

  const isDateRangeInvalid = Boolean(dateFrom && dateTo && dateFrom > dateTo);

  const filteredInvoices = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return invoices.filter((invoice) => {
      const invoiceDate = new Date(invoice.issueDate);
      const matchesSearch = query.length === 0
        || invoice.invoiceNumber.toLowerCase().includes(query)
        || invoice.customerName.toLowerCase().includes(query)
        || invoice.customerCompany.toLowerCase().includes(query)
        || invoice.status.toLowerCase().includes(query)
        || invoice.paymentStatus.toLowerCase().includes(query);
      const matchesStatus = statusFilter === 'All' || invoice.status === statusFilter;
      const matchesPayment = paymentFilter === 'All' || invoice.paymentStatus === paymentFilter;
      const matchesCustomer = customerFilter === 'All' || invoice.customerName === customerFilter;
      const matchesFromDate = !dateFrom || invoiceDate >= new Date(dateFrom);
      const matchesToDate = !dateTo || invoiceDate <= new Date(`${dateTo}T23:59:59`);
      const matchesDateRange = isDateRangeInvalid ? true : (matchesFromDate && matchesToDate);

      return matchesSearch && matchesStatus && matchesPayment && matchesCustomer && matchesDateRange;
    });
  }, [customerFilter, dateFrom, dateTo, invoices, isDateRangeInvalid, paymentFilter, searchQuery, statusFilter]);

  const invoiceSummary = useMemo(() => {
    const collected = invoices
      .filter((invoice) => invoice.paymentStatus === 'Paid')
      .reduce((sum, invoice) => sum + invoice.total, 0);
    const outstanding = invoices
      .filter((invoice) => invoice.paymentStatus !== 'Paid')
      .reduce((sum, invoice) => sum + invoice.total, 0);
    const overdueCount = invoices.filter((invoice) => invoice.status === 'Overdue').length;

    return {
      totalInvoices: invoices.length,
      collected,
      outstanding,
      overdueCount,
    };
  }, [invoices]);

  useEffect(() => {
    if (!viewingInvoice) return undefined;

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setViewingInvoice(null);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [viewingInvoice]);

  const updateCustomer = (field, value) => {
    setCustomer((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  };

  const updateSendTo = (field, value) => {
    setSendTo((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [`sendTo.${field}`]: '' }));
  };

  const handleAddItem = () => {
    setItems((current) => [...current, { id: nextItemId, name: '', qty: 1, rate: 0, amount: 0 }]);
    setNextItemId((current) => current + 1);
    setErrors((current) => ({ ...current, items: '' }));
  };

  const removeItem = (id) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const updateItem = (id, field, value) => {
    setItems((current) => current.map((item) => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        updated.amount = updated.qty * updated.rate;
        return updated;
      }
      return item;
    }));
    setErrors((current) => ({ ...current, items: '' }));
  };

  const togglePartSelection = (id) => {
    setUsedParts((parts) => parts.map((part) => (
      part.id === id ? { ...part, selected: !part.selected } : part
    )));
  };

  const togglePartVisibility = (id) => {
    setUsedParts((parts) => parts.map((part) => (
      part.id === id ? { ...part, visible: !part.visible } : part
    )));
  };

  const validateInvoice = () => {
    const nextErrors = {};
    if (!customer.name.trim()) nextErrors.name = 'Customer name is required.';
    if (!customer.mobile.trim()) {
      nextErrors.mobile = 'Mobile number is required.';
    } else if (!/^\d{10}$/.test(customer.mobile.trim())) {
      nextErrors.mobile = 'Enter a valid 10 digit mobile number.';
    }
    if (customer.email && !/^\S+@\S+\.\S+$/.test(customer.email)) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (!billToSelf) {
      if (!sendTo.name.trim()) nextErrors['sendTo.name'] = 'Recipient name is required.';
      if (!/^\d{10}$/.test(sendTo.mobile.trim())) nextErrors['sendTo.mobile'] = 'Enter a valid 10 digit mobile number.';
      if (sendTo.email && !/^\S+@\S+\.\S+$/.test(sendTo.email)) nextErrors['sendTo.email'] = 'Enter a valid recipient email.';
    }
    if (items.length === 0 || items.some((item) => !item.name.trim() || item.qty <= 0 || item.rate < 0)) {
      nextErrors.items = 'Each item needs a name, positive quantity, and valid rate.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleGenerateInvoice = () => {
    // Inventory Stock Check Logic
    try {
      items.forEach(billingItem => {
        const invItem = inventoryService.getItems().find(i => 
          i.name.toLowerCase() === billingItem.name.toLowerCase() || 
          i.sku.toLowerCase() === billingItem.name.toLowerCase()
        );
        
        if (invItem && invItem.isStockDependent) {
          if (invItem.currentStock < billingItem.qty) {
            throw new Error(`Insufficient stock for "${billingItem.name}". Available: ${invItem.currentStock}, Requested: ${billingItem.qty}`);
          }
        }
      });
    } catch (err) {
      setNotice(`Billing Failed: ${err.message}`);
      setErrors(prev => ({ ...prev, items: err.message }));
      return;
    }

    if (!validateInvoice()) return;
    const seed = nextInvoiceId;
    const invoiceNumber = createInvoiceNumber(seed);
    const generatedInvoice = {
      id: seed,
      invoiceNumber,
      customerName: customer.name.trim(),
      customerCompany: customer.company.trim() || 'Individual',
      issueDate,
      dueDate: addDays(issueDate, 7),
      status: 'Pending',
      paymentStatus: 'Unpaid',
      subtotal,
      gstAmount,
      total,
      gstEnabled: isGstEnabled,
      gstOption,
      customer: { ...customer },
      billToSelf,
      sendTo: { ...sendTo },
      items: items.map((item) => ({ ...item })),
      usedParts: usedParts.filter((part) => part.selected).map((part) => ({
        name: part.name,
        qty: part.qty,
        visible: part.visible,
      })),
      terms: invoiceTerms,
    };

    setInvoices((current) => [generatedInvoice, ...current]);
    setNextInvoiceId((current) => current + 1);
    setNotice(`Invoice ${invoiceNumber} generated successfully. Total: ${formatAmount(total)}.`);
  };

  const handleEditInvoice = (invoice) => {
    setCustomer({ ...invoice.customer });
    setBillToSelf(Boolean(invoice.billToSelf));
    setSendTo({ ...invoice.sendTo });
    setIsGstEnabled(Boolean(invoice.gstEnabled));
    setGstOption(invoice.gstOption === 'included' ? 'included' : 'extra');
    const loadedItems = invoice.items.map((item, index) => ({
      ...item,
      id: item.id || nextItemId + index,
      amount: item.qty * item.rate,
    }));
    const maxLoadedItemId = loadedItems.reduce((highestId, item) => (
      Number.isFinite(item.id) && item.id > highestId ? item.id : highestId
    ), 0);

    setItems(loadedItems);
    setNextItemId((current) => Math.max(current, maxLoadedItemId + 1));
    setInvoiceTerms(invoice.terms || defaultTerms);

    const selectedParts = new Map((invoice.usedParts || []).map((part) => [part.name.toLowerCase(), part]));
    setUsedParts((current) => current.map((part) => {
      const matchedPart = selectedParts.get(part.name.toLowerCase());
      if (!matchedPart) return { ...part, selected: false, visible: true };
      return {
        ...part,
        selected: true,
        visible: matchedPart.visible ?? true,
        qty: matchedPart.qty || part.qty,
      };
    }));

    window.scrollTo({ top: 0, behavior: 'smooth' });
    setNotice(`Invoice ${invoice.invoiceNumber} loaded for editing.`);
  };

  const handleDownloadInvoice = (invoice) => {
    const lines = [
      `Invoice Number: ${invoice.invoiceNumber}`,
      `Customer: ${invoice.customerName}`,
      `Company: ${invoice.customerCompany}`,
      `Issue Date: ${invoice.issueDate}`,
      `Due Date: ${invoice.dueDate}`,
      `Status: ${invoice.status}`,
      `Payment Status: ${invoice.paymentStatus}`,
      `Subtotal: ${formatAmount(invoice.subtotal)}`,
      `GST: ${formatAmount(invoice.gstAmount)}`,
      `Total: ${formatAmount(invoice.total)}`,
      '',
      'Items:',
      ...invoice.items.map((item) => `${item.name} | Qty ${item.qty} | Rate ${formatAmount(item.rate)} | Amount ${formatAmount(item.amount)}`),
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${invoice.invoiceNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setNotice(`${invoice.invoiceNumber} downloaded.`);
  };

  const handleMarkPaid = (invoice) => {
    if (invoice.paymentStatus === 'Paid') return;

    setInvoices((current) => current.map((entry) => (
      entry.id === invoice.id
        ? { ...entry, paymentStatus: 'Paid', status: 'Paid' }
        : entry
    )));
    setNotice(`${invoice.invoiceNumber} marked as paid.`);
  };

  const handlePaymentAction = (invoice) => {
    if (invoice.paymentStatus === 'Paid') return;

    setInvoices((current) => current.map((entry) => {
      if (entry.id !== invoice.id) return entry;

      if (entry.paymentStatus === 'Unpaid') {
        return {
          ...entry,
          paymentStatus: 'Partially Paid',
          status: entry.status === 'Draft' ? 'Pending' : entry.status,
        };
      }

      return {
        ...entry,
        paymentStatus: 'Paid',
        status: 'Paid',
      };
    }));

    const actionMessage = invoice.paymentStatus === 'Unpaid'
      ? `Partial payment recorded for ${invoice.invoiceNumber}.`
      : `${invoice.invoiceNumber} settled in full.`;
    setNotice(actionMessage);
  };

  const handleSendReminder = (invoice) => {
    if (invoice.status === 'Paid') return;
    setNotice(`Payment reminder prepared for ${invoice.customerName} (${invoice.invoiceNumber}).`);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setPaymentFilter('All');
    setCustomerFilter('All');
    setDateFrom('');
    setDateTo('');
  };

  return (
    <div className="billing-page">
      {notice && (
        <div className="success-banner" role="status">
          <span>{notice}</span>
          <button className="icon-btn" onClick={() => setNotice('')} aria-label="Dismiss billing message">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="billing-kpi-grid" role="list" aria-label="Billing summary metrics">
        <div className="card billing-kpi-card" role="listitem">
          <div className="billing-kpi-icon">
            <FileText size={20} />
          </div>
          <div className="billing-kpi-copy">
            <span>Total Invoices</span>
            <strong>{invoiceSummary.totalInvoices}</strong>
          </div>
        </div>
        <div className="card billing-kpi-card" role="listitem">
          <div className="billing-kpi-icon success">
            <Wallet size={20} />
          </div>
          <div className="billing-kpi-copy">
            <span>Collected</span>
            <strong>{formatAmount(invoiceSummary.collected)}</strong>
          </div>
        </div>
        <div className="card billing-kpi-card" role="listitem">
          <div className="billing-kpi-icon warning">
            <Clock size={20} />
          </div>
          <div className="billing-kpi-copy">
            <span>Outstanding</span>
            <strong>{formatAmount(invoiceSummary.outstanding)}</strong>
          </div>
        </div>
        <div className="card billing-kpi-card" role="listitem">
          <div className="billing-kpi-icon danger">
            <AlertCircle size={20} />
          </div>
          <div className="billing-kpi-copy">
            <span>Overdue Invoices</span>
            <strong>{invoiceSummary.overdueCount}</strong>
          </div>
        </div>
      </div>

      <div className="card table-controls billing-toolbar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search invoices, payments, customers..."
            aria-label="Search invoices, payments, customers"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
        <div className="filter-group billing-filter-group">
          <label className="sr-only" htmlFor="billing-status-filter">Invoice status filter</label>
          <select
            id="billing-status-filter"
            className="form-select sm"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="All">Status: All</option>
            <option value="Paid">Status: Paid</option>
            <option value="Pending">Status: Pending</option>
            <option value="Overdue">Status: Overdue</option>
            <option value="Draft">Status: Draft</option>
          </select>

          <label className="sr-only" htmlFor="billing-payment-filter">Payment status filter</label>
          <select
            id="billing-payment-filter"
            className="form-select sm"
            value={paymentFilter}
            onChange={(event) => setPaymentFilter(event.target.value)}
          >
            <option value="All">Payment: All</option>
            <option value="Paid">Payment: Paid</option>
            <option value="Partially Paid">Payment: Partially Paid</option>
            <option value="Unpaid">Payment: Unpaid</option>
          </select>

          <label className="sr-only" htmlFor="billing-customer-filter">Customer filter</label>
          <select
            id="billing-customer-filter"
            className="form-select sm"
            value={customerFilter}
            onChange={(event) => setCustomerFilter(event.target.value)}
          >
            <option value="All">Customer: All</option>
            {customerOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>

          <div className="billing-date-range">
            <label className="sr-only" htmlFor="billing-date-from">From date</label>
            <input
              id="billing-date-from"
              className="form-select sm"
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
            />
            <label className="sr-only" htmlFor="billing-date-to">To date</label>
            <input
              id="billing-date-to"
              className="form-select sm"
              type="date"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
            />
          </div>

          <button className="btn btn-secondary btn-sm" onClick={clearFilters}>Clear</button>
        </div>
      </div>

      {isDateRangeInvalid && (
        <div className="inline-error" role="alert">
          <span>Date range is invalid. "From" date cannot be after "To" date.</span>
        </div>
      )}

      <div className="card leads-table-container billing-table-card">
        <table className="leads-table billing-table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Customer</th>
              <th>Issued</th>
              <th>Due</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map((invoice) => {
              const paymentActionLabel = invoice.paymentStatus === 'Unpaid' ? 'Record Payment' : 'Settle Balance';
              const canPaymentAction = invoice.paymentStatus !== 'Paid';
              const canReminder = invoice.status !== 'Paid';

              return (
                <tr key={invoice.id}>
                  <td>
                    <div className="item-cell">
                      <span className="customer-name">{invoice.invoiceNumber}</span>
                      <span className="company-name">{invoice.items.length} line item{invoice.items.length > 1 ? 's' : ''}</span>
                    </div>
                  </td>
                  <td>
                    <div className="customer-info">
                      <span className="customer-name truncate-text" title={invoice.customerName}>{invoice.customerName}</span>
                      <span className="company-name truncate-text" title={invoice.customerCompany}>{invoice.customerCompany}</span>
                    </div>
                  </td>
                  <td>{formatDate(invoice.issueDate)}</td>
                  <td>{formatDate(invoice.dueDate)}</td>
                  <td className="bold">{formatAmount(invoice.total)}</td>
                  <td>
                    <span className={`status-pill ${getInvoiceStatusClass(invoice.status)}`}>
                      <span className="sr-only">Invoice status: </span>
                      {invoice.status}
                    </span>
                  </td>
                  <td>
                    <div className="billing-payment-cell">
                      <span className={`status-pill payment-pill ${getPaymentStatusClass(invoice.paymentStatus)}`}>
                        <span className="sr-only">Payment status: </span>
                        {invoice.paymentStatus}
                      </span>
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => handlePaymentAction(invoice)}
                        disabled={!canPaymentAction}
                        aria-label={`${canPaymentAction ? paymentActionLabel : 'Payment settled'} for ${invoice.invoiceNumber}`}
                      >
                        {canPaymentAction ? paymentActionLabel : 'Settled'}
                      </button>
                    </div>
                  </td>
                  <td>
                    <div className="billing-row-actions">
                      <button className="icon-btn" onClick={() => setViewingInvoice(invoice)} aria-label={`View ${invoice.invoiceNumber}`} title="View Invoice">
                        <Eye size={16} />
                      </button>
                      <button className="icon-btn" onClick={() => handleEditInvoice(invoice)} aria-label={`Edit ${invoice.invoiceNumber}`} title="Edit Invoice">
                        <ExternalLink size={16} />
                      </button>
                      <button className="icon-btn" onClick={() => handleDownloadInvoice(invoice)} aria-label={`Download ${invoice.invoiceNumber}`} title="Download Invoice">
                        <Download size={16} />
                      </button>
                      <button
                        className="icon-btn"
                        onClick={() => handleMarkPaid(invoice)}
                        aria-label={`Mark ${invoice.invoiceNumber} as paid`}
                        title="Mark Paid"
                        disabled={invoice.paymentStatus === 'Paid'}
                      >
                        <CheckCircle size={16} />
                      </button>
                      <button
                        className="icon-btn"
                        onClick={() => handleSendReminder(invoice)}
                        aria-label={`Send reminder for ${invoice.invoiceNumber}`}
                        title="Send Reminder"
                        disabled={!canReminder}
                      >
                        <MessageSquare size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredInvoices.length === 0 && (
              <tr>
                <td colSpan="8">
                  <div className="empty-state">
                    <h3>No invoices found</h3>
                    <p className="billing-empty-copy">Try a different filter, date range, or customer selection.</p>
                    <button className="btn btn-secondary" onClick={clearFilters}>Reset Filters</button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="billing-grid">
        <div className="billing-main">
          <div className="card billing-section billing-setup-card">
            <div className="section-header">
              <div>
                <h3>Invoice Setup</h3>
                <p className="section-subtitle">Enable GST and choose how tax is applied before generating.</p>
              </div>
            </div>
            <div className="gst-toggle-row">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={isGstEnabled}
                  onChange={() => setIsGstEnabled(!isGstEnabled)}
                />
                <span className="checkmark"></span>
                <span className="label-text">Create GST Invoice</span>
              </label>
              {isGstEnabled && (
                <div className="button-group billing-toggle-options">
                  <button
                    className={`btn btn-secondary btn-sm ${gstOption === 'extra' ? 'active' : ''}`}
                    onClick={() => setGstOption('extra')}
                  >
                    GST Extra
                  </button>
                  <button
                    className={`btn btn-secondary btn-sm ${gstOption === 'included' ? 'active' : ''}`}
                    onClick={() => setGstOption('included')}
                  >
                    GST Included
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="card billing-section">
            <div className="section-header">
              <h3>Customer Details</h3>
              <div className="search-box sm">
                <Search size={14} className="search-icon" />
                <input type="text" placeholder="Auto-fill from leads..." aria-label="Search customer from leads" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="billing-name">Name</label>
                <input
                  id="billing-name"
                  type="text"
                  value={customer.name}
                  onChange={(event) => updateCustomer('name', event.target.value)}
                  aria-invalid={Boolean(errors.name)}
                />
                {errors.name && <span className="form-error">{errors.name}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="billing-company">Company</label>
                <input
                  id="billing-company"
                  type="text"
                  value={customer.company}
                  onChange={(event) => updateCustomer('company', event.target.value)}
                />
              </div>
            </div>
            <div className="form-row mt-2">
              <div className="form-group">
                <label htmlFor="billing-mobile">Mobile</label>
                <input
                  id="billing-mobile"
                  type="tel"
                  inputMode="numeric"
                  value={customer.mobile}
                  onChange={(event) => updateCustomer('mobile', event.target.value.replace(/\D/g, '').slice(0, 10))}
                  aria-invalid={Boolean(errors.mobile)}
                />
                {errors.mobile && <span className="form-error">{errors.mobile}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="billing-email">Email</label>
                <input
                  id="billing-email"
                  type="email"
                  value={customer.email}
                  onChange={(event) => updateCustomer('email', event.target.value)}
                  aria-invalid={Boolean(errors.email)}
                />
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>
            </div>
          </div>

          <div className="card billing-section">
            <div className="section-header">
              <h3>Delivery Details</h3>
            </div>
            <div className="button-group bill-to-options">
              <button
                className={`btn btn-secondary ${billToSelf ? 'active' : ''}`}
                onClick={() => setBillToSelf(true)}
              >
                Bill To Customer
              </button>
              <button
                className={`btn btn-secondary ${!billToSelf ? 'active' : ''}`}
                onClick={() => setBillToSelf(false)}
              >
                Send To Other Person
              </button>
            </div>

            {!billToSelf && (
              <div className="send-to-form mt-4">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="recipient-name">Recipient Name</label>
                    <input
                      id="recipient-name"
                      type="text"
                      value={sendTo.name}
                      onChange={(event) => updateSendTo('name', event.target.value)}
                      aria-invalid={Boolean(errors['sendTo.name'])}
                    />
                    {errors['sendTo.name'] && <span className="form-error">{errors['sendTo.name']}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="recipient-mobile">Recipient Mobile</label>
                    <input
                      id="recipient-mobile"
                      type="tel"
                      inputMode="numeric"
                      value={sendTo.mobile}
                      onChange={(event) => updateSendTo('mobile', event.target.value.replace(/\D/g, '').slice(0, 10))}
                      aria-invalid={Boolean(errors['sendTo.mobile'])}
                    />
                    {errors['sendTo.mobile'] && <span className="form-error">{errors['sendTo.mobile']}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="recipient-email">Recipient Email</label>
                    <input
                      id="recipient-email"
                      type="email"
                      value={sendTo.email}
                      onChange={(event) => updateSendTo('email', event.target.value)}
                      aria-invalid={Boolean(errors['sendTo.email'])}
                    />
                    {errors['sendTo.email'] && <span className="form-error">{errors['sendTo.email']}</span>}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="card billing-section">
            <div className="section-header">
              <h3>Items / Services</h3>
              <button className="btn btn-sm btn-outline" onClick={handleAddItem}>
                <Plus size={14} /> Add Item
              </button>
            </div>
            {errors.items && <div className="inline-error">{errors.items}</div>}
            <div className="device-table-container">
              <table className="items-table">
                <thead>
                  <tr>
                    <th style={{ width: '40%' }}>Item Name</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th>Amount</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <input
                          className="table-input"
                          type="text"
                          value={item.name}
                          onChange={(event) => updateItem(item.id, 'name', event.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          className="table-input center"
                          type="number"
                          min="1"
                          value={item.qty}
                          onChange={(event) => updateItem(item.id, 'qty', parseInt(event.target.value, 10) || 0)}
                        />
                      </td>
                      <td>
                        <input
                          className="table-input"
                          type="number"
                          min="0"
                          value={item.rate}
                          onChange={(event) => updateItem(item.id, 'rate', parseFloat(event.target.value) || 0)}
                        />
                      </td>
                      <td className="bold">{formatAmount(item.amount)}</td>
                      <td>
                        <button className="icon-btn danger" onClick={() => removeItem(item.id)} aria-label={`Remove ${item.name || 'item'}`}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan="5">
                        <div className="empty-state compact">
                          <p>No billable items added.</p>
                          <button className="btn btn-sm btn-primary" onClick={handleAddItem}>Add Item</button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card billing-section used-parts-section">
            <div className="section-header">
              <div className="title-with-icon">
                <span className="inline-symbol" aria-hidden="true">Parts</span>
                <h3>Used Parts (Inventory Deduction)</h3>
              </div>
            </div>
            <p className="section-subtitle">Checked items deduct stock. Visibility controls whether parts appear on the invoice.</p>

            <div className="parts-list">
              {usedParts.map((part) => (
                <div key={part.id} className="part-item-row">
                  <div className="part-main">
                    <label className="checkbox-container">
                      <input
                        type="checkbox"
                        checked={part.selected}
                        onChange={() => togglePartSelection(part.id)}
                      />
                      <span className="checkmark"></span>
                      <span className="part-name-text">{part.name}</span>
                    </label>
                    <div className="part-qty-tag">Qty: {part.qty}</div>
                  </div>
                  <div className="part-actions">
                    <button
                      className={`icon-btn visibility-btn ${part.visible ? 'visible' : 'hidden'}`}
                      onClick={() => togglePartVisibility(part.id)}
                      title={part.visible ? 'Visible on Invoice' : 'Hidden on Invoice'}
                      aria-label={`${part.visible ? 'Hide' : 'Show'} ${part.name} on invoice`}
                    >
                      {part.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="billing-side">
          <div className="card summary-card sticky-sidebar billing-summary-card">
            <h3 className="summary-title">Invoice Summary</h3>

            {isGstEnabled && (
              <div className="gst-options-group">
                <label className="radio-container">
                  <input
                    type="radio"
                    name="gstOption"
                    checked={gstOption === 'included'}
                    onChange={() => setGstOption('included')}
                  />
                  <span className="radio-checkmark"></span>
                  <span>Include GST</span>
                </label>
                <label className="radio-container">
                  <input
                    type="radio"
                    name="gstOption"
                    checked={gstOption === 'extra'}
                    onChange={() => setGstOption('extra')}
                  />
                  <span className="radio-checkmark"></span>
                  <span>Add GST Extra</span>
                </label>
              </div>
            )}

            <div className="summary-lines">
              <div className="summary-line">
                <span>Subtotal</span>
                <span>{formatAmount(subtotal)}</span>
              </div>
              {isGstEnabled && (
                <div className="summary-line highlight">
                  <span>GST (18%)</span>
                  <span>{formatAmount(gstAmount)}</span>
                </div>
              )}
              <div className="summary-total">
                <span>Total</span>
                <span>{formatAmount(total)}</span>
              </div>
            </div>

            <div className="billing-actions">
              <button className="btn btn-primary btn-full" onClick={handleGenerateInvoice}>
                <CheckCircle size={18} /> Generate Invoice
              </button>
              <div className="btn-group-row">
                <button className="btn btn-secondary flex-1" onClick={() => window.print()}>
                  <Printer size={16} /> Print
                </button>
                <button className="btn btn-secondary flex-1 whatsapp-btn" onClick={() => setNotice('WhatsApp invoice message prepared.')}>
                  <MessageSquare size={16} /> WhatsApp
                </button>
              </div>
              <button className="btn btn-secondary btn-full" onClick={() => setNotice('Email invoice draft prepared.')}>
                <Send size={16} /> Send Email
              </button>
            </div>

            <div className="terms-container mt-4">
              <label htmlFor="invoice-terms">Terms & Conditions</label>
              <textarea
                id="invoice-terms"
                className="terms-input"
                value={invoiceTerms}
                onChange={(event) => setInvoiceTerms(event.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {viewingInvoice && (
        <div className="modal-overlay" role="presentation" onClick={() => setViewingInvoice(null)}>
          <div className="modal-panel billing-invoice-modal" role="dialog" aria-modal="true" aria-labelledby="billing-invoice-title" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 id="billing-invoice-title">{viewingInvoice.invoiceNumber}</h2>
                <p>{viewingInvoice.customerName} - {formatDate(viewingInvoice.issueDate)} to {formatDate(viewingInvoice.dueDate)}</p>
              </div>
              <button className="icon-btn" onClick={() => setViewingInvoice(null)} aria-label="Close invoice details">
                <X size={18} />
              </button>
            </div>

            <div className="modal-form">
              <div className="billing-modal-overview">
                <div className="billing-modal-item">
                  <span className="summary-label">Invoice Status</span>
                  <span className={`status-pill ${getInvoiceStatusClass(viewingInvoice.status)}`}>{viewingInvoice.status}</span>
                </div>
                <div className="billing-modal-item">
                  <span className="summary-label">Payment Status</span>
                  <span className={`status-pill payment-pill ${getPaymentStatusClass(viewingInvoice.paymentStatus)}`}>{viewingInvoice.paymentStatus}</span>
                </div>
                <div className="billing-modal-item">
                  <span className="summary-label">Total Amount</span>
                  <strong>{formatAmount(viewingInvoice.total)}</strong>
                </div>
              </div>

              <div className="device-table-container mt-4">
                <table className="report-table compact">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Qty</th>
                      <th>Rate</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewingInvoice.items.map((item) => (
                      <tr key={`${viewingInvoice.id}-${item.id}`}>
                        <td>{item.name}</td>
                        <td>{item.qty}</td>
                        <td>{formatAmount(item.rate)}</td>
                        <td>{formatAmount(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => handleDownloadInvoice(viewingInvoice)}>
                  <Download size={16} /> Download
                </button>
                <button className="btn btn-secondary" onClick={() => handleEditInvoice(viewingInvoice)}>
                  <ExternalLink size={16} /> Edit
                </button>
                <button className="btn btn-primary" onClick={() => setViewingInvoice(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
