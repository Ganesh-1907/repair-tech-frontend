import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Eye, FileCheck2, IndianRupee, Mail, MoreVertical, Plus, Printer, Save, Send, Trash2 } from 'lucide-react';
import { api } from '../../services/apiClient';
import './RentalManagement.css';
import './RentalInvoiceGenerator.css';

const COLLECTION = 'rentalCustomers';

const pageTabs = ['Customers', 'Customer View', 'Device Assignment', 'Replacement', 'Maintenance', 'Quotation', 'Agreement', 'Invoice Generator', 'Payment Tracking'];
const profileTabs = ['Overview', 'Locations', 'Devices', 'Invoices', 'Payments', 'Maintenance History'];
const techs = ['Suresh K', 'Rakesh P', 'Aditi M'];
const plans = ['Minimum Commitment Plan', 'Free Page Limit', 'Tier Pricing / Slab Pricing', 'Multi-Rate Printer Billing'];


const emptyCustomer = { companyName: '', customerType: 'Corporate', authorizedPerson1Name: '', authorizedPerson1Phone: '', authorizedPerson1Email: '', authorizedPerson2Name: '', authorizedPerson2Phone: '', authorizedPerson2Email: '', gstNumber: '', primaryAddress: '', billingAddress: '', contactNumber: '', email: '', notes: '', locations: [], additionalAddresses: [] };
const emptyDevice = { deviceType: 'Printer', brand: '', model: '', serialNumber: '', installationDate: '', customerLocation: '', technician: '', billingType: 'Multi-Rate Printer Billing', monthlyRent: '', meterStart: '', currentMeter: '', quantity: '1', deviceStatus: 'Active', notes: '' };
const customerRequiredFields = new Set(['companyName', 'authorizedPerson1Name', 'primaryAddress', 'contactNumber', 'email']);

const DataTable = ({ columns, rows, emptyText }) => (
  <div className="rm-table-wrap">
    <div className="rm-table-scroll">
      <table className="rm-table">
        <thead><tr>{columns.map((c) => <th key={c.key}>{c.label}</th>)}</tr></thead>
        <tbody>{rows.length ? rows.map((row) => <tr key={row.id}>{columns.map((c) => <td key={c.key}>{c.render ? c.render(row) : row[c.key]}</td>)}</tr>) : <tr><td className="rm-empty-row" colSpan={columns.length}>{emptyText}</td></tr>}</tbody>
      </table>
    </div>
  </div>
);

const statusClass = (value) => `rm-status rm-status-${String(value || '').toLowerCase().replace(/\s+/g, '-')}`;

const Header = ({ title, subtitle, actions = [] }) => (
  <div className="rm-page-header">
    <div><h1>{title}</h1><p>{subtitle}</p></div>
    <div className="rm-actions-row">{actions.map((a) => <button key={a.label} className={a.secondary ? 'rm-btn rm-btn-secondary' : 'rm-btn rm-btn-primary'} onClick={a.onClick}>{a.icon ? <a.icon size={14} /> : null}{a.label}</button>)}</div>
  </div>
);

const ActionMenu = ({ items }) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const rootRef = useRef(null);
  const triggerRef = useRef(null);

  const closeMenu = () => setOpen(false);

  const openMenu = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const menuWidth = 240;
    const menuHeight = Math.min(320, Math.max(180, (items?.length || 0) * 34 + 12));
    const pad = 8;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const showAbove = rect.bottom + 8 + menuHeight > vh;
    const top = showAbove ? Math.max(pad, rect.top - menuHeight - 8) : Math.min(vh - menuHeight - pad, rect.bottom + 8);
    const left = Math.min(vw - menuWidth - pad, Math.max(pad, rect.right - menuWidth));
    setPosition({ top, left });
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return undefined;
    const onDocClick = (event) => {
      if (!rootRef.current?.contains(event.target)) closeMenu();
    };
    const onEscape = (event) => {
      if (event.key === 'Escape') closeMenu();
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEscape);
    };
  }, [open]);

  return (
    <div className="rm-action-menu" ref={rootRef}>
      <button type="button" className="rm-icon-btn" ref={triggerRef} onClick={() => (open ? closeMenu() : openMenu())}>
        <MoreVertical size={16} />
      </button>
      {open ? (
        <div className="rm-action-popover rm-action-popover-fixed" style={{ top: `${position.top}px`, left: `${position.left}px` }}>
          {items.map((item) => (
            <button key={item.label} type="button" onClick={() => { item.onClick?.(); closeMenu(); }}>
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

const RentalOperationsBillingPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Customers');
  const [activeProfileTab, setActiveProfileTab] = useState('Overview');
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [editingCustomerId, setEditingCustomerId] = useState(null);
  const [customerFormOpen, setCustomerFormOpen] = useState(false);
  const [customerForm, setCustomerForm] = useState(emptyCustomer);
  const [deviceForm, setDeviceForm] = useState(emptyDevice);
  const [deviceBatch, setDeviceBatch] = useState([]);
  const [replacementForm, setReplacementForm] = useState({ oldDeviceId: '', replacementDate: '', oldClosingReading: '', newBrand: '', newModel: '', newSerial: '', newInstallDate: '', newStartReading: '', location: '', technician: '', reason: '', notes: '' });
  const [maintenanceForm, setMaintenanceForm] = useState({ rentalStartDate: '', visitDate: '', technician: '', location: '', deviceId: '', issue: '', workDone: '', status: 'Completed', technicianSignature: '', customerSignature: '' });
  const [maintenanceParts, setMaintenanceParts] = useState([{ id: 'PART-1', item: 'Toner Powder', qty: '1', charge: '' }]);
  const [invoiceForm, setInvoiceForm] = useState({ billingPeriod: '', billingMode: 'Combined Invoice', addOnCharges: '', addOnItems: '', discounts: '', gst: '18', currentMeterAvailable: true });
  const [invoiceCustomerId, setInvoiceCustomerId] = useState('');
  const [invoiceCustomerSearch, setInvoiceCustomerSearch] = useState('');
  const [invoiceTypeFilter, setInvoiceTypeFilter] = useState('All');
  const [invoiceDraftByDevice, setInvoiceDraftByDevice] = useState({});
  const [invoiceWorkflowStatus, setInvoiceWorkflowStatus] = useState('Draft');
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [invoiceHistoryRows, setInvoiceHistoryRows] = useState([]);
  const [paymentForm, setPaymentForm] = useState({ invoiceNumber: '', invoiceAmount: '', paidAmount: '', paymentDate: '', paymentMode: '', notes: '' });
  const [quotationForm, setQuotationForm] = useState({ quotationNumber: '', quotationDate: '', validUntil: '', monthlyRent: '', meterRates: '', addOns: '', discounts: '', taxes: '18', terms: 'Payment due within 15 days.', notes: '' });
  const [quotationEditMode, setQuotationEditMode] = useState(false);
  const [quotationSnapshot, setQuotationSnapshot] = useState(null);
  const [agreementEditMode, setAgreementEditMode] = useState(false);
  const [agreementSnapshot, setAgreementSnapshot] = useState(null);
  const [agreementDoc, setAgreementDoc] = useState({
    introDate: '',
    serviceProvider: 'RepairTech Solutions, Bangalore (Hereinafter referred to as The Company)',
    client: '',
    scope: 'The Company agrees to provide maintenance services for the equipment listed in the Asset Registry below as per the Standard CMC.',
    period: '',
    paymentTerms: 'The client agrees to pay the agreed monthly rental and usage charges for the period mentioned above.',
  });
  const [agreementType, setAgreementType] = useState('Corporate');
  const [toast, setToast] = useState('');
  const todayIso = new Date().toISOString().slice(0, 10);

  const selected = useMemo(() => customers.find((c) => c.id === selectedCustomerId) || null, [customers, selectedCustomerId]);
  const hasOpenedCustomer = Boolean(selectedCustomerId && selected);
  const visibleTabs = activeTab === 'Customers' ? ['Customers'] : (hasOpenedCustomer ? pageTabs : ['Customers']);
  const tell = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2200); };
  const goToCustomers = () => setActiveTab('Customers');

  // ── Backend helpers ──
  const fetchCustomers = useCallback(async () => {
    setLoadingCustomers(true);
    try {
      const data = await api.list(COLLECTION);
      setCustomers(Array.isArray(data) ? data : []);
    } catch {
      tell('Failed to load customers. Check backend connection.');
    } finally {
      setLoadingCustomers(false);
    }
  }, []);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  // Persist the full updated customer document to backend
  const persistCustomer = useCallback(async (updatedCustomer) => {
    try {
      const saved = updatedCustomer.id
        ? await api.update(COLLECTION, updatedCustomer.id, updatedCustomer)
        : await api.create(COLLECTION, updatedCustomer);
      return saved;
    } catch {
      tell('Failed to save to backend. Changes may not persist.');
      return updatedCustomer;
    }
  }, []);
  const closeCustomerModal = () => {
    setCustomerFormOpen(false);
    setEditingCustomerId(null);
    setCustomerForm(emptyCustomer);
  };

  const addAdditionalAddress = () => {
    setCustomerForm((current) => ({ ...current, additionalAddresses: [...(current.additionalAddresses || []), ''] }));
  };

  const updateAdditionalAddress = (index, value) => {
    setCustomerForm((current) => ({
      ...current,
      additionalAddresses: (current.additionalAddresses || []).map((address, i) => (i === index ? value : address)),
    }));
  };

  const removeAdditionalAddress = (index) => {
    setCustomerForm((current) => ({
      ...current,
      additionalAddresses: (current.additionalAddresses || []).filter((_, i) => i !== index),
    }));
  };

  const saveCustomer = async () => {
    if (!customerForm.companyName || !customerForm.authorizedPerson1Name || !customerForm.primaryAddress || !customerForm.contactNumber || !customerForm.email) return tell('Please fill required customer fields.');
    if (customerForm.customerType === 'Corporate' && !customerForm.gstNumber) return tell('GST is required for corporate customers.');
    const additionalAddresses = (customerForm.additionalAddresses || [])
      .map((address) => String(address || '').trim())
      .filter(Boolean)
      .filter((address, index, arr) => arr.indexOf(address) === index);
    const generatedLocations = [
      {
        id: `LOC-${Date.now()}-0`,
        locationName: 'Primary Location',
        address: customerForm.primaryAddress,
        city: '',
        state: '',
        pincode: '',
        contactPerson: customerForm.authorizedPerson1Name,
        contactNumber: customerForm.contactNumber,
        isPrimary: true,
      },
      ...additionalAddresses.map((address, index) => ({
        id: `LOC-${Date.now()}-${index + 1}`,
        locationName: `Branch ${index + 1}`,
        address,
        city: '',
        state: '',
        pincode: '',
        contactPerson: customerForm.authorizedPerson1Name,
        contactNumber: customerForm.contactNumber,
        isPrimary: false,
      })),
    ];
    if (editingCustomerId) {
      const existing = customers.find((r) => r.id === editingCustomerId) || {};
      const updated = { ...existing, ...customerForm, locations: generatedLocations, additionalAddresses };
      setCustomers((rows) => rows.map((row) => row.id === editingCustomerId ? updated : row));
      persistCustomer(updated);
      tell('Customer updated.');
    } else {
      const next = {
        ...customerForm,
        id: `CUS-${Date.now().toString().slice(-6)}`,
        status: 'Pending',
        billingType: 'Smart Billing Plan',
        outstandingAmount: 0,
        locations: generatedLocations,
        additionalAddresses,
        devices: [], quotations: [], agreements: [], invoices: [], payments: [], maintenanceHistory: [], replacements: [],
      };
      const saved = await persistCustomer(next);
      setCustomers((c) => [saved || next, ...c]);
      tell('Customer saved.');
    }
    closeCustomerModal();
  };

  const queueDevice = () => {
    if (!deviceForm.customerLocation || !deviceForm.technician) return tell('Each device requires location and technician.');
    const qty = Math.max(1, Number(deviceForm.quantity || 1));
    const next = {
      id: `QDEV-${Date.now()}`,
      deviceType: deviceForm.deviceType,
      brand: deviceForm.brand,
      model: deviceForm.model,
      serialNumber: deviceForm.serialNumber,
      installationDate: deviceForm.installationDate,
      customerLocation: deviceForm.customerLocation,
      technician: deviceForm.technician,
      billingType: deviceForm.billingType,
      monthlyRent: Number(deviceForm.monthlyRent || 0),
      currentMeter: Number(deviceForm.currentMeter || 0),
      status: deviceForm.deviceStatus,
      quantity: qty,
    };
    setDeviceBatch((rows) => [...rows, next]);
    setDeviceForm(emptyDevice);
    tell('Device added to batch.');
  };

  const saveAllDevices = () => {
    if (!deviceBatch.length) return tell('Add at least one device to batch.');
    const expanded = deviceBatch.flatMap((row) => {
      const qty = Math.max(1, Number(row.quantity || 1));
      return Array.from({ length: qty }).map((_, index) => ({
        id: `DEV-${Math.floor(Math.random() * 9000 + 1000)}-${index + 1}`,
        deviceType: row.deviceType,
        brand: row.brand,
        model: row.model,
        serialNumber: qty > 1 ? `${row.serialNumber || 'SER'}-${index + 1}` : row.serialNumber,
        installationDate: row.installationDate,
        customerLocation: row.customerLocation,
        technician: row.technician,
        billingType: row.billingType,
        monthlyRent: row.monthlyRent,
        currentMeter: row.currentMeter,
        status: row.status,
      }));
    });
    setCustomers((rows) => {
      const next = rows.map((c) => c.id === selected.id ? { ...c, devices: [...(c.devices || []), ...expanded] } : c);
      const updated = next.find((c) => c.id === selected.id);
      if (updated) persistCustomer(updated);
      return next;
    });
    setDeviceBatch([]);
    tell(`${expanded.length} devices saved.`);
  };
  const addMaintenancePart = () => {
    setMaintenanceParts((rows) => [...rows, { id: `PART-${Date.now()}`, item: '', qty: '1', charge: '' }]);
  };
  const updateMaintenancePart = (partId, patch) => {
    setMaintenanceParts((rows) => rows.map((row) => (row.id === partId ? { ...row, ...patch } : row)));
  };
  const removeMaintenancePart = (partId) => {
    setMaintenanceParts((rows) => rows.filter((row) => row.id !== partId));
  };
  const saveMaintenanceReport = () => {
    if (!selected) return tell('Open a customer first.');
    if (!maintenanceForm.visitDate || !maintenanceForm.technician || !maintenanceForm.issue || !maintenanceForm.workDone) {
      return tell('Please fill required maintenance fields.');
    }
    const nextEntry = {
      id: `MNT-${Math.floor(Math.random() * 9000 + 1000)}`,
      visitDate: maintenanceForm.visitDate,
      technician: maintenanceForm.technician,
      issue: maintenanceForm.issue,
      status: maintenanceForm.status,
      location: maintenanceForm.location,
      deviceId: maintenanceForm.deviceId,
      workDone: maintenanceForm.workDone,
      parts: maintenanceParts.filter((row) => row.item),
    };
    setCustomers((rows) => {
      const next = rows.map((row) => row.id === selected.id ? { ...row, maintenanceHistory: [nextEntry, ...(row.maintenanceHistory || [])] } : row);
      const updated = next.find((c) => c.id === selected.id);
      if (updated) persistCustomer(updated);
      return next;
    });
    tell('Service report saved.');
  };

  const removeQueuedDevice = (id) => {
    setDeviceBatch((rows) => rows.filter((row) => row.id !== id));
  };

  const confirmReplacement = () => {
    if (!replacementForm.oldDeviceId || !replacementForm.oldClosingReading) return tell('Replacement requires old closing meter reading.');
    setCustomers((rows) => rows.map((c) => {
      if (c.id !== selected.id) return c;
      const old = c.devices.find((d) => d.id === replacementForm.oldDeviceId);
      if (!old) return c;
      const updated = c.devices.map((d) => d.id === old.id ? { ...d, status: 'Replaced', closingMeter: replacementForm.oldClosingReading, replacementDate: replacementForm.replacementDate } : d);
      const added = { id: `DEV-${Date.now()}`, deviceType: old.deviceType, brand: replacementForm.newBrand, model: replacementForm.newModel, serialNumber: replacementForm.newSerial, installationDate: replacementForm.newInstallDate, customerLocation: replacementForm.location || old.customerLocation, technician: replacementForm.technician || old.technician, billingType: old.billingType, monthlyRent: old.monthlyRent, currentMeter: Number(replacementForm.newStartReading || 0), status: 'Active' };
      const rep = { id: `REP-${Date.now()}`, oldDeviceId: old.id, newDeviceId: added.id, replacementDate: replacementForm.replacementDate, oldClosingReading: Number(replacementForm.oldClosingReading), newStartingReading: Number(replacementForm.newStartReading || 0), reason: replacementForm.reason };
      return { ...c, devices: [...updated, added], replacements: [...(c.replacements || []), rep] };
    }));
    setCustomers((rows) => {
      const updatedCustomer = rows.find((c) => c.id === selected.id);
      if (updatedCustomer) persistCustomer(updatedCustomer);
      return rows;
    });
    tell('Replacement confirmed with billing split metadata.');
  };

  const viewPaymentInvoice = () => {
    const invoiceId = fallbackInvoiceId;
    if (!invoiceId) return tell('No invoice available to view.');
    tell(`Invoice ${invoiceId} opened.`);
  };
  const downloadReceipt = () => {
    const invoiceId = fallbackInvoiceId;
    if (!invoiceId) return tell('No invoice available for receipt.');
    tell(`Receipt downloaded for ${invoiceId}.`);
  };
  const recordPayment = () => {
    if (!selected) return tell('Open a customer first.');
    const invoiceId = String(fallbackInvoiceId || '').trim();
    if (!invoiceId) return tell('Invoice Number is required.');
    const paymentDate = paymentForm.paymentDate || todayIso;
    if (!paymentDate) return tell('Payment Date is required.');
    if (!paymentForm.paymentMode) return tell('Payment Mode is required.');
    const paidAmount = Number(paymentForm.paidAmount || 0);
    if (Number.isNaN(paidAmount) || paidAmount <= 0) return tell('Enter a valid Paid Amount.');

    const targetInvoice = selected.invoices.find((inv) => inv.id === invoiceId);
    if (!targetInvoice) return tell('Invoice not found for this customer.');
    const invoiceAmount = Number(fallbackInvoiceAmount || targetInvoice.total || 0);
    const alreadyPaid = (selected.payments || [])
      .filter((entry) => entry.invoiceId === invoiceId)
      .reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
    const balanceBefore = Math.max(invoiceAmount - alreadyPaid, 0);
    if (paidAmount > balanceBefore) return tell('Payment cannot exceed invoice balance.');

    const balanceAfter = Math.max(balanceBefore - paidAmount, 0);
    const nextStatus = balanceAfter === 0 ? 'Paid' : 'Partially Paid';
    const paymentId = `PAY-${Math.floor(Math.random() * 9000 + 1000)}`;

    setCustomers((rows) => rows.map((row) => {
      if (row.id !== selected.id) return row;
      const invoices = (row.invoices || []).map((inv) => inv.id === invoiceId ? { ...inv, paymentStatus: nextStatus } : inv);
      const payments = [...(row.payments || []), {
        id: paymentId,
        invoiceId,
        amount: paidAmount,
        mode: paymentForm.paymentMode,
        date: paymentDate,
        notes: paymentForm.notes || '',
      }];
      return { ...row, invoices, payments, outstandingAmount: Math.max(Number(row.outstandingAmount || 0) - paidAmount, 0) };
    }));
    setCustomers((rows) => {
      const updatedCustomer = rows.find((c) => c.id === selected.id);
      if (updatedCustomer) persistCustomer(updatedCustomer);
      return rows;
    });

    setPaymentForm((current) => ({
      ...current,
      paidAmount: '',
      notes: '',
      invoiceAmount: String(invoiceAmount),
      paymentDate,
    }));
    tell(`Payment of Rs ${paidAmount} recorded for ${invoiceId}.`);
  };
  const removeDevice = (deviceId) => {
    if (!selected) return;
    setCustomers((rows) => {
      const next = rows.map((row) => row.id === selected.id ? { ...row, devices: (row.devices || []).filter((device) => device.id !== deviceId) } : row);
      const updated = next.find((c) => c.id === selected.id);
      if (updated) persistCustomer(updated);
      return next;
    });
    tell('Device removed.');
  };
  const editDevice = (device) => {
    setDeviceForm({
      deviceType: device.deviceType || 'Printer',
      brand: device.brand || '',
      model: device.model || '',
      serialNumber: device.serialNumber || '',
      installationDate: device.installationDate || '',
      customerLocation: device.customerLocation || '',
      technician: device.technician || '',
      billingType: device.billingType || 'Multi-Rate Printer Billing',
      monthlyRent: String(device.monthlyRent || ''),
      meterStart: '',
      currentMeter: String(device.currentMeter || ''),
      deviceStatus: device.status || 'Active',
      notes: '',
    });
    setActiveTab('Device Assignment');
  };
  const addMeterReading = (device) => {
    const reading = window.prompt(`Enter current meter reading for ${device.serialNumber}`, String(device.currentMeter || 0));
    if (reading === null) return;
    const parsed = Number(reading);
    if (Number.isNaN(parsed) || parsed < 0) return tell('Invalid meter reading.');
    setCustomers((rows) => rows.map((row) => row.id === selected.id ? { ...row, devices: row.devices.map((d) => d.id === device.id ? { ...d, currentMeter: parsed } : d) } : row));
    tell('Meter reading updated.');
  };
  const startQuotationEdit = () => {
    setQuotationSnapshot({ ...quotationForm });
    setQuotationEditMode(true);
  };
  const cancelQuotationEdit = () => {
    if (quotationSnapshot) setQuotationForm(quotationSnapshot);
    setQuotationEditMode(false);
    setQuotationSnapshot(null);
    tell('Quotation edit cancelled.');
  };
  const saveQuotationEdit = () => {
    setQuotationEditMode(false);
    setQuotationSnapshot(null);
    tell('Quotation saved.');
  };
  const startAgreementEdit = () => {
    const defaultPeriod = `This agreement shall be valid from ${selected?.agreements?.[0]?.startDate || ''} to ${selected?.agreements?.[0]?.endDate || ''}.`;
    setAgreementSnapshot({ ...agreementDoc });
    setAgreementDoc((current) => ({
      ...current,
      client: current.client || `${selected?.companyName || ''}, (Hereinafter referred to as The Client)`,
      period: current.period || defaultPeriod,
    }));
    setAgreementEditMode(true);
  };
  const cancelAgreementEdit = () => {
    if (agreementSnapshot) setAgreementDoc(agreementSnapshot);
    setAgreementEditMode(false);
    setAgreementSnapshot(null);
    tell('Agreement edit cancelled.');
  };
  const saveAgreementEdit = () => {
    setAgreementEditMode(false);
    setAgreementSnapshot(null);
    tell('Agreement saved.');
  };

  const customerRows = customers.map((c) => ({ ...c, activeDevicesCount: (c.devices || []).filter((d) => d.status === 'Active').length }));
  const invoiceCustomers = useMemo(() => customers.filter((row) => {
    const matchesSearch = `${row.companyName} ${row.gstNumber || ''}`.toLowerCase().includes(invoiceCustomerSearch.toLowerCase());
    const hasPending = (row.invoices || []).some((inv) => inv.paymentStatus === 'Unpaid' || inv.paymentStatus === 'Partially Paid');
    const matchesType = invoiceTypeFilter === 'All'
      ? true
      : invoiceTypeFilter === 'Pending invoices'
        ? hasPending
        : row.customerType === invoiceTypeFilter;
    return matchesSearch && matchesType;
  }), [customers, invoiceCustomerSearch, invoiceTypeFilter]);
  const effectiveInvoiceCustomerId = activeTab === 'Invoice Generator' && !invoiceCustomerId ? selected?.id : invoiceCustomerId;
  const invoiceCustomer = useMemo(() => customers.find((row) => row.id === effectiveInvoiceCustomerId) || selected || null, [customers, effectiveInvoiceCustomerId, selected]);
  const invoiceActiveDevices = useMemo(() => (invoiceCustomer?.devices || []).filter((row) => row.status === 'Active' || row.status === 'Under Maintenance'), [invoiceCustomer]);
  const ensureDraft = useCallback((device) => {
    const existing = invoiceDraftByDevice[device.id];
    if (existing) return existing;
    return {
      previous: Math.max(0, Number(device.currentMeter || 0) - 500),
      current: Number(device.currentMeter || 0),
      fixedRent: Number(device.monthlyRent || 0),
      planType: device.billingType || 'Fixed Rental Plan',
      freeLimit: 1000,
      minCommitment: 5000,
      slabs: [
        { upto: 1000, rate: 0.5 },
        { upto: 5000, rate: 0.4 },
        { upto: Infinity, rate: 0.3 },
      ],
      meterRates: { a4bw: 0.5, a4color: 3, a3bw: 5, a3color: 7 },
      meterUsage: { a4bw: 0, a4color: 0, a3bw: 0, a3color: 0 },
      addOns: 0,
      discountType: 'flat',
      discountValue: 0,
      taxPercent: 18,
      replacementSplitDaysOld: 0,
      replacementSplitDaysNew: 0,
    };
  }, [invoiceDraftByDevice]);
  const updateInvoiceDraft = (deviceId, patch) => {
    setInvoiceDraftByDevice((rows) => ({ ...rows, [deviceId]: { ...(rows[deviceId] || {}), ...patch } }));
  };
  const calcDevice = useCallback((device) => {
    const draft = ensureDraft(device);
    const usage = Math.max(0, Number(draft.current || 0) - Number(draft.previous || 0));
    let usageCharge = 0;
    if (draft.planType.includes('Free Page')) {
      usageCharge = Math.max(0, usage - Number(draft.freeLimit || 0)) * 0.5;
    } else if (draft.planType.includes('Minimum Commitment')) {
      usageCharge = Math.max(Number(draft.minCommitment || 0), usage * 0.5);
    } else if (draft.planType.includes('Tier')) {
      let remaining = usage;
      let lastCap = 0;
      draft.slabs.forEach((slab) => {
        if (remaining <= 0) return;
        const cap = slab.upto === Infinity ? remaining : Math.max(0, slab.upto - lastCap);
        const billed = Math.min(remaining, cap);
        usageCharge += billed * slab.rate;
        remaining -= billed;
        lastCap = slab.upto;
      });
    } else if (draft.planType.includes('Multi-Rate')) {
      usageCharge = Number(draft.meterUsage.a4bw || 0) * Number(draft.meterRates.a4bw || 0)
        + Number(draft.meterUsage.a4color || 0) * Number(draft.meterRates.a4color || 0)
        + Number(draft.meterUsage.a3bw || 0) * Number(draft.meterRates.a3bw || 0)
        + Number(draft.meterUsage.a3color || 0) * Number(draft.meterRates.a3color || 0);
    } else {
      usageCharge = usage * 0.5;
    }
    const fixedRent = Number(draft.fixedRent || 0);
    const replacementSplit = (Number(draft.replacementSplitDaysOld || 0) + Number(draft.replacementSplitDaysNew || 0)) > 0;
    const replacementAdj = replacementSplit ? fixedRent : 0;
    const gross = fixedRent + usageCharge + replacementAdj + Number(draft.addOns || 0);
    const discount = draft.discountType === 'percent' ? gross * (Number(draft.discountValue || 0) / 100) : Number(draft.discountValue || 0);
    const taxable = Math.max(0, gross - discount);
    const tax = taxable * (Number(draft.taxPercent || 0) / 100);
    const total = taxable + tax;
    return { usage, usageCharge, fixedRent, replacementAdj, gross, discount, taxable, tax, total, draft };
  }, [ensureDraft]);
  const invoiceBreakdown = useMemo(() => invoiceActiveDevices.map((device) => ({ device, calc: calcDevice(device) })), [invoiceActiveDevices, calcDevice]);
  const invoiceTotals = useMemo(() => {
    const subtotal = invoiceBreakdown.reduce((sum, row) => sum + row.calc.gross, 0);
    const discounts = invoiceBreakdown.reduce((sum, row) => sum + row.calc.discount, 0);
    const taxes = invoiceBreakdown.reduce((sum, row) => sum + row.calc.tax, 0);
    const grandTotal = subtotal - discounts + taxes;
    return { subtotal, discounts, taxes, grandTotal };
  }, [invoiceBreakdown]);
  const intraState = (invoiceCustomer?.primaryAddress || '').toLowerCase().includes('karnataka');
  const invoiceTaxSplit = useMemo(() => {
    if (intraState) return { cgst: invoiceTotals.taxes / 2, sgst: invoiceTotals.taxes / 2, igst: 0 };
    return { cgst: 0, sgst: 0, igst: invoiceTotals.taxes };
  }, [invoiceTotals.taxes, intraState]);
  const invoiceHistory = useMemo(() => {
    const staticRows = (invoiceCustomer?.invoices || []).map((row) => ({
      id: row.id,
      customer: invoiceCustomer.companyName,
      period: row.period,
      total: row.total,
      paymentStatus: row.paymentStatus,
      status: row.paymentStatus === 'Paid' ? 'Paid' : 'Generated',
      date: row.date || '',
    }));
    return [...invoiceHistoryRows, ...staticRows];
  }, [invoiceHistoryRows, invoiceCustomer]);
  const selectedPaymentInvoice = useMemo(() => {
    if (!selected) return null;
    const invoiceId = String(paymentForm.invoiceNumber || '').trim();
    if (invoiceId) return selected.invoices.find((inv) => inv.id === invoiceId) || null;
    return selected.invoices[0] || null;
  }, [selected, paymentForm.invoiceNumber]);
  const selectedPaymentInvoiceAmount = Number(paymentForm.invoiceAmount || selectedPaymentInvoice?.total || 0);
  const selectedInvoicePaidSoFar = useMemo(() => {
    if (!selected || !selectedPaymentInvoice) return 0;
    return (selected.payments || [])
      .filter((entry) => entry.invoiceId === selectedPaymentInvoice.id)
      .reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
  }, [selected, selectedPaymentInvoice]);
  const selectedInvoiceCurrentBalance = Math.max(selectedPaymentInvoiceAmount - selectedInvoicePaidSoFar, 0);
  const selectedInvoiceDerivedStatus = selectedInvoiceCurrentBalance === selectedPaymentInvoiceAmount
    ? 'Unpaid'
    : selectedInvoiceCurrentBalance === 0
      ? 'Paid'
      : 'Partially Paid';
  const fallbackInvoiceId = paymentForm.invoiceNumber || selected?.invoices?.[0]?.id || '';
  const fallbackInvoiceAmount = paymentForm.invoiceAmount || (selectedPaymentInvoice ? String(selectedPaymentInvoice.total || '') : '');
  const runInvoiceCalculation = () => {
    if (!invoiceCustomer) return tell('Select customer first.');
    setInvoiceLoading(true);
    setTimeout(() => {
      setInvoiceLoading(false);
      tell('Invoice calculations completed.');
    }, 650);
  };
  const generateInvoiceRecord = (status = 'Generated') => {
    if (!invoiceCustomer) return tell('Select customer first.');
    const id = `INV-${Math.floor(Math.random() * 9000 + 1000)}`;
    const period = invoiceForm.billingPeriod || new Date().toISOString().slice(0, 7);
    const row = { id, customer: invoiceCustomer.companyName, period, total: Math.round(invoiceTotals.grandTotal), paymentStatus: status === 'Draft' ? 'Draft' : 'Unpaid', status, date: new Date().toISOString().slice(0, 10) };
    setInvoiceHistoryRows((rows) => [row, ...rows]);
    setInvoiceWorkflowStatus(status);
    tell(`Invoice ${status.toLowerCase()} successfully.`);
  };
  const markLatestInvoicePaid = () => {
    setInvoiceHistoryRows((rows) => {
      if (!rows.length) return rows;
      const [first, ...rest] = rows;
      return [{ ...first, paymentStatus: 'Paid', status: 'Paid' }, ...rest];
    });
    setInvoiceWorkflowStatus('Paid');
    tell('Latest invoice marked as paid.');
  };

  return (
    <div className="rental-management-shell">
      {activeTab !== 'Customers' ? (
        <div className="rm-main-nav-row">
          <button className="rm-btn rm-btn-secondary" onClick={goToCustomers}>Back</button>
          <div className="rm-view-filter">
            <select
              id="rental-main-section"
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
            >
              {visibleTabs.map((tab) => (
                <option key={tab} value={tab}>{tab}</option>
              ))}
            </select>
          </div>
        </div>
      ) : null}

      {activeTab === 'Customers' && (
        <div className="rm-section-stack">
          <Header title="Rental Customers" subtitle="Primary address listing with compact CRM actions" actions={[{ label: '+ Add Customer', icon: Plus, onClick: () => navigate('/admin/rental/new') }, { label: 'Generate Invoice', icon: FileCheck2, onClick: () => selected ? setActiveTab('Invoice Generator') : tell('Open a customer first to generate invoice.') }, { label: 'Export Customers', icon: Download, secondary: true, onClick: () => tell('Export started.') }]} />
          <div className="rm-card">
            <DataTable
              columns={[
                { key: 'companyName', label: 'Company Name' }, { key: 'authorizedPerson1Name', label: 'Authorized Person 1' }, { key: 'authorizedPerson2Name', label: 'Authorized Person 2' }, { key: 'gstNumber', label: 'GST Number' }, { key: 'primaryAddress', label: 'Primary Address' }, { key: 'contactNumber', label: 'Contact Number' }, { key: 'email', label: 'Email' }, { key: 'activeDevicesCount', label: 'Active Devices' }, { key: 'billingType', label: 'Billing Type' }, { key: 'status', label: 'Status', render: (r) => <span className={statusClass(r.status)}>{r.status}</span> }, {
                  key: 'actions', label: 'Actions', render: (r) => <ActionMenu items={[
                    { label: 'View Customer', onClick: () => { setSelectedCustomerId(r.id); setActiveTab('Customer View'); } },
                    { label: 'Edit Customer Details', onClick: () => { setEditingCustomerId(r.id); setCustomerForm({ ...r, additionalAddresses: r.additionalAddresses || (r.locations || []).filter((l) => !l.isPrimary).map((l) => l.address) }); setCustomerFormOpen(true); } },
                    { label: 'Send Quotation', onClick: () => { setSelectedCustomerId(r.id); setActiveTab('Quotation'); } },
                    { label: 'New Agreement - Individual', onClick: () => { setSelectedCustomerId(r.id); setAgreementType('Individual'); setActiveTab('Agreement'); } },
                    { label: 'New Agreement - Corporate', onClick: () => { setSelectedCustomerId(r.id); setAgreementType('Corporate'); setActiveTab('Agreement'); } },
                    { label: 'Device Assignment', onClick: () => { setSelectedCustomerId(r.id); setActiveTab('Device Assignment'); } },
                    { label: 'Replacement', onClick: () => { setSelectedCustomerId(r.id); setActiveTab('Replacement'); } },
                    { label: 'Maintenance', onClick: () => { setSelectedCustomerId(r.id); setActiveTab('Maintenance'); } },
                    { label: 'Invoice Generator', onClick: () => { setSelectedCustomerId(r.id); setActiveTab('Invoice Generator'); } },
                    { label: 'Payment Tracking', onClick: () => { setSelectedCustomerId(r.id); setActiveTab('Payment Tracking'); } },
                  ]} />,
                },
              ]}
              rows={customerRows}
              emptyText={loadingCustomers ? 'Loading customers…' : 'No customers found. Click "+ Add Customer" to create one.'}
            />
          </div>
          {customerFormOpen && (
            <div className="rm-modal-overlay" onClick={closeCustomerModal}>
              <div className="rm-card rm-modal-card" onClick={(e) => e.stopPropagation()}>
              <h3>Add / Edit Customer</h3>
              <div className="rm-form-grid">
                {['companyName', 'authorizedPerson1Name', 'authorizedPerson1Phone', 'authorizedPerson1Email', 'authorizedPerson2Name', 'authorizedPerson2Phone', 'authorizedPerson2Email', 'gstNumber', 'primaryAddress', 'billingAddress', 'contactNumber', 'email'].map((k) => <label key={k}>{k.replace(/([A-Z])/g, ' $1').replace(/^./, (m) => m.toUpperCase())}{customerRequiredFields.has(k) ? <span className="rm-required-asterisk">*</span> : null}{k === 'gstNumber' ? <span className="rm-required-note"> (Required for Corporate)</span> : null}<input value={customerForm[k] || ''} onChange={(e) => setCustomerForm((c) => ({ ...c, [k]: e.target.value }))} /></label>)}
                <label>Customer Type<span className="rm-required-asterisk">*</span><select value={customerForm.customerType} onChange={(e) => setCustomerForm((c) => ({ ...c, customerType: e.target.value }))}><option>Individual</option><option>Corporate</option></select></label>
                <label className="full">Notes<textarea value={customerForm.notes || ''} onChange={(e) => setCustomerForm((c) => ({ ...c, notes: e.target.value }))} /></label>
              </div>
              <div className="rm-divider"></div>
              <div className="rm-inline-heading">
                <h4>Additional Addresses</h4>
                <button className="rm-btn rm-btn-secondary" onClick={addAdditionalAddress}><Plus size={14} />+ Add Address</button>
              </div>
              {(customerForm.additionalAddresses || []).length ? (
                <div className="rm-address-list">
                  {(customerForm.additionalAddresses || []).map((address, index) => (
                    <div key={`addr-${index}`} className="rm-address-row">
                      <input
                        value={address}
                        placeholder={`Address ${index + 2}`}
                        onChange={(e) => updateAdditionalAddress(index, e.target.value)}
                      />
                      <button className="rm-icon-btn" onClick={() => removeAdditionalAddress(index)}><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rm-muted">No additional addresses added.</p>
              )}
              <div className="rm-actions-row"><button className="rm-btn rm-btn-primary" onClick={saveCustomer}><Save size={14} />Save Customer</button><button className="rm-btn rm-btn-secondary" onClick={closeCustomerModal}>Cancel</button></div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'Customer View' && selected && (
        <div className="rm-section-stack">
          <Header title="Customer View" subtitle="Profile summary with devices, quotations, agreements, invoices, payments, and maintenance" actions={[{ label: '+ Add Device', icon: Plus, onClick: () => setActiveTab('Device Assignment') }]} />
          <div className="rm-card rm-summary-grid">
            <Info label="Company / Customer Name" value={selected.companyName} /><Info label="GST" value={selected.gstNumber || 'N/A'} /><Info label="Primary Contact" value={selected.contactNumber} /><Info label="Primary Address" value={selected.primaryAddress} /><Info label="Billing Status" value={selected.invoices[0]?.paymentStatus || 'Unpaid'} /><Info label="Total Active Devices" value={String(selected.devices.filter((d) => d.status === 'Active').length)} /><Info label="Outstanding Amount" value={`Rs ${selected.outstandingAmount || 0}`} />
          </div>
          <div className="rm-subtabs">{profileTabs.map((tab) => <button key={tab} className={activeProfileTab === tab ? 'active' : ''} onClick={() => setActiveProfileTab(tab)}>{tab}</button>)}</div>
          <div className="rm-card">
            {activeProfileTab === 'Locations' && <DataTable columns={[{ key: 'locationName', label: 'Location Name' }, { key: 'address', label: 'Address' }, { key: 'contactPerson', label: 'Contact Person' }, { key: 'contactNumber', label: 'Contact Number' }]} rows={selected.locations} emptyText="No locations added yet" />}
            {activeProfileTab === 'Devices' && <DataTable columns={[{ key: 'deviceType', label: 'Device Type' }, { key: 'model', label: 'Model' }, { key: 'serialNumber', label: 'Asset Serial Number' }, { key: 'installationDate', label: 'Installation Date' }, { key: 'customerLocation', label: 'Customer Location' }, { key: 'technician', label: 'Assigned Technician' }, { key: 'currentMeter', label: 'Current Meter Reading' }, { key: 'billingType', label: 'Billing Plan' }, { key: 'status', label: 'Status', render: (r) => <span className={statusClass(r.status)}>{r.status}</span> }, { key: 'actions', label: 'Actions', render: (row) => <ActionMenu items={[{ label: 'View Device', onClick: () => tell(`Device ${row.serialNumber} selected.`) }, { label: 'Edit Device', onClick: () => editDevice(row) }, { label: 'Replace Device', onClick: () => { setReplacementForm((curr) => ({ ...curr, oldDeviceId: row.id, location: row.customerLocation, technician: row.technician })); setActiveTab('Replacement'); } }, { label: 'Remove Device', onClick: () => removeDevice(row.id) }, { label: 'Add Meter Reading', onClick: () => addMeterReading(row) }, { label: 'View Maintenance', onClick: () => setActiveTab('Maintenance') }]} /> }]} rows={selected.devices} emptyText="No devices added yet" />}
            {activeProfileTab === 'Quotations' && <DataTable columns={[{ key: 'id', label: 'Quotation Number' }, { key: 'date', label: 'Quotation Date' }, { key: 'validUntil', label: 'Valid Until' }, { key: 'amount', label: 'Amount', render: (r) => `Rs ${r.amount}` }, { key: 'status', label: 'Status' }]} rows={selected.quotations} emptyText="No quotations generated" />}
            {activeProfileTab === 'Agreements' && <DataTable columns={[{ key: 'id', label: 'Agreement' }, { key: 'type', label: 'Type' }, { key: 'startDate', label: 'Start Date' }, { key: 'endDate', label: 'End Date' }, { key: 'status', label: 'Status' }]} rows={selected.agreements} emptyText="No agreements found" />}
            {activeProfileTab === 'Invoices' && <DataTable columns={[{ key: 'id', label: 'Invoice' }, { key: 'period', label: 'Billing Period' }, { key: 'total', label: 'Total Amount', render: (r) => `Rs ${r.total}` }, { key: 'paymentStatus', label: 'Payment Status' }]} rows={selected.invoices} emptyText="No invoices found" />}
            {activeProfileTab === 'Payments' && <DataTable columns={[{ key: 'id', label: 'Payment' }, { key: 'invoiceId', label: 'Invoice' }, { key: 'amount', label: 'Amount', render: (r) => `Rs ${r.amount}` }, { key: 'mode', label: 'Payment Mode' }, { key: 'date', label: 'Date' }]} rows={selected.payments} emptyText="No payments recorded" />}
            {activeProfileTab === 'Maintenance History' && <DataTable columns={[{ key: 'visitDate', label: 'Visit Date' }, { key: 'technician', label: 'Technician' }, { key: 'issue', label: 'Issue / Request' }, { key: 'status', label: 'Status' }]} rows={selected.maintenanceHistory} emptyText="No maintenance history" />}
            {activeProfileTab === 'Overview' && <p className="rm-muted">Use tabs to access location-wise devices, quotation and agreement records, invoice history, and payment tracking.</p>}
          </div>
        </div>
      )}

      {activeTab === 'Device Assignment' && selected && (
        <div className="rm-section-stack">
          <Header title="Device Assignment" subtitle="Assign device with location, technician, smart billing plan, and meter details" />
          <div className="rm-card">
            <div className="rm-form-grid">
              <label>Device Type<select value={deviceForm.deviceType} onChange={(e) => setDeviceForm((c) => ({ ...c, deviceType: e.target.value }))}><option>Printer</option><option>Copier</option><option>Scanner</option><option>Other</option></select></label>
              <label>Brand<input value={deviceForm.brand} onChange={(e) => setDeviceForm((c) => ({ ...c, brand: e.target.value }))} /></label>
              <label>Model<input value={deviceForm.model} onChange={(e) => setDeviceForm((c) => ({ ...c, model: e.target.value }))} /></label>
              <label>Asset Serial Number<input value={deviceForm.serialNumber} onChange={(e) => setDeviceForm((c) => ({ ...c, serialNumber: e.target.value }))} /></label>
              <label>Installation Date<input type="date" value={deviceForm.installationDate} onChange={(e) => setDeviceForm((c) => ({ ...c, installationDate: e.target.value }))} /></label>
              <label>Customer Location<span className="rm-required-asterisk">*</span><select value={deviceForm.customerLocation} onChange={(e) => setDeviceForm((c) => ({ ...c, customerLocation: e.target.value }))}><option value="">Select</option>{selected.locations.map((l) => <option key={l.id}>{l.locationName}</option>)}</select></label>
              <label>Assigned Technician<span className="rm-required-asterisk">*</span><select value={deviceForm.technician} onChange={(e) => setDeviceForm((c) => ({ ...c, technician: e.target.value }))}><option value="">Select</option>{techs.map((t) => <option key={t}>{t}</option>)}</select></label>
              <label>Billing Type<select value={deviceForm.billingType} onChange={(e) => setDeviceForm((c) => ({ ...c, billingType: e.target.value }))}>{plans.map((p) => <option key={p}>{p}</option>)}</select></label>
              <label>Monthly Rent<input value={deviceForm.monthlyRent} onChange={(e) => setDeviceForm((c) => ({ ...c, monthlyRent: e.target.value }))} /></label>
              <label>Quantity<span className="rm-required-asterisk">*</span><input type="number" min="1" value={deviceForm.quantity} onChange={(e) => setDeviceForm((c) => ({ ...c, quantity: e.target.value }))} /></label>
              <label>Meter Reading Start Value<input value={deviceForm.meterStart} onChange={(e) => setDeviceForm((c) => ({ ...c, meterStart: e.target.value }))} /></label>
              <label>Current Meter Reading<input value={deviceForm.currentMeter} onChange={(e) => setDeviceForm((c) => ({ ...c, currentMeter: e.target.value }))} /></label>
              <label>Device Status<select value={deviceForm.deviceStatus} onChange={(e) => setDeviceForm((c) => ({ ...c, deviceStatus: e.target.value }))}><option>Active</option><option>Replaced</option><option>Removed</option><option>Under Maintenance</option></select></label>
              <label className="full">Notes<textarea value={deviceForm.notes} onChange={(e) => setDeviceForm((c) => ({ ...c, notes: e.target.value }))} /></label>
            </div>
            {deviceForm.deviceType === 'Printer' && <DataTable columns={[{ key: 'type', label: 'Meter Type' }, { key: 'open', label: 'Opening Reading' }, { key: 'curr', label: 'Current Reading' }, { key: 'rate', label: 'Rate / Page' }]} rows={[{ id: 'm1', type: 'A4 B/W', open: '', curr: '', rate: '0.50' }, { id: 'm2', type: 'A4 Color', open: '', curr: '', rate: '3.00' }, { id: 'm3', type: 'A3 B/W', open: '', curr: '', rate: '5.00' }, { id: 'm4', type: 'A3 Color', open: '', curr: '', rate: '7.00' }]} emptyText="No meter rows" />}
            <div className="rm-actions-row"><button className="rm-btn rm-btn-secondary" onClick={queueDevice}>+ Add to Batch</button><button className="rm-btn rm-btn-primary" onClick={saveAllDevices}>Save All Devices</button><button className="rm-btn rm-btn-secondary" onClick={() => { setDeviceForm(emptyDevice); setDeviceBatch([]); setActiveTab('Customer View'); }}>Cancel</button></div>
            <DataTable
              columns={[
                { key: 'deviceType', label: 'Device Type' },
                { key: 'model', label: 'Model' },
                { key: 'serialNumber', label: 'Base Serial' },
                { key: 'quantity', label: 'Qty' },
                { key: 'customerLocation', label: 'Location' },
                { key: 'technician', label: 'Technician' },
                { key: 'actions', label: 'Actions', render: (row) => <button className="rm-icon-btn" onClick={() => removeQueuedDevice(row.id)}><Trash2 size={14} /></button> },
              ]}
              rows={deviceBatch}
              emptyText="No devices queued yet."
            />
          </div>
        </div>
      )}

      {activeTab === 'Replacement' && selected && (
        <div className="rm-section-stack">
          <Header title="Replacement Handling" subtitle="Close old meter, mark replaced, capture replacement date, and add new active device" />
          <div className="rm-card">
            <div className="rm-alert">Replacement cannot happen without closing old meter reading.</div>
            <div className="rm-form-grid">
              <label>Old Device<span className="rm-required-asterisk">*</span><select value={replacementForm.oldDeviceId} onChange={(e) => setReplacementForm((c) => ({ ...c, oldDeviceId: e.target.value }))}><option value="">Select</option>{selected.devices.map((d) => <option key={d.id} value={d.id}>{d.serialNumber}</option>)}</select></label>
              <label>Replacement Date<input type="date" value={replacementForm.replacementDate} onChange={(e) => setReplacementForm((c) => ({ ...c, replacementDate: e.target.value }))} /></label>
              <label>Old Device Closing Reading<span className="rm-required-asterisk">*</span><input value={replacementForm.oldClosingReading} onChange={(e) => setReplacementForm((c) => ({ ...c, oldClosingReading: e.target.value }))} /></label>
              <label>New Device Brand<input value={replacementForm.newBrand} onChange={(e) => setReplacementForm((c) => ({ ...c, newBrand: e.target.value }))} /></label>
              <label>New Device Model<input value={replacementForm.newModel} onChange={(e) => setReplacementForm((c) => ({ ...c, newModel: e.target.value }))} /></label>
              <label>New Asset Serial Number<input value={replacementForm.newSerial} onChange={(e) => setReplacementForm((c) => ({ ...c, newSerial: e.target.value }))} /></label>
              <label>New Installation Date<input type="date" value={replacementForm.newInstallDate} onChange={(e) => setReplacementForm((c) => ({ ...c, newInstallDate: e.target.value }))} /></label>
              <label>New Starting Meter Reading<input value={replacementForm.newStartReading} onChange={(e) => setReplacementForm((c) => ({ ...c, newStartReading: e.target.value }))} /></label>
              <label>Location<select value={replacementForm.location} onChange={(e) => setReplacementForm((c) => ({ ...c, location: e.target.value }))}><option value="">Select</option>{selected.locations.map((l) => <option key={l.id}>{l.locationName}</option>)}</select></label>
              <label>Assigned Technician<select value={replacementForm.technician} onChange={(e) => setReplacementForm((c) => ({ ...c, technician: e.target.value }))}><option value="">Select</option>{techs.map((t) => <option key={t}>{t}</option>)}</select></label>
              <label>Reason for Replacement<input value={replacementForm.reason} onChange={(e) => setReplacementForm((c) => ({ ...c, reason: e.target.value }))} /></label>
              <label className="full">Notes<textarea value={replacementForm.notes} onChange={(e) => setReplacementForm((c) => ({ ...c, notes: e.target.value }))} /></label>
            </div>
            <div className="rm-actions-row"><button className="rm-btn rm-btn-primary" onClick={confirmReplacement}>Confirm Replacement</button><button className="rm-btn rm-btn-secondary" onClick={() => setActiveTab('Customer View')}>Cancel</button></div>
          </div>
        </div>
      )}

      {activeTab === 'Maintenance' && selected && (
        <div className="rm-section-stack">
          <Header title="Rental Service Report" subtitle="Printable service card with issue/request, work done, parts used, and signatures" actions={[{ label: 'Print', icon: Printer, secondary: true, onClick: () => window.print() }, { label: 'Save', icon: Save, onClick: saveMaintenanceReport }]} />
          <div className="rm-card rm-printable">
            <div className="rm-form-grid compact"><label>Company Name<input value={selected.companyName} readOnly /></label><label>Customer Name<input value={selected.companyName} readOnly /></label><label>Rental Start Date<input type="date" value={maintenanceForm.rentalStartDate} onChange={(e) => setMaintenanceForm((c) => ({ ...c, rentalStartDate: e.target.value }))} /></label><label>Billing Cycle<input value="Monthly" readOnly /></label></div>
            <div className="rm-inline-heading"><h4>Device Details</h4><button className="rm-btn rm-btn-secondary" onClick={() => setActiveTab('Device Assignment')}><Plus size={14} />+ Add Device</button></div>
            <DataTable columns={[{ key: 'deviceType', label: 'Device' }, { key: 'model', label: 'Model' }, { key: 'serialNumber', label: 'Serial No' }, { key: 'qty', label: 'Qty', render: () => '1' }, { key: 'actions', label: '', render: (row) => <button className="rm-icon-btn" onClick={() => removeDevice(row.id)}><Trash2 size={14} /></button> }]} rows={selected.devices} emptyText="No devices added yet" />
            <div className="rm-form-grid compact">
              <label>Visit Date<span className="rm-required-asterisk">*</span><input type="date" value={maintenanceForm.visitDate} onChange={(e) => setMaintenanceForm((c) => ({ ...c, visitDate: e.target.value }))} /></label>
              <label>Technician<span className="rm-required-asterisk">*</span><select value={maintenanceForm.technician} onChange={(e) => setMaintenanceForm((c) => ({ ...c, technician: e.target.value }))}><option value="">Select</option>{techs.map((t) => <option key={t}>{t}</option>)}</select></label>
              <label>Customer Location<select value={maintenanceForm.location} onChange={(e) => setMaintenanceForm((c) => ({ ...c, location: e.target.value }))}><option value="">Select</option>{selected.locations.map((l) => <option key={l.id} value={l.locationName}>{l.locationName}</option>)}</select></label>
              <label>Device<select value={maintenanceForm.deviceId} onChange={(e) => setMaintenanceForm((c) => ({ ...c, deviceId: e.target.value }))}><option value="">Select</option>{selected.devices.map((d) => <option key={d.id} value={d.id}>{d.serialNumber} - {d.model}</option>)}</select></label>
              <label className="full">Issue / Request<span className="rm-required-asterisk">*</span><textarea value={maintenanceForm.issue} onChange={(e) => setMaintenanceForm((c) => ({ ...c, issue: e.target.value }))} /></label>
              <label className="full">Work Done<span className="rm-required-asterisk">*</span><textarea value={maintenanceForm.workDone} onChange={(e) => setMaintenanceForm((c) => ({ ...c, workDone: e.target.value }))} /></label>
            </div>
            <div className="rm-inline-heading"><h4>Parts Used</h4><button className="rm-btn rm-btn-secondary" onClick={addMaintenancePart}><Plus size={14} />+ Add Part</button></div>
            <DataTable
              columns={[
                { key: 'item', label: 'Item', render: (row) => <input value={row.item} onChange={(e) => updateMaintenancePart(row.id, { item: e.target.value })} /> },
                { key: 'qty', label: 'Qty', render: (row) => <input value={row.qty} onChange={(e) => updateMaintenancePart(row.id, { qty: e.target.value })} /> },
                { key: 'charge', label: 'Charge', render: (row) => <input value={row.charge} onChange={(e) => updateMaintenancePart(row.id, { charge: e.target.value })} /> },
                { key: 'actions', label: '', render: (row) => <button className="rm-icon-btn" onClick={() => removeMaintenancePart(row.id)}><Trash2 size={14} /></button> },
              ]}
              rows={maintenanceParts}
              emptyText="No parts added"
            />
            <div className="rm-radio-row"><strong>Status</strong><label><input type="radio" checked={maintenanceForm.status === 'Completed'} onChange={() => setMaintenanceForm((c) => ({ ...c, status: 'Completed' }))} />Completed</label><label><input type="radio" checked={maintenanceForm.status === 'Pending'} onChange={() => setMaintenanceForm((c) => ({ ...c, status: 'Pending' }))} />Pending</label></div>
            <div className="rm-signature-row"><div><div className="line"></div><p>Technician Signature</p></div><div><div className="line"></div><p>Customer Signature</p></div></div>
            <div className="rm-actions-row"><button className="rm-btn rm-btn-primary" onClick={saveMaintenanceReport}>Save</button><button className="rm-btn rm-btn-secondary" onClick={() => setActiveTab('Customer View')}>Cancel</button></div>
          </div>
        </div>
      )}

      {activeTab === 'Quotation' && selected && (
        <div className="rm-section-stack">
          <Header title="Quotation" subtitle="Quotation slip preview. Use Edit to unlock fields." actions={[...(quotationEditMode ? [{ label: 'Cancel', secondary: true, onClick: cancelQuotationEdit }, { label: 'Save', icon: Save, onClick: saveQuotationEdit }] : [{ label: 'Edit', secondary: true, onClick: startQuotationEdit }]), { label: 'Print', icon: Printer, secondary: true, onClick: () => window.print() }, { label: 'Download PDF', icon: Download, secondary: true, onClick: () => tell('Quotation PDF downloaded.') }, { label: 'Send to Customer', icon: Send, onClick: () => tell('Quotation sent.') }]} />
          <div className={`rm-card rm-printable rm-quotation-slip rm-quotation-doc ${quotationEditMode ? 'rm-quotation-editable' : 'rm-quotation-readonly'}`}>
            <div className="rm-quote-head rm-quote-doc-head">
              <div>
                <h3>RENTAL QUOTATION</h3>
                <p>RepairTech Solutions</p>
              </div>
            </div>
            <div className="rm-quote-meta-grid">
              <label>Quotation Number<input value={quotationForm.quotationNumber || `QTN-${selected.id.split('-')[1]}-01`} readOnly /></label>
              <label>Quotation Date<input type="date" value={quotationForm.quotationDate} readOnly={!quotationEditMode} onChange={(e) => setQuotationForm((c) => ({ ...c, quotationDate: e.target.value }))} /></label>
              <label>Valid Until<input type="date" value={quotationForm.validUntil} readOnly={!quotationEditMode} onChange={(e) => setQuotationForm((c) => ({ ...c, validUntil: e.target.value }))} /></label>
            </div>

            <div className="rm-quote-party-grid">
              <div className="rm-quote-party-card">
                <h4>From</h4>
                <p>RepairTech Solutions</p>
                <p>Bangalore</p>
                <p>support@repairtech.com</p>
              </div>
              <div className="rm-quote-party-card">
                <h4>To</h4>
                <p><strong>{selected.companyName}</strong></p>
                <p>{selected.authorizedPerson1Name}</p>
                <p>{selected.primaryAddress}</p>
                <p>{selected.email}</p>
              </div>
            </div>

            <div className="rm-quote-lines">
              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Rental Service Plan</td>
                    <td>1</td>
                    <td><input value={quotationForm.monthlyRent} readOnly={!quotationEditMode} onChange={(e) => setQuotationForm((c) => ({ ...c, monthlyRent: e.target.value }))} /></td>
                    <td>{quotationForm.monthlyRent || '0'}</td>
                  </tr>
                  <tr>
                    <td>Meter Based Rates</td>
                    <td>-</td>
                    <td colSpan="2"><input value={quotationForm.meterRates} readOnly={!quotationEditMode} onChange={(e) => setQuotationForm((c) => ({ ...c, meterRates: e.target.value }))} /></td>
                  </tr>
                  <tr>
                    <td>Add-ons</td>
                    <td>-</td>
                    <td colSpan="2"><input value={quotationForm.addOns} readOnly={!quotationEditMode} onChange={(e) => setQuotationForm((c) => ({ ...c, addOns: e.target.value }))} /></td>
                  </tr>
                  <tr>
                    <td>Discounts</td>
                    <td>-</td>
                    <td colSpan="2"><input value={quotationForm.discounts} readOnly={!quotationEditMode} onChange={(e) => setQuotationForm((c) => ({ ...c, discounts: e.target.value }))} /></td>
                  </tr>
                  <tr>
                    <td>Taxes (%)</td>
                    <td>-</td>
                    <td colSpan="2"><input value={quotationForm.taxes} readOnly={!quotationEditMode} onChange={(e) => setQuotationForm((c) => ({ ...c, taxes: e.target.value }))} /></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="rm-form-grid">
              <label className="full">Terms & Conditions<textarea value={quotationForm.terms} readOnly={!quotationEditMode} onChange={(e) => setQuotationForm((c) => ({ ...c, terms: e.target.value }))} /></label>
              <label className="full">Notes<textarea value={quotationForm.notes} readOnly={!quotationEditMode} onChange={(e) => setQuotationForm((c) => ({ ...c, notes: e.target.value }))} /></label>
            </div>

            <div className="rm-signature-row">
              <div><div className="line"></div><p>For {selected.companyName}</p></div>
              <div><div className="line"></div><p>For RepairTech Solutions</p></div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Agreement' && selected && (
        <div className="rm-section-stack">
          <Header title="Agreement" subtitle="Agreement hardcopy preview. Use Edit to unlock fields." actions={[...(agreementEditMode ? [{ label: 'Cancel', secondary: true, onClick: cancelAgreementEdit }, { label: 'Save', icon: Save, onClick: saveAgreementEdit }] : [{ label: 'Edit', secondary: true, onClick: startAgreementEdit }]), { label: 'Print', icon: Printer, secondary: true, onClick: () => window.print() }, { label: 'Download PDF', icon: Download, secondary: true, onClick: () => tell('Agreement PDF downloaded.') }, { label: 'Send to Customer', icon: Mail, onClick: () => tell('Agreement sent.') }]} />
          <div className={`rm-card rm-printable rm-agreement-doc ${agreementEditMode ? 'rm-agreement-editable' : 'rm-agreement-readonly'}`}>
            <div className="rm-actions-row"><button className={agreementType === 'Corporate' ? 'rm-btn rm-btn-primary' : 'rm-btn rm-btn-secondary'} onClick={() => setAgreementType('Corporate')}>Corporate Agreement</button><button className={agreementType === 'Individual' ? 'rm-btn rm-btn-primary' : 'rm-btn rm-btn-secondary'} onClick={() => setAgreementType('Individual')}>Individual Agreement</button></div>
            <h2 className="rm-agreement-title">{agreementType === 'Corporate' ? 'RENTAL AGREEMENT (CORPORATE)' : 'RENTAL AGREEMENT (INDIVIDUAL)'}</h2>
            <p className="rm-agreement-intro">
              This Maintenance Agreement (the "Agreement") is entered into this <input type="date" value={agreementDoc.introDate} readOnly={!agreementEditMode} onChange={(e) => setAgreementDoc((c) => ({ ...c, introDate: e.target.value }))} /> by and between:
            </p>

            <div className="rm-agreement-party">
              <strong>SERVICE PROVIDER:</strong>
              <textarea value={agreementDoc.serviceProvider} readOnly={!agreementEditMode} onChange={(e) => setAgreementDoc((c) => ({ ...c, serviceProvider: e.target.value }))} />
            </div>

            <div className="rm-agreement-party">
              <strong>THE CLIENT:</strong>
              <textarea value={agreementDoc.client || `${selected.companyName}, (Hereinafter referred to as The Client)`} readOnly={!agreementEditMode} onChange={(e) => setAgreementDoc((c) => ({ ...c, client: e.target.value }))} />
            </div>

            <div className="rm-agreement-section">
              <h4>1. SCOPE OF SERVICES</h4>
              <textarea value={agreementDoc.scope} readOnly={!agreementEditMode} onChange={(e) => setAgreementDoc((c) => ({ ...c, scope: e.target.value }))} />
            </div>

            <div className="rm-agreement-section">
              <h4>2. PERIOD OF AGREEMENT</h4>
              <textarea value={agreementDoc.period || `This agreement shall be valid from ${selected.agreements[0]?.startDate || ''} to ${selected.agreements[0]?.endDate || ''}.`} readOnly={!agreementEditMode} onChange={(e) => setAgreementDoc((c) => ({ ...c, period: e.target.value }))} />
            </div>

            <div className="rm-agreement-section">
              <h4>3. ASSET REGISTRY</h4>
              <DataTable
                columns={[
                  { key: 'deviceType', label: 'Device Type' },
                  { key: 'model', label: 'Brand / Model', render: (row) => `${row.brand || ''} ${row.model || ''}`.trim() },
                  { key: 'serialNumber', label: 'Serial Number' },
                ]}
                rows={selected.devices}
                emptyText="No assets available."
              />
            </div>

            <div className="rm-agreement-section">
              <h4>4. PAYMENT TERMS</h4>
              <textarea value={agreementDoc.paymentTerms} readOnly={!agreementEditMode} onChange={(e) => setAgreementDoc((c) => ({ ...c, paymentTerms: e.target.value }))} />
            </div>

            <div className="rm-signature-row rm-agreement-signatures">
              <div><div className="line"></div><p>For {selected.companyName}</p></div>
              <div><div className="line"></div><p>For RepairTech Solutions</p></div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Invoice Generator' && selected && (
        <div className="rm-section-stack invoice-generator-page">
          <Header
            title="Rental Invoice Generator"
            subtitle="Production-grade billing flow with meter usage, plan rules, taxes, replacement split, and payment status"
            actions={[
              { label: 'Save Draft', icon: Save, secondary: true, onClick: () => generateInvoiceRecord('Draft') },
              { label: 'Generate Invoice', icon: FileCheck2, onClick: () => generateInvoiceRecord('Generated') },
              { label: 'Preview', icon: Eye, secondary: true, onClick: () => tell('Preview is visible in the right panel.') },
              { label: 'Print', icon: Printer, secondary: true, onClick: () => window.print() },
              { label: 'Download PDF', icon: Download, secondary: true, onClick: () => tell('Invoice PDF downloaded.') },
              { label: 'Send Invoice', icon: Send, onClick: () => tell('Invoice sent via email and WhatsApp queue.') },
            ]}
          />
          <div className="invoice-layout-grid">
            <div className="invoice-main-stack">
              <section className="invoice-card">
                <div className="invoice-step-header"><h3>Step 1: Select Customer</h3><span className={`invoice-status-badge status-${invoiceWorkflowStatus.toLowerCase()}`}>{invoiceWorkflowStatus}</span></div>
                <div className="rm-form-grid">
                  <label>Search Customer<input value={invoiceCustomerSearch} onChange={(e) => setInvoiceCustomerSearch(e.target.value)} placeholder="Search by customer or GST" /></label>
                  <label>Filter<select value={invoiceTypeFilter} onChange={(e) => setInvoiceTypeFilter(e.target.value)}><option>All</option><option>Corporate</option><option>Individual</option><option>Pending invoices</option></select></label>
                  <label>Customer<span className="rm-required-asterisk">*</span><select value={invoiceCustomerId} onChange={(e) => setInvoiceCustomerId(e.target.value)}><option value="">Select customer</option>{invoiceCustomers.map((c) => <option key={c.id} value={c.id}>{c.companyName} - {c.customerType}</option>)}</select></label>
                  <label>Billing Period<span className="rm-required-asterisk">*</span><input type="month" value={invoiceForm.billingPeriod} onChange={(e) => setInvoiceForm((c) => ({ ...c, billingPeriod: e.target.value }))} /></label>
                  <label>Billing Mode<select value={invoiceForm.billingMode} onChange={(e) => setInvoiceForm((c) => ({ ...c, billingMode: e.target.value }))}><option>Combined Invoice</option><option>Separate Location Invoice</option></select></label>
                  <label>Workflow Status<input value={invoiceWorkflowStatus} readOnly /></label>
                </div>
              </section>

              <section className="invoice-card">
                <div className="invoice-step-header"><h3>Step 2-4: Active Contracts, Meter Readings & Pricing Rules</h3><button className="rm-btn rm-btn-secondary" onClick={runInvoiceCalculation}>Recalculate</button></div>
                {invoiceLoading ? (
                  <div className="invoice-skeleton-wrap"><div className="invoice-skeleton-line"></div><div className="invoice-skeleton-line"></div><div className="invoice-skeleton-line"></div></div>
                ) : (
                  <div className="invoice-meter-grid">
                    {invoiceBreakdown.length ? invoiceBreakdown.map(({ device, calc }) => (
                      <div className="invoice-device-card" key={device.id}>
                        <div className="invoice-device-card-head">
                          <strong>{device.serialNumber || device.id} - {device.model}</strong>
                          <span>{device.customerLocation} | {device.billingType}</span>
                        </div>
                        <table className="invoice-device-table">
                          <thead><tr><th>Previous</th><th>Current</th><th>Usage</th><th>Plan</th><th>Fixed Rent</th><th>Add-ons</th><th>Discount</th><th>Tax %</th></tr></thead>
                          <tbody>
                            <tr>
                              <td><input type="number" value={calc.draft.previous} onChange={(e) => updateInvoiceDraft(device.id, { previous: Number(e.target.value) })} /></td>
                              <td><input type="number" value={calc.draft.current} onChange={(e) => updateInvoiceDraft(device.id, { current: Number(e.target.value) })} /></td>
                              <td>{calc.usage}</td>
                              <td><select value={calc.draft.planType} onChange={(e) => updateInvoiceDraft(device.id, { planType: e.target.value })}><option>Fixed Rental Plan</option>{plans.map((p) => <option key={p}>{p}</option>)}</select></td>
                              <td><input type="number" value={calc.draft.fixedRent} onChange={(e) => updateInvoiceDraft(device.id, { fixedRent: Number(e.target.value) })} /></td>
                              <td><input type="number" value={calc.draft.addOns} onChange={(e) => updateInvoiceDraft(device.id, { addOns: Number(e.target.value) })} /></td>
                              <td><input type="number" value={calc.draft.discountValue} onChange={(e) => updateInvoiceDraft(device.id, { discountValue: Number(e.target.value) })} /></td>
                              <td><input type="number" value={calc.draft.taxPercent} onChange={(e) => updateInvoiceDraft(device.id, { taxPercent: Number(e.target.value) })} /></td>
                            </tr>
                          </tbody>
                        </table>
                        <div className="invoice-multi-rate-grid">
                          {['a4bw', 'a4color', 'a3bw', 'a3color'].map((key) => (
                            <label key={key}>
                              {key.toUpperCase()} Usage
                              <input type="number" value={calc.draft.meterUsage?.[key] || 0} onChange={(e) => updateInvoiceDraft(device.id, { meterUsage: { ...calc.draft.meterUsage, [key]: Number(e.target.value) } })} />
                            </label>
                          ))}
                          <label>Replacement Old Days<input type="number" value={calc.draft.replacementSplitDaysOld || 0} onChange={(e) => updateInvoiceDraft(device.id, { replacementSplitDaysOld: Number(e.target.value) })} /></label>
                          <label>Replacement New Days<input type="number" value={calc.draft.replacementSplitDaysNew || 0} onChange={(e) => updateInvoiceDraft(device.id, { replacementSplitDaysNew: Number(e.target.value) })} /></label>
                        </div>
                        <table className="invoice-breakdown-table"><tbody><tr><td>Usage Charges</td><td>Rs {calc.usageCharge.toFixed(2)}</td></tr><tr><td>Gross</td><td>Rs {calc.gross.toFixed(2)}</td></tr><tr><td>Discount</td><td>Rs {calc.discount.toFixed(2)}</td></tr><tr><td>Tax</td><td>Rs {calc.tax.toFixed(2)}</td></tr><tr><td><strong>Total</strong></td><td><strong>Rs {calc.total.toFixed(2)}</strong></td></tr></tbody></table>
                      </div>
                    )) : <p className="rm-muted">No active devices found for selected customer.</p>}
                  </div>
                )}
              </section>

              <section className="invoice-card">
                <div className="invoice-step-header"><h3>Step 10-12: Invoice Summary, Actions & History</h3><span>{invoiceForm.billingMode}</span></div>
                <div className="invoice-actions">
                  <button className="rm-btn rm-btn-primary" onClick={() => generateInvoiceRecord('Generated')}>Generate Invoice</button>
                  <button className="rm-btn rm-btn-secondary" onClick={() => generateInvoiceRecord('Draft')}>Save Draft</button>
                  <button className="rm-btn rm-btn-secondary" onClick={markLatestInvoicePaid}>Mark Paid</button>
                  <button className="rm-btn rm-btn-secondary" onClick={() => setActiveTab('Payment Tracking')}>Add Payment</button>
                  <button className="rm-btn rm-btn-secondary" onClick={() => tell('Invoice cancelled.')}>Cancel</button>
                </div>
                <div className="invoice-history-table">
                  <DataTable
                    columns={[
                      { key: 'id', label: 'Invoice Number' },
                      { key: 'customer', label: 'Customer' },
                      { key: 'period', label: 'Period' },
                      { key: 'total', label: 'Total', render: (r) => `Rs ${r.total}` },
                      { key: 'paymentStatus', label: 'Payment Status', render: (r) => <span className={`invoice-status-badge status-${String(r.paymentStatus || '').toLowerCase().replace(/\s+/g, '-')}`}>{r.paymentStatus}</span> },
                      { key: 'status', label: 'Invoice Status' },
                    ]}
                    rows={invoiceHistory}
                    emptyText="No invoices generated yet."
                  />
                </div>
              </section>
            </div>

            <aside className="invoice-summary-card">
              <div className="invoice-card invoice-preview-panel">
                <div className="invoice-step-header"><h3>Invoice Preview</h3><span>{invoiceForm.billingPeriod || 'Select period'}</span></div>
                <p><strong>{invoiceCustomer?.companyName || 'No customer selected'}</strong></p>
                <p>GST: {invoiceCustomer?.gstNumber || 'N/A'}</p>
                <p>Billing Type: {invoiceCustomer?.billingType || 'N/A'}</p>
                <table className="invoice-tax-table"><tbody><tr><td>Subtotal</td><td>Rs {invoiceTotals.subtotal.toFixed(2)}</td></tr><tr><td>Discounts</td><td>Rs {invoiceTotals.discounts.toFixed(2)}</td></tr><tr><td>CGST</td><td>Rs {invoiceTaxSplit.cgst.toFixed(2)}</td></tr><tr><td>SGST</td><td>Rs {invoiceTaxSplit.sgst.toFixed(2)}</td></tr><tr><td>IGST</td><td>Rs {invoiceTaxSplit.igst.toFixed(2)}</td></tr><tr><td>Previous Dues</td><td>Rs {Number(invoiceCustomer?.outstandingAmount || 0).toFixed(2)}</td></tr></tbody></table>
                <div className="invoice-total-card">
                  <p>Grand Total</p>
                  <h2>Rs {(invoiceTotals.grandTotal + Number(invoiceCustomer?.outstandingAmount || 0)).toFixed(2)}</h2>
                </div>
              </div>
            </aside>
          </div>
        </div>
      )}

      {activeTab === 'Payment Tracking' && selected && (
        <div className="rm-section-stack">
          <Header title="Payment Tracking" subtitle="Partial payments with outstanding and invoice-wise history checks" actions={[{ label: 'Record Payment', icon: IndianRupee, onClick: recordPayment }, { label: 'View Invoice', icon: Eye, secondary: true, onClick: viewPaymentInvoice }, { label: 'Download Receipt', icon: Download, secondary: true, onClick: downloadReceipt }]} />
          <div className="rm-card">
            <div className="rm-form-grid">
              <label>Invoice Number<span className="rm-required-asterisk">*</span>
                <select
                  value={paymentForm.invoiceNumber}
                  onChange={(e) => {
                    const nextId = e.target.value;
                    const inv = selected.invoices.find((row) => row.id === nextId);
                    setPaymentForm((c) => ({ ...c, invoiceNumber: nextId, invoiceAmount: inv ? String(inv.total) : c.invoiceAmount }));
                  }}
                >
                  <option value="">Select invoice</option>
                  {selected.invoices.map((inv) => <option key={inv.id} value={inv.id}>{inv.id}</option>)}
                </select>
              </label>
              <label>Customer<input value={selected.companyName} readOnly /></label>
              <label>Invoice Amount<input value={fallbackInvoiceAmount} onChange={(e) => setPaymentForm((c) => ({ ...c, invoiceAmount: e.target.value }))} placeholder={String(selected.invoices[0]?.total || 0)} /></label>
              <label>Paid So Far<input readOnly value={`Rs ${selectedInvoicePaidSoFar}`} /></label>
              <label>Paid Amount<span className="rm-required-asterisk">*</span><input value={paymentForm.paidAmount} onChange={(e) => setPaymentForm((c) => ({ ...c, paidAmount: e.target.value }))} /></label>
              <label>Balance Amount<input readOnly value={selectedInvoiceCurrentBalance} /></label>
              <label>Payment Status<input readOnly value={selectedPaymentInvoice?.paymentStatus || selectedInvoiceDerivedStatus} /></label>
              <label>Payment Date<span className="rm-required-asterisk">*</span><input type="date" value={paymentForm.paymentDate || todayIso} onChange={(e) => setPaymentForm((c) => ({ ...c, paymentDate: e.target.value }))} /></label>
              <label>Payment Mode<span className="rm-required-asterisk">*</span><input value={paymentForm.paymentMode} onChange={(e) => setPaymentForm((c) => ({ ...c, paymentMode: e.target.value }))} /></label>
              <label className="full">Notes<textarea value={paymentForm.notes} onChange={(e) => setPaymentForm((c) => ({ ...c, notes: e.target.value }))} /></label>
            </div>
            <DataTable columns={[{ key: 'id', label: 'Invoice Number' }, { key: 'total', label: 'Invoice Amount', render: (r) => `Rs ${r.total}` }, { key: 'paymentStatus', label: 'Payment Status' }]} rows={selected.invoices} emptyText="No invoices found" />
            <div className="rm-divider"></div>
            <DataTable
              columns={[
                { key: 'id', label: 'Payment ID' },
                { key: 'invoiceId', label: 'Invoice Number' },
                { key: 'amount', label: 'Amount', render: (r) => `Rs ${r.amount}` },
                { key: 'mode', label: 'Payment Mode' },
                { key: 'date', label: 'Payment Date' },
              ]}
              rows={selected.payments || []}
              emptyText="No payments recorded"
            />
          </div>
        </div>
      )}
      {toast ? <div className="rm-toast">{toast}</div> : null}
    </div>
  );
};

const Info = ({ label, value }) => <div className="rm-info"><span>{label}</span><strong>{value}</strong></div>;

export default RentalOperationsBillingPage;

