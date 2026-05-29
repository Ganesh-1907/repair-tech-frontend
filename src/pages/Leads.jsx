import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  Edit,
  Eye,
  Search,
  MoreVertical,
  Phone,
  Plus,
  UserPlus,
  Zap,
  X,
  MessageCircleMore,
  Send,
  Smartphone,
  Wrench,
  FileText,
  ChevronRight,
} from 'lucide-react';
import { leadManagementService } from '../services/leadManagementService';
import { staffManagementService } from '../services/staffManagementService';
import { useLeadSettings } from '../hooks/useLeadSettings';
import { sendOutboundMessage } from '../services/communicationService';
import SendCredentialsModal from '../components/common/SendCredentialsModal';

const initialLeadForm = {
  customerName: '',
  company: '',
  mobileNumber: '',
  email: '',
  serviceType: '',
  source: '',
  assignedTechnicianId: '',
  device: '',
  locationLink: '',
  problemInwardNote: '',
  deviceCheckNote: '',
  quote: '',
  billing: '',
  reviewMessageLink: '',
  deviceReceiveConfirmed: false,
  deviceDeliveryConfirmed: false,
  problemInwardImage1: null,
  problemInwardImage2: null,
  problemInwardImage3: null,
  deviceCheckImages: [],
  onsiteImages: [],
  category: 'Pending',
};

const categories = ['All', 'Pending', 'Completed', 'Assigned', 'Missed'];

const ADMIN_TRACKER_STEPS = ['Lead Captured', 'Assign to Technician'];

const STAFF_PROGRESS_STEPS = [
  'Technician Assigned',
  'Quotation Preparation',
  'Quotation Approved',
  'Repair / Service Started',
  'Ready for Collection',
  'Delivered & Closed',
];

const ALL_LEAD_STEPS = [...ADMIN_TRACKER_STEPS, ...STAFF_PROGRESS_STEPS];

const normalizeStatus = (v) => String(v || '').trim().toLowerCase();

const getCurrentStepIndex = (lead) => {
  if (lead.tracker?.some((s) => s.status === 'cancelled')) return -1;
  if (lead.category && lead.category !== 'Missed') {
    const staffIdx = STAFF_PROGRESS_STEPS.findIndex((s) =>
      normalizeStatus(s) === normalizeStatus(lead.category) ||
      normalizeStatus(lead.category).includes(normalizeStatus(s)) ||
      normalizeStatus(s).includes(normalizeStatus(lead.category))
    );
    if (staffIdx >= 0) return staffIdx + ADMIN_TRACKER_STEPS.length;
  }
  const tracker = lead.tracker || [];
  const lastCompleted = tracker.reduce((max, s, i) => (s.status === 'completed' ? i : max), -1);
  return lastCompleted;
};

const normalizeServiceType = (value = '') => String(value).toLowerCase().includes('onsite') ? 'Onsite service' : 'Walk-in';

const buildLeadTracker = (serviceType, assigned = false) => {
  return ADMIN_TRACKER_STEPS.map((step, index) => ({
    step,
    status: index === 0 || assigned ? 'completed' : 'current',
    date: index === 0 || assigned ? new Date().toISOString() : null,
  }));
};

const completeAssignStep = (lead) => {
  return ADMIN_TRACKER_STEPS.map((step) => ({
    step,
    status: 'completed',
    date: new Date().toISOString(),
  }));
};

const normalizePhoneForWhatsApp = (mobileNumber = '') => {
  const digits = String(mobileNumber).replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  return digits;
};

const openWhatsAppMessage = (mobileNumber, message) => {
  const phone = normalizePhoneForWhatsApp(mobileNumber);
  if (!phone) return;
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
};

const messageTemplates = [
  {
    id: 'welcome',
    label: 'Welcome Message',
    content: 'Hi {{customer_name}},\n\nThank you for contacting RepairBoy. We received your enquiry and our team will connect with you shortly.\n\nRegards,\nRepairBoy Team',
  },
  {
    id: 'followup',
    label: 'Follow-up Message',
    content: 'Hi {{customer_name}},\n\nJust following up on your service enquiry. Please let us know a convenient time to connect and help you further.\n\nRegards,\nRepairBoy Team',
  },
  {
    id: 'service_update',
    label: 'Service Update Preview',
    content: 'Hi {{customer_name}},\n\nService update for your request: our team is reviewing the details and will share the next step soon.\n\nStatus: {{lead_status}}\nAssigned to: {{technician}}\n\nRegards,\nRepairBoy Team',
  },
];

const prepareMessage = (template, lead) => template.content
  .replaceAll('{{customer_name}}', lead?.customerName || 'Customer')
  .replaceAll('{{lead_status}}', lead?.category || 'Pending')
  .replaceAll('{{technician}}', lead?.assignedTechnician || 'Not assigned');

const fileToDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve({ name: file.name, dataUrl: reader.result });
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const LeadFormModal = ({ technicians, submitting, onClose, onCreate, serviceTypeOptions, sourceOptions, deviceOptions }) => {
  const [form, setForm] = useState(initialLeadForm);
  const [errors, setErrors] = useState({});

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  };

  const handleFiles = async (field, event) => {
    const files = Array.from(event.target.files || []);
    const images = await Promise.all(files.map(fileToDataUrl));
    updateForm(field, images);
  };

  const handleSingleFile = async (field, event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const image = await fileToDataUrl(file);
    updateForm(field, image);
  };

  const selectedServiceType = normalizeServiceType(form.serviceType);
  const selectedTechnician = technicians.find((tech) => tech.id === form.assignedTechnicianId);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    const nextErrors = {};
    if (!form.company.trim()) nextErrors.company = 'Company is required.';
    if (!form.customerName.trim()) nextErrors.customerName = 'Customer name is required.';
    if (!form.mobileNumber.trim()) {
      nextErrors.mobileNumber = 'Mobile number is required.';
    } else if (!/^\d{10}$/.test(form.mobileNumber.trim())) {
      nextErrors.mobileNumber = 'Enter a valid 10 digit mobile number.';
    }
    if (!form.email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (!form.serviceType.trim()) nextErrors.serviceType = 'Service type is required.';
    if (!form.source.trim()) nextErrors.source = 'Source is required.';
    if (selectedServiceType === 'Onsite service' && form.onsiteImages.length < 3) {
      nextErrors.onsiteImages = 'Upload at least 3 onsite images.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    await onCreate({
      id: String(Date.now()),
      customerName: form.customerName.trim(),
      company: form.company.trim(),
      mobileNumber: form.mobileNumber.trim(),
      email: form.email.trim(),
      serviceType: selectedServiceType,
      source: form.source.trim(),
      device: form.device.trim(),
      locationLink: form.locationLink.trim(),
      problemInwardNote: form.problemInwardNote.trim(),
      deviceCheckNote: form.deviceCheckNote.trim(),
      quote: form.quote.trim(),
      billing: form.billing.trim(),
      reviewMessageLink: form.reviewMessageLink.trim(),
      deviceReceiveConfirmed: form.deviceReceiveConfirmed,
      deviceDeliveryConfirmed: form.deviceDeliveryConfirmed,
      problemInwardImages: [form.problemInwardImage1, form.problemInwardImage2, form.problemInwardImage3].filter(Boolean),
      deviceCheckImages: form.deviceCheckImages,
      onsiteImages: form.onsiteImages,
      assignedTechnician: selectedTechnician?.name || '',
      assignedTechnicianId: selectedTechnician?.id || '',
      category: selectedTechnician ? 'Assigned' : form.category,
      tracker: buildLeadTracker(selectedServiceType, Boolean(selectedTechnician)),
      createdAt: new Date().toISOString().slice(0, 10),
    });
  };

  return (
    <div className="modal-overlay" role="presentation">
      <div className="modal-panel lead-form-modal" role="dialog" aria-modal="true" aria-labelledby="new-lead-title">
        <div className="modal-header">
          <div>
            <h2 id="new-lead-title">Create New Lead</h2>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close new lead form">
            <X size={18} />
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="lead-company">Company</label>
              <input
                id="lead-company"
                type="text"
                placeholder="Enter company"
                value={form.company}
                onChange={(event) => updateForm('company', event.target.value)}
                aria-invalid={Boolean(errors.company)}
              />
              {errors.company && <span className="form-error">{errors.company}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="lead-customer">Customer Name</label>
              <input
                id="lead-customer"
                type="text"
                placeholder="Enter customer name"
                value={form.customerName}
                onChange={(event) => updateForm('customerName', event.target.value)}
                aria-invalid={Boolean(errors.customerName)}
              />
              {errors.customerName && <span className="form-error">{errors.customerName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="lead-mobile">Mobile Number</label>
              <input
                id="lead-mobile"
                type="tel"
                inputMode="numeric"
                placeholder="Enter mobile number"
                value={form.mobileNumber}
                onChange={(event) => updateForm('mobileNumber', event.target.value.replace(/\D/g, '').slice(0, 10))}
                aria-invalid={Boolean(errors.mobileNumber)}
              />
              {errors.mobileNumber && <span className="form-error">{errors.mobileNumber}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="lead-email">Email <span style={{ color: '#ef4444' }}>*</span></label>
              <input
                id="lead-email"
                type="email"
                placeholder="Enter email address"
                value={form.email}
                onChange={(event) => updateForm('email', event.target.value)}
                aria-invalid={Boolean(errors.email)}
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="lead-service-type">Service Type</label>
              <select
                id="lead-service-type"
                value={form.serviceType}
                onChange={(event) => updateForm('serviceType', event.target.value)}
                aria-invalid={Boolean(errors.serviceType)}
              >
                {serviceTypeOptions.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              {errors.serviceType && <span className="form-error">{errors.serviceType}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="lead-source">Source</label>
              <select
                id="lead-source"
                value={form.source}
                onChange={(event) => updateForm('source', event.target.value)}
                aria-invalid={Boolean(errors.source)}
              >
                {sourceOptions.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              {errors.source && <span className="form-error">{errors.source}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="lead-assign">Assign</label>
              <select
                id="lead-assign"
                value={form.assignedTechnicianId}
                onChange={(event) => updateForm('assignedTechnicianId', event.target.value)}
              >
                <option value="">Assign later</option>
                {technicians.map((tech) => (
                  <option key={tech.id} value={tech.id}>{tech.name} ({tech.departmentSkill || 'General'})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="lead-device">Device</label>
              <select
                id="lead-device"
                value={form.device}
                onChange={(event) => updateForm('device', event.target.value)}
              >
                {deviceOptions.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>

            {selectedServiceType === 'Onsite service' && (
              <div className="form-group">
                <label htmlFor="lead-location">Location Link</label>
                <input
                  id="lead-location"
                  type="url"
                  placeholder="https://maps.google.com/..."
                  value={form.locationLink}
                  onChange={(event) => updateForm('locationLink', event.target.value)}
                />
              </div>
            )}

            {/* <div className="form-group">
              <label htmlFor="lead-quote">Quote</label>
              <input id="lead-quote" type="text" placeholder="Enter quote amount/details" value={form.quote} onChange={(event) => updateForm('quote', event.target.value)} />
            </div> */}

            {/* <div className="form-group">
              <label htmlFor="lead-billing">Billing</label>
              <input id="lead-billing" type="text" placeholder="Enter billing details" value={form.billing} onChange={(event) => updateForm('billing', event.target.value)} />
            </div> */}

            <div className="form-group form-group-full">
              <label htmlFor="lead-review-link">Review Message Link</label>
              <input
                id="lead-review-link"
                type="url"
                placeholder="Google review / message link"
                value={form.reviewMessageLink}
                onChange={(event) => updateForm('reviewMessageLink', event.target.value)}
              />
            </div>

            {selectedServiceType === 'Walk-in' ? (
              <div className="form-group form-group-full">
                <label htmlFor="lead-problem-note">Problem Inward</label>
                <textarea
                  id="lead-problem-note"
                  value={form.problemInwardNote}
                  onChange={(event) => updateForm('problemInwardNote', event.target.value)}
                  rows={3}
                  placeholder="Problem reported during inward"
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '10px' }}>
                  {[
                    { key: 'problemInwardImage1', label: 'Image 1', value: form.problemInwardImage1 },
                    { key: 'problemInwardImage2', label: 'Image 2', value: form.problemInwardImage2 },
                    { key: 'problemInwardImage3', label: 'Image 3', value: form.problemInwardImage3 },
                  ].map(({ key, label, value }) => (
                    <label key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', minHeight: '110px', padding: '14px 10px', border: `2px dashed ${value ? '#6366f1' : '#cbd5e1'}`, borderRadius: '12px', background: value ? '#eef2ff' : '#f8fafc', cursor: 'pointer', transition: 'all 0.18s', textAlign: 'center' }}>
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(event) => handleSingleFile(key, event)} />
                      {value ? (
                        <>
                          <img src={value.dataUrl} alt={label} style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: '8px', border: '2px solid #6366f1' }} />
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#4f46e5', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value.name}</span>
                        </>
                      ) : (
                        <>
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>{label}</span>
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Click to upload</span>
                        </>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="form-group form-group-full">
                  <label htmlFor="lead-device-check">Device Check / Internal Report</label>
                  <textarea
                    id="lead-device-check"
                    value={form.deviceCheckNote}
                    onChange={(event) => updateForm('deviceCheckNote', event.target.value)}
                    rows={3}
                    placeholder="Internal report / problem inward"
                  />
                  <input type="file" accept="image/*" multiple onChange={(event) => handleFiles('deviceCheckImages', event)} />
                  <span className="field-hint">{form.deviceCheckImages.length} device check image(s) selected</span>
                </div>

                <div className="form-group form-group-full">
                  <label htmlFor="lead-onsite-images">Images Upload</label>
                  <input id="lead-onsite-images" type="file" accept="image/*" multiple onChange={(event) => handleFiles('onsiteImages', event)} />
                  <span className="field-hint">At least 3 images required. {form.onsiteImages.length} selected</span>
                  {errors.onsiteImages && <span className="form-error">{errors.onsiteImages}</span>}
                </div>

                <label className="lead-check-row">
                  <input
                    type="checkbox"
                    checked={form.deviceReceiveConfirmed}
                    onChange={(event) => updateForm('deviceReceiveConfirmed', event.target.checked)}
                  />
                  Device receive confirmation needed in Customer Portal
                </label>

                <label className="lead-check-row">
                  <input
                    type="checkbox"
                    checked={form.deviceDeliveryConfirmed}
                    onChange={(event) => updateForm('deviceDeliveryConfirmed', event.target.checked)}
                  />
                  Device delivery confirmation needed in Customer Portal
                </label>
              </>
            )}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Click to Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AssignTechnicianModal = ({ lead, technicians, onClose, onAssign }) => {
  const [selectedTechId, setSelectedTechId] = useState(lead?.assignedTechnicianId || '');
  const currentTechnician = lead?.assignedTechnician || technicians.find((tech) => tech.id === lead?.assignedTechnicianId)?.name || '';

  const handleAssign = () => {
    const tech = technicians.find(t => t.id === selectedTechId);
    if (tech) onAssign(tech);
  };

  return (
    <div className="modal-overlay" role="presentation">
      <div className="modal-panel" role="dialog" aria-modal="true">
        <div className="modal-header">
          <div>
            <h2>{currentTechnician ? 'Edit Assigned Technician' : 'Assign Technician'}</h2>
            <p>Select a technician for this lead</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close assignment modal"><X size={18} /></button>
        </div>

        <div className="modal-body">
          <div style={{
            background: 'var(--surface-muted, #f8fafc)',
            border: '1px solid var(--border-light, #e2e8f0)',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '20px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
          }}>
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted, #64748b)', letterSpacing: '0.05em' }}>Customer</span>
              <p style={{ margin: '2px 0 0', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary, #1e293b)' }}>{lead?.customerName || '—'}</p>
              {lead?.company && <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: 'var(--text-muted, #64748b)' }}>{lead.company}</p>}
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted, #64748b)', letterSpacing: '0.05em' }}>Mobile</span>
              <p style={{ margin: '2px 0 0', fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-primary, #1e293b)' }}>{lead?.mobileNumber || '—'}</p>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted, #64748b)', letterSpacing: '0.05em' }}>Service Type</span>
              <p style={{ margin: '2px 0 0', fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-primary, #1e293b)' }}>{lead?.serviceType || '—'}</p>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted, #64748b)', letterSpacing: '0.05em' }}>Device</span>
              <p style={{ margin: '2px 0 0', fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-primary, #1e293b)' }}>{lead?.device || '—'}</p>
            </div>
            {(lead?.problemInwardNote || lead?.deviceCheckNote) && (
              <div style={{ gridColumn: '1 / -1' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted, #64748b)', letterSpacing: '0.05em' }}>Issue / Problem</span>
                <p style={{ margin: '2px 0 0', fontSize: '0.88rem', color: 'var(--text-primary, #1e293b)', lineHeight: 1.5 }}>
                  {lead?.problemInwardNote || lead?.deviceCheckNote}
                </p>
              </div>
            )}
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted, #64748b)', letterSpacing: '0.05em' }}>Status</span>
              <p style={{ margin: '2px 0 0', fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary, #1e293b)' }}>{lead?.category || '—'}</p>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted, #64748b)', letterSpacing: '0.05em' }}>Created</span>
              <p style={{ margin: '2px 0 0', fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary, #1e293b)' }}>{lead?.createdAt || '—'}</p>
            </div>
          </div>

          {currentTechnician && (
            <div className="assigned-tech-summary" style={{ marginBottom: '16px' }}>
              <span>Currently Assigned</span>
              <strong>{currentTechnician}</strong>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="tech-select">{currentTechnician ? 'Assign New Technician' : 'Available Technicians'}</label>
            <select
              id="tech-select"
              className="form-input"
              value={selectedTechId}
              onChange={(e) => setSelectedTechId(e.target.value)}
            >
              <option value="">Select a technician...</option>
              {technicians.map(tech => (
                <option key={tech.id} value={tech.id}>
                  {tech.name} ({tech.departmentSkill || 'General'})
                </option>
              ))}
            </select>
          </div>

          <div className="modal-actions" style={{ marginTop: '24px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAssign}
              disabled={!selectedTechId}
            >
              {currentTechnician ? 'Update Technician' : 'Assign Technician'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const statusColors = {
  Pending:   { bg: '#fef9c3', color: '#854d0e', dot: '#eab308' },
  Assigned:  { bg: '#ede9fe', color: '#5b21b6', dot: '#7c3aed' },
  Completed: { bg: '#dcfce7', color: '#166534', dot: '#16a34a' },
  Missed:    { bg: '#fee2e2', color: '#991b1b', dot: '#dc2626' },
};

const ViewLeadModal = ({ lead, onClose, onEdit }) => {
  const sc = statusColors[lead.category] || { bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' };

  const infoCell = (label, value, span = false) => (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 3,
      padding: '10px 14px',
      background: 'var(--surface-muted, #f8fafc)',
      border: '1px solid var(--border-light, #e2e8f0)',
      borderRadius: 10,
      gridColumn: span ? '1 / -1' : undefined,
    }}>
      <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted, #64748b)' }}>{label}</span>
      <span style={{ fontSize: '0.88rem', fontWeight: value ? 600 : 400, color: value ? 'var(--text-main, #0f172a)' : '#94a3b8' }}>{value || '-'}</span>
    </div>
  );

  return (
    <div className="modal-overlay" role="presentation">
      <div className="modal-panel lead-form-modal" role="dialog" aria-modal="true" style={{ maxHeight: 'min(88vh, 780px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

        {/* ── Header ── */}
        <div className="modal-header" style={{ padding: '18px 24px 16px', borderBottom: '1px solid var(--border-light, #e2e8f0)', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 800, color: '#fff', flexShrink: 0 }}>
              {(lead.customerName || 'L')[0].toUpperCase()}
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main, #0f172a)', lineHeight: 1.2 }}>{lead.customerName || '-'}</h2>
              <p style={{ margin: '2px 0 0', fontSize: '0.83rem', color: 'var(--text-muted, #64748b)' }}>{lead.company || '—'}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, background: sc.bg, color: sc.color, fontSize: '0.72rem', fontWeight: 700 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: sc.dot }} />
                {lead.category || 'Pending'}
              </span>
              <span style={{ padding: '3px 10px', borderRadius: 20, background: '#ede9fe', color: '#6d28d9', fontSize: '0.72rem', fontWeight: 600 }}>{lead.serviceType || '-'}</span>
              <span style={{ padding: '3px 10px', borderRadius: 20, background: '#e0f2fe', color: '#0369a1', fontSize: '0.72rem', fontWeight: 600 }}>{lead.device || '-'}</span>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close lead details"><X size={18} /></button>
        </div>

        {/* ── Quick actions ── */}
        <div style={{ display: 'flex', gap: 10, padding: '10px 24px', borderBottom: '1px solid var(--border-light, #e2e8f0)', background: 'var(--surface-muted, #f8fafc)', flexShrink: 0 }}>
          <a href={`tel:${lead.mobileNumber}`} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center', textDecoration: 'none' }}>
            <Phone size={14} /> {lead.mobileNumber || 'No phone'}
          </a>
          <button type="button" className="btn btn-primary" onClick={() => openWhatsAppMessage(lead.mobileNumber, `Hi ${lead.customerName || 'Customer'}, thank you for contacting RepairBoy. We will update you about your ${lead.serviceType || 'service'} request shortly.`)} disabled={!lead.mobileNumber} style={{ background: '#16a34a', borderColor: '#16a34a' }}>
            <MessageCircleMore size={14} /> WhatsApp
          </button>
        </div>

        {/* ── Info grid ── */}
        <div style={{ padding: '16px 24px', overflowY: 'auto', flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {infoCell('Customer Name', lead.customerName)}
            {infoCell('Company', lead.company)}
            {infoCell('Mobile Number', lead.mobileNumber)}
            {infoCell('Source', lead.source)}
            {infoCell('Service Type', lead.serviceType)}
            {infoCell('Device', lead.device)}
            {infoCell('Status', lead.category)}
            {infoCell('Assigned To', lead.assignedTechnician || null)}
            {infoCell('Created', lead.createdAt)}
            {infoCell('Quote', lead.quote)}
            {infoCell('Billing', lead.billing)}

            {/* Location link */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, padding: '10px 14px', background: 'var(--surface-muted, #f8fafc)', border: '1px solid var(--border-light, #e2e8f0)', borderRadius: 10 }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted, #64748b)' }}>Location Link</span>
              {lead.locationLink ? <a href={lead.locationLink} target="_blank" rel="noreferrer" style={{ fontSize: '0.88rem', color: '#6366f1', fontWeight: 600 }}>Open Maps →</a> : <span style={{ fontSize: '0.88rem', color: '#94a3b8' }}>-</span>}
            </div>

            {/* Review link */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, padding: '10px 14px', background: 'var(--surface-muted, #f8fafc)', border: '1px solid var(--border-light, #e2e8f0)', borderRadius: 10 }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted, #64748b)' }}>Review Link</span>
              {lead.reviewMessageLink ? <a href={lead.reviewMessageLink} target="_blank" rel="noreferrer" style={{ fontSize: '0.88rem', color: '#6366f1', fontWeight: 600 }}>Open Link →</a> : <span style={{ fontSize: '0.88rem', color: '#94a3b8' }}>-</span>}
            </div>

            {infoCell('Device Receive Confirm', lead.deviceReceiveConfirmed ? 'Yes' : 'No')}
            {infoCell('Device Delivery Confirm', lead.deviceDeliveryConfirmed ? 'Yes' : 'No')}

            {/* Problem Inward Note — full width */}
            <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: 4, padding: '12px 14px', background: lead.problemInwardNote ? '#fffbeb' : 'var(--surface-muted, #f8fafc)', border: `1px solid ${lead.problemInwardNote ? '#fde68a' : 'var(--border-light, #e2e8f0)'}`, borderRadius: 10 }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: lead.problemInwardNote ? '#92400e' : 'var(--text-muted, #64748b)' }}>Problem Inward Note</span>
              <span style={{ fontSize: '0.88rem', color: lead.problemInwardNote ? '#78350f' : '#94a3b8', lineHeight: 1.6 }}>{lead.problemInwardNote || '-'}</span>
            </div>

            {/* Device Check Note — full width */}
            <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: 4, padding: '12px 14px', background: lead.deviceCheckNote ? '#fffbeb' : 'var(--surface-muted, #f8fafc)', border: `1px solid ${lead.deviceCheckNote ? '#fde68a' : 'var(--border-light, #e2e8f0)'}`, borderRadius: 10 }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: lead.deviceCheckNote ? '#92400e' : 'var(--text-muted, #64748b)' }}>Device Check / Internal Report</span>
              <span style={{ fontSize: '0.88rem', color: lead.deviceCheckNote ? '#78350f' : '#94a3b8', lineHeight: 1.6 }}>{lead.deviceCheckNote || '-'}</span>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="modal-actions" style={{ margin: 0, padding: '14px 24px', borderTop: '1px solid var(--border-light, #e2e8f0)', flexShrink: 0 }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
          <button type="button" className="btn btn-primary" onClick={onEdit}>
            <Edit size={15} /> Edit Lead
          </button>
        </div>
      </div>
    </div>
  );
};

const EditLeadModal = ({ lead, technicians, submitting, onClose, onUpdate, serviceTypeOptions, sourceOptions, deviceOptions }) => {
  const [form, setForm] = useState({
    customerName: lead.customerName || '',
    company: lead.company || '',
    mobileNumber: lead.mobileNumber || '',
    email: lead.email || '',
    serviceType: lead.serviceType || 'Walk-in',
    source: lead.source || 'Google',
    assignedTechnicianId: lead.assignedTechnicianId || '',
    device: lead.device || 'Laptop',
    locationLink: lead.locationLink || '',
    problemInwardNote: lead.problemInwardNote || '',
    deviceCheckNote: lead.deviceCheckNote || '',
    quote: lead.quote || '',
    billing: lead.billing || '',
    reviewMessageLink: lead.reviewMessageLink || '',
    deviceReceiveConfirmed: lead.deviceReceiveConfirmed || false,
    deviceDeliveryConfirmed: lead.deviceDeliveryConfirmed || false,
    category: lead.category || 'Pending',
  });
  const [errors, setErrors] = useState({});

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  };

  const selectedServiceType = normalizeServiceType(form.serviceType);
  const selectedTechnician = technicians.find((tech) => tech.id === form.assignedTechnicianId);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    const nextErrors = {};
    if (!form.company.trim()) nextErrors.company = 'Company is required.';
    if (!form.customerName.trim()) nextErrors.customerName = 'Customer name is required.';
    if (!form.mobileNumber.trim()) {
      nextErrors.mobileNumber = 'Mobile number is required.';
    } else if (!/^\d{10}$/.test(form.mobileNumber.trim())) {
      nextErrors.mobileNumber = 'Enter a valid 10 digit mobile number.';
    }
    if (!form.email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    await onUpdate({
      customerName: form.customerName.trim(),
      company: form.company.trim(),
      mobileNumber: form.mobileNumber.trim(),
      email: form.email.trim(),
      serviceType: selectedServiceType,
      source: form.source.trim(),
      device: form.device.trim(),
      locationLink: form.locationLink.trim(),
      problemInwardNote: form.problemInwardNote.trim(),
      deviceCheckNote: form.deviceCheckNote.trim(),
      quote: form.quote.trim(),
      billing: form.billing.trim(),
      reviewMessageLink: form.reviewMessageLink.trim(),
      deviceReceiveConfirmed: form.deviceReceiveConfirmed,
      deviceDeliveryConfirmed: form.deviceDeliveryConfirmed,
      assignedTechnician: selectedTechnician?.name || lead.assignedTechnician || '',
      assignedTechnicianId: selectedTechnician?.id || form.assignedTechnicianId || '',
      category: selectedTechnician ? 'Assigned' : form.category,
    });
  };

  return (
    <div className="modal-overlay" role="presentation">
      <div className="modal-panel lead-form-modal" role="dialog" aria-modal="true" aria-labelledby="edit-lead-title">
        <div className="modal-header">
          <div>
            <h2 id="edit-lead-title">Edit Lead</h2>
            <p>{lead.customerName}</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close edit lead form"><X size={18} /></button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="edit-lead-company">Company</label>
              <input id="edit-lead-company" type="text" placeholder="Enter company" value={form.company} onChange={(e) => updateForm('company', e.target.value)} aria-invalid={Boolean(errors.company)} />
              {errors.company && <span className="form-error">{errors.company}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="edit-lead-customer">Customer Name</label>
              <input id="edit-lead-customer" type="text" placeholder="Enter customer name" value={form.customerName} onChange={(e) => updateForm('customerName', e.target.value)} aria-invalid={Boolean(errors.customerName)} />
              {errors.customerName && <span className="form-error">{errors.customerName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="edit-lead-mobile">Mobile Number</label>
              <input id="edit-lead-mobile" type="tel" inputMode="numeric" placeholder="Enter mobile number" value={form.mobileNumber} onChange={(e) => updateForm('mobileNumber', e.target.value.replace(/\D/g, '').slice(0, 10))} aria-invalid={Boolean(errors.mobileNumber)} />
              {errors.mobileNumber && <span className="form-error">{errors.mobileNumber}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="edit-lead-email">Email <span style={{ color: '#ef4444' }}>*</span></label>
              <input id="edit-lead-email" type="email" placeholder="Enter email address" value={form.email} onChange={(e) => updateForm('email', e.target.value)} aria-invalid={Boolean(errors.email)} />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="edit-lead-service-type">Service Type</label>
              <select id="edit-lead-service-type" value={form.serviceType} onChange={(e) => updateForm('serviceType', e.target.value)}>
                {serviceTypeOptions.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="edit-lead-source">Source</label>
              <select id="edit-lead-source" value={form.source} onChange={(e) => updateForm('source', e.target.value)}>
                {sourceOptions.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="edit-lead-status">Status</label>
              <select id="edit-lead-status" value={form.category} onChange={(e) => updateForm('category', e.target.value)}>
                {['Pending', 'Assigned', 'Completed', 'Missed'].map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="edit-lead-assign">Assigned Technician</label>
              <select id="edit-lead-assign" value={form.assignedTechnicianId} onChange={(e) => updateForm('assignedTechnicianId', e.target.value)}>
                <option value="">Unassigned</option>
                {technicians.map((tech) => (
                  <option key={tech.id} value={tech.id}>{tech.name} ({tech.departmentSkill || 'General'})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="edit-lead-device">Device</label>
              <select id="edit-lead-device" value={form.device} onChange={(e) => updateForm('device', e.target.value)}>
                {deviceOptions.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>

            {selectedServiceType === 'Onsite service' && (
              <div className="form-group">
                <label htmlFor="edit-lead-location">Location Link</label>
                <input id="edit-lead-location" type="url" placeholder="https://maps.google.com/..." value={form.locationLink} onChange={(e) => updateForm('locationLink', e.target.value)} />
              </div>
            )}

            {/* <div className="form-group">
              <label htmlFor="edit-lead-quote">Quote</label>
              <input id="edit-lead-quote" type="text" placeholder="Enter quote amount/details" value={form.quote} onChange={(e) => updateForm('quote', e.target.value)} />
            </div> */}

            {/* <div className="form-group">
              <label htmlFor="edit-lead-billing">Billing</label>
              <input id="edit-lead-billing" type="text" placeholder="Enter billing details" value={form.billing} onChange={(e) => updateForm('billing', e.target.value)} />
            </div> */}

            <div className="form-group form-group-full">
              <label htmlFor="edit-lead-review-link">Review Message Link</label>
              <input id="edit-lead-review-link" type="url" placeholder="Google review / message link" value={form.reviewMessageLink} onChange={(e) => updateForm('reviewMessageLink', e.target.value)} />
            </div>

            {selectedServiceType === 'Walk-in' ? (
              <div className="form-group form-group-full">
                <label htmlFor="edit-lead-problem-note">Problem Inward</label>
                <textarea id="edit-lead-problem-note" value={form.problemInwardNote} onChange={(e) => updateForm('problemInwardNote', e.target.value)} rows={3} placeholder="Problem reported during inward" />
              </div>
            ) : (
              <>
                <div className="form-group form-group-full">
                  <label htmlFor="edit-lead-device-check">Device Check / Internal Report</label>
                  <textarea id="edit-lead-device-check" value={form.deviceCheckNote} onChange={(e) => updateForm('deviceCheckNote', e.target.value)} rows={3} placeholder="Internal report / problem inward" />
                </div>
                <label className="lead-check-row">
                  <input type="checkbox" checked={form.deviceReceiveConfirmed} onChange={(e) => updateForm('deviceReceiveConfirmed', e.target.checked)} />
                  Device receive confirmation needed in Customer Portal
                </label>
                <label className="lead-check-row">
                  <input type="checkbox" checked={form.deviceDeliveryConfirmed} onChange={(e) => updateForm('deviceDeliveryConfirmed', e.target.checked)} />
                  Device delivery confirmation needed in Customer Portal
                </label>
              </>
            )}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


const LeadTrackerModal = ({ lead, onClose, onSetStep, onCancelLead, updating }) => {
  const isCancelled = lead.tracker?.some((s) => s.status === 'cancelled') || lead.category === 'Missed';
  const currentIndex = isCancelled ? -1 : getCurrentStepIndex(lead);
  const nextIndex = Math.min(currentIndex + 1, ALL_LEAD_STEPS.length - 1);
  const progress = isCancelled ? 0 : Math.round(((currentIndex + 1) / ALL_LEAD_STEPS.length) * 100);

  return (
    <div className="modal-overlay" role="presentation">
      <div className="modal-panel" role="dialog" aria-modal="true" style={{ padding: 0, overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '20px 24px 18px', position: 'relative' }}>
          <button className="icon-btn" onClick={onClose} aria-label="Close tracker modal" style={{ position: 'absolute', top: 14, right: 14, color: '#94a3b8', background: 'rgba(255,255,255,0.08)' }}><X size={18} /></button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 800, color: '#fff', flexShrink: 0 }}>
              {(lead.customerName || 'L')[0].toUpperCase()}
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#fff' }}>Service Tracker</h2>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>{lead.customerName} · {lead.serviceType || 'Walk-in'}</p>
            </div>
          </div>
        </div>

        <div style={{ padding: '20px 24px' }}>
          {/* Status overview */}
          <div className="staff-status-overview">
            <div>
              <span>Current Status</span>
              <strong>{isCancelled ? 'Cancelled' : (ALL_LEAD_STEPS[currentIndex] || 'Not started')}</strong>
            </div>
            <div>
              <span>Progress</span>
              <strong>{isCancelled ? '—' : `${progress}%`}</strong>
            </div>
            <div>
              <span>Next Step</span>
              <strong>{isCancelled ? '—' : (currentIndex >= ALL_LEAD_STEPS.length - 1 ? 'Completed' : ALL_LEAD_STEPS[nextIndex])}</strong>
            </div>
          </div>

          {/* Progress bar */}
          <div className="staff-status-progress">
            <div style={{ width: `${progress}%` }} />
          </div>

          {/* All steps — clickable */}
          <div className="staff-status-flow">
            {ALL_LEAD_STEPS.map((step, index) => {
              const state = isCancelled ? 'pending' : index < currentIndex ? 'completed' : index === currentIndex ? 'active' : 'pending';
              return (
                <button
                  type="button"
                  key={step}
                  className={`staff-status-flow-card ${state}`}
                  onClick={() => !isCancelled && updating !== lead.id && onSetStep(lead, index)}
                  disabled={isCancelled || updating === lead.id}
                >
                  <span className="staff-status-flow-index">{index + 1}</span>
                  <strong>{step}</strong>
                </button>
              );
            })}
          </div>

          {/* Actions */}
          {!isCancelled && (
            <div className="staff-status-actions" style={{ display: 'flex', gap: 10, justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                className="btn btn-secondary"
                style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5' }}
                onClick={() => {
                  const trackerIdx = lead.tracker?.findIndex((s) => s.status === 'current') ?? 1;
                  onCancelLead(lead, trackerIdx >= 0 ? trackerIdx : 1);
                }}
                disabled={updating === lead.id}
              >
                ✕ Cancel Lead
              </button>
              <button
                className="btn btn-primary"
                disabled={currentIndex >= ALL_LEAD_STEPS.length - 1 || updating === lead.id}
                onClick={() => onSetStep(lead, nextIndex)}
              >
                {updating === lead.id ? 'Updating...' : 'Mark Done / Next Step'}
                <ChevronRight size={16} style={{ marginLeft: 4 }} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const InstantMessageModal = ({ lead, onClose, onSent }) => {
  const [templateId, setTemplateId] = useState(messageTemplates[0].id);
  const [draft, setDraft] = useState(() => prepareMessage(messageTemplates[0], lead));
  const [sending, setSending] = useState(false);

  const selectedTemplate = messageTemplates.find((template) => template.id === templateId) || messageTemplates[0];

  const handleTemplateChange = (nextTemplateId) => {
    const nextTemplate = messageTemplates.find((template) => template.id === nextTemplateId) || messageTemplates[0];
    setTemplateId(nextTemplate.id);
    setDraft(prepareMessage(nextTemplate, lead));
  };

  const handleSend = async () => {
    if (!lead?.mobileNumber) {
      onSent('Lead does not have a mobile number.');
      onClose();
      return;
    }
    if (!draft.trim()) {
      onSent('Message preview cannot be empty.');
      return;
    }

    setSending(true);
    try {
      await sendOutboundMessage({
        channel: 'WhatsApp',
        recipientType: 'Lead',
        recipient: lead.mobileNumber,
        message: draft.trim(),
        templateName: selectedTemplate.label,
        contextType: 'Lead',
      });
    } catch {
      // best-effort backend log; proceed to open WhatsApp regardless
    } finally {
      setSending(false);
    }
    const phone = normalizePhoneForWhatsApp(lead.mobileNumber);
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(draft.trim())}`, '_blank', 'noopener,noreferrer');
    onSent(`${selectedTemplate.label} opened in WhatsApp.`);
    onClose();
  };

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="lead-message-title" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 id="lead-message-title">Instant Message</h2>
            <p>Send WhatsApp message to <strong>{lead.customerName}</strong>.</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close instant message">
            <X size={18} />
          </button>
        </div>

        <div className="modal-form" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(260px, 0.8fr)', gap: '18px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label htmlFor="lead-message-template">Message Type</label>
              <select id="lead-message-template" value={templateId} onChange={(event) => handleTemplateChange(event.target.value)}>
                {messageTemplates.map((template) => (
                  <option key={template.id} value={template.id}>{template.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="lead-message-preview">Edit Message</label>
              <textarea
                id="lead-message-preview"
                className="form-textarea"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                rows={10}
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ border: '1px solid var(--border-light)', borderRadius: '18px', padding: '14px', background: 'var(--surface-muted)' }}>
              <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '10px' }}>Recipient</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <strong>{lead.customerName}</strong>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.86rem' }}>{lead.mobileNumber || 'No mobile number'}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.86rem' }}>{lead.company || 'Individual'}</span>
              </div>
            </div>

            <div style={{ border: '1px solid var(--border-light)', borderRadius: '18px', padding: '14px', background: '#efeae2' }}>
              <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '12px' }}>WhatsApp Preview</span>
              <div style={{ marginLeft: 'auto', width: 'fit-content', maxWidth: '100%', borderRadius: '14px', borderTopRightRadius: 0, background: '#dcf8c6', padding: '10px 12px', boxShadow: '0 1px 2px rgba(15, 23, 42, 0.12)' }}>
                <p style={{ margin: 0, whiteSpace: 'pre-wrap', color: '#0f172a', fontSize: '0.86rem', lineHeight: 1.45 }}>{draft}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-actions" style={{ padding: '0 22px 22px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={handleSend} disabled={sending || !lead.mobileNumber}>
            <Send size={16} />
            {sending ? 'Opening...' : 'Send WhatsApp'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Leads = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { settings } = useLeadSettings();
  const serviceTypeOptions = settings.serviceTypes;
  const sourceOptions = settings.sources;
  const deviceOptions = settings.devices;
  const [leads, setLeads] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [assigningLead, setAssigningLead] = useState(null);
  const [trackingLead, setTrackingLead] = useState(null);
  const [updatingTracker, setUpdatingTracker] = useState(null);
  const [messagingLead, setMessagingLead] = useState(null);
  const [viewingLead, setViewingLead] = useState(null);
  const [editingLead, setEditingLead] = useState(null);
  const [activeLeadMenu, setActiveLeadMenu] = useState(null);
  const [credentialsTarget, setCredentialsTarget] = useState(null);
  const [notice, setNotice] = useState('');
  const [creatingLead, setCreatingLead] = useState(false);
  const [savingLead, setSavingLead] = useState(false);

  useEffect(() => {
    if (location.state?.notice) {
      setNotice(location.state.notice);
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  const loadLeads = () => {
    leadManagementService.listLeads()
      .then(setLeads)
      .catch((error) => {
        console.error('Leads failed to load.', error);
        setNotice(error.response?.data?.message || error.message || 'Leads failed to load. Please check that the backend is running.');
      });
  };

  const loadTechnicians = () => {
    staffManagementService.getStaffList()
      .then((data) => setTechnicians(data.filter((staff) => staff.status !== 'Inactive')))
      .catch((error) => {
        console.error('Failed to load technicians.', error);
        setNotice(error.response?.data?.message || error.message || 'Technicians failed to load. Please check that the backend is running.');
      });
  };

  useEffect(() => {
    loadLeads();
    loadTechnicians();
  }, []);

  useEffect(() => {
    const closeMenu = (event) => {
      if (event.target.closest('.member-action-menu') || event.target.closest('.action-trigger-btn')) return;
      setActiveLeadMenu(null);
    };
    const closeOnViewportChange = () => setActiveLeadMenu(null);

    document.addEventListener('mousedown', closeMenu);
    window.addEventListener('scroll', closeOnViewportChange, true);
    window.addEventListener('resize', closeOnViewportChange);
    return () => {
      document.removeEventListener('mousedown', closeMenu);
      window.removeEventListener('scroll', closeOnViewportChange, true);
      window.removeEventListener('resize', closeOnViewportChange);
    };
  }, []);

  const statusParam = searchParams.get('status');
  const searchTerm = searchParams.get('q') || '';
  const activeCategory = categories.includes(statusParam) ? statusParam : 'All';
  const isLeadModalOpen = isManualModalOpen || searchParams.get('add') === '1';

  const filteredLeads = leads.filter((lead) => {
    const query = searchTerm.toLowerCase();
    const matchesSearch = (lead.customerName || '').toLowerCase().includes(query)
      || (lead.company || '').toLowerCase().includes(query)
      || (lead.mobileNumber || '').includes(searchTerm);
    const matchesCategory = activeCategory === 'All' || lead.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const closeLeadModal = () => {
    setIsManualModalOpen(false);
    if (searchParams.get('add')) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('add');
      setSearchParams(nextParams);
    }
  };

  const handleCategoryChange = (category) => {
    const nextParams = new URLSearchParams(searchParams);
    if (category === 'All') {
      nextParams.delete('status');
    } else {
      nextParams.set('status', category);
    }
    setSearchParams(nextParams);
  };

  const handleSearchTermChange = (value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (!value) {
      nextParams.delete('q');
    } else {
      nextParams.set('q', value);
    }
    setSearchParams(nextParams);
  };

  const handleCreateLead = async (lead) => {
    if (creatingLead) return;
    setCreatingLead(true);
    try {
      const created = await leadManagementService.createLead(lead);
      setLeads((current) => [created, ...current]);
      setNotice(`Lead created for ${created.customerName}.`);
      closeLeadModal();
    } catch (error) {
      setNotice(error.response?.data?.message || error.message || 'Lead creation failed.');
    } finally {
      setCreatingLead(false);
    }
  };

  const handleUpdateLead = async (updates) => {
    if (savingLead || !editingLead) return;
    setSavingLead(true);
    try {
      await leadManagementService.updateLead(editingLead.id, updates);
      setNotice(`Lead updated for ${updates.customerName}.`);
      setEditingLead(null);
      loadLeads();
    } catch (error) {
      setNotice(error.response?.data?.message || error.message || 'Lead update failed.');
    } finally {
      setSavingLead(false);
    }
  };

  const handleAssignTechnician = async (tech) => {
    const leadId = assigningLead.id;
    try {
      await leadManagementService.updateLead(leadId, {
        assignedTechnician: tech.name,
        assignedTechnicianId: tech.id,
        category: 'Assigned',
        tracker: completeAssignStep(assigningLead),
      });
      setNotice(`Lead assigned to ${tech.name}.`);
      setAssigningLead(null);
      loadLeads();
    } catch (error) {
      setNotice(error.response?.data?.message || error.message || 'Assignment failed.');
    }
  };

  const handleCancelLead = async (lead, stepIndex) => {
    try {
      const nextTracker = (lead.tracker || []).map((item, i) =>
        i === stepIndex ? { ...item, status: 'cancelled', date: new Date().toISOString() } : item
      );
      await leadManagementService.updateLead(lead.id, { tracker: nextTracker, category: 'Missed' });
      setNotice(`Lead for ${lead.customerName} cancelled at "${lead.tracker[stepIndex]?.step}".`);
      setTrackingLead(null);
      loadLeads();
    } catch (error) {
      setNotice(error.response?.data?.message || error.message || 'Failed to cancel lead.');
    }
  };


  const handleSetLeadStep = async (lead, stepIndex) => {
    setUpdatingTracker(lead.id);
    try {
      const completedTracker = ADMIN_TRACKER_STEPS.map((step) => ({
        step,
        status: 'completed',
        date: new Date().toISOString(),
      }));

      const updates = { tracker: completedTracker };

      if (stepIndex < ADMIN_TRACKER_STEPS.length) {
        // Admin-only steps: only update tracker, clear staff category
        updates.tracker = ADMIN_TRACKER_STEPS.map((step, i) => ({
          step,
          status: i <= stepIndex ? 'completed' : 'current',
          date: i <= stepIndex ? new Date().toISOString() : null,
        }));
        updates.category = 'Pending';
      } else {
        // Staff steps: mark all admin steps done + set staff category
        updates.category = ALL_LEAD_STEPS[stepIndex];
      }

      await leadManagementService.updateLead(lead.id, updates);
      setNotice(`Status updated to "${ALL_LEAD_STEPS[stepIndex]}".`);
      const updatedLead = { ...lead, ...updates };
      setTrackingLead(updatedLead);
      loadLeads();
    } catch (error) {
      setNotice(error.response?.data?.message || error.message || 'Failed to update status.');
    } finally {
      setUpdatingTracker(null);
    }
  };

  const handleOpenActionMenu = (event, lead) => {
    event.stopPropagation();
    if (activeLeadMenu?.id === lead.id) {
      setActiveLeadMenu(null);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const menuWidth = 220;
    const menuHeight = lead.assignedTechnician ? 294 : 248;
    const gap = 8;
    const viewportPadding = 16;
    const spaceBelow = window.innerHeight - rect.bottom - viewportPadding;
    const shouldOpenUp = spaceBelow < menuHeight && rect.top > menuHeight;
    const left = Math.max(
      viewportPadding,
      Math.min(window.innerWidth - menuWidth - viewportPadding, rect.right - menuWidth)
    );
    const top = shouldOpenUp
      ? Math.max(viewportPadding, rect.top - menuHeight - gap)
      : Math.min(window.innerHeight - menuHeight - viewportPadding, rect.bottom + gap);

    setActiveLeadMenu({ id: lead.id, top, left, width: menuWidth });
  };

  const getStatusMeta = (status) => {
    switch (status) {
      case 'Pending':               return { bg: '#fef3c7', color: '#b45309', dot: '#f59e0b' };
      case 'Assigned':              return { bg: '#dbeafe', color: '#1d4ed8', dot: '#3b82f6' };
      case 'Missed':                return { bg: '#fee2e2', color: '#b91c1c', dot: '#ef4444' };
      case 'Completed':
      case 'Delivered & Closed':    return { bg: '#dcfce7', color: '#15803d', dot: '#16a34a' };
      case 'Technician Assigned':   return { bg: '#ede9fe', color: '#6d28d9', dot: '#7c3aed' };
      case 'Quotation Preparation': return { bg: '#fae8ff', color: '#a21caf', dot: '#c026d3' };
      case 'Quotation Approved':    return { bg: '#ccfbf1', color: '#0f766e', dot: '#14b8a6' };
      case 'Repair / Service Started': return { bg: '#ffedd5', color: '#c2410c', dot: '#f97316' };
      case 'Ready for Collection':  return { bg: '#cffafe', color: '#0e7490', dot: '#06b6d4' };
      default:                      return { bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' };
    }
  };

  const activeMenuLead = activeLeadMenu
    ? filteredLeads.find((lead) => lead.id === activeLeadMenu.id) || leads.find((lead) => lead.id === activeLeadMenu.id)
    : null;

  return (
    <div className="leads-page">
      {notice && (
        <div className="success-banner" role="status">
          <span>{notice}</span>
          <button className="icon-btn" onClick={() => setNotice('')} aria-label="Dismiss lead message">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="table-controls card">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search leads..."
            aria-label="Search leads"
            value={searchTerm}
            onChange={(event) => handleSearchTermChange(event.target.value)}
          />
        </div>

        <div className="filter-group" aria-label="Lead status filters">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => handleCategoryChange(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <button className="btn btn-primary" type="button" onClick={() => navigate('/admin/leads/create')}>
          <Plus size={16} />
          Add Lead
        </button>
      </div>

      <div className="leads-table-container card">
        <table className="leads-table">
          <thead>
            <tr>
              <th>Contact / Company</th>
              <th>Source</th>
              <th>Service</th>
              <th>Mobile</th>
              <th>Status</th>
              <th>Assigned To</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map((lead) => (
              <tr key={lead.id}>
                <td>
                  <div className="customer-info">
                    <span className="customer-name">{lead.customerName}</span>
                    <span className="company-name">{lead.company}</span>
                  </div>
                </td>
                <td>
                  <span className={`source-tag ${(lead.source || 'Other').toLowerCase().replace(' ', '-')}`}>
                    {lead.source}
                  </span>
                </td>
                <td>
                  <div className="customer-info">
                    <span className="customer-name">{lead.serviceType || 'Walk-in'}</span>
                    <span className="company-name">{lead.device || 'Device pending'}</span>
                    {lead.locationLink && (
                      <a className="lead-map-link" href={lead.locationLink} target="_blank" rel="noreferrer">Open Maps</a>
                    )}
                  </div>
                </td>
                <td>{lead.mobileNumber}</td>
                <td>
                  {(() => { const m = getStatusMeta(lead.category); return (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999, background: m.bg, color: m.color, fontSize: '0.75rem', fontWeight: 800, whiteSpace: 'nowrap' }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: m.dot, flexShrink: 0 }} />
                    {lead.category}
                  </span>); })()}
                </td>
                <td>
                  {lead.assignedTechnician ? (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                        {(lead.assignedTechnician || 'U')[0]}
                      </div>
                      <span className="text-xs font-bold text-slate-700">{lead.assignedTechnician}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">-</span>
                  )}
                </td>
                <td>{lead.createdAt}</td>
                <td>
                  <div className="action-btns" style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ position: 'relative' }}>
                      <button 
                        className="icon-btn action-trigger-btn" 
                        aria-label={`More actions for ${lead.customerName}`}
                        onClick={(event) => handleOpenActionMenu(event, lead)}
                      >
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
            {filteredLeads.length === 0 && (
              <tr>
                <td colSpan="8">
                  <div className="empty-state">
                    <h3>No leads found</h3>
                    <p>Adjust your search or create a new lead to continue.</p>
                    <button className="btn btn-primary" onClick={() => navigate('/admin/leads/create')}>Create Lead</button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {activeLeadMenu && activeMenuLead && (
        <div
          className="account-dropdown member-action-menu"
          style={{
            position: 'fixed',
            top: `${activeLeadMenu.top}px`,
            left: `${activeLeadMenu.left}px`,
            right: 'auto',
            width: `${activeLeadMenu.width}px`,
            zIndex: 500,
          }}
          onClick={(event) => event.stopPropagation()}
        >
          <button type="button" className="account-menu-item" onClick={() => { setActiveLeadMenu(null); setViewingLead(activeMenuLead); }}>
            <Eye size={14} className="icon-muted" /> View Details
          </button>
          <button type="button" className="account-menu-item" onClick={() => { setActiveLeadMenu(null); setEditingLead(activeMenuLead); }}>
            <Edit size={14} className="icon-muted" /> Edit Lead
          </button>
          <button type="button" className="account-menu-item" onClick={() => { setActiveLeadMenu(null); setAssigningLead(activeMenuLead); }}>
            <UserPlus size={14} className="icon-muted" /> Assign Technician
          </button>
          <button type="button" className="account-menu-item" onClick={() => { setActiveLeadMenu(null); setMessagingLead(activeMenuLead); }}>
            <MessageCircleMore size={14} className="icon-muted" /> Instant Message
          </button>
          <button type="button" className="account-menu-item" onClick={() => { setActiveLeadMenu(null); navigate(`/admin/leads/quotation/${activeMenuLead.id}`, { state: { lead: activeMenuLead } }); }}>
            <FileText size={14} className="icon-muted" /> Create Quotation
          </button>
          <button type="button" className="account-menu-item" onClick={() => { setActiveLeadMenu(null); navigate(`/admin/leads/repair/${activeMenuLead.id}`); }}>
            <Wrench size={14} className="icon-muted" /> Manage Repair
          </button>
          <button type="button" className="account-menu-item" onClick={() => { setCredentialsTarget(activeMenuLead); setActiveLeadMenu(null); }}>
            <Wrench size={14} className="icon-muted" /> Send Portal Access
          </button>
          {activeMenuLead.assignedTechnician && (
            <button type="button" className="account-menu-item" onClick={() => { setActiveLeadMenu(null); setTrackingLead(activeMenuLead); }}>
              <Zap size={14} className="icon-muted" /> Track Progress
            </button>
          )}
        </div>
      )}

      {assigningLead && (
        <AssignTechnicianModal 
          lead={assigningLead}
          technicians={technicians} 
          onClose={() => setAssigningLead(null)} 
          onAssign={handleAssignTechnician} 
        />
      )}

      {trackingLead && (
        <LeadTrackerModal
          lead={trackingLead}
          onClose={() => setTrackingLead(null)}
          onSetStep={handleSetLeadStep}
          onCancelLead={handleCancelLead}
          updating={updatingTracker}
        />
      )}

      {messagingLead && (
        <InstantMessageModal
          lead={messagingLead}
          onClose={() => setMessagingLead(null)}
          onSent={setNotice}
        />
      )}

      {viewingLead && (
        <ViewLeadModal
          lead={viewingLead}
          onClose={() => setViewingLead(null)}
          onEdit={() => { setViewingLead(null); setEditingLead(viewingLead); }}
        />
      )}

      {editingLead && (
        <EditLeadModal
          lead={editingLead}
          technicians={technicians}
          submitting={savingLead}
          onClose={() => setEditingLead(null)}
          onUpdate={handleUpdateLead}
          serviceTypeOptions={serviceTypeOptions}
          sourceOptions={sourceOptions}
          deviceOptions={deviceOptions}
        />
      )}

      {credentialsTarget && (
        <SendCredentialsModal
          contractId={credentialsTarget.id}
          customerName={credentialsTarget.customerName || credentialsTarget.name || ''}
          email={credentialsTarget.email || credentialsTarget.customerEmail || ''}
          emailLocked
          onClose={() => setCredentialsTarget(null)}
        />
      )}

    </div>
  );
};

export default Leads;
