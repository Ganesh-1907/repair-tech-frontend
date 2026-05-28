import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { leadManagementService } from '../../services/leadManagementService';
import { staffManagementService } from '../../services/staffManagementService';
import { useLeadSettings } from '../../hooks/useLeadSettings';

const initialForm = {
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
};

const normalizeServiceType = (value = '') =>
  String(value).toLowerCase().includes('onsite') ? 'Onsite service' : 'Walk-in';

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ name: file.name, dataUrl: reader.result });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const buildLeadTracker = (serviceType, assigned = false) => {
  const steps = ['Lead Captured', 'Assign to Technician'];
  return steps.map((step, index) => ({
    step,
    status: index === 0 || assigned ? 'completed' : 'current',
    date: index === 0 || assigned ? new Date().toISOString() : null,
  }));
};

const CreateLeadPage = () => {
  const navigate = useNavigate();
  const { settings } = useLeadSettings();
  const serviceTypeOptions = settings.serviceTypes;
  const sourceOptions = settings.sources;
  const deviceOptions = settings.devices;

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [technicians, setTechnicians] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    staffManagementService
      .getStaffList()
      .then((data) => setTechnicians(data.filter((s) => s.status !== 'Inactive')))
      .catch(() => {});
  }, []);

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
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
  const selectedTechnician = technicians.find((t) => t.id === form.assignedTechnicianId);

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

    setSubmitting(true);
    try {
      const created = await leadManagementService.createLead({
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
        category: selectedTechnician ? 'Assigned' : 'Pending',
        tracker: buildLeadTracker(selectedServiceType, Boolean(selectedTechnician)),
        createdAt: new Date().toISOString().slice(0, 10),
      });
      navigate('/admin/leads', { state: { notice: `Lead created for ${created.customerName}.` } });
    } catch (error) {
      setNotice(error.response?.data?.message || error.message || 'Lead creation failed.');
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '24px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button
          type="button"
          className="icon-btn"
          onClick={() => navigate('/admin/leads')}
          aria-label="Back to leads"
          style={{ flexShrink: 0 }}
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Create New Lead</h1>
          <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: 'var(--text-muted, #64748b)' }}>
            Fill in the details below to add a new lead.
          </p>
        </div>
      </div>

      {notice && (
        <div className="success-banner" role="alert" style={{ marginBottom: 16 }}>
          <span>{notice}</span>
          <button className="icon-btn" onClick={() => setNotice('')} aria-label="Dismiss">✕</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card" style={{ padding: '28px 32px' }}>
        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>

          <div className="form-group">
            <label htmlFor="lead-company">Company</label>
            <input
              id="lead-company"
              type="text"
              placeholder="Enter company"
              value={form.company}
              onChange={(e) => updateForm('company', e.target.value)}
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
              onChange={(e) => updateForm('customerName', e.target.value)}
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
              onChange={(e) => updateForm('mobileNumber', e.target.value.replace(/\D/g, '').slice(0, 10))}
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
              onChange={(e) => updateForm('email', e.target.value)}
              aria-invalid={Boolean(errors.email)}
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="lead-service-type">Service Type</label>
            <select
              id="lead-service-type"
              value={form.serviceType}
              onChange={(e) => updateForm('serviceType', e.target.value)}
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
              onChange={(e) => updateForm('source', e.target.value)}
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
              onChange={(e) => updateForm('assignedTechnicianId', e.target.value)}
            >
              <option value="">Assign later</option>
              {technicians.map((tech) => (
                <option key={tech.id} value={tech.id}>
                  {tech.name} ({tech.departmentSkill || 'General'})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="lead-device">Device</label>
            <select
              id="lead-device"
              value={form.device}
              onChange={(e) => updateForm('device', e.target.value)}
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
                onChange={(e) => updateForm('locationLink', e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="lead-quote">Quote</label>
            <input
              id="lead-quote"
              type="text"
              placeholder="Enter quote amount/details"
              value={form.quote}
              onChange={(e) => updateForm('quote', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="lead-billing">Billing</label>
            <input
              id="lead-billing"
              type="text"
              placeholder="Enter billing details"
              value={form.billing}
              onChange={(e) => updateForm('billing', e.target.value)}
            />
          </div>

          <div className="form-group form-group-full">
            <label htmlFor="lead-review-link">Review Message Link</label>
            <input
              id="lead-review-link"
              type="url"
              placeholder="Google review / message link"
              value={form.reviewMessageLink}
              onChange={(e) => updateForm('reviewMessageLink', e.target.value)}
            />
          </div>

          {selectedServiceType === 'Walk-in' ? (
            <div className="form-group form-group-full">
              <label htmlFor="lead-problem-note">Problem Inward</label>
              <textarea
                id="lead-problem-note"
                value={form.problemInwardNote}
                onChange={(e) => updateForm('problemInwardNote', e.target.value)}
                rows={3}
                placeholder="Problem reported during inward"
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label style={{ minWidth: '60px', fontSize: '0.82rem', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>Image 1</label>
                  <input type="file" accept="image/*" onChange={(e) => handleSingleFile('problemInwardImage1', e)} />
                  {form.problemInwardImage1 && <span className="field-hint" style={{ marginTop: 0 }}>{form.problemInwardImage1.name}</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label style={{ minWidth: '60px', fontSize: '0.82rem', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>Image 2</label>
                  <input type="file" accept="image/*" onChange={(e) => handleSingleFile('problemInwardImage2', e)} />
                  {form.problemInwardImage2 && <span className="field-hint" style={{ marginTop: 0 }}>{form.problemInwardImage2.name}</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label style={{ minWidth: '60px', fontSize: '0.82rem', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>Image 3</label>
                  <input type="file" accept="image/*" onChange={(e) => handleSingleFile('problemInwardImage3', e)} />
                  {form.problemInwardImage3 && <span className="field-hint" style={{ marginTop: 0 }}>{form.problemInwardImage3.name}</span>}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="form-group form-group-full">
                <label htmlFor="lead-device-check">Device Check / Internal Report</label>
                <textarea
                  id="lead-device-check"
                  value={form.deviceCheckNote}
                  onChange={(e) => updateForm('deviceCheckNote', e.target.value)}
                  rows={3}
                  placeholder="Internal report / problem inward"
                />
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ marginTop: 8 }}
                  onChange={(e) => handleFiles('deviceCheckImages', e)}
                />
                <span className="field-hint">{form.deviceCheckImages.length} device check image(s) selected</span>
              </div>

              <div className="form-group form-group-full">
                <label htmlFor="lead-onsite-images">Images Upload</label>
                <input
                  id="lead-onsite-images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFiles('onsiteImages', e)}
                />
                <span className="field-hint">At least 3 images required. {form.onsiteImages.length} selected</span>
                {errors.onsiteImages && <span className="form-error">{errors.onsiteImages}</span>}
              </div>

              <label className="lead-check-row">
                <input
                  type="checkbox"
                  checked={form.deviceReceiveConfirmed}
                  onChange={(e) => updateForm('deviceReceiveConfirmed', e.target.checked)}
                />
                Device receive confirmation needed in Customer Portal
              </label>

              <label className="lead-check-row">
                <input
                  type="checkbox"
                  checked={form.deviceDeliveryConfirmed}
                  onChange={(e) => updateForm('deviceDeliveryConfirmed', e.target.checked)}
                />
                Device delivery confirmation needed in Customer Portal
              </label>
            </>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--border-light, #e2e8f0)' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/admin/leads')}
            disabled={submitting}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Click to Submit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateLeadPage;
