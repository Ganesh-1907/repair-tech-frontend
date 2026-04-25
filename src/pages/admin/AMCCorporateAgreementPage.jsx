import React, { useEffect, useMemo, useState } from 'react';
import {
  Download,
  Edit,
  Eye,
  FileText,
  Mail,
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
import { amcCorporateAgreementService } from '../../services/amcCorporateAgreementService';

const initialForm = {
  agreementDate: new Date().toISOString().slice(0, 10),
  agreementNo: '',
  status: 'Draft',
  companyName: 'REPAIRBOY',
  companyAddress: 'Repairboy Service Center, Indore',
  companyGstin: '',
  providerContactPerson: '',
  providerEmail: '',
  providerPhone: '',
  clientName: '',
  clientAddress: '',
  clientGstin: '',
  clientContactPerson: '',
  clientEmail: '',
  clientPhone: '',
  branchLocation: '',
  startDate: new Date().toISOString().slice(0, 10),
  endDate: '',
  amcType: 'Comprehensive',
  preventiveFrequency: 'Quarterly',
  remoteSupport: '24x7',
  networkSupport: 'Included',
  serverSupport: 'Included',
  criticalResponse: 2,
  normalResponse: 6,
  resolutionTime: 'Within 24 hours',
  penaltyTerms: 'Penalty applied for SLA breach as per corporate policy.',
  totalAmount: 0,
  gstPercentage: 18,
  paymentPlan: 'Quarterly Billing',
  lateInterest: 2,
  sparePolicy: 'Spare parts policy as per AMC type and approval matrix.',
  level1Contact: '',
  level2Contact: '',
  level3Contact: '',
  dataSecurityTerms: 'NDA compliance mandatory. No data access without permission.',
  terminationNoticeDays: 30,
  terminationTerms: 'Immediate termination in case of breach.',
  renewalTerms: 'Auto-renewal with client consent.',
  renewalNoticeDays: 45,
  liabilityTerms: 'Limited liability up to contract value. No responsibility for indirect losses.',
  termsConditions: '',
  companyPolicies: '',
  additionalNotes: '',
};

const emptyAsset = {
  id: 0,
  assetId: '',
  assetType: 'Laptop',
  brandModel: '',
  serialNumber: '',
  configuration: '',
  locationBranch: '',
  coverageType: '',
  notes: '',
};

let localAssetSeed = 1;
const createAssetRow = () => ({ ...emptyAsset, id: `asset-${localAssetSeed++}` });

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

const formatCurrency = (value) => `INR ${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const AMCCorporateAgreementPage = () => {
  const [form, setForm] = useState(initialForm);
  const [assets, setAssets] = useState([createAssetRow()]);
  const [historyRows, setHistoryRows] = useState([]);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState('');
  const [currentAgreementId, setCurrentAgreementId] = useState(null);

  const refreshHistory = async () => {
    setHistoryRows(await amcCorporateAgreementService.getAgreementHistory());
  };

  useEffect(() => {
    let active = true;
    amcCorporateAgreementService.getAgreementHistory().then((rows) => {
      if (active) setHistoryRows(rows);
    });
    return () => {
      active = false;
    };
  }, []);

  const payload = useMemo(() => ({
    ...form,
    criticalResponse: Number(form.criticalResponse || 0),
    normalResponse: Number(form.normalResponse || 0),
    totalAmount: Number(form.totalAmount || 0),
    gstPercentage: Number(form.gstPercentage || 0),
    lateInterest: Number(form.lateInterest || 0),
    terminationNoticeDays: Number(form.terminationNoticeDays || 0),
    renewalNoticeDays: Number(form.renewalNoticeDays || 0),
    assets,
  }), [form, assets]);

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  };

  const updateAsset = (id, field, value) => {
    setAssets((current) => current.map((asset) => (asset.id === id ? { ...asset, [field]: value } : asset)));
  };

  const addAsset = () => {
    setAssets((current) => [...current, createAssetRow()]);
  };

  const removeAsset = (id) => {
    setAssets((current) => (current.length > 1 ? current.filter((asset) => asset.id !== id) : current));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.agreementDate) nextErrors.agreementDate = 'Agreement date is required.';
    if (!form.companyName.trim()) nextErrors.companyName = 'Company name is required.';
    if (!form.companyAddress.trim()) nextErrors.companyAddress = 'Company address is required.';
    if (!form.clientName.trim()) nextErrors.clientName = 'Client name is required.';
    if (!form.clientAddress.trim()) nextErrors.clientAddress = 'Client address is required.';
    if (!form.amcType) nextErrors.amcType = 'AMC type is required.';
    if (!form.startDate) nextErrors.startDate = 'Start date is required.';
    if (!form.endDate) nextErrors.endDate = 'End date is required.';
    if (form.startDate && form.endDate && new Date(form.endDate) <= new Date(form.startDate)) nextErrors.endDate = 'End date must be after start date.';
    if (assets.length === 0 || assets.some((asset) => !asset.assetType || !asset.brandModel.trim())) nextErrors.assets = 'At least one valid asset is required.';
    if (Number(form.totalAmount) <= 0) nextErrors.totalAmount = 'Total amount must be greater than 0.';
    if (!form.paymentPlan) nextErrors.paymentPlan = 'Payment plan is required.';
    if (Number(form.gstPercentage) < 0) nextErrors.gstPercentage = 'GST percentage cannot be negative.';
    if (Number(form.criticalResponse) <= 0) nextErrors.criticalResponse = 'Critical response hours must be valid.';
    if (Number(form.normalResponse) <= 0) nextErrors.normalResponse = 'Normal response hours must be valid.';
    if (Number(form.lateInterest) < 0) nextErrors.lateInterest = 'Late interest cannot be negative.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const saveDraft = async () => {
    if (!validate()) return null;
    const saved = currentAgreementId
      ? await amcCorporateAgreementService.updateAgreement(currentAgreementId, { ...payload, status: 'Draft' })
      : await amcCorporateAgreementService.createAgreement({ ...payload, status: 'Draft' });
    if (!saved) return null;
    setCurrentAgreementId(saved.id);
    setForm((current) => ({ ...current, agreementNo: saved.agreementNo, status: 'Draft' }));
    await refreshHistory();
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
    await amcCorporateAgreementService.generateAgreement(agreementId);
    setForm((current) => ({ ...current, status: 'Generated' }));
    await refreshHistory();
    setNotice('AMC agreement generated.');
  };

  const handleDownloadPdf = async (agreementId = null) => {
    const targetId = agreementId || await ensureAgreement();
    if (!targetId) return;
    const response = await amcCorporateAgreementService.downloadPdf(targetId);
    setNotice(response.message);
  };

  const handleSendEmail = async (agreementId = null) => {
    const targetId = agreementId || await ensureAgreement();
    if (!targetId) return;
    const response = await amcCorporateAgreementService.sendAgreementEmail(targetId);
    setForm((current) => ({ ...current, status: response.agreement?.status || current.status }));
    await refreshHistory();
    setNotice(response.message);
  };

  const handleSendWhatsApp = async () => {
    const targetId = await ensureAgreement();
    if (!targetId) return;
    const response = await amcCorporateAgreementService.sendAgreementWhatsApp(targetId);
    setForm((current) => ({ ...current, status: response.agreement?.status || current.status }));
    await refreshHistory();
    setNotice(response.message);
  };

  const handleMarkSigned = async (agreementId = null) => {
    const targetId = agreementId || await ensureAgreement();
    if (!targetId) return;
    await amcCorporateAgreementService.markAgreementSigned(targetId);
    setForm((current) => ({ ...current, status: 'Signed' }));
    await refreshHistory();
    setNotice('AMC agreement marked as signed.');
  };

  const handleRenew = async (agreementId = null) => {
    const targetId = agreementId || await ensureAgreement();
    if (!targetId) return;
    const renewed = await amcCorporateAgreementService.renewAgreement(targetId);
    if (!renewed) return;
    await refreshHistory();
    setNotice(`Renewed agreement created: ${renewed.agreementNo}.`);
  };

  const loadAgreement = async (agreementId) => {
    const agreement = await amcCorporateAgreementService.getAgreementById(agreementId);
    if (!agreement) return;
    setCurrentAgreementId(agreement.id);
    setForm((current) => ({ ...current, ...agreement }));
    setAssets(agreement.assets?.length ? agreement.assets : [createAssetRow()]);
  };

  return (
    <div className="admin-module-page amc-corporate-agreement-page">
      {notice && (
        <div className="success-banner" role="status">
          <span>{notice}</span>
          <button className="icon-btn" onClick={() => setNotice('')} aria-label="Dismiss amc corporate agreement message">
            <X size={16} />
          </button>
        </div>
      )}

      <AdminPageHeader
        title="AMC Corporate Agreement"
        description="Simplified corporate AMC agreement with editable terms, preview, and actions."
        breadcrumbs={['Admin', 'AMC Management', 'AMC Agreement', 'Corporate']}
        actions={[
          { label: 'Save Draft', icon: Save, onClick: saveDraft },
          { label: 'Generate Agreement', icon: FileText, onClick: handleGenerate },
          { label: 'Print', variant: 'secondary', icon: Printer, onClick: () => window.print() },
        ]}
      />

      <div className="amc-corporate-layout">
        <div className="amc-corporate-form-col">
          <div className="card">
            <div className="card-header">
              <div>
                <h3>Basic Agreement Details</h3>
                <p>Provider, corporate client, period, and primary AMC details.</p>
              </div>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="amc-agreement-date">Agreement Date</label>
                <input id="amc-agreement-date" type="date" value={form.agreementDate} onChange={(event) => updateForm('agreementDate', event.target.value)} aria-invalid={Boolean(errors.agreementDate)} />
                {errors.agreementDate && <span className="form-error">{errors.agreementDate}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="amc-agreement-no">Agreement Number</label>
                <input id="amc-agreement-no" value={form.agreementNo} onChange={(event) => updateForm('agreementNo', event.target.value)} placeholder="Auto generated if blank" />
              </div>
              <div className="form-group">
                <label htmlFor="amc-status">Status</label>
                <select id="amc-status" value={form.status} onChange={(event) => updateForm('status', event.target.value)}>
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
                <label htmlFor="provider-company-name">Company Name</label>
                <input id="provider-company-name" value={form.companyName} onChange={(event) => updateForm('companyName', event.target.value)} aria-invalid={Boolean(errors.companyName)} />
                {errors.companyName && <span className="form-error">{errors.companyName}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="provider-company-gstin">Company GSTIN</label>
                <input id="provider-company-gstin" value={form.companyGstin} onChange={(event) => updateForm('companyGstin', event.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="provider-contact-person">Provider Contact Person</label>
                <input id="provider-contact-person" value={form.providerContactPerson} onChange={(event) => updateForm('providerContactPerson', event.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="provider-email">Provider Email</label>
                <input id="provider-email" type="email" value={form.providerEmail} onChange={(event) => updateForm('providerEmail', event.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="provider-phone">Provider Phone</label>
                <input id="provider-phone" value={form.providerPhone} onChange={(event) => updateForm('providerPhone', event.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="provider-company-address">Company Address</label>
                <textarea id="provider-company-address" rows={2} value={form.companyAddress} onChange={(event) => updateForm('companyAddress', event.target.value)} aria-invalid={Boolean(errors.companyAddress)} />
                {errors.companyAddress && <span className="form-error">{errors.companyAddress}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="client-name">Client Name</label>
                <input id="client-name" value={form.clientName} onChange={(event) => updateForm('clientName', event.target.value)} aria-invalid={Boolean(errors.clientName)} />
                {errors.clientName && <span className="form-error">{errors.clientName}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="client-gstin">Client GSTIN</label>
                <input id="client-gstin" value={form.clientGstin} onChange={(event) => updateForm('clientGstin', event.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="client-contact-person">Client Contact Person</label>
                <input id="client-contact-person" value={form.clientContactPerson} onChange={(event) => updateForm('clientContactPerson', event.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="client-email">Client Email</label>
                <input id="client-email" type="email" value={form.clientEmail} onChange={(event) => updateForm('clientEmail', event.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="client-phone">Client Phone</label>
                <input id="client-phone" value={form.clientPhone} onChange={(event) => updateForm('clientPhone', event.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="client-branch-location">Branch / Location</label>
                <input id="client-branch-location" value={form.branchLocation} onChange={(event) => updateForm('branchLocation', event.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="client-address">Client Address</label>
                <textarea id="client-address" rows={2} value={form.clientAddress} onChange={(event) => updateForm('clientAddress', event.target.value)} aria-invalid={Boolean(errors.clientAddress)} />
                {errors.clientAddress && <span className="form-error">{errors.clientAddress}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="amc-start-date">Start Date</label>
                <input id="amc-start-date" type="date" value={form.startDate} onChange={(event) => updateForm('startDate', event.target.value)} aria-invalid={Boolean(errors.startDate)} />
                {errors.startDate && <span className="form-error">{errors.startDate}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="amc-end-date">End Date</label>
                <input id="amc-end-date" type="date" value={form.endDate} onChange={(event) => updateForm('endDate', event.target.value)} aria-invalid={Boolean(errors.endDate)} />
                {errors.endDate && <span className="form-error">{errors.endDate}</span>}
              </div>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="card-header">
              <div>
                <h3>Asset Coverage</h3>
                <p>Covered assets under this corporate AMC.</p>
              </div>
              <button type="button" className="btn btn-sm btn-secondary" onClick={addAsset}><Plus size={14} /> Add Asset</button>
            </div>
            {errors.assets && <div className="inline-error">{errors.assets}</div>}
            <div className="device-table-container">
              <table className="leads-table amc-asset-table">
                <thead>
                  <tr>
                    <th>Asset ID</th>
                    <th>Asset Type</th>
                    <th>Brand / Model</th>
                    <th>Serial Number</th>
                    <th>Configuration</th>
                    <th>Location / Branch</th>
                    <th>Coverage Type</th>
                    <th>Notes</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((asset) => (
                    <tr key={asset.id}>
                      <td><input className="table-input" value={asset.assetId} onChange={(event) => updateAsset(asset.id, 'assetId', event.target.value)} /></td>
                      <td>
                        <select className="table-input" value={asset.assetType} onChange={(event) => updateAsset(asset.id, 'assetType', event.target.value)}>
                          <option>Laptop</option>
                          <option>Desktop</option>
                          <option>Printer</option>
                          <option>Server</option>
                          <option>Network Device</option>
                          <option>Other</option>
                        </select>
                      </td>
                      <td><input className="table-input" value={asset.brandModel} onChange={(event) => updateAsset(asset.id, 'brandModel', event.target.value)} /></td>
                      <td><input className="table-input" value={asset.serialNumber} onChange={(event) => updateAsset(asset.id, 'serialNumber', event.target.value)} /></td>
                      <td><input className="table-input" value={asset.configuration} onChange={(event) => updateAsset(asset.id, 'configuration', event.target.value)} /></td>
                      <td><input className="table-input" value={asset.locationBranch} onChange={(event) => updateAsset(asset.id, 'locationBranch', event.target.value)} /></td>
                      <td><input className="table-input" value={asset.coverageType} onChange={(event) => updateAsset(asset.id, 'coverageType', event.target.value)} /></td>
                      <td><input className="table-input" value={asset.notes} onChange={(event) => updateAsset(asset.id, 'notes', event.target.value)} /></td>
                      <td>
                        <button type="button" className="icon-btn danger" onClick={() => removeAsset(asset.id)} aria-label="Remove asset" disabled={assets.length === 1}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div>
                <h3>AMC, SLA & Payment Details</h3>
                <p>Service scope, SLA response targets, and financial terms.</p>
              </div>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="amc-type">AMC Type</label>
                <select id="amc-type" value={form.amcType} onChange={(event) => updateForm('amcType', event.target.value)} aria-invalid={Boolean(errors.amcType)}>
                  <option>Comprehensive</option>
                  <option>Non-Comprehensive</option>
                </select>
                {errors.amcType && <span className="form-error">{errors.amcType}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="preventive-frequency">Preventive Frequency</label>
                <select id="preventive-frequency" value={form.preventiveFrequency} onChange={(event) => updateForm('preventiveFrequency', event.target.value)}>
                  <option>Monthly</option>
                  <option>Quarterly</option>
                  <option>Half-Yearly</option>
                  <option>Yearly</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="remote-support">Remote Support</label>
                <select id="remote-support" value={form.remoteSupport} onChange={(event) => updateForm('remoteSupport', event.target.value)}>
                  <option>24x7</option>
                  <option>Business Hours</option>
                  <option>Not Included</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="network-support">Network Support</label>
                <select id="network-support" value={form.networkSupport} onChange={(event) => updateForm('networkSupport', event.target.value)}>
                  <option>Included</option>
                  <option>Excluded</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="server-support">Server Support</label>
                <input id="server-support" value={form.serverSupport} onChange={(event) => updateForm('serverSupport', event.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="critical-response">Critical Response Hours</label>
                <input id="critical-response" type="number" min="1" value={form.criticalResponse} onChange={(event) => updateForm('criticalResponse', event.target.value)} aria-invalid={Boolean(errors.criticalResponse)} />
                {errors.criticalResponse && <span className="form-error">{errors.criticalResponse}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="normal-response">Normal Response Hours</label>
                <input id="normal-response" type="number" min="1" value={form.normalResponse} onChange={(event) => updateForm('normalResponse', event.target.value)} aria-invalid={Boolean(errors.normalResponse)} />
                {errors.normalResponse && <span className="form-error">{errors.normalResponse}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="resolution-time">Resolution Time</label>
                <input id="resolution-time" value={form.resolutionTime} onChange={(event) => updateForm('resolutionTime', event.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="penalty-terms">Penalty Terms</label>
                <textarea id="penalty-terms" rows={2} value={form.penaltyTerms} onChange={(event) => updateForm('penaltyTerms', event.target.value)} />
              </div>

              <div className="form-group">
                <label htmlFor="total-amount">Total Amount</label>
                <input id="total-amount" type="number" min="0" value={form.totalAmount} onChange={(event) => updateForm('totalAmount', event.target.value)} aria-invalid={Boolean(errors.totalAmount)} />
                {errors.totalAmount && <span className="form-error">{errors.totalAmount}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="gst-percentage">GST Percentage</label>
                <input id="gst-percentage" type="number" min="0" value={form.gstPercentage} onChange={(event) => updateForm('gstPercentage', event.target.value)} aria-invalid={Boolean(errors.gstPercentage)} />
                {errors.gstPercentage && <span className="form-error">{errors.gstPercentage}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="payment-plan">Payment Plan</label>
                <select id="payment-plan" value={form.paymentPlan} onChange={(event) => updateForm('paymentPlan', event.target.value)} aria-invalid={Boolean(errors.paymentPlan)}>
                  <option>100% Advance</option>
                  <option>Quarterly Billing</option>
                  <option>Monthly Retainer</option>
                </select>
                {errors.paymentPlan && <span className="form-error">{errors.paymentPlan}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="late-interest">Late Interest %</label>
                <input id="late-interest" type="number" min="0" value={form.lateInterest} onChange={(event) => updateForm('lateInterest', event.target.value)} aria-invalid={Boolean(errors.lateInterest)} />
                {errors.lateInterest && <span className="form-error">{errors.lateInterest}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="spare-policy">Spare Parts Policy</label>
                <textarea id="spare-policy" rows={2} value={form.sparePolicy} onChange={(event) => updateForm('sparePolicy', event.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="level-1-contact">Escalation Level 1</label>
                <input id="level-1-contact" value={form.level1Contact} onChange={(event) => updateForm('level1Contact', event.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="level-2-contact">Escalation Level 2</label>
                <input id="level-2-contact" value={form.level2Contact} onChange={(event) => updateForm('level2Contact', event.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="level-3-contact">Escalation Level 3</label>
                <input id="level-3-contact" value={form.level3Contact} onChange={(event) => updateForm('level3Contact', event.target.value)} />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div>
                <h3>Editable Terms, Policies & Clauses</h3>
                <p>All terms are editable per corporate client agreement.</p>
              </div>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="data-security-terms">Data & Security Terms</label>
                <textarea id="data-security-terms" rows={3} value={form.dataSecurityTerms} onChange={(event) => updateForm('dataSecurityTerms', event.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="termination-notice-days">Termination Notice Days</label>
                <input id="termination-notice-days" type="number" min="1" value={form.terminationNoticeDays} onChange={(event) => updateForm('terminationNoticeDays', event.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="termination-terms">Termination Terms</label>
                <textarea id="termination-terms" rows={3} value={form.terminationTerms} onChange={(event) => updateForm('terminationTerms', event.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="renewal-notice-days">Renewal Notice Days</label>
                <input id="renewal-notice-days" type="number" min="1" value={form.renewalNoticeDays} onChange={(event) => updateForm('renewalNoticeDays', event.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="renewal-terms">Renewal Terms</label>
                <textarea id="renewal-terms" rows={3} value={form.renewalTerms} onChange={(event) => updateForm('renewalTerms', event.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="liability-terms">Liability & Indemnity Terms</label>
                <textarea id="liability-terms" rows={3} value={form.liabilityTerms} onChange={(event) => updateForm('liabilityTerms', event.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="custom-terms-conditions">Custom Terms & Conditions</label>
                <textarea id="custom-terms-conditions" rows={3} value={form.termsConditions} onChange={(event) => updateForm('termsConditions', event.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="company-policies">Company Policies</label>
                <textarea id="company-policies" rows={3} value={form.companyPolicies} onChange={(event) => updateForm('companyPolicies', event.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="additional-notes">Additional Notes</label>
                <textarea id="additional-notes" rows={3} value={form.additionalNotes} onChange={(event) => updateForm('additionalNotes', event.target.value)} />
              </div>
            </div>
          </div>
        </div>

        <aside className="amc-corporate-preview-col">
          <div className="card amc-corporate-preview">
            <div className="card-header">
              <div>
                <h3>Agreement Preview</h3>
                <p>Clean printable corporate AMC agreement preview.</p>
              </div>
              <Eye size={18} className="icon-primary" />
            </div>

            <article className="agreement-document">
              <h2>Corporate AMC Agreement (Advanced)</h2>
              <p>This Annual Maintenance Contract (AMC) Agreement is made on <strong>{form.agreementDate || '-'}</strong> between:</p>

              <h3>Service Provider</h3>
              <p>{form.companyName || '-'}<br />{form.companyAddress || '-'}<br />GSTIN: {form.companyGstin || '-'}</p>

              <h3>Client (Corporate)</h3>
              <p>{form.clientName || '-'}<br />{form.clientAddress || '-'}<br />GSTIN: {form.clientGstin || '-'}</p>

              <h3>1. Contract Period</h3>
              <p>From {form.startDate || '-'} to {form.endDate || '-'} (12 Months)</p>

              <h3>2. Asset Coverage</h3>
              <table>
                <thead>
                  <tr>
                    <th>Asset ID</th>
                    <th>Type</th>
                    <th>Brand / Model</th>
                    <th>Serial</th>
                    <th>Coverage</th>
                    <th>Location</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((asset) => (
                    <tr key={asset.id}>
                      <td>{asset.assetId || '-'}</td>
                      <td>{asset.assetType || '-'}</td>
                      <td>{asset.brandModel || '-'}</td>
                      <td>{asset.serialNumber || '-'}</td>
                      <td>{asset.coverageType || '-'}</td>
                      <td>{asset.locationBranch || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h3>3. AMC Type</h3>
              <p>{form.amcType || '-'}</p>
              <h3>4. Service Scope</h3>
              <p>
                Preventive Maintenance: {form.preventiveFrequency || '-'}<br />
                Unlimited Breakdown Support<br />
                Remote Support: {form.remoteSupport || '-'}<br />
                Network Support: {form.networkSupport || '-'}<br />
                Server Support: {form.serverSupport || '-'}
              </p>
              <h3>5. SLA (Strict – Corporate Level)</h3>
              <p>
                Critical Issues: Response within {form.criticalResponse || '-'} hours<br />
                Normal Issues: Response within {form.normalResponse || '-'} hours<br />
                Resolution Time: {form.resolutionTime || '-'}<br />
                Penalty Clause: {form.penaltyTerms || '-'}
              </p>
              <h3>6. Payment Terms</h3>
              <p>
                Total Value: {formatCurrency(form.totalAmount)}<br />
                GST: {form.gstPercentage || '-'}%<br />
                Payment Plan: {form.paymentPlan || '-'}<br />
                Interest @ {form.lateInterest || '-'}% per month
              </p>
              <h3>7. Spare Parts Policy</h3>
              <p>{form.sparePolicy || '-'}</p>
              <h3>8. Escalation Matrix</h3>
              <p>Level 1: {form.level1Contact || '-'}<br />Level 2: {form.level2Contact || '-'}<br />Level 3: {form.level3Contact || '-'}</p>
              <h3>9. Data & Security</h3>
              <p>{form.dataSecurityTerms || '-'}</p>
              <h3>10. Termination</h3>
              <p>Notice Period: {form.terminationNoticeDays || '-'} days<br />{form.terminationTerms || '-'}</p>
              <h3>11. Renewal</h3>
              <p>{form.renewalTerms || '-'}<br />Renewal notice before {form.renewalNoticeDays || '-'} days</p>
              <h3>12. Liability & Indemnity</h3>
              <p>{form.liabilityTerms || '-'}</p>
              <h3>13. Custom Terms & Conditions</h3>
              <p>{form.termsConditions || '-'}</p>
              <h3>14. Company Policies</h3>
              <p>{form.companyPolicies || '-'}</p>
              {form.additionalNotes && (
                <>
                  <h3>Additional Notes</h3>
                  <p>{form.additionalNotes}</p>
                </>
              )}

              <div className="agreement-signature-grid">
                <div><strong>Authorized Signatory (Provider)</strong><span>Signature: ___________</span></div>
                <div><strong>Authorized Signatory (Client)</strong><span>Signature: ___________</span></div>
              </div>
            </article>

            <div className="admin-chip-row">
              <button className="btn btn-primary btn-full" onClick={saveDraft}><Save size={16} /> Save Draft</button>
              <button className="btn btn-primary btn-full" onClick={handleGenerate}><Send size={16} /> Generate</button>
              <button className="btn btn-secondary btn-full" onClick={handleDownloadPdf}><Download size={16} /> Download PDF</button>
              <button className="btn btn-secondary btn-full" onClick={() => window.print()}><Printer size={16} /> Print</button>
              <button className="btn btn-secondary btn-full" onClick={handleSendWhatsApp}><Send size={16} /> WhatsApp</button>
              <button className="btn btn-secondary btn-full" onClick={() => handleSendEmail()}><Mail size={16} /> Email</button>
              <button className="btn btn-secondary btn-full" onClick={() => handleMarkSigned()}><ShieldCheck size={16} /> Mark Signed</button>
              <button className="btn btn-secondary btn-full" onClick={() => handleRenew()}><RefreshCw size={16} /> Renew</button>
            </div>
          </div>
        </aside>
      </div>

      <div className="card overflow-hidden">
        <div className="card-header">
          <div>
            <h3>Agreement History</h3>
            <p>Simple AMC corporate agreement tracking and quick actions.</p>
          </div>
        </div>
        <div className="device-table-container">
          <table className="leads-table">
            <thead>
              <tr>
                <th>Agreement No</th>
                <th>Client Name</th>
                <th>Assets Count</th>
                <th>AMC Type</th>
                <th>Total Amount</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {historyRows.map((row) => (
                <tr key={row.id}>
                  <td className="bold">{row.agreementNo}</td>
                  <td>{row.clientName}</td>
                  <td>{row.assetsCount}</td>
                  <td>{row.amcType}</td>
                  <td>{formatCurrency(row.totalAmount)}</td>
                  <td>{row.startDate}</td>
                  <td>{row.endDate}</td>
                  <td><span className={`status-pill ${statusClass[row.status] || 'status-draft'}`}>{row.status}</span></td>
                  <td>
                    <div className="agreement-history-actions">
                      <button className="icon-btn" title="View" onClick={() => loadAgreement(row.id)} aria-label="View agreement"><Eye size={14} /></button>
                      <button className="icon-btn" title="Edit" onClick={() => loadAgreement(row.id)} aria-label="Edit agreement"><Edit size={14} /></button>
                      <button className="icon-btn" title="Print" onClick={() => window.print()} aria-label="Print agreement"><Printer size={14} /></button>
                      <button className="icon-btn" title="PDF" onClick={() => handleDownloadPdf(row.id)} aria-label="Download PDF"><Download size={14} /></button>
                      <button className="icon-btn" title="Send" onClick={() => handleSendEmail(row.id)} aria-label="Send agreement"><Send size={14} /></button>
                      <button className="icon-btn" title="Mark Signed" onClick={() => handleMarkSigned(row.id)} aria-label="Mark signed"><ShieldCheck size={14} /></button>
                      <button className="icon-btn" title="Renew" onClick={() => handleRenew(row.id)} aria-label="Renew agreement"><RefreshCw size={14} /></button>
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

export default AMCCorporateAgreementPage;
