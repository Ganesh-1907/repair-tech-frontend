import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Download,
  Edit,
  Eye,
  FileText,
  Mail,
  MessageCircle,
  MoreVertical,
  Plus,
  Printer,
  RefreshCw,
  Save,
  Send,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';
import AdminPageHeader from '../../components/common/AdminPageHeader';
import { rentalCorporateAgreementService } from '../../services/rentalCorporateAgreementService';

const agreementSteps = [
  { id: 'customer', label: 'Customer' },
  { id: 'devices', label: 'Devices' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'terms', label: 'Terms & Policies' },
  { id: 'preview', label: 'Preview & Generate' },
];

const statusClass = {
  Draft: 'status-draft',
  Generated: 'status-assigned',
  Sent: 'status-assigned',
  Signed: 'status-completed',
  Active: 'status-completed',
  Expired: 'status-overdue',
  Cancelled: 'status-overdue',
  Renewed: 'status-assigned',
};

const initialForm = {
  agreementDate: new Date().toISOString().slice(0, 10),
  agreementNumber: '',
  customerId: '',
  companyName: '',
  companyAddress: '',
  providerName: 'Saptarishi Solutions',
  providerAddress: 'Indore, Madhya Pradesh',
  yourCompanyName: 'Saptarishi Solutions',
  startDate: new Date().toISOString().slice(0, 10),
  endDate: '',
  status: 'Draft',
  registeredAddress: '',
  gstNumber: '',
  contactPerson: '',
  customerEmail: '',
  customerPhone: '',
  billingAddress: '',
  branchLocation: '',
  monthlyRent: 0,
  billingCycle: 'Monthly',
  paymentTerms: 7,
  securityDeposit: 0,
  installationCharges: 0,
  otherCharges: 0,
  a4BwRate: 1.2,
  a4ColorRate: 8,
  a3BwRate: 3,
  a3ColorRate: 18,
  extraUsageCharges: 0,
  minimumCommitment: 15000,
  slaTime: 8,
  maintenanceFrequency: 'Monthly preventive maintenance',
  breakdownSupportTerms: 'Onsite support within SLA window',
  replacementPolicy: 'Equivalent model replacement',
  downtimeLimit: '24 working hours',
  downtimeAdjustmentRule: 'Prorated adjustment on qualifying downtime',
  noticePeriod: 30,
  lateFee: 2,
  jurisdictionCity: 'Indore',
  clientSignatoryName: '',
  clientSignatoryDesignation: '',
  providerSignatoryName: '',
  providerSignatoryDesignation: '',
};

const emptyDeviceRow = {
  id: 0,
  deviceId: '',
  serialNumber: '',
  type: 'Printer',
  brand: '',
  model: '',
  configuration: '',
  location: '',
  monthlyRent: 0,
  status: 'Active',
  addOns: '',
};

const emptyAddon = {
  id: 0,
  serviceName: '',
  description: '',
  price: 0,
  discountType: 'Flat',
  discountValue: 0,
  focItems: '',
  notes: '',
};

const formatCurrency = (value) => `INR ${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const RentalCorporateAgreementPage = () => {
  const [form, setForm] = useState(initialForm);
  const [devices, setDevices] = useState([{ ...emptyDeviceRow, id: Date.now() }]);
  const [addOns, setAddOns] = useState([{ ...emptyAddon, id: Date.now() + 1 }]);
  const [clauses, setClauses] = useState([]);
  const [historyRows, setHistoryRows] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [availableDevices, setAvailableDevices] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [editingClause, setEditingClause] = useState(null);
  const [currentAgreementId, setCurrentAgreementId] = useState(null);
  const [currentStep, setCurrentStep] = useState('customer');
  const [showAdvancedCustomer, setShowAdvancedCustomer] = useState(false);
  const [showAdvancedDevices, setShowAdvancedDevices] = useState(false);
  const [showAdvancedPricing, setShowAdvancedPricing] = useState(false);
  const [showMorePreviewActions, setShowMorePreviewActions] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState('');
  const [activeClauseActionId, setActiveClauseActionId] = useState(null);
  const [activeHistoryActionId, setActiveHistoryActionId] = useState(null);

  const refreshHistory = async () => {
    setHistoryRows(await rentalCorporateAgreementService.getAgreementHistory());
  };

  const refreshTemplates = async () => {
    setTemplates(await rentalCorporateAgreementService.listTemplates());
  };

  useEffect(() => {
    const loadInitialData = async () => {
      const [customerRows, defaultTemplate] = await Promise.all([
        rentalCorporateAgreementService.getCustomers(),
        rentalCorporateAgreementService.getDefaultTemplate(),
      ]);
      setCustomers(customerRows);
      setSelectedTemplateId(defaultTemplate.id);
      setClauses(defaultTemplate.clauses);
      await Promise.all([refreshHistory(), refreshTemplates()]);
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    const loadDevices = async () => {
      setAvailableDevices(await rentalCorporateAgreementService.getDevices(form.customerId));
    };
    if (form.customerId) {
      loadDevices();
    } else {
      setAvailableDevices([]);
    }
  }, [form.customerId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.member-action-menu') && !event.target.closest('.action-trigger-btn')) {
        setActiveClauseActionId(null);
        setActiveHistoryActionId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalDeviceRent = useMemo(
    () => devices.reduce((sum, device) => sum + Number(device.monthlyRent || 0), 0),
    [devices]
  );

  const placeholderMap = useMemo(() => ({
    agreement_date: form.agreementDate || '-',
    company_name: form.companyName || '-',
    company_address: form.companyAddress || '-',
    REPAIRBOY: form.providerName || '-',
    REPAIRBOY_address: form.providerAddress || '-',
    monthly_rent: formatCurrency(form.monthlyRent || totalDeviceRent),
    billing_cycle: form.billingCycle || '-',
    payment_terms: form.paymentTerms || '-',
    a4_bw_rate: formatCurrency(form.a4BwRate),
    a4_color_rate: formatCurrency(form.a4ColorRate),
    a3_bw_rate: formatCurrency(form.a3BwRate),
    a3_color_rate: formatCurrency(form.a3ColorRate),
    minimum_commitment: formatCurrency(form.minimumCommitment),
    sla_time: form.slaTime || '-',
    downtime_limit: form.downtimeLimit || '-',
    start_date: form.startDate || '-',
    end_date: form.endDate || '-',
    notice_period: form.noticePeriod || '-',
    late_fee: form.lateFee || '-',
    jurisdiction_city: form.jurisdictionCity || '-',
    your_company_name: form.yourCompanyName || '-',
  }), [form, totalDeviceRent]);

  const resolveTemplateText = (text) => (
    String(text || '').replace(/\{\{\s*([^}]+)\s*\}\}/g, (_, key) => placeholderMap[key.trim()] || '-')
  );

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  };

  const applyCustomer = (customerId) => {
    const customer = customers.find((item) => item.id === customerId);
    if (!customer) return;
    setForm((current) => ({
      ...current,
      customerId,
      companyName: customer.companyName || current.companyName,
      companyAddress: customer.registeredAddress || current.companyAddress,
      registeredAddress: customer.registeredAddress || '',
      gstNumber: customer.gstNumber || '',
      contactPerson: customer.contactPerson || '',
      customerEmail: customer.email || '',
      customerPhone: customer.phoneNumber || '',
      billingAddress: customer.billingAddress || '',
      branchLocation: customer.branch || '',
      jurisdictionCity: customer.location || current.jurisdictionCity,
    }));
    setErrors((current) => ({ ...current, companyName: '', companyAddress: '' }));
  };

  const addBlankDevice = () => {
    setDevices((current) => [...current, { ...emptyDeviceRow, id: Date.now() }]);
  };

  const addDeviceFromCatalog = (deviceId) => {
    const selected = availableDevices.find((device) => device.id === deviceId);
    if (!selected) return;
    setDevices((current) => [...current, { ...selected, id: Date.now() + Math.floor(Math.random() * 999) }]);
  };

  const updateDevice = (id, field, value) => {
    setDevices((current) => current.map((device) => (
      device.id === id ? { ...device, [field]: value } : device
    )));
  };

  const updateAddon = (id, field, value) => {
    setAddOns((current) => current.map((addOn) => (
      addOn.id === id ? { ...addOn, [field]: value } : addOn
    )));
  };

  const addAddon = () => {
    setAddOns((current) => [...current, { ...emptyAddon, id: Date.now() }]);
  };

  const moveClause = (index, direction) => {
    setClauses((current) => {
      const next = [...current];
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const addClause = () => {
    setEditingClause({
      id: `custom-${Date.now()}`,
      title: `${clauses.length + 1}. Custom Policy`,
      body: 'Add customer-specific policy details.',
      isNew: true,
    });
  };

  const saveClauseEdit = () => {
    if (!editingClause) return;
    const { isNew, ...clauseToSave } = editingClause;
    if (!clauseToSave.title.trim() || !clauseToSave.body.trim()) {
      return;
    }
    setClauses((current) => {
      if (isNew) return [...current, clauseToSave];
      return current.map((clause) => (clause.id === clauseToSave.id ? clauseToSave : clause));
    });
    setEditingClause(null);
  };

  const deleteClause = (id) => {
    const target = clauses.find((clause) => clause.id === id);
    if (!target) return;
    if (!window.confirm(`Delete "${target.title}"?`)) return;
    setClauses((current) => current.filter((clause) => clause.id !== id));
  };

  const resetDefaultTemplate = async () => {
    const template = await rentalCorporateAgreementService.getDefaultTemplate();
    setSelectedTemplateId(template.id);
    setClauses(template.clauses);
    setNotice('Terms reset to default template.');
  };

  const applyTemplate = async (templateId) => {
    const template = await rentalCorporateAgreementService.getTemplateById(templateId);
    setSelectedTemplateId(template.id);
    setClauses(template.clauses);
  };

  const saveAsReusableTemplate = async () => {
    const created = await rentalCorporateAgreementService.saveReusableTemplate({
      name: `${form.companyName || 'Corporate'} Template`,
      description: `Saved from ${form.agreementNumber || 'unsaved agreement'}`,
      clauses,
    });
    await refreshTemplates();
    setSelectedTemplateId(created.id);
    setNotice(`Template "${created.name}" saved.`);
  };

  const buildPayload = (status = form.status) => ({
    ...form,
    status,
    monthlyRent: Number(form.monthlyRent || totalDeviceRent),
    devices: devices.map((device) => ({ ...device, monthlyRent: Number(device.monthlyRent || 0) })),
    addOns: addOns.map((row) => ({
      ...row,
      price: Number(row.price || 0),
      discountValue: Number(row.discountValue || 0),
    })),
    clauses,
    templateId: selectedTemplateId,
  });

  const validate = async () => {
    const nextErrors = {};
    if (!form.agreementDate) nextErrors.agreementDate = 'Agreement date is required.';
    if (!form.companyName.trim()) nextErrors.companyName = 'Company name is required.';
    if (!form.companyAddress.trim()) nextErrors.companyAddress = 'Company address is required.';
    if (!form.billingCycle) nextErrors.billingCycle = 'Billing cycle is required.';
    if (Number(form.monthlyRent || totalDeviceRent) <= 0) nextErrors.monthlyRent = 'Monthly rental must be positive.';
    if (Number(form.paymentTerms) <= 0) nextErrors.paymentTerms = 'Payment due days are required.';
    if (!form.startDate) nextErrors.startDate = 'Start date is required.';
    if (!form.endDate) nextErrors.endDate = 'End date is required.';
    if (form.startDate && form.endDate && new Date(form.endDate) <= new Date(form.startDate)) {
      nextErrors.endDate = 'End date must be after start date.';
    }
    if (!form.jurisdictionCity.trim()) nextErrors.jurisdictionCity = 'Jurisdiction city is required.';
    if (devices.length === 0 || devices.every((device) => !device.model.trim())) {
      nextErrors.devices = 'At least one valid device is required.';
    }
    if (clauses.length === 0 || clauses.some((clause) => !clause.title.trim() || !clause.body.trim())) {
      nextErrors.clauses = 'Terms editor cannot be empty.';
    }
    if (Number(form.a4BwRate) < 0 || Number(form.a4ColorRate) < 0 || Number(form.a3BwRate) < 0 || Number(form.a3ColorRate) < 0) {
      nextErrors.usageRates = 'Usage rates cannot be negative.';
    }
    if (form.agreementNumber) {
      const isUnique = await rentalCorporateAgreementService.isAgreementNumberAvailable(form.agreementNumber, currentAgreementId);
      if (!isUnique) nextErrors.agreementNumber = 'Agreement number must be unique.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const saveDraft = async () => {
    const valid = await validate();
    if (!valid) return null;
    const payload = buildPayload('Draft');
    const saved = currentAgreementId
      ? await rentalCorporateAgreementService.updateAgreement(currentAgreementId, payload)
      : await rentalCorporateAgreementService.createAgreement(payload);
    if (!saved) return null;
    setCurrentAgreementId(saved.id);
    setForm((current) => ({ ...current, agreementNumber: saved.agreementNumber, status: 'Draft' }));
    await refreshHistory();
    setNotice(`Agreement ${saved.agreementNumber} saved as draft.`);
    return saved;
  };

  const ensureAgreement = async () => {
    if (currentAgreementId) return currentAgreementId;
    const saved = await saveDraft();
    return saved?.id || null;
  };

  const handleGenerateAgreement = async () => {
    const agreementId = await ensureAgreement();
    if (!agreementId) return;
    await rentalCorporateAgreementService.generateAgreement(agreementId);
    setForm((current) => ({ ...current, status: 'Generated' }));
    await refreshHistory();
    setNotice('Agreement generated successfully.');
  };

  const handleDownloadPdf = async (agreementId = null) => {
    const targetId = agreementId || await ensureAgreement();
    if (!targetId) return;
    const result = await rentalCorporateAgreementService.downloadPdf(targetId);
    setNotice(result.message);
  };

  const handleSendEmail = async (agreementId = null) => {
    const targetId = agreementId || await ensureAgreement();
    if (!targetId) return;
    const result = await rentalCorporateAgreementService.sendAgreementEmail(targetId);
    setForm((current) => ({ ...current, status: result.agreement?.status || current.status }));
    await refreshHistory();
    setNotice(result.message);
  };

  const handleSendWhatsApp = async (agreementId = null) => {
    const targetId = agreementId || await ensureAgreement();
    if (!targetId) return;
    const result = await rentalCorporateAgreementService.sendAgreementWhatsApp(targetId);
    setForm((current) => ({ ...current, status: result.agreement?.status || current.status }));
    await refreshHistory();
    setNotice(result.message);
  };

  const handleDuplicate = async (agreementId = null) => {
    const targetId = agreementId || currentAgreementId;
    if (!targetId) return;
    const duplicated = await rentalCorporateAgreementService.duplicateAgreement(targetId);
    if (!duplicated) return;
    setCurrentAgreementId(duplicated.id);
    setForm((current) => ({ ...current, agreementNumber: duplicated.agreementNumber, status: duplicated.status }));
    await loadAgreementIntoEditor(duplicated.id, 'customer');
    setNotice(`Agreement duplicated as ${duplicated.agreementNumber}.`);
  };

  const handleRenew = async (agreementId = null) => {
    const targetId = agreementId || currentAgreementId;
    if (!targetId) return;
    const renewed = await rentalCorporateAgreementService.renewAgreement(targetId);
    if (!renewed) return;
    await refreshHistory();
    setNotice(`Renewed agreement created: ${renewed.agreementNumber}.`);
  };

  const handleMarkSigned = async (agreementId = null) => {
    const targetId = agreementId || currentAgreementId;
    if (!targetId) return;
    await rentalCorporateAgreementService.markAgreementSigned(targetId);
    setForm((current) => ({ ...current, status: 'Signed' }));
    await refreshHistory();
    setNotice('Agreement marked as signed.');
  };

  const handleCancelAgreement = async () => {
    if (!currentAgreementId) return;
    await rentalCorporateAgreementService.cancelAgreement(currentAgreementId);
    setForm((current) => ({ ...current, status: 'Cancelled' }));
    await refreshHistory();
    setNotice('Agreement cancelled.');
  };

  const loadAgreementIntoEditor = async (agreementId, step = 'preview') => {
    const agreement = await rentalCorporateAgreementService.getAgreementById(agreementId);
    if (!agreement) return;
    setCurrentAgreementId(agreement.id);
    setForm((current) => ({ ...current, ...agreement }));
    setDevices(agreement.devices?.length ? agreement.devices : [{ ...emptyDeviceRow, id: Date.now() }]);
    setAddOns(agreement.addOns?.length ? agreement.addOns : [{ ...emptyAddon, id: Date.now() }]);
    setClauses(agreement.clauses?.length ? agreement.clauses : []);
    setSelectedTemplateId(agreement.templateId || selectedTemplateId);
    setCurrentStep(step);
  };

  const renderCustomerStep = () => (
    <>
      <div className="card agreement-customer-card">
        <div className="card-header">
          <div>
            <h3>Agreement Basic Details</h3>
            <p>Corporate agreement identity and contract period details.</p>
          </div>
        </div>
        <div className="agreement-basic-grid">
          <div className="form-group">
            <label htmlFor="agreement-date">Agreement Date</label>
            <input
              id="agreement-date"
              type="date"
              value={form.agreementDate}
              onChange={(event) => updateForm('agreementDate', event.target.value)}
              aria-invalid={Boolean(errors.agreementDate)}
            />
            {errors.agreementDate && <span className="form-error">{errors.agreementDate}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="agreement-number">Agreement Number</label>
            <input
              id="agreement-number"
              value={form.agreementNumber}
              onChange={(event) => updateForm('agreementNumber', event.target.value)}
              placeholder="Auto generated if blank"
              aria-invalid={Boolean(errors.agreementNumber)}
            />
            {errors.agreementNumber && <span className="form-error">{errors.agreementNumber}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="agreement-status">Status</label>
            <select id="agreement-status" value={form.status} onChange={(event) => updateForm('status', event.target.value)}>
              <option>Draft</option>
              <option>Generated</option>
              <option>Sent</option>
              <option>Signed</option>
              <option>Active</option>
              <option>Expired</option>
              <option>Cancelled</option>
              <option>Renewed</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="customer-select">Corporate Customer</label>
            <select id="customer-select" value={form.customerId} onChange={(event) => applyCustomer(event.target.value)}>
              <option value="">Select customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>{customer.companyName}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="agreement-start-date">Start Date</label>
            <input
              id="agreement-start-date"
              type="date"
              value={form.startDate}
              onChange={(event) => updateForm('startDate', event.target.value)}
              aria-invalid={Boolean(errors.startDate)}
            />
            {errors.startDate && <span className="form-error">{errors.startDate}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="agreement-end-date">End Date</label>
            <input
              id="agreement-end-date"
              type="date"
              value={form.endDate}
              onChange={(event) => updateForm('endDate', event.target.value)}
              aria-invalid={Boolean(errors.endDate)}
            />
            {errors.endDate && <span className="form-error">{errors.endDate}</span>}
          </div>
        </div>
      </div>

      <div className="card agreement-customer-card">
        <div className="card-header">
          <div>
            <h3>Customer Details</h3>
            <p>Keep it simple first. Open advanced fields only when needed.</p>
          </div>
          <button className="btn btn-sm btn-secondary" onClick={() => setShowAdvancedCustomer((current) => !current)}>
            {showAdvancedCustomer ? 'Hide Advanced' : 'Show Advanced'}
          </button>
        </div>
        <div className="agreement-customer-sections">
          <div className="agreement-form-section">
            <h4>Company Profile</h4>
            <div className="agreement-form-grid">
              <div className="form-group">
                <label htmlFor="company-name">Company Name</label>
                <input
                  id="company-name"
                  value={form.companyName}
                  onChange={(event) => updateForm('companyName', event.target.value)}
                  aria-invalid={Boolean(errors.companyName)}
                />
                {errors.companyName && <span className="form-error">{errors.companyName}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="company-address">Company Address</label>
                <textarea
                  id="company-address"
                  rows={2}
                  value={form.companyAddress}
                  onChange={(event) => updateForm('companyAddress', event.target.value)}
                  aria-invalid={Boolean(errors.companyAddress)}
                />
                {errors.companyAddress && <span className="form-error">{errors.companyAddress}</span>}
              </div>
            </div>
          </div>

          <div className="agreement-form-section">
            <h4>Contact & Billing</h4>
            <div className="agreement-form-grid">
              <div className="form-group">
                <label htmlFor="contact-person">Contact Person</label>
                <input id="contact-person" value={form.contactPerson} onChange={(event) => updateForm('contactPerson', event.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="customer-phone">Phone Number</label>
                <input id="customer-phone" value={form.customerPhone} onChange={(event) => updateForm('customerPhone', event.target.value.replace(/\D/g, '').slice(0, 10))} />
              </div>
              <div className="form-group">
                <label htmlFor="customer-email">Email</label>
                <input id="customer-email" type="email" value={form.customerEmail} onChange={(event) => updateForm('customerEmail', event.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="jurisdiction-city">Jurisdiction City</label>
                <input
                  id="jurisdiction-city"
                  value={form.jurisdictionCity}
                  onChange={(event) => updateForm('jurisdictionCity', event.target.value)}
                  aria-invalid={Boolean(errors.jurisdictionCity)}
                />
                {errors.jurisdictionCity && <span className="form-error">{errors.jurisdictionCity}</span>}
              </div>
            </div>
          </div>

          {showAdvancedCustomer && (
            <>
              <div className="agreement-form-section">
                <h4>Address & Tax</h4>
                <div className="agreement-form-grid">
                  <div className="form-group">
                    <label htmlFor="customer-gst">GST Number</label>
                    <input id="customer-gst" value={form.gstNumber} onChange={(event) => updateForm('gstNumber', event.target.value)} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="branch-location">Branch / Location</label>
                    <input id="branch-location" value={form.branchLocation} onChange={(event) => updateForm('branchLocation', event.target.value)} />
                  </div>
                  <div className="form-group agreement-span-2">
                    <label htmlFor="registered-address">Registered Address</label>
                    <textarea
                      id="registered-address"
                      rows={2}
                      value={form.registeredAddress}
                      onChange={(event) => updateForm('registeredAddress', event.target.value)}
                    />
                  </div>
                  <div className="form-group agreement-span-2">
                    <label htmlFor="billing-address">Billing Address</label>
                    <textarea id="billing-address" rows={2} value={form.billingAddress} onChange={(event) => updateForm('billingAddress', event.target.value)} />
                  </div>
                </div>
              </div>

              <div className="agreement-form-section">
                <h4>Service Provider</h4>
                <div className="agreement-form-grid">
                  <div className="form-group">
                    <label htmlFor="provider-name">Service Provider Name</label>
                    <input id="provider-name" value={form.providerName} onChange={(event) => updateForm('providerName', event.target.value)} />
                  </div>
                  <div className="form-group agreement-span-2">
                    <label htmlFor="provider-address">Service Provider Address</label>
                    <textarea id="provider-address" rows={2} value={form.providerAddress} onChange={(event) => updateForm('providerAddress', event.target.value)} />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );

  const renderDeviceStep = () => (
    <div className="card overflow-hidden">
      <div className="card-header">
        <div>
          <h3>Device / Equipment Table</h3>
          <p>Use essential device fields first. Advanced columns are optional.</p>
        </div>
        <div className="agreement-inline-actions">
          <button className="btn btn-sm btn-secondary" onClick={() => setShowAdvancedDevices((current) => !current)}>
            {showAdvancedDevices ? 'Hide Advanced' : 'Show Advanced'}
          </button>
          <select value="" onChange={(event) => addDeviceFromCatalog(event.target.value)}>
            <option value="">Add from customer device pool</option>
            {availableDevices.map((device) => (
              <option key={device.id} value={device.id}>{device.id} - {device.brand} {device.model}</option>
            ))}
          </select>
          <button className="btn btn-sm btn-secondary" onClick={addBlankDevice}><Plus size={14} /> Add Device</button>
        </div>
      </div>
      {errors.devices && <div className="inline-error">{errors.devices}</div>}
      <div className="device-table-container">
        <table className="leads-table rental-agreement-device-table">
          <thead>
            <tr>
              <th>Device ID</th>
              <th>Serial Number</th>
              <th>Type</th>
              <th>Brand</th>
              <th>Model</th>
              <th>Location / Branch</th>
              <th>Monthly Rent</th>
              <th>Status</th>
              {showAdvancedDevices && <th>Configuration</th>}
              {showAdvancedDevices && <th>Add-on parts/accessories</th>}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {devices.map((device) => (
              <tr key={device.id}>
                <td><input className="table-input" value={device.deviceId} onChange={(event) => updateDevice(device.id, 'deviceId', event.target.value)} /></td>
                <td><input className="table-input" value={device.serialNumber} onChange={(event) => updateDevice(device.id, 'serialNumber', event.target.value)} /></td>
                <td>
                  <select className="table-input" value={device.type} onChange={(event) => updateDevice(device.id, 'type', event.target.value)}>
                    <option>Printer</option>
                    <option>Laptop</option>
                    <option>Desktop</option>
                    <option>Other</option>
                  </select>
                </td>
                <td><input className="table-input" value={device.brand} onChange={(event) => updateDevice(device.id, 'brand', event.target.value)} /></td>
                <td><input className="table-input" value={device.model} onChange={(event) => updateDevice(device.id, 'model', event.target.value)} /></td>
                <td><input className="table-input" value={device.location} onChange={(event) => updateDevice(device.id, 'location', event.target.value)} /></td>
                <td><input className="table-input" type="number" min="0" value={device.monthlyRent} onChange={(event) => updateDevice(device.id, 'monthlyRent', event.target.value)} /></td>
                <td><input className="table-input" value={device.status} onChange={(event) => updateDevice(device.id, 'status', event.target.value)} /></td>
                {showAdvancedDevices && <td><input className="table-input" value={device.configuration} onChange={(event) => updateDevice(device.id, 'configuration', event.target.value)} /></td>}
                {showAdvancedDevices && <td><input className="table-input" value={device.addOns} onChange={(event) => updateDevice(device.id, 'addOns', event.target.value)} /></td>}
                <td>
                  <button className="icon-btn danger" onClick={() => setDevices((current) => current.filter((row) => row.id !== device.id))} disabled={devices.length === 1} aria-label="Remove device">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPricingStep = () => (
    <>
      <div className="card">
        <div className="card-header">
          <div>
            <h3>Rental Charges & Usage Rates</h3>
            <p>Core pricing fields first. Advanced commercial controls are optional.</p>
          </div>
          <button className="btn btn-sm btn-secondary" onClick={() => setShowAdvancedPricing((current) => !current)}>
            {showAdvancedPricing ? 'Hide Advanced' : 'Show Advanced'}
          </button>
        </div>
        {errors.usageRates && <div className="inline-error">{errors.usageRates}</div>}
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="monthly-rent">Monthly Rental</label>
            <input
              id="monthly-rent"
              type="number"
              min="0"
              value={form.monthlyRent}
              onChange={(event) => updateForm('monthlyRent', event.target.value)}
              aria-invalid={Boolean(errors.monthlyRent)}
            />
            {errors.monthlyRent && <span className="form-error">{errors.monthlyRent}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="billing-cycle">Billing Cycle</label>
            <select id="billing-cycle" value={form.billingCycle} onChange={(event) => updateForm('billingCycle', event.target.value)} aria-invalid={Boolean(errors.billingCycle)}>
              <option>Monthly</option>
              <option>Quarterly</option>
              <option>Half-Yearly</option>
              <option>Yearly</option>
            </select>
            {errors.billingCycle && <span className="form-error">{errors.billingCycle}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="payment-due">Payment Due Days</label>
            <input
              id="payment-due"
              type="number"
              min="1"
              value={form.paymentTerms}
              onChange={(event) => updateForm('paymentTerms', event.target.value)}
              aria-invalid={Boolean(errors.paymentTerms)}
            />
            {errors.paymentTerms && <span className="form-error">{errors.paymentTerms}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="security-deposit">Security Deposit</label>
            <input id="security-deposit" type="number" min="0" value={form.securityDeposit} onChange={(event) => updateForm('securityDeposit', event.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="a4-bw-rate">A4 B/W Rate</label>
            <input id="a4-bw-rate" type="number" min="0" step="0.01" value={form.a4BwRate} onChange={(event) => updateForm('a4BwRate', event.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="a4-color-rate">A4 Color Rate</label>
            <input id="a4-color-rate" type="number" min="0" step="0.01" value={form.a4ColorRate} onChange={(event) => updateForm('a4ColorRate', event.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="a3-bw-rate">A3 B/W Rate</label>
            <input id="a3-bw-rate" type="number" min="0" step="0.01" value={form.a3BwRate} onChange={(event) => updateForm('a3BwRate', event.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="a3-color-rate">A3 Color Rate</label>
            <input id="a3-color-rate" type="number" min="0" step="0.01" value={form.a3ColorRate} onChange={(event) => updateForm('a3ColorRate', event.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="minimum-commitment">Minimum Commitment</label>
            <input id="minimum-commitment" type="number" min="0" value={form.minimumCommitment} onChange={(event) => updateForm('minimumCommitment', event.target.value)} />
          </div>
          {showAdvancedPricing && (
            <>
              <div className="form-group">
                <label htmlFor="installation-charges">Installation Charges</label>
                <input id="installation-charges" type="number" min="0" value={form.installationCharges} onChange={(event) => updateForm('installationCharges', event.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="other-charges">Other Charges</label>
                <input id="other-charges" type="number" min="0" value={form.otherCharges} onChange={(event) => updateForm('otherCharges', event.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="extra-usage">Extra Usage Charges</label>
                <input id="extra-usage" type="number" min="0" value={form.extraUsageCharges} onChange={(event) => updateForm('extraUsageCharges', event.target.value)} />
              </div>
            </>
          )}
        </div>
      </div>

      {showAdvancedPricing && (
        <div className="card overflow-hidden">
        <div className="card-header">
          <div>
            <h3>Add-ons & Discounts</h3>
            <p>Capture commercial concessions and free-of-cost additions per contract.</p>
          </div>
          <button className="btn btn-sm btn-secondary" onClick={addAddon}><Plus size={14} /> Add Row</button>
        </div>
        <div className="device-table-container">
          <table className="leads-table">
            <thead>
              <tr>
                <th>Add-on Service</th>
                <th>Description</th>
                <th>Price</th>
                <th>Discount Type</th>
                <th>Discount Value</th>
                <th>Free-of-cost items</th>
                <th>Notes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {addOns.map((addOn) => (
                <tr key={addOn.id}>
                  <td><input className="table-input" value={addOn.serviceName} onChange={(event) => updateAddon(addOn.id, 'serviceName', event.target.value)} /></td>
                  <td><input className="table-input" value={addOn.description} onChange={(event) => updateAddon(addOn.id, 'description', event.target.value)} /></td>
                  <td><input className="table-input" type="number" min="0" value={addOn.price} onChange={(event) => updateAddon(addOn.id, 'price', event.target.value)} /></td>
                  <td>
                    <select className="table-input" value={addOn.discountType} onChange={(event) => updateAddon(addOn.id, 'discountType', event.target.value)}>
                      <option>Flat</option>
                      <option>Percentage</option>
                    </select>
                  </td>
                  <td><input className="table-input" type="number" min="0" value={addOn.discountValue} onChange={(event) => updateAddon(addOn.id, 'discountValue', event.target.value)} /></td>
                  <td><input className="table-input" value={addOn.focItems} onChange={(event) => updateAddon(addOn.id, 'focItems', event.target.value)} /></td>
                  <td><input className="table-input" value={addOn.notes} onChange={(event) => updateAddon(addOn.id, 'notes', event.target.value)} /></td>
                  <td>
                    <button className="icon-btn danger" onClick={() => setAddOns((current) => current.filter((row) => row.id !== addOn.id))} disabled={addOns.length === 1} aria-label="Remove add-on row">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {showAdvancedPricing && (
        <div className="card">
        <div className="card-header">
          <div>
            <h3>Maintenance & SLA</h3>
            <p>Service commitments, downtime policy, replacement rules, and termination terms.</p>
          </div>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="sla-time">SLA Time (hours)</label>
            <input id="sla-time" type="number" min="1" value={form.slaTime} onChange={(event) => updateForm('slaTime', event.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="maintenance-frequency">Maintenance Frequency</label>
            <input id="maintenance-frequency" value={form.maintenanceFrequency} onChange={(event) => updateForm('maintenanceFrequency', event.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="breakdown-support">Breakdown Support Terms</label>
            <input id="breakdown-support" value={form.breakdownSupportTerms} onChange={(event) => updateForm('breakdownSupportTerms', event.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="replacement-policy">Replacement Policy</label>
            <input id="replacement-policy" value={form.replacementPolicy} onChange={(event) => updateForm('replacementPolicy', event.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="downtime-limit">Downtime Limit</label>
            <input id="downtime-limit" value={form.downtimeLimit} onChange={(event) => updateForm('downtimeLimit', event.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="downtime-adjustment">Downtime Adjustment Rule</label>
            <input id="downtime-adjustment" value={form.downtimeAdjustmentRule} onChange={(event) => updateForm('downtimeAdjustmentRule', event.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="notice-period">Notice Period (days)</label>
            <input id="notice-period" type="number" min="1" value={form.noticePeriod} onChange={(event) => updateForm('noticePeriod', event.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="late-fee">Late Fee (%)</label>
            <input id="late-fee" type="number" min="0" value={form.lateFee} onChange={(event) => updateForm('lateFee', event.target.value)} />
          </div>
        </div>
      </div>
      )}
    </>
  );

  const renderTermsStep = () => (
    <div className="card agreement-full-width-card">
      <div className="card-header">
        <div>
          <h3>Terms, Conditions & Policies</h3>
          <p>Edit every clause customer-wise, reorder terms, and manage reusable templates.</p>
        </div>
        <div className="agreement-inline-actions">
          <select value={selectedTemplateId} onChange={(event) => applyTemplate(event.target.value)}>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>{template.name}</option>
            ))}
          </select>
          <button className="btn btn-sm btn-secondary" onClick={resetDefaultTemplate}><RefreshCw size={14} /> Reset Default</button>
          <button className="btn btn-sm btn-secondary" onClick={saveAsReusableTemplate}><Save size={14} /> Save Template</button>
          <button className="btn btn-sm btn-secondary" onClick={addClause}><Plus size={14} /> Add Clause</button>
        </div>
      </div>
      {errors.clauses && <div className="inline-error">{errors.clauses}</div>}
      <div className="device-table-container">
        <table className="leads-table agreement-clause-full-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Agreement Name</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {clauses.map((clause, index) => (
              <tr key={clause.id}>
                <td className="agreement-serial-cell">{index + 1}</td>
                <td className="agreement-clause-title">{clause.title}</td>
                <td>{clause.body}</td>
                <td className="agreement-clause-action-cell">
                  <div style={{ position: 'relative' }}>
                    <button
                      type="button"
                      className="icon-btn action-trigger-btn"
                      aria-label={`Open actions for ${clause.title}`}
                      onClick={() => setActiveClauseActionId(activeClauseActionId === clause.id ? null : clause.id)}
                    >
                      <MoreVertical size={15} />
                    </button>
                    {activeClauseActionId === clause.id && (
                      <div className="account-dropdown member-action-menu" style={{ top: '100%', right: 0, width: '170px', zIndex: 50 }}>
                        <button
                          type="button"
                          className="account-menu-item"
                          onClick={() => {
                            setActiveClauseActionId(null);
                            setEditingClause({ ...clause, isNew: false });
                          }}
                        >
                          <Edit size={14} className="icon-muted" /> Edit
                        </button>
                        <button
                          type="button"
                          className="account-menu-item"
                          disabled={index === 0}
                          onClick={() => {
                            setActiveClauseActionId(null);
                            moveClause(index, 'up');
                          }}
                        >
                          <ArrowUp size={14} className="icon-muted" /> Move Up
                        </button>
                        <button
                          type="button"
                          className="account-menu-item"
                          disabled={index === clauses.length - 1}
                          onClick={() => {
                            setActiveClauseActionId(null);
                            moveClause(index, 'down');
                          }}
                        >
                          <ArrowDown size={14} className="icon-muted" /> Move Down
                        </button>
                        <button
                          type="button"
                          className="account-menu-item"
                          onClick={() => {
                            setActiveClauseActionId(null);
                            deleteClause(clause.id);
                          }}
                        >
                          <Trash2 size={14} className="icon-muted" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPreviewStep = () => (
    <div className="card">
      <div className="card-header">
        <div>
          <h3>Signature Section</h3>
          <p>Signatory and designation fields for final printable agreement output.</p>
        </div>
      </div>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="client-signatory-name">Client Authorized Signatory</label>
            <input id="client-signatory-name" value={form.clientSignatoryName} onChange={(event) => updateForm('clientSignatoryName', event.target.value)} />
          </div>
        <div className="form-group">
          <label htmlFor="client-signatory-designation">Client Designation</label>
          <input id="client-signatory-designation" value={form.clientSignatoryDesignation} onChange={(event) => updateForm('clientSignatoryDesignation', event.target.value)} />
        </div>
          <div className="form-group">
            <label htmlFor="provider-signatory-name">Technician Signatory</label>
            <input id="provider-signatory-name" value={form.providerSignatoryName} onChange={(event) => updateForm('providerSignatoryName', event.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="provider-signatory-designation">Technician Designation</label>
            <input id="provider-signatory-designation" value={form.providerSignatoryDesignation} onChange={(event) => updateForm('providerSignatoryDesignation', event.target.value)} />
          </div>
        <div className="form-group">
          <label htmlFor="signature-company-name">Signature Company Name</label>
          <input id="signature-company-name" value={form.yourCompanyName} onChange={(event) => updateForm('yourCompanyName', event.target.value)} />
        </div>
      </div>
    </div>
  );

  const previewActions = (
    <div className="agreement-preview-actions">
      <div className="agreement-preview-actions-primary">
        <button className="btn btn-primary" onClick={saveDraft}><Save size={15} /> Save Draft</button>
        <button className="btn btn-primary" onClick={handleGenerateAgreement}><FileText size={15} /> Generate</button>
      </div>
      <div className="agreement-preview-actions-secondary">
        <button className="btn btn-secondary" onClick={handleDownloadPdf}><Download size={15} /> PDF</button>
        <button className="btn btn-secondary" onClick={() => window.print()}><Printer size={15} /> Print</button>
        <button className="btn btn-secondary" onClick={() => handleSendEmail()}><Mail size={15} /> Email</button>
        <button className="btn btn-secondary" onClick={() => handleSendWhatsApp()}><MessageCircle size={15} /> WhatsApp</button>
        <button className="btn btn-secondary" onClick={() => setShowMorePreviewActions((current) => !current)}>
          {showMorePreviewActions ? 'Less Actions' : 'More Actions'}
        </button>
      </div>
      {showMorePreviewActions && (
        <div className="agreement-preview-actions-tertiary">
          <button className="btn btn-sm btn-secondary" onClick={() => handleDuplicate()}><Copy size={14} /> Duplicate</button>
          <button className="btn btn-sm btn-secondary" onClick={() => handleRenew()}><RefreshCw size={14} /> Renew</button>
          <button className="btn btn-sm btn-secondary" onClick={() => handleMarkSigned()}><ShieldCheck size={14} /> Mark Signed</button>
          <button className="btn btn-sm btn-outline-danger" onClick={handleCancelAgreement}><Trash2 size={14} /> Cancel</button>
        </div>
      )}
    </div>
  );

  return (
    <div className="admin-module-page rental-corporate-agreement-page">
      {notice && (
        <div className="success-banner" role="status">
          <span>{notice}</span>
          <button className="icon-btn" onClick={() => setNotice('')} aria-label="Dismiss corporate agreement message">
            <X size={16} />
          </button>
        </div>
      )}

      <AdminPageHeader
        title="Rental Corporate Agreement"
        description="Corporate agreement builder with editable customer-specific terms, templates, preview, and status tracking."
        breadcrumbs={['Admin', 'Rental Management', 'Agreements', 'Corporate']}
      />

      {editingClause && (
        <div className="modal-overlay" role="presentation" onClick={() => setEditingClause(null)}>
          <div className="modal-panel agreement-edit-modal" role="dialog" aria-modal="true" aria-labelledby="agreement-edit-title" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 id="agreement-edit-title">Edit Terms & Policy</h2>
                <p>Update agreement clause title and customer-specific policy text.</p>
              </div>
              <button className="icon-btn" onClick={() => setEditingClause(null)} aria-label="Close edit policy popup">
                <X size={18} />
              </button>
            </div>
            <div className="modal-form">
              <div className="form-group">
                <label htmlFor="edit-agreement-name">Clause Title</label>
                <input id="edit-agreement-name" value={editingClause.title} onChange={(event) => setEditingClause((current) => ({ ...current, title: event.target.value }))} />
              </div>
              <div className="form-group">
                <label htmlFor="edit-agreement-description">Clause Content</label>
                <textarea id="edit-agreement-description" rows={6} value={editingClause.body} onChange={(event) => setEditingClause((current) => ({ ...current, body: event.target.value }))} />
              </div>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setEditingClause(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={saveClauseEdit}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="agreement-step-tabs">
        {agreementSteps.map((step, index) => (
          <button
            key={step.id}
            className={currentStep === step.id ? 'active' : ''}
            onClick={() => setCurrentStep(step.id)}
          >
            <span className="step-index">{index + 1}</span>
            <span>{step.label}</span>
          </button>
        ))}
        <button className="btn btn-sm btn-secondary agreement-preview-trigger" onClick={() => setShowPreviewModal(true)}>
          <Eye size={14} /> Preview
        </button>
      </div>

      <div className="rental-agreement-layout simplified-layout">
        <div className="rental-agreement-editor agreement-step-surface">
          {currentStep === 'customer' && renderCustomerStep()}
          {currentStep === 'devices' && renderDeviceStep()}
          {currentStep === 'pricing' && renderPricingStep()}
          {currentStep === 'terms' && renderTermsStep()}
          {currentStep === 'preview' && renderPreviewStep()}
        </div>
      </div>

      {showPreviewModal && (
        <div className="modal-overlay" role="presentation" onClick={() => setShowPreviewModal(false)}>
          <div className="modal-panel agreement-preview-modal" role="dialog" aria-modal="true" aria-labelledby="agreement-preview-title" onClick={(event) => event.stopPropagation()}>
            <div className="card-header">
              <div>
                <h3 id="agreement-preview-title">Agreement Preview</h3>
                <p>Live corporate agreement with dynamic placeholders and editable clauses.</p>
              </div>
              <button className="icon-btn" onClick={() => setShowPreviewModal(false)} aria-label="Close agreement preview">
                <X size={18} />
              </button>
            </div>

            <article className="agreement-document">
              <h2>Rental Agreement (Corporate)</h2>
              <p>This Rental Agreement is made on <strong>{form.agreementDate || '-'}</strong></p>

              <h3>BETWEEN</h3>
              <p>
                <strong>{form.companyName || '-'}</strong>, having its registered office at
                <br />
                {form.companyAddress || '-'}
                <br />
                (hereinafter referred to as "Client")
              </p>

              <h3>AND</h3>
              <p>
                <strong>{form.providerName || '-'}</strong>, having its office at
                <br />
                {form.providerAddress || '-'}
                <br />
                (hereinafter referred to as "Service Provider")
              </p>

              {clauses.map((clause) => {
                const showDeviceTable = clause.body.includes('{{device_table}}');
                const resolvedText = resolveTemplateText(clause.body.replace('{{device_table}}', '').trim());
                return (
                  <section key={clause.id}>
                    <h3>{resolveTemplateText(clause.title)}</h3>
                    {resolvedText && <p>{resolvedText}</p>}
                    {showDeviceTable && (
                      <table>
                        <thead>
                          <tr>
                            <th>Device ID</th>
                            <th>Type</th>
                            <th>Brand</th>
                            <th>Model</th>
                            <th>Serial</th>
                            <th>Location</th>
                            <th>Monthly Rent</th>
                          </tr>
                        </thead>
                        <tbody>
                          {devices.map((device) => (
                            <tr key={device.id}>
                              <td>{device.deviceId || '-'}</td>
                              <td>{device.type || '-'}</td>
                              <td>{device.brand || '-'}</td>
                              <td>{device.model || '-'}</td>
                              <td>{device.serialNumber || '-'}</td>
                              <td>{device.location || '-'}</td>
                              <td>{formatCurrency(device.monthlyRent)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </section>
                );
              })}

              <div className="agreement-signature-grid">
                <div>
                  <strong>Customer Signature</strong>
                  <span>Customer Signature</span>
                  <span>Authorized Signatory</span>
                </div>
                <div>
                  <strong>Technician Signature</strong>
                  <span>Technician Signature</span>
                  <span>Authorized Signatory</span>
                </div>
              </div>
            </article>

            {previewActions}
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="card-header">
          <div>
            <h3>Agreement History</h3>
            <p>Track lifecycle, status transitions, and operations for all corporate agreements.</p>
          </div>
        </div>
        <div className="device-table-container">
          <table className="leads-table">
            <thead>
              <tr>
                <th>Agreement No</th>
                <th>Company Name</th>
                <th>Devices Count</th>
                <th>Monthly Rent</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th>Created By</th>
                <th>Created Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {historyRows.map((agreement) => (
                <tr key={agreement.id}>
                  <td className="bold">{agreement.agreementNumber}</td>
                  <td>{agreement.companyName}</td>
                  <td>{agreement.devicesCount}</td>
                  <td>{formatCurrency(agreement.monthlyRent)}</td>
                  <td>{agreement.startDate}</td>
                  <td>{agreement.endDate}</td>
                  <td><span className={`status-pill ${statusClass[agreement.status] || 'status-draft'}`}>{agreement.status}</span></td>
                  <td>{agreement.createdBy}</td>
                  <td>{agreement.createdDate}</td>
                  <td>
                    <div style={{ position: 'relative' }}>
                      <button
                        type="button"
                        className="icon-btn action-trigger-btn"
                        aria-label={`Open actions for ${agreement.agreementNumber}`}
                        onClick={() => setActiveHistoryActionId(activeHistoryActionId === agreement.id ? null : agreement.id)}
                      >
                        <MoreVertical size={15} />
                      </button>
                      {activeHistoryActionId === agreement.id && (
                        <div className="account-dropdown member-action-menu" style={{ top: '100%', right: 0, width: '180px', zIndex: 50 }}>
                          <button type="button" className="account-menu-item" onClick={() => { setActiveHistoryActionId(null); loadAgreementIntoEditor(agreement.id, 'preview'); }}>
                            <Eye size={14} className="icon-muted" /> View
                          </button>
                          <button type="button" className="account-menu-item" onClick={() => { setActiveHistoryActionId(null); loadAgreementIntoEditor(agreement.id, 'customer'); }}>
                            <Edit size={14} className="icon-muted" /> Edit
                          </button>
                          <button type="button" className="account-menu-item" onClick={() => { setActiveHistoryActionId(null); handleDownloadPdf(agreement.id); }}>
                            <Download size={14} className="icon-muted" /> Download PDF
                          </button>
                          <button type="button" className="account-menu-item" onClick={() => { setActiveHistoryActionId(null); window.print(); }}>
                            <Printer size={14} className="icon-muted" /> Print
                          </button>
                          <button type="button" className="account-menu-item" onClick={() => { setActiveHistoryActionId(null); handleSendEmail(agreement.id); }}>
                            <Send size={14} className="icon-muted" /> Send
                          </button>
                          <button type="button" className="account-menu-item" onClick={() => { setActiveHistoryActionId(null); handleRenew(agreement.id); }}>
                            <RefreshCw size={14} className="icon-muted" /> Renew
                          </button>
                          <button type="button" className="account-menu-item" onClick={() => { setActiveHistoryActionId(null); handleMarkSigned(agreement.id); }}>
                            <ShieldCheck size={14} className="icon-muted" /> Mark Signed
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RentalCorporateAgreementPage;
