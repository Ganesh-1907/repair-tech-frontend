import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Eye,
  Edit,
  Printer,
  Plus,
  Trash2,
  Send,
  Save,
  Check,
  User,
  MapPin,
  Calendar,
  Wrench,
  Package2,
  Sparkles,
} from 'lucide-react';
import './PlansCustomers.css';
import './RentalWorkflow.css';
import { rentalQuotationService } from '../../services/rentalQuotationService';
import { api } from '../../services/apiClient';

const DEFAULT_DEVICE_OPTIONS = ['Desktop', 'Laptop', 'Printer', 'CCTV', 'Server'];

const createDevice = (idx = 0) => ({
  id: Date.now() + idx,
  device: 'Desktop',
  type: '',
  brand: '',
  model: '',
  inputField: '',
  specs: '',
  serialNo: '',
  quantity: 1,
  rentalPrice: 0,
  rentalUnit: 'Per Month',
  billingFrequency: 'Monthly',
  installationRequirements: '',
  accessories: '',
  remarks: '',
});

const buildDefaultQuote = (params) => ({
  date: new Date().toISOString().split('T')[0],
  number: `RQT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
  customerName: params.get('customerName') || '',
  customerId: params.get('customerId') || '',
  contactPerson: params.get('contactPerson') || '',
  customerAddress: params.get('customerAddress') || '',
  customerLocation: params.get('customerAddress') || '',
  gstin: params.get('gstin') || '',
  customerPhone: '',
  customerEmail: '',
  installationDate: new Date().toISOString().split('T')[0],
  assignedTechnician: 'Unassigned',
  minimumRentalPeriod: '3 Months',
  securityDeposit: 0,
  installationCharges: 0,
  deliveryCharges: 0,
  gstType: 'Exclusive',
  gstPercent: 18,
  paymentTerms: 'Advance',
  slaResponse: '4-8 Working Hours',
  resolutionTime: '24-48 Working Hours',
  validity: '30 Days',
  scope: ['Preventive maintenance support', 'Remote support', 'On-site visit support'],
  exclusions: ['Physical damage', 'Consumables and accessories'],
});

const formatCurrency = (value) => `INR ${Number(value || 0).toLocaleString('en-IN')}`;

const RentalQuotationPage = () => {
  const params = new URLSearchParams(window.location.search);
  const [mode, setMode] = useState('form');
  const [quoteData, setQuoteData] = useState(() => buildDefaultQuote(params));
  const [devices, setDevices] = useState([createDevice()]);
  const [deviceOptions, setDeviceOptions] = useState(DEFAULT_DEVICE_OPTIONS);
  const [quotationId, setQuotationId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [activity, setActivity] = useState([]);
  const [workflow, setWorkflow] = useState({
    quotationSaved: false,
    quotationSent: false,
    quotationApproved: false,
    agreementId: '',
    assetsCount: 0,
    installationReady: false,
    meterReady: false,
    invoiceReady: false,
  });

  useEffect(() => {
    const loadCustomerDeviceOptions = async () => {
      const customerId = params.get('customerId');
      if (!customerId) return;

      try {
        const customer = await api.get('rentalCustomers', customerId);
        const customerDevices = Array.isArray(customer?.devices) ? customer.devices : [];
        const fromCustomer = customerDevices
          .map((device) => String(device?.device || device?.deviceType || '').trim())
          .filter(Boolean);
        const merged = [...new Set([...fromCustomer, ...DEFAULT_DEVICE_OPTIONS])];
        if (merged.length) setDeviceOptions(merged);
      } catch {
        setDeviceOptions(DEFAULT_DEVICE_OPTIONS);
      }
    };

    loadCustomerDeviceOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const loadExistingQuotation = async () => {
      const queryQuotationId = params.get('quotationId');
      const queryCustomerId = params.get('customerId');
      let existing = null;
      if (queryQuotationId) {
        existing = await rentalQuotationService.listQuotations()
          .then((rows) => rows.find((row) => row.id === queryQuotationId) || null);
      } else if (queryCustomerId) {
        existing = await rentalQuotationService.getQuotationByCustomer(queryCustomerId);
      }
      if (!existing) return;

      setQuotationId(existing.id || '');
      setQuoteData((prev) => ({
        ...prev,
        ...existing,
        date: existing.quoteDate || existing.date || prev.date,
        number: existing.quotationNo || existing.number || prev.number,
        minimumRentalPeriod: existing.minimumPeriod ? `${existing.minimumPeriod} Months` : (existing.minimumRentalPeriod || prev.minimumRentalPeriod),
        gstPercent: Number(existing.gstRate ?? existing.gstPercent ?? prev.gstPercent),
      }));
      setDevices(
        Array.isArray(existing.products) && existing.products.length
          ? existing.products.map((row, idx) => ({
            ...createDevice(idx),
            ...row,
            id: row.id || `${existing.id}-${idx}`,
            quantity: Number(row.quantity || 1),
            rentalPrice: Number(row.rentalPrice || 0),
            rentalUnit: row.rentalUnit || 'Per Month',
          }))
          : [createDevice()]
      );
      setWorkflow((prev) => ({
        ...prev,
        quotationSaved: true,
        quotationSent: existing.status === 'Sent' || existing.status === 'Approved' || existing.status === 'Converted',
        quotationApproved: existing.status === 'Approved' || existing.status === 'Converted',
        agreementId: existing.agreementId || '',
        assetsCount: Number(existing.assetsCount || 0),
        installationReady: existing.installationStatus === 'Pending' || existing.installationStatus === 'Ready',
        meterReady: existing.onboardingStatus === 'Assets Registered',
        invoiceReady: existing.onboardingStatus === 'Assets Registered',
      }));
      pushActivity(`Loaded existing quotation ${existing.id} for this customer.`);
    };

    loadExistingQuotation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const subtotal = useMemo(
    () => devices.reduce((sum, d) => sum + Number(d.quantity || 0) * Number(d.rentalPrice || 0), 0),
    [devices]
  );
  const gstAmount = quoteData.gstType === 'Exclusive'
    ? (subtotal + Number(quoteData.installationCharges || 0) + Number(quoteData.deliveryCharges || 0)) * (Number(quoteData.gstPercent || 0) / 100)
    : 0;
  const grandTotal = subtotal
    + Number(quoteData.securityDeposit || 0)
    + Number(quoteData.installationCharges || 0)
    + Number(quoteData.deliveryCharges || 0)
    + gstAmount;

  const workflowSteps = useMemo(() => {
    const steps = [
      { id: 'saved', label: 'Quotation Saved', done: workflow.quotationSaved },
      { id: 'sent', label: 'Quotation Sent', done: workflow.quotationSent },
      { id: 'approved', label: 'Quotation Approved', done: workflow.quotationApproved },
      { id: 'agreement', label: 'Agreement Created', done: Boolean(workflow.agreementId) },
      { id: 'assets', label: 'Assets Registered', done: workflow.assetsCount > 0 },
      { id: 'installation', label: 'Installation Ready', done: workflow.installationReady },
      { id: 'meter', label: 'Meter Billing Ready', done: workflow.meterReady },
      { id: 'invoice', label: 'Invoice Generation Ready', done: workflow.invoiceReady },
    ];
    const activeIndex = steps.findIndex((s) => !s.done);
    return { steps, activeIndex: activeIndex === -1 ? steps.length - 1 : activeIndex };
  }, [workflow]);

  const pushActivity = (text) => {
    const ts = new Date();
    const time = `${ts.toLocaleDateString()} ${ts.toLocaleTimeString()}`;
    setActivity((prev) => [{ id: Date.now() + Math.random(), text, time }, ...prev].slice(0, 8));
  };

  const updateDevice = (id, field, value) => {
    setDevices((prev) => prev.map((d) => (d.id === id ? { ...d, [field]: value } : d)));
  };

  const addDevice = () => {
    setDevices((prev) => [...prev, createDevice(prev.length)]);
    pushActivity('Added a new device row to quotation.');
  };

  const removeDevice = (id) => {
    setDevices((prev) => (prev.length > 1 ? prev.filter((d) => d.id !== id) : prev));
    pushActivity('Removed a device row from quotation.');
  };

  const updateListItem = (key, index, value) => {
    setQuoteData((prev) => {
      const next = [...prev[key]];
      next[index] = value;
      return { ...prev, [key]: next };
    });
  };

  const removeListItem = (key, index) => {
    setQuoteData((prev) => ({ ...prev, [key]: prev[key].filter((_, i) => i !== index) }));
  };

  const addListItem = (key, value) => {
    setQuoteData((prev) => ({ ...prev, [key]: [...prev[key], value] }));
  };

  const buildPayload = (status = 'Draft', source = quoteData) => ({
    id: quotationId || undefined,
    status,
    customerId: source.customerId || undefined,
    customerName: source.customerName,
    customerAddress: source.customerAddress,
    customerLocation: source.customerLocation || source.customerAddress || 'Primary Location',
    customerPhone: source.customerPhone,
    customerEmail: source.customerEmail,
    gstin: source.gstin,
    quotationNo: source.number,
    quoteDate: source.date,
    minimumPeriod: Number(String(source.minimumRentalPeriod || '0').split(' ')[0]) || 0,
    securityDeposit: Number(source.securityDeposit || 0),
    installationCharges: Number(source.installationCharges || 0),
    deliveryCharges: Number(source.deliveryCharges || 0),
    gstRate: Number(source.gstPercent || 0),
    paymentTerms: source.paymentTerms,
    slaResponse: source.slaResponse,
    resolutionTime: source.resolutionTime,
    validity: source.validity,
    installationDate: source.installationDate,
    assignedTechnician: source.assignedTechnician || 'Unassigned',
    scope: source.scope,
    exclusions: source.exclusions,
    products: devices.map((d) => ({
      device: d.device,
      type: d.type,
      brand: d.brand,
      model: d.model,
      inputField: d.inputField,
      specs: d.specs,
      serialNo: d.serialNo,
      quantity: Number(d.quantity || 0),
      rentalPrice: Number(d.rentalPrice || 0),
      rentalUnit: d.rentalUnit,
      billingFrequency: d.billingFrequency,
      installationRequirements: d.installationRequirements,
      accessories: d.accessories,
      remarks: d.remarks,
    })),
  });

  const saveQuotation = async (status = 'Draft', source = quoteData) => {
    setIsSaving(true);
    setNotice('');
    try {
      const saved = await rentalQuotationService.saveQuotation(buildPayload(status, source));
      setQuotationId(saved.id);
      setWorkflow((prev) => ({
        ...prev,
        quotationSaved: true,
        quotationSent: prev.quotationSent || status === 'Sent',
      }));
      setNotice(`Quotation ${saved.id} saved as ${status}.`);
      pushActivity(`Quotation ${saved.id} saved as ${status}.`);
      return saved;
    } catch (error) {
      setNotice(error.message || 'Failed to save quotation.');
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const sendQuotation = async () => {
    const saved = await saveQuotation('Draft');
    if (!saved?.id) return;
    setIsSaving(true);
    try {
      await rentalQuotationService.markSent(saved.id);
      setWorkflow((prev) => ({ ...prev, quotationSent: true }));
      setNotice(`Quotation ${saved.id} marked as Sent.`);
      pushActivity(`Quotation ${saved.id} sent to customer.`);
    } catch (error) {
      setNotice(error.message || 'Failed to send quotation.');
    } finally {
      setIsSaving(false);
    }
  };

  const approveQuotation = async () => {
    const normalized = {
      ...quoteData,
      customerName: quoteData.customerName || 'Unnamed Customer',
      customerLocation: quoteData.customerLocation || quoteData.customerAddress || 'Primary Location',
      assignedTechnician: quoteData.assignedTechnician || 'Unassigned',
    };
    setQuoteData((prev) => ({
      ...prev,
      ...normalized,
    }));
    const saved = await saveQuotation('Sent', normalized);
    if (!saved?.id) return;
    setIsSaving(true);
    try {
      const result = await rentalQuotationService.markApproved(saved.id);
      const resolvedCustomerId = result?.customer?.id || quoteData.customerId || '';
      setWorkflow((prev) => ({
        ...prev,
        quotationApproved: true,
        agreementId: result.agreement?.id || '',
        assetsCount: result.assets?.length || 0,
        installationReady: (result.assets?.length || 0) > 0,
        meterReady: (result.assets?.length || 0) > 0,
        invoiceReady: (result.assets?.length || 0) > 0,
      }));
      setNotice(`${result.message} Agreement: ${result.agreement?.id || '-'}, Assets: ${result.assets?.length || 0}. Redirecting to customer workflow...`);
      pushActivity(`Quotation approved. Agreement ${result.agreement?.id || '-'} created and ${result.assets?.length || 0} asset(s) registered.`);
      if (resolvedCustomerId) {
        setTimeout(() => {
          window.location.href = `/admin/rental/customers/${resolvedCustomerId}`;
        }, 900);
      }
    } catch (error) {
      setNotice(error.message || 'Failed to approve quotation.');
    } finally {
      setIsSaving(false);
    }
  };

  const workflowBadge = workflow.invoiceReady
    ? 'Invoice Ready'
    : workflow.quotationApproved
      ? 'Approved'
      : workflow.quotationSent
        ? 'Sent'
        : workflow.quotationSaved
          ? 'Draft Saved'
          : 'In Progress';

  const isDeviceValid = (device) =>
    Boolean(device.device) && Number(device.quantity || 0) > 0 && Number(device.rentalPrice || 0) >= 0;
  const hasValidCustomer = Boolean(quoteData.customerName?.trim());
  const hasValidDevices = devices.length > 0 && devices.every(isDeviceValid);
  const canSend = hasValidCustomer && hasValidDevices && !workflow.quotationApproved;
  const canApprove = workflow.quotationSent && !workflow.quotationApproved;

  if (mode === 'preview') {
    return (
      <div className="document-view-container rental-workflow-page">
        <HeaderBar
          title="Quotation Preview"
          quotationId={quotationId}
          customerName={quoteData.customerName}
          badge={workflowBadge}
          onBack={() => setMode('form')}
          onSaveDraft={() => saveQuotation('Draft')}
          onSend={sendQuotation}
          onApprove={approveQuotation}
          onPreview={null}
          loading={isSaving}
          primaryLabel="Print Quotation"
          onPrimary={() => window.print()}
        />

        {notice ? <div className="success-banner no-print" role="status"><span>{notice}</span></div> : null}

        <div className="document-paper">
          <div className="paper-header">
            <div className="company-info">
              <h2 style={{ color: 'var(--secondary)', margin: 0 }}>RepairTech Solutions</h2>
              <p>Rental Management Division</p>
            </div>
            <div className="doc-type" style={{ textAlign: 'right' }}>
              <h1 style={{ margin: 0, fontSize: '28px' }}>RENTAL QUOTATION</h1>
              <p><strong>Date:</strong> {quoteData.date}</p>
              <p><strong>Quote #:</strong> {quoteData.number}</p>
            </div>
          </div>

          <div className="paper-body">
            <div className="info-grid">
              <div className="info-block">
                <strong>BILL TO:</strong>
                <p className="client-name">{quoteData.customerName || '-'}</p>
                <p>{quoteData.contactPerson || '-'}</p>
                <p>{quoteData.customerAddress || '-'}</p>
                <p><strong>GSTIN:</strong> {quoteData.gstin || '-'}</p>
              </div>
              <div className="info-block" style={{ textAlign: 'right' }}>
                <strong>SLA DETAILS:</strong>
                <p>Response: {quoteData.slaResponse}</p>
                <p>Resolution: {quoteData.resolutionTime}</p>
                <p>Validity: {quoteData.validity}</p>
                <p>Payment Terms: {quoteData.paymentTerms}</p>
              </div>
            </div>

            <div className="doc-section">
              <h3 className="section-heading">ASSET REGISTRY & COVERAGE</h3>
              <table className="doc-table">
                <thead>
                  <tr>
                    <th>Device</th><th>Type</th><th>Brand</th><th>Model</th><th>Input Field</th><th>S/N</th><th>Qty</th><th style={{ textAlign: 'right' }}>Unit Price</th><th style={{ textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {devices.map((d) => (
                    <tr key={d.id}>
                      <td>{d.device}</td><td>{d.type || '-'}</td><td>{d.brand || '-'}</td><td>{d.model || '-'}</td><td>{d.inputField || '-'}</td><td>{d.serialNo || '-'}</td><td>{d.quantity}</td><td style={{ textAlign: 'right' }}>{formatCurrency(d.rentalPrice)}</td><td style={{ textAlign: 'right' }}>{formatCurrency(d.quantity * d.rentalPrice)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr><td colSpan="8" style={{ textAlign: 'right' }}>Rental Subtotal</td><td style={{ textAlign: 'right' }}>{formatCurrency(subtotal)}</td></tr>
                  <tr><td colSpan="8" style={{ textAlign: 'right' }}>Security Deposit</td><td style={{ textAlign: 'right' }}>{formatCurrency(quoteData.securityDeposit)}</td></tr>
                  <tr><td colSpan="8" style={{ textAlign: 'right' }}>Installation Charges</td><td style={{ textAlign: 'right' }}>{formatCurrency(quoteData.installationCharges)}</td></tr>
                  <tr><td colSpan="8" style={{ textAlign: 'right' }}>Delivery Charges</td><td style={{ textAlign: 'right' }}>{formatCurrency(quoteData.deliveryCharges)}</td></tr>
                  <tr><td colSpan="8" style={{ textAlign: 'right' }}>GST ({quoteData.gstPercent}%) - {quoteData.gstType}</td><td style={{ textAlign: 'right' }}>{formatCurrency(gstAmount)}</td></tr>
                  <tr style={{ fontSize: '18px', color: 'var(--secondary)' }}><td colSpan="8" style={{ textAlign: 'right', fontWeight: 'bold' }}>GRAND TOTAL</td><td style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(grandTotal)}</td></tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="document-view-container rental-workflow-page">
      <HeaderBar
        title="Quotation Settings"
        quotationId={quotationId}
        customerName={quoteData.customerName}
        badge={workflowBadge}
        canSend={canSend}
        canApprove={canApprove}
        onBack={() => window.location.href = '/admin/rental/customers'}
        onSaveDraft={() => saveQuotation('Draft')}
        onSend={sendQuotation}
        onApprove={approveQuotation}
        onPreview={() => setMode('preview')}
        loading={isSaving}
        primaryLabel=""
        onPrimary={null}
      />

      {notice ? <div className="success-banner no-print" role="status"><span>{notice}</span></div> : null}

      <div className="quotation-form-card">
        <div className="workflow-grid">
          <section className="workflow-card customer-card">
            <div className="section-head">
              <h3><User size={16} /> Customer Details</h3>
              <button className="secondary-button" onClick={approveQuotation} disabled={isSaving || !canApprove}>{isSaving ? 'Processing...' : 'Approve & Start Agreement'}</button>
            </div>
            <div className="customer-hero">
              <div className="avatar">{(quoteData.customerName || 'C').slice(0, 1).toUpperCase()}</div>
              <div>
                <h4>{quoteData.customerName || 'Customer Name'}</h4>
                <p>{quoteData.contactPerson || 'Contact person'}</p>
              </div>
            </div>
            <div className="form-two-col">
              <FloatingField label="Customer Name" value={quoteData.customerName} onChange={(v) => setQuoteData({ ...quoteData, customerName: v })} />
              <FloatingField label="Contact Person" value={quoteData.contactPerson} onChange={(v) => setQuoteData({ ...quoteData, contactPerson: v })} />
              <FloatingField label="Address" value={quoteData.customerAddress} onChange={(v) => setQuoteData({ ...quoteData, customerAddress: v })} />
              <FloatingField label="Customer Location" value={quoteData.customerLocation} onChange={(v) => setQuoteData({ ...quoteData, customerLocation: v })} />
              <FloatingField type="date" label="Installation Date" value={quoteData.installationDate} onChange={(v) => setQuoteData({ ...quoteData, installationDate: v })} icon={<Calendar size={14} />} />
              <FloatingField label="Assigned Technician" value={quoteData.assignedTechnician} onChange={(v) => setQuoteData({ ...quoteData, assignedTechnician: v })} icon={<Wrench size={14} />} />
            </div>
            <div className="meta-line"><MapPin size={14} /> {quoteData.customerLocation || 'Location not set yet'}</div>
          </section>

          <section className="workflow-card">
            <div className="section-head">
              <h3><Package2 size={16} /> Product Details</h3>
              <button className="fab-add" onClick={addDevice}><Plus size={15} /> Add Device</button>
            </div>
            <div className="product-stack">
              {devices.map((d) => (
                <article className="device-card" key={d.id}>
                  <div className="device-top">
                    <div className="device-badge">{d.device}</div>
                    <div className="rent-badge">{formatCurrency(d.rentalPrice)} / {d.rentalUnit === 'Per Day' ? 'Day' : 'Month'}</div>
                    <button className="icon-button" style={{ color: 'var(--red)' }} onClick={() => removeDevice(d.id)}><Trash2 size={14} /></button>
                  </div>
                  <div className="form-two-col three">
                    <FloatingSelect label="Device" value={d.device} onChange={(v) => updateDevice(d.id, 'device', v)} options={deviceOptions} />
                    <FloatingField label="Type" value={d.type} onChange={(v) => updateDevice(d.id, 'type', v)} />
                    <FloatingField label="Brand" value={d.brand} onChange={(v) => updateDevice(d.id, 'brand', v)} />
                    <FloatingField label="Model" value={d.model} onChange={(v) => updateDevice(d.id, 'model', v)} />
                    <FloatingField label="Input Field" value={d.inputField} onChange={(v) => updateDevice(d.id, 'inputField', v)} />
                    <FloatingField label="Specs" value={d.specs} onChange={(v) => updateDevice(d.id, 'specs', v)} />
                    <FloatingField label="Serial No" value={d.serialNo} onChange={(v) => updateDevice(d.id, 'serialNo', v)} />
                    <FloatingField type="number" label="Qty" value={d.quantity} onChange={(v) => updateDevice(d.id, 'quantity', Number(v) || 0)} />
                    <FloatingField type="number" label="Rental Price" value={d.rentalPrice} onChange={(v) => updateDevice(d.id, 'rentalPrice', Number(v) || 0)} />
                    <FloatingSelect label="Rental Unit" value={d.rentalUnit} onChange={(v) => updateDevice(d.id, 'rentalUnit', v)} options={['Per Month', 'Per Day']} />
                    <FloatingSelect label="Billing Frequency" value={d.billingFrequency} onChange={(v) => updateDevice(d.id, 'billingFrequency', v)} options={['Monthly', 'Quarterly', 'Yearly', 'Daily']} />
                    <FloatingField label="Installation Notes" value={d.installationRequirements} onChange={(v) => updateDevice(d.id, 'installationRequirements', v)} />
                    <FloatingField label="Accessories" value={d.accessories} onChange={(v) => updateDevice(d.id, 'accessories', v)} />
                    <FloatingField label="Remarks" value={d.remarks} onChange={(v) => updateDevice(d.id, 'remarks', v)} />
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="workflow-card">
            <div className="section-head"><h3><Sparkles size={16} /> Scope of Work</h3></div>
            <EditableList
              items={quoteData.scope}
              onChange={(i, v) => updateListItem('scope', i, v)}
              onRemove={(i) => removeListItem('scope', i)}
              onAdd={() => addListItem('scope', 'New scope point')}
              addLabel="Add Scope Point"
            />
          </section>

          <section className="workflow-card">
            <div className="section-head"><h3><Sparkles size={16} /> Pricing Summary</h3></div>
            <div className="form-two-col">
              <FloatingField label="Minimum Rental Period" value={quoteData.minimumRentalPeriod} onChange={(v) => setQuoteData({ ...quoteData, minimumRentalPeriod: v })} />
              <FloatingSelect label="Payment Terms" value={quoteData.paymentTerms} onChange={(v) => setQuoteData({ ...quoteData, paymentTerms: v })} options={['Advance', 'Monthly']} />
              <FloatingField type="number" label="Security Deposit" value={quoteData.securityDeposit} onChange={(v) => setQuoteData({ ...quoteData, securityDeposit: Number(v) || 0 })} />
              <FloatingField type="number" label="Installation Charges" value={quoteData.installationCharges} onChange={(v) => setQuoteData({ ...quoteData, installationCharges: Number(v) || 0 })} />
              <FloatingField type="number" label="Delivery Charges" value={quoteData.deliveryCharges} onChange={(v) => setQuoteData({ ...quoteData, deliveryCharges: Number(v) || 0 })} />
              <FloatingSelect label="GST Type" value={quoteData.gstType} onChange={(v) => setQuoteData({ ...quoteData, gstType: v })} options={['Exclusive', 'Inclusive']} />
              <FloatingField type="number" label="GST %" value={quoteData.gstPercent} onChange={(v) => setQuoteData({ ...quoteData, gstPercent: Number(v) || 0 })} />
              <FloatingField label="SLA Response" value={quoteData.slaResponse} onChange={(v) => setQuoteData({ ...quoteData, slaResponse: v })} />
              <FloatingField label="Resolution Time" value={quoteData.resolutionTime} onChange={(v) => setQuoteData({ ...quoteData, resolutionTime: v })} />
              <FloatingField label="Validity" value={quoteData.validity} onChange={(v) => setQuoteData({ ...quoteData, validity: v })} />
            </div>
            <div className="price-total">Estimated Grand Total: <strong>{formatCurrency(grandTotal)}</strong></div>
          </section>

          <section className="workflow-card">
            <div className="section-head"><h3><Sparkles size={16} /> Exclusions</h3></div>
            <EditableList
              items={quoteData.exclusions}
              onChange={(i, v) => updateListItem('exclusions', i, v)}
              onRemove={(i) => removeListItem('exclusions', i)}
              onAdd={() => addListItem('exclusions', 'New exclusion point')}
              addLabel="Add Exclusion Point"
            />
          </section>

          <section className="workflow-card activity-card">
            <div className="section-head"><h3>Activity Timeline</h3></div>
            <div className="timeline-list">
              {activity.length === 0 ? <p className="empty-hint">No activity yet. Start with Save Draft or Send.</p> : null}
              {activity.map((row) => (
                <div key={row.id} className="timeline-row">
                  <span className="dot" />
                  <div>
                    <p>{row.text}</p>
                    <small>{row.time}</small>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const HeaderBar = ({
  title, quotationId, customerName, badge, onBack, onSaveDraft, onSend, onApprove, onPreview, loading, primaryLabel, onPrimary, canSend, canApprove,
}) => (
  <div className="sticky-head no-print">
    <div className="left">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> Back</button>
      <div>
        <h1>{title}</h1>
        <p>Quotation ID: <strong>{quotationId || 'Not generated'}</strong> | Customer: <strong>{customerName || '-'}</strong></p>
      </div>
      <span className="status-pill">{badge}</span>
    </div>
    <div className="right">
      <button className="secondary-button" onClick={onSaveDraft} disabled={loading}><Save size={15} /> {loading ? 'Saving...' : 'Save Draft'}</button>
      <button className="secondary-button" onClick={onSend} disabled={loading || !canSend}><Send size={15} /> Send</button>
      <button className="secondary-button" onClick={onApprove} disabled={loading || !canApprove}><Check size={15} /> Approve & Start</button>
      {onPreview ? <button className="primary-button" onClick={onPreview} disabled={loading}><Eye size={15} /> Generate Preview</button> : null}
      {onPrimary ? <button className="primary-button" onClick={onPrimary}>{primaryLabel}</button> : null}
    </div>
  </div>
);

const WorkflowChain = ({ steps, activeIndex }) => (
  <section className="workflow-chain-card no-print">
    <div className="workflow-chain desktop">
      {steps.map((step, index) => {
        const state = step.done ? 'done' : index === activeIndex ? 'active' : 'pending';
        const connector = index < steps.length - 1
          ? (steps[index + 1].done ? 'done' : index === activeIndex ? 'active' : 'pending')
          : null;
        return (
          <div className="workflow-node-wrap" key={step.id}>
            <div className={`workflow-node ${state}`}>{step.done ? <Check size={14} /> : null}</div>
            <span className={`workflow-label ${state}`}>{step.label}</span>
            {connector ? <span className={`workflow-connector ${connector}`} /> : null}
          </div>
        );
      })}
    </div>

    <div className="workflow-chain mobile">
      {steps.map((step, index) => {
        const state = step.done ? 'done' : index === activeIndex ? 'active' : 'pending';
        return (
          <div className="workflow-mobile-row" key={`m-${step.id}`}>
            <div className="workflow-mobile-rail">
              <div className={`workflow-node ${state}`}>{step.done ? <Check size={12} /> : null}</div>
              {index < steps.length - 1 ? <span className={`workflow-connector-vertical ${steps[index + 1].done ? 'done' : index === activeIndex ? 'active' : 'pending'}`} /> : null}
            </div>
            <div className="workflow-mobile-copy">
              <p>{step.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  </section>
);

const FloatingField = ({ label, value, onChange, type = 'text', icon = null }) => (
  <div className="floating-field">
    {icon ? <span className="field-icon">{icon}</span> : null}
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder=" " className={icon ? 'with-icon' : ''} />
    <label>{label}</label>
  </div>
);

const FloatingSelect = ({ label, value, onChange, options }) => (
  <div className="floating-field">
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((option) => <option key={option}>{option}</option>)}
    </select>
    <label>{label}</label>
  </div>
);

const EditableList = ({ items, onChange, onRemove, onAdd, addLabel }) => (
  <div className="edit-list">
    {items.map((item, i) => (
      <div key={`${item}-${i}`} className="edit-row">
        <input className="form-input" value={item} onChange={(e) => onChange(i, e.target.value)} />
        <button className="icon-button" style={{ color: 'var(--red)' }} onClick={() => onRemove(i)}><Trash2 size={14} /></button>
      </div>
    ))}
    <button className="secondary-button" style={{ borderStyle: 'dashed' }} onClick={onAdd}><Plus size={14} /> {addLabel}</button>
  </div>
);

export default RentalQuotationPage;
