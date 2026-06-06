import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, ExternalLink, X } from 'lucide-react';
import { leadManagementService } from '../../services/leadManagementService';
import { staffManagementService } from '../../services/staffManagementService';
import { uploadFileToR2, uploadFilesToR2 } from '../../services/uploadService';
import { useLeadSettings } from '../../hooks/useLeadSettings';
import { api } from '../../services/apiClient';
import FileViewer from '../../components/common/FileViewer';

const normalizeServiceType = (value = '') =>
  String(value).toLowerCase().includes('onsite') ? 'Onsite service' : 'Walk-in';

const getFileUrl = (file) => {
  if (!file) return '';
  if (typeof file === 'string') return file;
  if (file.url) return file.url;
  if (file.dataUrl) return file.dataUrl;
  if (file.key) return `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/upload/view?key=${encodeURIComponent(file.key)}`;
  return '';
};

const getFileName = (file) => {
  if (!file) return '-';
  if (typeof file === 'string') return file.split('/').pop() || 'File';
  return file.name || file.originalName || 'File';
};

const ExistingFile = ({ file, onReplace, onRemove }) => {
  const url = getFileUrl(file);
  const name = getFileName(file);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '0.8rem' }}>
      {url ? (
        <a href={url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#6366f1', textDecoration: 'none', fontWeight: 500, flex: 1 }}>
          <ExternalLink size={12} /> {name}
        </a>
      ) : (
        <span style={{ flex: 1, color: '#0f172a', fontWeight: 500 }}>{name}</span>
      )}
      <label style={{ cursor: 'pointer', fontSize: '0.72rem', color: '#6366f1', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
        Replace<input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) onReplace(f); }} />
      </label>
      <button type="button" onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 0, display: 'flex' }} title="Remove"><X size={14} /></button>
    </div>
  );
};

const SingleFileRow = ({ label, field, form, uploadingFields, onReplace, onRemove }) => (
  <div style={{ flex: '1 1 160px', minWidth: 150 }}>
    <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, marginBottom: 4, display: 'block' }}>{label}</label>
    {form[field] ? (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <ExistingFile file={form[field]} onReplace={(f) => onReplace(field, f)} onRemove={() => onRemove(field)} />
        <FileViewer files={form[field]} size={56} />
      </div>
    ) : (
      <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) onReplace(field, f); }} />
    )}
    {uploadingFields.has(field) && <span className="field-hint" style={{ marginTop: 2 }}>Uploading...</span>}
  </div>
);

const EditLeadPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { settings } = useLeadSettings();
  const serviceTypeOptions = settings.serviceTypes;
  const sourceOptions = settings.sources;
  const deviceOptions = settings.devices;

  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [technicians, setTechnicians] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploadingFields, setUploadingFields] = useState(new Set());

  const mapLeadToForm = (lead) => ({
    customerName: lead.customerName || '',
    company: lead.company || '',
    mobileNumber: lead.mobileNumber || '',
    email: lead.email || '',
    serviceType: lead.serviceType || '',
    source: lead.source || '',
    assignedTechnicianId: lead.assignedTechnicianId || '',
    device: lead.device || '',
    locationLink: lead.locationLink || '',
    problemInwardNote: lead.problemInwardNote || '',
    deviceCheckNote: lead.deviceCheckNote || '',
    quote: lead.quote || '',
    billing: lead.billing || '',
    reviewMessageLink: lead.reviewMessageLink || '',
    deviceReceiveConfirmed: lead.deviceReceiveConfirmed || false,
    deviceDeliveryConfirmed: lead.deviceDeliveryConfirmed || false,
    problemInwardImage1: lead.problemInwardImages?.[0] || null,
    problemInwardImage2: lead.problemInwardImages?.[1] || null,
    problemInwardImage3: lead.problemInwardImages?.[2] || null,
    deviceCheckImages: lead.deviceCheckImages || [],
    onsiteImages: lead.onsiteImages || [],
  });

  useEffect(() => {
    staffManagementService
      .getStaffList()
      .then((data) => setTechnicians(data.filter((s) => s.status !== 'Inactive')))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const lead = await api.get('leads', id);
        if (cancelled) return;
        setForm(mapLeadToForm(lead));
      } catch {
        if (!cancelled) setNotice('Failed to load lead data.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [id]);

  const updateForm = (field, value) => {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleReplaceFile = async (field, file) => {
    setUploadingFields((prev) => new Set(prev).add(field));
    try {
      const image = await uploadFileToR2(file);
      console.log('R2 upload result:', image);
      updateForm(field, image);
    } catch (e) {
      console.error('R2 upload failed:', e);
    } finally {
      setUploadingFields((prev) => { const next = new Set(prev); next.delete(field); return next; });
    }
  };

  const handleRemoveFile = (field) => {
    updateForm(field, null);
  };

  const handleReplaceMultiFile = async (index, field, file) => {
    setUploadingFields((prev) => new Set(prev).add(`${field}-${index}`));
    try {
      const image = await uploadFileToR2(file);
      setForm((prev) => {
        if (!prev) return prev;
        const arr = [...prev[field]];
        arr[index] = image;
        return { ...prev, [field]: arr };
      });
    } finally {
      setUploadingFields((prev) => { const next = new Set(prev); next.delete(`${field}-${index}`); return next; });
    }
  };

  const handleRemoveMultiFile = (index, field) => {
    setForm((prev) => {
      if (!prev) return prev;
      const arr = prev[field].filter((_, i) => i !== index);
      return { ...prev, [field]: arr };
    });
  };

  const handleAddFiles = async (field, event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    setUploadingFields((prev) => new Set(prev).add(field));
    try {
      const images = await uploadFilesToR2(files);
      setForm((prev) => {
        if (!prev) return prev;
        return { ...prev, [field]: [...prev[field], ...images] };
      });
    } finally {
      setUploadingFields((prev) => { const next = new Set(prev); next.delete(field); return next; });
    }
  };

  const handleAddSlotFile = async (field, index, event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const slotKey = `${field}-slot-${index}`;
    setUploadingFields((prev) => new Set(prev).add(slotKey));
    try {
      const image = await uploadFileToR2(file);
      setForm((prev) => {
        if (!prev) return prev;
        const arr = [...prev[field]];
        arr.push(image);
        return { ...prev, [field]: arr };
      });
    } finally {
      setUploadingFields((prev) => { const next = new Set(prev); next.delete(slotKey); return next; });
    }
  };

  const selectedServiceType = form ? normalizeServiceType(form.serviceType) : 'Walk-in';
  const selectedTechnician = technicians.find((t) => t.id === form?.assignedTechnicianId);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting || !form) return;

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
    const payload = {
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
    };
    console.log('EditLead submit payload, problemInwardImages:', payload.problemInwardImages);
    try {
      await leadManagementService.updateLead(id, payload);
      navigate('/admin/leads', { state: { notice: `Lead updated for ${form.customerName}.` } });
    } catch (error) {
      setNotice(error.response?.data?.message || error.message || 'Lead update failed.');
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ padding: 60, textAlign: 'center', color: '#64748b' }}>
      <Loader2 size={24} className="spin-slow" /> Loading lead...
    </div>
  );

  if (!form) return (
    <div style={{ padding: 60, textAlign: 'center', color: '#ef4444' }}>
      Lead not found. <button onClick={() => navigate('/admin/leads')} className="btn btn-primary" style={{ marginLeft: 10 }}>Back</button>
    </div>
  );

  return (
    <div style={{ padding: '24px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button type="button" className="icon-btn" onClick={() => navigate('/admin/leads')} style={{ flexShrink: 0 }}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Edit Lead</h1>
          <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: '#64748b' }}>Editing lead for {form.customerName}.</p>
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
          <div className="form-group"><label htmlFor="edit-company">Company</label><input id="edit-company" type="text" placeholder="Enter company" value={form.company} onChange={(e) => updateForm('company', e.target.value)} />{errors.company && <span className="form-error">{errors.company}</span>}</div>
          <div className="form-group"><label htmlFor="edit-customer">Customer Name</label><input id="edit-customer" type="text" placeholder="Enter customer name" value={form.customerName} onChange={(e) => updateForm('customerName', e.target.value)} />{errors.customerName && <span className="form-error">{errors.customerName}</span>}</div>
          <div className="form-group"><label htmlFor="edit-mobile">Mobile Number</label><input id="edit-mobile" type="tel" placeholder="Enter mobile number" value={form.mobileNumber} onChange={(e) => updateForm('mobileNumber', e.target.value.replace(/\D/g, '').slice(0, 10))} />{errors.mobileNumber && <span className="form-error">{errors.mobileNumber}</span>}</div>
          <div className="form-group"><label htmlFor="edit-email">Email</label><input id="edit-email" type="email" placeholder="Enter email" value={form.email} onChange={(e) => updateForm('email', e.target.value)} />{errors.email && <span className="form-error">{errors.email}</span>}</div>
          <div className="form-group"><label htmlFor="edit-service-type">Service Type</label><select id="edit-service-type" value={form.serviceType} onChange={(e) => updateForm('serviceType', e.target.value)}>{serviceTypeOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select>{errors.serviceType && <span className="form-error">{errors.serviceType}</span>}</div>
          <div className="form-group"><label htmlFor="edit-source">Source</label><select id="edit-source" value={form.source} onChange={(e) => updateForm('source', e.target.value)}>{sourceOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select>{errors.source && <span className="form-error">{errors.source}</span>}</div>
          <div className="form-group"><label htmlFor="edit-assign">Assign</label><select id="edit-assign" value={form.assignedTechnicianId} onChange={(e) => updateForm('assignedTechnicianId', e.target.value)}><option value="">Assign later</option>{technicians.map((tech) => <option key={tech.id} value={tech.id}>{tech.name} ({tech.departmentSkill || 'General'})</option>)}</select></div>
          <div className="form-group"><label htmlFor="edit-device">Device</label><select id="edit-device" value={form.device} onChange={(e) => updateForm('device', e.target.value)}>{deviceOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
          {selectedServiceType === 'Onsite service' && <div className="form-group"><label htmlFor="edit-location">Location Link</label><input id="edit-location" type="url" placeholder="https://maps.google.com/..." value={form.locationLink} onChange={(e) => updateForm('locationLink', e.target.value)} /></div>}
          <div className="form-group"><label htmlFor="edit-quote">Quote</label><input id="edit-quote" type="text" placeholder="Enter quote" value={form.quote} onChange={(e) => updateForm('quote', e.target.value)} /></div>
          <div className="form-group"><label htmlFor="edit-billing">Billing</label><input id="edit-billing" type="text" placeholder="Enter billing" value={form.billing} onChange={(e) => updateForm('billing', e.target.value)} /></div>
          <div className="form-group form-group-full"><label htmlFor="edit-review">Review Message Link</label><input id="edit-review" type="url" placeholder="Google review / message link" value={form.reviewMessageLink} onChange={(e) => updateForm('reviewMessageLink', e.target.value)} /></div>

          {selectedServiceType === 'Walk-in' ? (
            <div className="form-group form-group-full">
              <label>Problem Inward</label>
              <textarea value={form.problemInwardNote} onChange={(e) => updateForm('problemInwardNote', e.target.value)} rows={3} placeholder="Problem reported during inward" />
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap' }}>
                <SingleFileRow label="Image 1" field="problemInwardImage1" form={form} uploadingFields={uploadingFields} onReplace={handleReplaceFile} onRemove={handleRemoveFile} />
                <SingleFileRow label="Image 2" field="problemInwardImage2" form={form} uploadingFields={uploadingFields} onReplace={handleReplaceFile} onRemove={handleRemoveFile} />
                <SingleFileRow label="Image 3" field="problemInwardImage3" form={form} uploadingFields={uploadingFields} onReplace={handleReplaceFile} onRemove={handleRemoveFile} />
              </div>
            </div>
          ) : (
            <>
              <div className="form-group form-group-full">
                <label>Device Check / Internal Report</label>
                <textarea value={form.deviceCheckNote} onChange={(e) => updateForm('deviceCheckNote', e.target.value)} rows={3} placeholder="Internal report" />
                <div style={{ marginTop: 8 }}>
                  {form.deviceCheckImages.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                      {form.deviceCheckImages.map((file, i) => (
                        <ExistingFile key={i} file={file} onReplace={(f) => handleReplaceMultiFile(i, 'deviceCheckImages', f)} onRemove={() => handleRemoveMultiFile(i, 'deviceCheckImages')} />
                      ))}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {[0, 1, 2].map((i) => (
                      <div key={i} style={{ flex: '1 1 150px', minWidth: 140 }}>
                        <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, marginBottom: 4, display: 'block' }}>Add Image {i + 1}</label>
                        <input type="file" accept="image/*" onChange={(e) => handleAddSlotFile('deviceCheckImages', i, e)} />
                        {uploadingFields.has(`deviceCheckImages-slot-${i}`) && <span className="field-hint" style={{ marginTop: 2 }}>Uploading...</span>}
                      </div>
                    ))}
                  </div>
                  <span className="field-hint">{form.deviceCheckImages.length} image(s)</span>
                </div>
              </div>
              <div className="form-group form-group-full">
                <label>Onsite Images</label>
                <div style={{ marginTop: 8 }}>
                  {form.onsiteImages.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                      {form.onsiteImages.map((file, i) => (
                        <ExistingFile key={i} file={file} onReplace={(f) => handleReplaceMultiFile(i, 'onsiteImages', f)} onRemove={() => handleRemoveMultiFile(i, 'onsiteImages')} />
                      ))}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {[0, 1, 2].map((i) => (
                      <div key={i} style={{ flex: '1 1 150px', minWidth: 140 }}>
                        <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, marginBottom: 4, display: 'block' }}>Add Image {i + 1}</label>
                        <input type="file" accept="image/*" onChange={(e) => handleAddSlotFile('onsiteImages', i, e)} />
                        {uploadingFields.has(`onsiteImages-slot-${i}`) && <span className="field-hint" style={{ marginTop: 2 }}>Uploading...</span>}
                      </div>
                    ))}
                  </div>
                  <span className="field-hint">At least 3 images. {form.onsiteImages.length} selected</span>
                  {errors.onsiteImages && <span className="form-error">{errors.onsiteImages}</span>}
                </div>
              </div>
            </>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 28, paddingTop: 20, borderTop: '1px solid #e2e8f0' }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/leads')} disabled={submitting}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving...' : 'Update Lead'}</button>
        </div>
      </form>
    </div>
  );
};

export default EditLeadPage;
