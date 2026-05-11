import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ChevronDown, ChevronUp, ArrowLeft, Save } from 'lucide-react';
import { api } from '../../services/apiClient';
import './PlansCustomers.css';

const COLLECTION = 'rentalCustomers';

const DEVICE_TYPES = ['Printer', 'Copier', 'Laptop', 'Desktop', 'Scanner', 'CCTV', 'Server', 'Other'];
const BILLING_TYPES = ['Multi-Rate Printer Billing', 'Minimum Commitment Plan', 'Free Page Limit', 'Tier Pricing / Slab Pricing'];
const TECHNICIANS = ['Suresh K', 'Rakesh P', 'Aditi M'];

const createBlankDevice = (type = 'Printer') => ({
  type,
  brand: '',
  model: '',
  serialNumber: '',
  installationDate: '',
  customerLocation: '',
  technician: '',
  billingType: 'Multi-Rate Printer Billing',
  monthlyRent: '',
  meterStart: '',
  quantity: '1',
  deviceStatus: 'Active',
  notes: '',
});

// ─── Device Accordion ────────────────────────────────────────────────────────

const DeviceFields = ({ device, onChange }) => {
  const showMeter = device.type === 'Printer' || device.type === 'Copier';

  return (
    <div className="device-fields-section">
      <div className="device-fields-row">
        <div className="form-group">
          <label>Brand</label>
          <input className="form-input" value={device.brand} onChange={e => onChange('brand', e.target.value)} placeholder="e.g. HP, Canon, Dell" />
        </div>
        <div className="form-group">
          <label>Model</label>
          <input className="form-input" value={device.model} onChange={e => onChange('model', e.target.value)} placeholder="e.g. LaserJet Pro M404" />
        </div>
        <div className="form-group">
          <label>Serial Number</label>
          <input className="form-input" value={device.serialNumber} onChange={e => onChange('serialNumber', e.target.value)} placeholder="S/N" />
        </div>
      </div>

      <div className="device-fields-row">
        <div className="form-group">
          <label>Installation Date</label>
          <input type="date" className="form-input" value={device.installationDate} onChange={e => onChange('installationDate', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Customer Location</label>
          <input className="form-input" value={device.customerLocation} onChange={e => onChange('customerLocation', e.target.value)} placeholder="e.g. Head Office, Floor 2" />
        </div>
        <div className="form-group">
          <label>Technician</label>
          <select className="form-select" value={device.technician} onChange={e => onChange('technician', e.target.value)}>
            <option value="">— Assign Technician —</option>
            {TECHNICIANS.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="device-fields-row">
        <div className="form-group">
          <label>Billing Type</label>
          <select className="form-select" value={device.billingType} onChange={e => onChange('billingType', e.target.value)}>
            {BILLING_TYPES.map(b => <option key={b}>{b}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Monthly Rent (₹)</label>
          <input className="form-input" value={device.monthlyRent} onChange={e => onChange('monthlyRent', e.target.value)} placeholder="e.g. 2500" />
        </div>
        <div className="form-group">
          <label>Quantity</label>
          <input type="number" className="form-input" value={device.quantity} min="1" onChange={e => onChange('quantity', e.target.value)} placeholder="1" />
        </div>
      </div>

      {showMeter && (
        <div className="device-fields-row">
          <div className="form-group">
            <label>Meter Start Reading</label>
            <input className="form-input" value={device.meterStart} onChange={e => onChange('meterStart', e.target.value)} placeholder="Opening meter count" />
          </div>
          <div className="form-group">
            <label>Device Status</label>
            <select className="form-select" value={device.deviceStatus} onChange={e => onChange('deviceStatus', e.target.value)}>
              <option>Active</option>
              <option>Inactive</option>
              <option>Under Maintenance</option>
            </select>
          </div>
          <div className="form-group" />
        </div>
      )}

      {!showMeter && (
        <div className="device-fields-row">
          <div className="form-group">
            <label>Device Status</label>
            <select className="form-select" value={device.deviceStatus} onChange={e => onChange('deviceStatus', e.target.value)}>
              <option>Active</option>
              <option>Inactive</option>
              <option>Under Maintenance</option>
            </select>
          </div>
          <div className="form-group">
            <label>Notes</label>
            <input className="form-input" value={device.notes} onChange={e => onChange('notes', e.target.value)} placeholder="Any additional notes" />
          </div>
          <div className="form-group" />
        </div>
      )}

      {showMeter && (
        <div className="device-fields-row">
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Notes</label>
            <input className="form-input" value={device.notes} onChange={e => onChange('notes', e.target.value)} placeholder="Any additional notes" />
          </div>
        </div>
      )}
    </div>
  );
};

const getDeviceSummary = (d) => `${d.brand || ''} ${d.model || ''}`.trim() || '';

const DeviceAccordion = ({ device, index, isOpen, onToggle, onUpdate, onRemove, onAdd }) => {
  const onChange = (field, value) => {
    if (field === 'type') {
      onUpdate(index, createBlankDevice(value));
    } else {
      onUpdate(index, { ...device, [field]: value });
    }
  };

  const summary = getDeviceSummary(device);

  return (
    <div className={`device-accordion${isOpen ? ' open' : ''}`}>
      <div className="accordion-header" onClick={onToggle}>
        <div className="accordion-title-area">
          <span className="accordion-device-index">Device {index + 1}</span>
          <span className="accordion-device-type-badge">{device.type}</span>
          {summary && <span className="accordion-device-summary">{summary}</span>}
        </div>
        <div className="accordion-actions" onClick={e => e.stopPropagation()}>
          <select
            className="form-select accordion-type-select"
            value={device.type}
            onChange={e => onChange('type', e.target.value)}
            title="Change device type"
          >
            {DEVICE_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          <button className="accordion-remove-btn" onClick={() => onRemove(index)}>
            <Trash2 size={13} /> Remove
          </button>
          <button className="accordion-add-device-btn" onClick={onAdd} title="Add another device">
            <Plus size={14} /> Add Device
          </button>
          <span className="accordion-chevron">
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        </div>
      </div>
      {isOpen && (
        <div className="accordion-body">
          <DeviceFields device={device} onChange={onChange} />
        </div>
      )}
    </div>
  );
};

// ─── Main Page ───────────────────────────────────────────────────────────────

const RentalNewCustomerPage = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [openDevices, setOpenDevices] = useState(new Set([0]));

  const [form, setForm] = useState({
    companyName: '',
    customerType: 'Corporate',
    gstNumber: '',
    primaryContact: { name: '', mobile: '', email: '' },
    secondaryContact: { name: '', mobile: '', email: '' },
    primaryAddress: '',
    billingAddress: '',
    notes: '',
    devices: [createBlankDevice('Printer')],
  });

  const setContact = (type, field, value) => {
    setForm(f => ({ ...f, [type]: { ...f[type], [field]: value } }));
  };

  const addDevice = () => {
    const newIndex = form.devices.length;
    setForm(f => ({ ...f, devices: [...f.devices, createBlankDevice('Printer')] }));
    setOpenDevices(prev => new Set([...prev, newIndex]));
  };

  const updateDevice = (index, updated) => {
    setForm(f => {
      const devices = [...f.devices];
      devices[index] = updated;
      return { ...f, devices };
    });
  };

  const removeDevice = (index) => {
    setForm(f => ({ ...f, devices: f.devices.filter((_, i) => i !== index) }));
    setOpenDevices(prev => {
      const next = new Set();
      prev.forEach(i => {
        if (i < index) next.add(i);
        else if (i > index) next.add(i - 1);
      });
      return next;
    });
  };

  const toggleDevice = (index) => {
    setOpenDevices(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index); else next.add(index);
      return next;
    });
  };

  const validate = () => {
    const errs = {};
    if (!form.companyName.trim()) errs.companyName = 'Company / customer name is required';
    if (!form.primaryContact.name.trim()) errs.primaryContactName = 'Primary contact name is required';
    if (!form.primaryAddress.trim()) errs.primaryAddress = 'Primary address is required';
    if (!form.primaryContact.mobile.trim() && !form.primaryContact.email.trim()) errs.primaryContact = 'Mobile or email is required';
    if (form.customerType === 'Corporate' && !form.gstNumber.trim()) errs.gstNumber = 'GST is required for corporate customers';
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSaving(true);
    try {
      const id = `CUS-${Date.now().toString().slice(-6)}`;
      const locations = [
        {
          id: `LOC-${Date.now()}-0`,
          locationName: 'Primary Location',
          address: form.primaryAddress,
          contactPerson: form.primaryContact.name,
          contactNumber: form.primaryContact.mobile,
          isPrimary: true,
        },
      ];
      const payload = {
        id,
        companyName: form.companyName,
        customerType: form.customerType,
        gstNumber: form.gstNumber,
        authorizedPerson1Name: form.primaryContact.name,
        authorizedPerson1Phone: form.primaryContact.mobile,
        authorizedPerson1Email: form.primaryContact.email,
        authorizedPerson2Name: form.secondaryContact.name,
        authorizedPerson2Phone: form.secondaryContact.mobile,
        authorizedPerson2Email: form.secondaryContact.email,
        primaryAddress: form.primaryAddress,
        billingAddress: form.billingAddress || form.primaryAddress,
        contactNumber: form.primaryContact.mobile,
        email: form.primaryContact.email,
        notes: form.notes,
        status: 'Pending',
        billingType: 'Smart Billing Plan',
        outstandingAmount: 0,
        locations,
        additionalAddresses: [],
        devices: form.devices.map((d, i) => ({ ...d, id: `DEV-${Date.now()}-${i}` })),
        quotations: [],
        agreements: [],
        invoices: [],
        payments: [],
        maintenanceHistory: [],
        replacements: [],
      };
      await api.create(COLLECTION, payload);
      navigate('/admin/rental/customers');
    } catch (err) {
      console.error('Failed to save rental customer:', err);
      setErrors({ save: 'Failed to save. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="amc-new-page">
      <div className="amc-new-page-header">
        <button className="back-button" onClick={() => navigate('/admin/rental/customers')}>
          <ArrowLeft size={18} /> Back to Rental Customers
        </button>
        <div className="amc-new-page-title">
          <h1>New Rental Customer</h1>
          <p>Register a new customer with their contact details and device registry.</p>
        </div>
        <div className="amc-new-page-actions">
          <button className="secondary-button" onClick={() => navigate('/admin/rental/customers')}>Cancel</button>
          <button className="primary-button" onClick={handleSave} disabled={saving}>
            <Save size={16} /> {saving ? 'Saving…' : 'Save Customer'}
          </button>
        </div>
      </div>

      {errors.save && <div className="form-error-banner">{errors.save}</div>}

      <div className="amc-new-page-body">

        {/* Section 1: Customer / Company */}
        <div className="amc-form-card card-customer">
          <div className="amc-form-card-header">
            <h2 className="amc-form-section-title">1. Customer / Company</h2>
          </div>
          <div className="amc-form-card-body">
            <div className="form-row-2">
              <div className={`form-group${errors.companyName ? ' has-error' : ''}`}>
                <label>Company Name / Customer Name *</label>
                <input
                  className="form-input"
                  value={form.companyName}
                  onChange={e => { setForm(f => ({ ...f, companyName: e.target.value })); setErrors(p => ({ ...p, companyName: undefined })); }}
                  placeholder="Enter company or customer name"
                />
                {errors.companyName && <span className="field-error">{errors.companyName}</span>}
              </div>
              <div className="form-group">
                <label>Customer Type</label>
                <select className="form-select" value={form.customerType} onChange={e => setForm(f => ({ ...f, customerType: e.target.value }))}>
                  <option>Corporate</option>
                  <option>Individual</option>
                </select>
              </div>
            </div>

            <div className="form-row-2">
              <div className={`form-group${errors.gstNumber ? ' has-error' : ''}`}>
                <label>GST Number {form.customerType === 'Corporate' ? '*' : ''}</label>
                <input
                  className="form-input"
                  value={form.gstNumber}
                  onChange={e => { setForm(f => ({ ...f, gstNumber: e.target.value })); setErrors(p => ({ ...p, gstNumber: undefined })); }}
                  placeholder="GSTIN (required for corporate)"
                />
                {errors.gstNumber && <span className="field-error">{errors.gstNumber}</span>}
              </div>
              <div className="form-group" />
            </div>

            <div className="contact-section">
              <div className="contact-section-label">Primary Contact</div>
              <div className="form-row-3">
                <div className={`form-group${errors.primaryContactName ? ' has-error' : ''}`}>
                  <label>Name *</label>
                  <input
                    className="form-input"
                    value={form.primaryContact.name}
                    onChange={e => { setContact('primaryContact', 'name', e.target.value); setErrors(p => ({ ...p, primaryContactName: undefined })); }}
                    placeholder="Contact person name"
                  />
                  {errors.primaryContactName && <span className="field-error">{errors.primaryContactName}</span>}
                </div>
                <div className={`form-group${errors.primaryContact ? ' has-error' : ''}`}>
                  <label>Mobile *</label>
                  <input
                    className="form-input"
                    value={form.primaryContact.mobile}
                    onChange={e => { setContact('primaryContact', 'mobile', e.target.value); setErrors(p => ({ ...p, primaryContact: undefined })); }}
                    placeholder="+91 XXXXX XXXXX"
                  />
                  {errors.primaryContact && <span className="field-error">{errors.primaryContact}</span>}
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input className="form-input" value={form.primaryContact.email} onChange={e => setContact('primaryContact', 'email', e.target.value)} placeholder="email@company.com" />
                </div>
              </div>
            </div>

            <div className="contact-section secondary-contact-section">
              <div className="contact-section-label">
                Secondary Contact <span className="optional-tag">(Optional)</span>
              </div>
              <div className="form-row-3">
                <div className="form-group">
                  <label>Name</label>
                  <input className="form-input" value={form.secondaryContact.name} onChange={e => setContact('secondaryContact', 'name', e.target.value)} placeholder="Contact person name" />
                </div>
                <div className="form-group">
                  <label>Mobile</label>
                  <input className="form-input" value={form.secondaryContact.mobile} onChange={e => setContact('secondaryContact', 'mobile', e.target.value)} placeholder="+91 XXXXX XXXXX" />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input className="form-input" value={form.secondaryContact.email} onChange={e => setContact('secondaryContact', 'email', e.target.value)} placeholder="email@company.com" />
                </div>
              </div>
            </div>

            <div className="form-row-2">
              <div className={`form-group${errors.primaryAddress ? ' has-error' : ''}`}>
                <label>Primary Address *</label>
                <textarea
                  className="form-input"
                  style={{ height: '72px', paddingTop: '10px', resize: 'vertical' }}
                  value={form.primaryAddress}
                  onChange={e => { setForm(f => ({ ...f, primaryAddress: e.target.value })); setErrors(p => ({ ...p, primaryAddress: undefined })); }}
                  placeholder="Full registered / primary address"
                />
                {errors.primaryAddress && <span className="field-error">{errors.primaryAddress}</span>}
              </div>
              <div className="form-group">
                <label>Billing Address <span className="optional-tag">(if different)</span></label>
                <textarea
                  className="form-input"
                  style={{ height: '72px', paddingTop: '10px', resize: 'vertical' }}
                  value={form.billingAddress}
                  onChange={e => setForm(f => ({ ...f, billingAddress: e.target.value }))}
                  placeholder="Leave blank to use primary address"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Notes <span className="optional-tag">(Optional)</span></label>
              <textarea
                className="form-input"
                style={{ height: '60px', paddingTop: '10px', resize: 'vertical' }}
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Any additional notes about this customer"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Device Registry */}
        <div className="amc-form-card card-devices">
          <div className="amc-form-card-header device-registry-header">
            <h2 className="amc-form-section-title">2. Device Registry</h2>
            <button className="primary-button" style={{ height: '36px', fontSize: '13px' }} onClick={addDevice}>
              <Plus size={16} /> Add Device
            </button>
          </div>
          <div className="amc-form-card-body">
            {form.devices.length === 0 && (
              <div className="empty-devices-hint">
                No devices added. Click "Add Device" to register the first device.
              </div>
            )}
            <div className="device-accordion-list">
              {form.devices.map((device, index) => (
                <DeviceAccordion
                  key={index}
                  device={device}
                  index={index}
                  isOpen={openDevices.has(index)}
                  onToggle={() => toggleDevice(index)}
                  onUpdate={updateDevice}
                  onRemove={removeDevice}
                  onAdd={addDevice}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="amc-form-footer">
          <button className="secondary-button" onClick={() => navigate('/admin/rental/customers')}>Cancel</button>
          <button className="primary-button" onClick={handleSave} disabled={saving}>
            <Save size={16} /> {saving ? 'Saving…' : 'Save Customer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RentalNewCustomerPage;
