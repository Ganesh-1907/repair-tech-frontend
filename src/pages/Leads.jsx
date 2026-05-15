import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Edit,
  Eye,
  Search,
  MoreVertical,
  Mail,
  Phone,
  Plus,
  UserPlus,
  Zap,
  X,
  MessageCircleMore,
  Send,
  Smartphone,
  Wrench
} from 'lucide-react';
import { leadManagementService } from '../services/leadManagementService';
import { staffManagementService } from '../services/staffManagementService';
import { sendOutboundMessage } from '../services/communicationService';
import SendCredentialsModal from '../components/common/SendCredentialsModal';

const initialLeadForm = {
  customerName: '',
  company: '',
  mobileNumber: '',
  serviceType: 'Walk-in',
  source: 'Google',
  assignedTechnicianId: '',
  device: 'Laptop',
  locationLink: '',
  problemInwardNote: '',
  deviceCheckNote: '',
  quote: '',
  billing: '',
  reviewMessageLink: '',
  deviceReceiveConfirmed: false,
  deviceDeliveryConfirmed: false,
  problemInwardImages: [],
  deviceCheckImages: [],
  onsiteImages: [],
  category: 'Pending',
};

const categories = ['All', 'Pending', 'Completed', 'Assigned', 'Missed'];
const serviceTypeOptions = ['Walk-in', 'Onsite service'];
const sourceOptions = ['Google', 'FB', 'Insta', 'Walkin'];
const deviceOptions = ['Laptop', 'Desktop', 'CCTV'];

const walkInTrackerSteps = [
  'Lead Captured',
  'Assign',
  'Device Check',
  'Problem Inward',
  'Quote',
  'Billing',
  'Review Message Link',
];

const onsiteTrackerSteps = [
  'Lead Captured',
  'Location Visit',
  'Assign',
  'Device Check / Internal Report',
  'Device Receive Customer Confirmation',
  'Quote',
  'Device Delivery Customer Confirmation',
  'Billing',
  'Images Upload',
  'Review Message Link',
];

const normalizeServiceType = (value = '') => String(value).toLowerCase().includes('onsite') ? 'Onsite service' : 'Walk-in';

const buildLeadTracker = (serviceType, assigned = false) => {
  const steps = normalizeServiceType(serviceType) === 'Onsite service' ? onsiteTrackerSteps : walkInTrackerSteps;
  return steps.map((step, index) => ({
    step,
    status: index === 0 || (assigned && step === 'Assign') ? 'completed' : index === (assigned ? 2 : 1) ? 'current' : 'pending',
    date: index === 0 || (assigned && step === 'Assign') ? new Date().toISOString() : null,
  }));
};

const completeAssignStep = (lead) => {
  const tracker = lead.tracker?.length ? [...lead.tracker] : buildLeadTracker(lead.serviceType);
  const assignIndex = tracker.findIndex((item) => item.step === 'Assign');
  const nextTracker = tracker.map((item, index) => {
    if (index === 0 || index === assignIndex) {
      return { ...item, status: 'completed', date: item.date || new Date().toISOString() };
    }
    return { ...item, status: item.status === 'current' ? 'pending' : item.status };
  });
  const nextIndex = nextTracker.findIndex((item, index) => index > assignIndex && item.status !== 'completed');
  if (nextIndex >= 0) nextTracker[nextIndex] = { ...nextTracker[nextIndex], status: 'current' };
  return nextTracker;
};

const normalizePhoneForWhatsApp = (mobileNumber = '') => {
  const digits = String(mobileNumber).replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  return digits;
};

const openWhatsAppForLead = (lead) => {
  const phone = normalizePhoneForWhatsApp(lead.mobileNumber);
  if (!phone) return;
  const message = encodeURIComponent(`Hi ${lead.customerName || 'Customer'}, thank you for contacting RepairBoy. We will update you about your ${lead.serviceType || 'service'} request shortly.`);
  window.open(`https://wa.me/${phone}?text=${message}`, '_blank', 'noopener,noreferrer');
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

const LeadFormModal = ({ technicians, submitting, onClose, onCreate }) => {
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
      problemInwardImages: form.problemInwardImages,
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

            <div className="form-group">
              <label htmlFor="lead-quote">Quote</label>
              <input id="lead-quote" type="text" placeholder="Enter quote amount/details" value={form.quote} onChange={(event) => updateForm('quote', event.target.value)} />
            </div>

            <div className="form-group">
              <label htmlFor="lead-billing">Billing</label>
              <input id="lead-billing" type="text" placeholder="Enter billing details" value={form.billing} onChange={(event) => updateForm('billing', event.target.value)} />
            </div>

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
                <input type="file" accept="image/*" multiple onChange={(event) => handleFiles('problemInwardImages', event)} />
                <span className="field-hint">{form.problemInwardImages.length} image(s) selected</span>
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
      <div className="modal-panel" role="dialog" aria-modal="true" style={{ maxWidth: '620px', width: '100%' }}>
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

const ViewLeadModal = ({ lead, onClose, onEdit }) => {
  const infoRow = (label, value) => value ? (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted, #64748b)', letterSpacing: '0.05em' }}>{label}</span>
      <span style={{ fontSize: '0.92rem', color: 'var(--text-primary, #1e293b)', fontWeight: 500 }}>{value}</span>
    </div>
  ) : null;

  return (
    <div className="modal-overlay" role="presentation">
      <div className="modal-panel" role="dialog" aria-modal="true" style={{ maxWidth: '660px', width: '100%' }}>
        <div className="modal-header">
          <div>
            <h2>Lead Details</h2>
            <p>{lead.customerName} — {lead.company || 'Individual'}</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close lead details"><X size={18} /></button>
        </div>

        <div style={{ padding: '0 24px 8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
          {infoRow('Customer Name', lead.customerName)}
          {infoRow('Company', lead.company)}
          {infoRow('Mobile Number', lead.mobileNumber)}
          {infoRow('Source', lead.source)}
          {infoRow('Service Type', lead.serviceType)}
          {infoRow('Device', lead.device)}
          {infoRow('Status', lead.category)}
          {infoRow('Assigned To', lead.assignedTechnician || 'Unassigned')}
          {infoRow('Quote', lead.quote)}
          {infoRow('Billing', lead.billing)}
          {infoRow('Created', lead.createdAt)}
          {lead.locationLink && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted, #64748b)', letterSpacing: '0.05em' }}>Location</span>
              <a href={lead.locationLink} target="_blank" rel="noreferrer" className="lead-map-link">Open Maps</a>
            </div>
          )}
        </div>

        {(lead.problemInwardNote || lead.deviceCheckNote) && (
          <div style={{ margin: '8px 24px 0', padding: '14px 16px', background: 'var(--surface-muted, #f8fafc)', borderRadius: '10px', border: '1px solid var(--border-light, #e2e8f0)' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted, #64748b)', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
              {lead.serviceType === 'Onsite service' ? 'Device Check / Internal Report' : 'Problem Inward'}
            </span>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary, #1e293b)', lineHeight: 1.6 }}>
              {lead.problemInwardNote || lead.deviceCheckNote}
            </p>
          </div>
        )}

        {lead.reviewMessageLink && (
          <div style={{ margin: '8px 24px 0' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted, #64748b)', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>Review Link</span>
            <a href={lead.reviewMessageLink} target="_blank" rel="noreferrer" style={{ fontSize: '0.88rem', color: 'var(--primary, #6366f1)' }}>Open Review Link</a>
          </div>
        )}

        <div className="modal-actions" style={{ marginTop: '20px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
          <button type="button" className="btn btn-primary" onClick={onEdit}>
            <Edit size={15} /> Edit Lead
          </button>
        </div>
      </div>
    </div>
  );
};

const EditLeadModal = ({ lead, technicians, submitting, onClose, onUpdate }) => {
  const [form, setForm] = useState({
    customerName: lead.customerName || '',
    company: lead.company || '',
    mobileNumber: lead.mobileNumber || '',
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

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    await onUpdate({
      customerName: form.customerName.trim(),
      company: form.company.trim(),
      mobileNumber: form.mobileNumber.trim(),
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

            <div className="form-group">
              <label htmlFor="edit-lead-quote">Quote</label>
              <input id="edit-lead-quote" type="text" placeholder="Enter quote amount/details" value={form.quote} onChange={(e) => updateForm('quote', e.target.value)} />
            </div>

            <div className="form-group">
              <label htmlFor="edit-lead-billing">Billing</label>
              <input id="edit-lead-billing" type="text" placeholder="Enter billing details" value={form.billing} onChange={(e) => updateForm('billing', e.target.value)} />
            </div>

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

const LeadTrackerModal = ({ lead, onClose, onUpdateStep }) => {
  const tracker = lead.tracker?.length ? lead.tracker : buildLeadTracker(lead.serviceType);

  return (
    <div className="modal-overlay" role="presentation">
      <div className="modal-panel" role="dialog" aria-modal="true" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <div>
            <h2>Service Tracker</h2>
            <p>Tracking progress for <strong>{lead.customerName}</strong></p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close tracker modal"><X size={18} /></button>
        </div>

        <div className="tracker-timeline" style={{ padding: '20px 0', maxHeight: '400px', overflowY: 'auto' }}>
          {tracker.map((item, index, array) => (
            <div key={item.step} className={`tracker-step ${item.status}`} style={{ 
              display: 'flex', 
              gap: '16px', 
              marginBottom: '20px',
              position: 'relative'
            }}>
              <div className="step-indicator" style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: item.status === 'completed' ? '#10b981' : item.status === 'current' ? '#6366f1' : '#e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '12px',
                fontWeight: 'bold',
                zIndex: 2
              }}>
                {item.status === 'completed' ? '✓' : index + 1}
              </div>
              {index < (array.length - 1) && (
                <div className="step-line" style={{
                  position: 'absolute',
                  left: '11px',
                  top: '24px',
                  width: '2px',
                  height: '20px',
                  backgroundColor: '#e2e8f0',
                  zIndex: 1
                }}></div>
              )}
              <div className="step-content" style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ 
                    fontSize: '14px', 
                    fontWeight: 'bold', 
                    color: item.status === 'pending' ? '#94a3b8' : '#1e293b' 
                  }}>{item.step}</span>
                  {item.status !== 'completed' && (
                    <button 
                      className="btn-mini-glass" 
                      onClick={() => onUpdateStep(lead, index)}
                      style={{ fontSize: '10px', padding: '4px 8px' }}
                    >
                      Mark Done
                    </button>
                  )}
                </div>
                {item.date && (
                  <p style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                    Completed on {new Date(item.date).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

const InstantMessageModal = ({ lead, onClose, onSent }) => {
  const [templateId, setTemplateId] = useState(messageTemplates[0].id);
  const [channel, setChannel] = useState('WhatsApp');
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
      return;
    }
    if (!draft.trim()) {
      onSent('Message preview cannot be empty.');
      return;
    }

    setSending(true);
    try {
      const result = await sendOutboundMessage({
        channel,
        recipientType: 'Lead',
        recipient: lead.mobileNumber,
        message: draft.trim(),
        templateName: selectedTemplate.label,
        contextType: 'Lead',
      });
      onSent(`${selectedTemplate.label} ${result.status || 'queued'} via ${channel}.`);
      onClose();
    } catch (error) {
      onSent(error.message || `Failed to send ${channel} message.`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="lead-message-title" style={{ width: 'min(100%, 720px)' }} onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 id="lead-message-title">Instant Message</h2>
            <p>Send WhatsApp or SMS to <strong>{lead.customerName}</strong>.</p>
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
              <label>Channel</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {['WhatsApp', 'SMS'].map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`btn ${channel === item ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setChannel(item)}
                    style={{ justifyContent: 'center' }}
                  >
                    {item === 'WhatsApp' ? <MessageCircleMore size={16} /> : <Smartphone size={16} />}
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="lead-message-preview">Message Preview</label>
              <textarea
                id="lead-message-preview"
                className="form-textarea"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                rows={8}
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

            <div style={{ border: '1px solid var(--border-light)', borderRadius: '18px', padding: '14px', background: channel === 'WhatsApp' ? '#efeae2' : 'var(--bg-card)' }}>
              <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '12px' }}>{channel} Preview</span>
              <div style={{ marginLeft: 'auto', width: 'fit-content', maxWidth: '100%', borderRadius: '14px', borderTopRightRadius: 0, background: channel === 'WhatsApp' ? '#dcf8c6' : '#e0f2fe', padding: '10px 12px', boxShadow: '0 1px 2px rgba(15, 23, 42, 0.12)' }}>
                <p style={{ margin: 0, whiteSpace: 'pre-wrap', color: '#0f172a', fontSize: '0.86rem', lineHeight: 1.45 }}>{draft}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-actions" style={{ padding: '0 22px 22px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={handleSend} disabled={sending || !lead.mobileNumber}>
            <Send size={16} />
            {sending ? 'Sending...' : `Send ${channel}`}
          </button>
        </div>
      </div>
    </div>
  );
};

const Leads = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [leads, setLeads] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [assigningLead, setAssigningLead] = useState(null);
  const [trackingLead, setTrackingLead] = useState(null);
  const [messagingLead, setMessagingLead] = useState(null);
  const [viewingLead, setViewingLead] = useState(null);
  const [editingLead, setEditingLead] = useState(null);
  const [activeLeadMenu, setActiveLeadMenu] = useState(null);
  const [credentialsTarget, setCredentialsTarget] = useState(null);
  const [notice, setNotice] = useState('');
  const [creatingLead, setCreatingLead] = useState(false);
  const [savingLead, setSavingLead] = useState(false);

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

  const handleUpdateTrackerStep = async (lead, stepIndex) => {
    try {
      const nextTracker = [...(lead.tracker || [])];
      nextTracker[stepIndex] = {
        ...nextTracker[stepIndex],
        status: 'completed',
        date: new Date().toISOString(),
      };

      if (stepIndex + 1 < nextTracker.length && nextTracker[stepIndex + 1].status === 'pending') {
        nextTracker[stepIndex + 1] = {
          ...nextTracker[stepIndex + 1],
          status: 'current',
        };
      }

      await leadManagementService.updateLead(lead.id, { tracker: nextTracker });
      setNotice(`Step "${nextTracker[stepIndex].step}" completed.`);
      loadLeads();
      setTrackingLead({ ...lead, tracker: nextTracker });
    } catch (error) {
      setNotice(error.response?.data?.message || error.message || 'Failed to update tracker.');
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'status-completed';
      case 'Pending': return 'status-pending';
      case 'Assigned': return 'status-assigned';
      case 'Missed': return 'status-missed';
      default: return '';
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

        <button className="btn btn-primary" type="button" onClick={() => setIsManualModalOpen(true)}>
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
                  <span className={`status-pill ${getStatusColor(lead.category)}`}>
                    {lead.category}
                  </span>
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
                    <button className="icon-btn" title="Call" aria-label={`Call ${lead.customerName}`}><Phone size={16} /></button>
                    <button className="icon-btn" title="Email" aria-label={`Email ${lead.customerName}`}><Mail size={16} /></button>
                    <button
                      className="icon-btn whatsapp-btn"
                      title="Send WhatsApp"
                      aria-label={`Send WhatsApp to ${lead.customerName}`}
                      onClick={() => openWhatsAppForLead(lead)}
                      disabled={!lead.mobileNumber}
                    >
                      <MessageCircleMore size={16} />
                    </button>
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
                    <button className="btn btn-primary" onClick={() => setIsManualModalOpen(true)}>Create Lead</button>
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
          <button type="button" className="account-menu-item" onClick={() => { setActiveLeadMenu(null); navigate(`/admin/leads/repair/${activeMenuLead.id}`); }}>
            <Wrench size={14} className="icon-muted" /> Manage Repair
          </button>
          <button type="button" className="account-menu-item" style={{ color: '#4f46e5' }} onClick={() => { setCredentialsTarget(activeMenuLead); setActiveLeadMenu(null); }}>
            <Wrench size={14} className="icon-muted" /> Send Portal Access
          </button>
          {activeMenuLead.assignedTechnician && (
            <button type="button" className="account-menu-item" onClick={() => { setActiveLeadMenu(null); setTrackingLead(activeMenuLead); }}>
              <Zap size={14} className="icon-muted" /> Track Progress
            </button>
          )}
        </div>
      )}

      {isLeadModalOpen && (
        <LeadFormModal
          technicians={technicians}
          submitting={creatingLead}
          onClose={closeLeadModal}
          onCreate={handleCreateLead}
        />
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
          onUpdateStep={handleUpdateTrackerStep} 
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
        />
      )}

      {credentialsTarget && (
        <SendCredentialsModal
          contractId={credentialsTarget.id}
          customerName={credentialsTarget.customerName || credentialsTarget.name || ''}
          email={credentialsTarget.email || credentialsTarget.customerEmail || ''}
          onClose={() => setCredentialsTarget(null)}
        />
      )}
    </div>
  );
};

export default Leads;
