import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Phone, Edit, MessageCircleMore, Loader2, ExternalLink } from 'lucide-react';
import { api } from '../../services/apiClient';
import FileViewer from '../../components/common/FileViewer';

const openWhatsAppMessage = (phone, message) => {
  const clean = String(phone || '').replace(/\D/g, '');
  if (!clean) return;
  window.open(`https://wa.me/91${clean}?text=${encodeURIComponent(message)}`, '_blank');
};

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

const Field = ({ label, value }) => (
  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
    <td style={{ padding: '10px 16px', fontSize: '0.82rem', fontWeight: 600, color: '#64748b', whiteSpace: 'nowrap', width: 180 }}>{label}</td>
    <td style={{ padding: '10px 16px', fontSize: '0.88rem', color: value ? '#0f172a' : '#94a3b8', fontWeight: value ? 500 : 400 }}>
      {value || '-'}
    </td>
  </tr>
);

const ViewLeadPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const data = await api.get('leads', id);
        if (!cancelled) setLead(data);
      } catch {
        if (!cancelled) setError('Failed to load lead details.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) return (
    <div style={{ padding: 60, textAlign: 'center', color: '#64748b' }}>
      <Loader2 size={24} className="spin-slow" /> Loading lead...
    </div>
  );

  if (error || !lead) return (
    <div style={{ padding: 60, textAlign: 'center', color: '#ef4444' }}>
      {error || 'Lead not found.'}{' '}
      <button onClick={() => navigate('/admin/leads')} className="btn btn-primary" style={{ marginLeft: 10 }}>Back</button>
    </div>
  );

  const imageFiles = lead.problemInwardImages || [];
  const deviceImages = lead.deviceCheckImages || [];
  const onsiteImgs = lead.onsiteImages || [];

  return (
    <div style={{ padding: '24px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button type="button" className="icon-btn" onClick={() => navigate('/admin/leads')}><ArrowLeft size={18} /></button>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
            {(lead.customerName || 'L')[0].toUpperCase()}
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>{lead.customerName || '-'}</h1>
            <p style={{ margin: 0, fontSize: '0.83rem', color: '#64748b' }}>{lead.company || '-'}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <a href={`tel:${lead.mobileNumber}`} className="btn btn-secondary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Phone size={14} /> {lead.mobileNumber || 'No phone'}
          </a>
          <button type="button" className="btn btn-primary" onClick={() => openWhatsAppMessage(lead.mobileNumber, `Hi ${lead.customerName || 'Customer'}, thank you for contacting RepairBoy.`)} disabled={!lead.mobileNumber} style={{ background: '#16a34a', borderColor: '#16a34a', display: 'flex', alignItems: 'center', gap: 6 }}>
            <MessageCircleMore size={14} /> WhatsApp
          </button>
          <button type="button" className="btn btn-primary" onClick={() => navigate(`/admin/leads/edit/${lead.id}`)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Edit size={15} /> Edit Lead
          </button>
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <Field label="Lead ID" value={lead.id} />
            <Field label="Customer Name" value={lead.customerName} />
            <Field label="Company" value={lead.company} />
            <Field label="Mobile Number" value={lead.mobileNumber} />
            <Field label="Email" value={lead.email} />
            <Field label="Service Type" value={lead.serviceType} />
            <Field label="Source" value={lead.source} />
            <Field label="Device" value={lead.device} />
            <Field label="Assigned Technician" value={lead.assignedTechnician} />
            <Field label="Category" value={lead.category} />
            <Field label="Quote" value={lead.quote} />
            <Field label="Billing" value={lead.billing} />
            <Field label="Location Link" value={lead.locationLink} />
            <Field label="Review Message Link" value={lead.reviewMessageLink} />
            <Field label="Created At" value={lead.createdAt} />
          </tbody>
        </table>
      </div>

      {lead.problemInwardNote && (
        <div className="card" style={{ marginTop: 16, padding: '20px 24px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 8 }}>Problem Inward Note</h3>
          <p style={{ fontSize: '0.85rem', color: '#475569', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{lead.problemInwardNote}</p>
        </div>
      )}

      {imageFiles.length > 0 && (
        <div className="card" style={{ marginTop: 16, padding: '20px 24px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 12 }}>Problem Inward Images ({imageFiles.length})</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {imageFiles.map((file, i) => {
              const url = getFileUrl(file);
              return url ? (
                <a key={i} href={url} target="_blank" rel="noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '0.82rem', color: '#6366f1', textDecoration: 'none', fontWeight: 500 }}
                >
                  <ExternalLink size={12} /> {getFileName(file)}
                </a>
              ) : <span key={i} style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{getFileName(file)}</span>;
            })}
          </div>
          <FileViewer files={imageFiles} size={80} />
        </div>
      )}

      {lead.deviceCheckNote && (
        <div className="card" style={{ marginTop: 16, padding: '20px 24px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 8 }}>Device Check / Internal Report</h3>
          <p style={{ fontSize: '0.85rem', color: '#475569', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{lead.deviceCheckNote}</p>
        </div>
      )}

      {deviceImages.length > 0 && (
        <div className="card" style={{ marginTop: 16, padding: '20px 24px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 12 }}>Device Check Images ({deviceImages.length})</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {deviceImages.map((file, i) => {
              const url = getFileUrl(file);
              return url ? (
                <a key={i} href={url} target="_blank" rel="noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '0.82rem', color: '#6366f1', textDecoration: 'none', fontWeight: 500 }}
                >
                  <ExternalLink size={12} /> {getFileName(file)}
                </a>
              ) : <span key={i} style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{getFileName(file)}</span>;
            })}
          </div>
          <FileViewer files={deviceImages} size={80} />
        </div>
      )}

      {onsiteImgs.length > 0 && (
        <div className="card" style={{ marginTop: 16, padding: '20px 24px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 12 }}>Onsite Images ({onsiteImgs.length})</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {onsiteImgs.map((file, i) => {
              const url = getFileUrl(file);
              return url ? (
                <a key={i} href={url} target="_blank" rel="noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '0.82rem', color: '#6366f1', textDecoration: 'none', fontWeight: 500 }}
                >
                  <ExternalLink size={12} /> {getFileName(file)}
                </a>
              ) : <span key={i} style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{getFileName(file)}</span>;
            })}
          </div>
          <FileViewer files={onsiteImgs} size={80} />
        </div>
      )}
    </div>
  );
};

export default ViewLeadPage;
