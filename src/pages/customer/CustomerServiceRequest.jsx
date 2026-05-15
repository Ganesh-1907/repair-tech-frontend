import React, { useEffect, useState } from 'react';
import { MessageSquarePlus, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { customerPortalService } from '../../services/customerPortalService';

const fmtDate = (v) => {
  if (!v) return '—';
  try { return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(v)); }
  catch { return v; }
};

const urgencyOptions = ['Low', 'Normal', 'High', 'Critical'];

const CustomerServiceRequest = () => {
  const { user } = useAuth();
  const contractIds = user?.contractIds || [];

  const [contracts, setContracts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState({ contractId: contractIds[0] || '', issueDescription: '', deviceType: '', urgency: 'Normal', contactPhone: '' });
  const [devices, setDevices] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!contractIds.length) return;
    customerPortalService.getContractsByIds(contractIds).then((list) => {
      setContracts(list);
      if (list.length > 0) {
        const first = list[0];
        setForm((f) => ({ ...f, contractId: first.id }));
        const devs = first.amcDetails?.devices || first.cmcDetails?.devices || first.devices || [];
        setDevices(devs);
      }
    });
    customerPortalService.getServiceRequests(contractIds).then(setRequests);
  }, []);

  const handleContractChange = (id) => {
    const c = contracts.find((x) => x.id === id);
    const devs = c?.amcDetails?.devices || c?.cmcDetails?.devices || c?.devices || [];
    setDevices(devs);
    setForm((f) => ({ ...f, contractId: id, deviceType: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.contractId || !form.issueDescription.trim()) {
      setError('Contract and issue description are required.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await customerPortalService.submitServiceRequest({
        ...form,
        customerName: user?.customerName || '',
        customerEmail: user?.email || '',
        status: 'Open',
        createdAt: new Date().toISOString(),
      });
      setSuccess('Your service request has been submitted. Our team will contact you shortly.');
      setForm((f) => ({ ...f, issueDescription: '', deviceType: '', urgency: 'Normal', contactPhone: '' }));
      const updated = await customerPortalService.getServiceRequests(contractIds);
      setRequests(updated);
    } catch (err) {
      setError(err.message || 'Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="cp-page-title">Raise a Service Request</h1>
      <p className="cp-page-sub">Submit a new complaint or service request and we'll get back to you.</p>

      <div className="cp-card" style={{ marginBottom: 24 }}>
        <div className="cp-card-header"><h3>New Request</h3></div>
        <div className="cp-card-body">
          {success && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px 16px', marginBottom: 16, color: '#15803d', fontWeight: 600, fontSize: '0.875rem' }}>
              <CheckCircle size={18} /> {success}
            </div>
          )}
          {error && <div className="cp-login-error" style={{ marginBottom: 16 }}>{error}</div>}

          <form className="cp-form" onSubmit={handleSubmit}>
            <div className="cp-form-row">
              <div className="cp-form-group">
                <label>Contract</label>
                <select value={form.contractId} onChange={(e) => handleContractChange(e.target.value)}>
                  {contractIds.map((id) => <option key={id} value={id}>{id}</option>)}
                </select>
              </div>
              <div className="cp-form-group">
                <label>Urgency</label>
                <select value={form.urgency} onChange={(e) => setForm((f) => ({ ...f, urgency: e.target.value }))}>
                  {urgencyOptions.map((u) => <option key={u}>{u}</option>)}
                </select>
              </div>
            </div>

            <div className="cp-form-row">
              <div className="cp-form-group">
                <label>Device (optional)</label>
                <select value={form.deviceType} onChange={(e) => setForm((f) => ({ ...f, deviceType: e.target.value }))}>
                  <option value="">— Select device —</option>
                  {devices.map((d, i) => (
                    <option key={i} value={d.type || d.deviceType}>
                      {[d.type || d.deviceType, d.brand, d.model, d.serialNumber || d.serial].filter(Boolean).join(' — ')}
                    </option>
                  ))}
                  <option value="Other">Other / Not listed</option>
                </select>
              </div>
              <div className="cp-form-group">
                <label>Contact Phone (optional)</label>
                <input
                  className="cp-form-group input"
                  style={{ padding: '11px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: '0.9rem', outline: 'none' }}
                  value={form.contactPhone}
                  onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div className="cp-form-group">
              <label>Issue Description <span style={{ color: '#dc2626' }}>*</span></label>
              <textarea rows={4} value={form.issueDescription} onChange={(e) => setForm((f) => ({ ...f, issueDescription: e.target.value }))} placeholder="Describe the issue in detail..." />
            </div>

            <button className="cp-submit-btn" type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        </div>
      </div>

      {/* Past Requests */}
      <div className="cp-card">
        <div className="cp-card-header"><h3>My Requests</h3></div>
        {requests.length === 0 ? (
          <div className="cp-empty"><MessageSquarePlus size={36} /><p>No service requests yet.</p></div>
        ) : (
          <table className="cp-table">
            <thead><tr><th>ID</th><th>Contract</th><th>Issue</th><th>Urgency</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {requests.map((r, i) => {
                const st = String(r.status || 'open').toLowerCase();
                return (
                  <tr key={r.id || i}>
                    <td>{r.id || `#${i + 1}`}</td>
                    <td>{r.contractId}</td>
                    <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.issueDescription}</td>
                    <td><span className={`cp-badge ${r.urgency === 'Critical' ? 'cp-badge-red' : r.urgency === 'High' ? 'cp-badge-amber' : 'cp-badge-blue'}`}>{r.urgency || 'Normal'}</span></td>
                    <td><span className={`cp-badge ${st === 'open' ? 'cp-badge-amber' : st === 'closed' || st === 'resolved' ? 'cp-badge-green' : 'cp-badge-blue'}`}>{r.status || 'Open'}</span></td>
                    <td>{fmtDate(r.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CustomerServiceRequest;
