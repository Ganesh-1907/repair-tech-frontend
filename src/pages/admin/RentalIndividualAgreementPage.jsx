import React, { useMemo, useState } from 'react';
import { Download, Eye, FileText, Mail, Plus, Printer, Save, Send, Trash2, X } from 'lucide-react';
import AdminPageHeader from '../../components/common/AdminPageHeader';
import { rentalIndividualAgreementService } from '../../services/rentalIndividualAgreementService';

const initialForm = {
  agreementDate: new Date().toISOString().slice(0, 10),
  agreementNo: '',
  customerName: '',
  customerAddress: '',
  providerName: 'REPAIRBOY',
  monthlyRent: 0,
  a4BwRate: 1.2,
  a4ColorRate: 8,
  paymentTerms: 7,
  startDate: new Date().toISOString().slice(0, 10),
  endDate: '',
  noticePeriod: 15,
  maintenanceTerms: 'Basic maintenance included',
  replacementTerms: 'Device may be replaced if faulty',
  liabilityTerms: 'Customer responsible for physical damages',
  additionalTerms: '',
  status: 'Draft',
};

const emptyDevice = {
  id: 0,
  deviceType: 'Printer',
  brandModel: '',
  serialNumber: '',
  notes: '',
};

let localDeviceSeed = 1;
const createDeviceRow = () => ({ ...emptyDevice, id: `tmp-${localDeviceSeed++}` });

const formatCurrency = (value) => `INR ${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const RentalIndividualAgreementPage = () => {
  const [form, setForm] = useState(initialForm);
  const [devices, setDevices] = useState([createDeviceRow()]);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState('');
  const [currentAgreementId, setCurrentAgreementId] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const payload = useMemo(() => ({
    ...form,
    monthlyRent: Number(form.monthlyRent || 0),
    a4BwRate: Number(form.a4BwRate || 0),
    a4ColorRate: Number(form.a4ColorRate || 0),
    paymentTerms: Number(form.paymentTerms || 0),
    noticePeriod: Number(form.noticePeriod || 0),
    devices,
  }), [form, devices]);

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  };

  const updateDevice = (id, field, value) => {
    setDevices((current) => current.map((device) => (device.id === id ? { ...device, [field]: value } : device)));
  };

  const addDevice = () => {
    setDevices((current) => [...current, createDeviceRow()]);
  };

  const removeDevice = (id) => {
    setDevices((current) => (current.length > 1 ? current.filter((row) => row.id !== id) : current));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.agreementDate) nextErrors.agreementDate = 'Agreement date is required.';
    if (!form.customerName.trim()) nextErrors.customerName = 'Customer name is required.';
    if (!form.customerAddress.trim()) nextErrors.customerAddress = 'Customer address is required.';
    if (!form.startDate) nextErrors.startDate = 'Start date is required.';
    if (!form.endDate) nextErrors.endDate = 'End date is required.';
    if (form.startDate && form.endDate && new Date(form.endDate) <= new Date(form.startDate)) nextErrors.endDate = 'End date must be after start date.';
    if (Number(form.monthlyRent) <= 0) nextErrors.monthlyRent = 'Monthly rent must be greater than 0.';
    if (Number(form.paymentTerms) <= 0) nextErrors.paymentTerms = 'Payment terms must be valid number.';
    if (devices.length === 0 || devices.some((row) => !row.brandModel.trim())) nextErrors.devices = 'At least one valid device is required.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const saveDraft = async () => {
    if (!validate()) return null;
    const saved = currentAgreementId
      ? await rentalIndividualAgreementService.updateAgreement(currentAgreementId, { ...payload, status: 'Draft' })
      : await rentalIndividualAgreementService.createAgreement({ ...payload, status: 'Draft' });
    if (!saved) return null;
    setCurrentAgreementId(saved.id);
    setForm((current) => ({ ...current, agreementNo: saved.agreementNo, status: 'Draft' }));
    setNotice(`Agreement ${saved.agreementNo} saved as draft.`);
    return saved;
  };

  const ensureAgreement = async () => {
    if (currentAgreementId) return currentAgreementId;
    const saved = await saveDraft();
    return saved?.id || null;
  };

  const handleGenerate = async () => {
    const agreementId = await ensureAgreement();
    if (!agreementId) return;
    await rentalIndividualAgreementService.generateAgreement(agreementId);
    setForm((current) => ({ ...current, status: 'Generated' }));
    setNotice('Agreement generated.');
  };

  const handleDownloadPdf = async () => {
    const agreementId = await ensureAgreement();
    if (!agreementId) return;
    const response = await rentalIndividualAgreementService.downloadPdf(agreementId);
    setNotice(response.message);
  };

  const handleSendEmail = async () => {
    const agreementId = await ensureAgreement();
    if (!agreementId) return;
    const response = await rentalIndividualAgreementService.sendAgreementEmail(agreementId);
    setForm((current) => ({ ...current, status: response.agreement?.status || current.status }));
    setNotice(response.message);
  };

  const handleSendWhatsApp = async () => {
    const agreementId = await ensureAgreement();
    if (!agreementId) return;
    const response = await rentalIndividualAgreementService.sendAgreementWhatsApp(agreementId);
    setForm((current) => ({ ...current, status: response.agreement?.status || current.status }));
    setNotice(response.message);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await saveDraft();
  };

  return (
    <div className="admin-module-page rental-individual-agreement-page">
      {notice && (
        <div className="success-banner" role="status">
          <span>{notice}</span>
          <button className="icon-btn" onClick={() => setNotice('')} aria-label="Dismiss individual agreement message">
            <X size={16} />
          </button>
        </div>
      )}

      <AdminPageHeader
        title="Rental Individual Agreement"
        description="Single page form with editable terms and popup preview."
        breadcrumbs={['Admin', 'Rental Management', 'Agreements', 'Individual']}
      />

      <form className="card individual-form-card individual-agreement-form" onSubmit={handleSubmit}>
        <div className="card-header">
          <div>
            <h3>Individual Agreement Form</h3>
            <p>One simple form. Fill details and click preview.</p>
          </div>
          <div className="agreement-inline-actions">
            <button type="button" className="btn btn-sm btn-secondary" onClick={() => setShowPreview(true)}><Eye size={14} /> Preview</button>
            <button type="button" className="btn btn-sm btn-secondary" onClick={handleGenerate}><FileText size={14} /> Generate</button>
            <button type="button" className="btn btn-sm btn-secondary" onClick={handleDownloadPdf}><Download size={14} /> PDF</button>
            <button type="button" className="btn btn-sm btn-secondary" onClick={() => window.print()}><Printer size={14} /> Print</button>
            <button type="button" className="btn btn-sm btn-secondary" onClick={handleSendWhatsApp}><Send size={14} /> WhatsApp</button>
            <button type="button" className="btn btn-sm btn-secondary" onClick={handleSendEmail}><Mail size={14} /> Email</button>
          </div>
        </div>

        <fieldset className="individual-form-section">
          <legend>Basic Details</legend>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="ind-agreement-date">Agreement Date</label>
              <input id="ind-agreement-date" type="date" value={form.agreementDate} onChange={(event) => updateForm('agreementDate', event.target.value)} aria-invalid={Boolean(errors.agreementDate)} />
              {errors.agreementDate && <span className="form-error">{errors.agreementDate}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="ind-agreement-no">Agreement No</label>
              <input id="ind-agreement-no" value={form.agreementNo} onChange={(event) => updateForm('agreementNo', event.target.value)} placeholder="Auto generated if blank" />
            </div>
            <div className="form-group">
              <label htmlFor="ind-customer-name">Customer Name</label>
              <input id="ind-customer-name" value={form.customerName} onChange={(event) => updateForm('customerName', event.target.value)} aria-invalid={Boolean(errors.customerName)} />
              {errors.customerName && <span className="form-error">{errors.customerName}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="ind-provider-name">Provider / Company Name</label>
              <input id="ind-provider-name" value={form.providerName} onChange={(event) => updateForm('providerName', event.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="ind-customer-address">Customer Address</label>
              <textarea id="ind-customer-address" rows={3} value={form.customerAddress} onChange={(event) => updateForm('customerAddress', event.target.value)} aria-invalid={Boolean(errors.customerAddress)} />
              {errors.customerAddress && <span className="form-error">{errors.customerAddress}</span>}
            </div>
          </div>
        </fieldset>

        <fieldset className="individual-form-section">
          <legend>Device Details</legend>
          <div className="individual-section-header">
            <p className="section-hint">Add one or more rented devices.</p>
            <button type="button" className="btn btn-sm btn-secondary" onClick={addDevice}><Plus size={14} /> Add Device</button>
          </div>
          {errors.devices && <div className="inline-error">{errors.devices}</div>}
          <div className="device-table-container">
            <table className="leads-table">
              <thead>
                <tr>
                  <th>Device Type</th>
                  <th>Brand / Model</th>
                  <th>Serial Number</th>
                  <th>Notes</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {devices.map((device) => (
                  <tr key={device.id}>
                    <td>
                      <select className="table-input" value={device.deviceType} onChange={(event) => updateDevice(device.id, 'deviceType', event.target.value)}>
                        <option>Printer</option>
                        <option>Laptop</option>
                        <option>Desktop</option>
                        <option>Other</option>
                      </select>
                    </td>
                    <td><input className="table-input" value={device.brandModel} onChange={(event) => updateDevice(device.id, 'brandModel', event.target.value)} /></td>
                    <td><input className="table-input" value={device.serialNumber} onChange={(event) => updateDevice(device.id, 'serialNumber', event.target.value)} /></td>
                    <td><input className="table-input" value={device.notes} onChange={(event) => updateDevice(device.id, 'notes', event.target.value)} /></td>
                    <td>
                      <button type="button" className="icon-btn danger" onClick={() => removeDevice(device.id)} aria-label="Remove device" disabled={devices.length === 1}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </fieldset>

        <fieldset className="individual-form-section">
          <legend>Rental Details</legend>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="ind-monthly-rent">Monthly Rent</label>
              <input id="ind-monthly-rent" type="number" min="0" value={form.monthlyRent} onChange={(event) => updateForm('monthlyRent', event.target.value)} aria-invalid={Boolean(errors.monthlyRent)} />
              {errors.monthlyRent && <span className="form-error">{errors.monthlyRent}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="ind-a4-bw">A4 B/W Rate</label>
              <input id="ind-a4-bw" type="number" min="0" step="0.01" value={form.a4BwRate} onChange={(event) => updateForm('a4BwRate', event.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="ind-a4-color">A4 Color Rate</label>
              <input id="ind-a4-color" type="number" min="0" step="0.01" value={form.a4ColorRate} onChange={(event) => updateForm('a4ColorRate', event.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="ind-payment-terms">Payment Terms (days)</label>
              <input id="ind-payment-terms" type="number" min="1" value={form.paymentTerms} onChange={(event) => updateForm('paymentTerms', event.target.value)} aria-invalid={Boolean(errors.paymentTerms)} />
              {errors.paymentTerms && <span className="form-error">{errors.paymentTerms}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="ind-start-date">Start Date</label>
              <input id="ind-start-date" type="date" value={form.startDate} onChange={(event) => updateForm('startDate', event.target.value)} aria-invalid={Boolean(errors.startDate)} />
              {errors.startDate && <span className="form-error">{errors.startDate}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="ind-end-date">End Date</label>
              <input id="ind-end-date" type="date" value={form.endDate} onChange={(event) => updateForm('endDate', event.target.value)} aria-invalid={Boolean(errors.endDate)} />
              {errors.endDate && <span className="form-error">{errors.endDate}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="ind-notice-period">Notice Period (days)</label>
              <input id="ind-notice-period" type="number" min="1" value={form.noticePeriod} onChange={(event) => updateForm('noticePeriod', event.target.value)} />
            </div>
          </div>
        </fieldset>

        <fieldset className="individual-form-section">
          <legend>Editable Terms</legend>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="ind-maintenance">Maintenance Terms</label>
              <textarea id="ind-maintenance" rows={3} value={form.maintenanceTerms} onChange={(event) => updateForm('maintenanceTerms', event.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="ind-replacement">Replacement Terms</label>
              <textarea id="ind-replacement" rows={3} value={form.replacementTerms} onChange={(event) => updateForm('replacementTerms', event.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="ind-liability">Liability Terms</label>
              <textarea id="ind-liability" rows={3} value={form.liabilityTerms} onChange={(event) => updateForm('liabilityTerms', event.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="ind-additional">Additional Terms / Notes</label>
              <textarea id="ind-additional" rows={3} value={form.additionalTerms} onChange={(event) => updateForm('additionalTerms', event.target.value)} />
            </div>
          </div>
        </fieldset>

        <div className="individual-form-footer">
          <button type="submit" className="btn btn-primary"><Save size={14} /> Save Draft</button>
        </div>
      </form>

      {showPreview && (
        <div className="modal-overlay" role="presentation" onClick={() => setShowPreview(false)}>
          <div className="modal-panel agreement-preview-modal" role="dialog" aria-modal="true" aria-labelledby="ind-preview-title" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 id="ind-preview-title">Agreement Preview</h2>
                <p>Printable individual agreement preview.</p>
              </div>
              <button className="icon-btn" onClick={() => setShowPreview(false)} aria-label="Close preview">
                <X size={18} />
              </button>
            </div>
            <div className="modal-form">
              <article className="agreement-document">
                <h2>Rental Agreement (Individual)</h2>
                <p>This Agreement is made on <strong>{form.agreementDate || '-'}</strong></p>
                <h3>Between</h3>
                <p><strong>{form.customerName || '-'}</strong>, residing at<br />{form.customerAddress || '-'}<br />(hereinafter referred to as "Customer")</p>
                <h3>And</h3>
                <p><strong>{form.providerName || '-'}</strong><br />(hereinafter referred to as "Provider")</p>

                <h3>1. Equipment Provided</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Brand / Model</th>
                      <th>Serial</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {devices.map((device) => (
                      <tr key={device.id}>
                        <td>{device.deviceType || '-'}</td>
                        <td>{device.brandModel || '-'}</td>
                        <td>{device.serialNumber || '-'}</td>
                        <td>{device.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <h3>2. Rental Charges</h3>
                <p>Monthly Rent: {formatCurrency(form.monthlyRent)}</p>
                <h3>3. Usage Charges</h3>
                <p>A4 B/W: {formatCurrency(form.a4BwRate)}<br />A4 Color: {formatCurrency(form.a4ColorRate)}</p>
                <h3>4. Billing</h3>
                <p>Monthly billing cycle. Payment due within {form.paymentTerms || '-'} days.</p>
                <h3>5. Maintenance</h3>
                <p>{form.maintenanceTerms || '-'}</p>
                <h3>6. Replacement</h3>
                <p>{form.replacementTerms || '-'}</p>
                <h3>7. Duration</h3>
                <p>From {form.startDate || '-'} to {form.endDate || '-'}</p>
                <h3>8. Termination</h3>
                <p>{form.noticePeriod || '-'} days notice required.</p>
                <h3>9. Liability</h3>
                <p>{form.liabilityTerms || '-'}</p>
                {form.additionalTerms && (
                  <>
                    <h3>Additional Terms / Notes</h3>
                    <p>{form.additionalTerms}</p>
                  </>
                )}
                <div className="agreement-signature-grid">
                  <div>
                    <strong>Customer Signature</strong>
                    <span>Authorized Signatory</span>
                  </div>
                  <div>
                    <strong>Provider Signature</strong>
                    <span>Authorized Signatory</span>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RentalIndividualAgreementPage;
