import React, { useState } from 'react';
import { X, Mail, CheckCircle } from 'lucide-react';
import { customerPortalService } from '../../services/customerPortalService';

/**
 * Props:
 *  contractId      - string
 *  contractIds     - string[]  (optional, for linking multiple)
 *  customerName    - string
 *  email           - string   (pre-fill, editable)
 *  onClose         - () => void
 */
const SendCredentialsModal = ({ contractId, contractIds, customerName, email: initialEmail, onClose }) => {
  const [email, setEmail] = useState(initialEmail || '');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const allContractIds = [...new Set([
    ...(Array.isArray(contractIds) ? contractIds : []),
    ...(contractId ? [contractId] : []),
  ])];

  const handleSend = async () => {
    if (!email.trim()) { setError('Email address is required.'); return; }
    if (!email.includes('@')) { setError('Please enter a valid email.'); return; }
    setSending(true);
    setError('');
    try {
      const data = await customerPortalService.sendPortalCredentials({
        email: email.trim().toLowerCase(),
        customerName,
        contractId: contractId || allContractIds[0],
        contractIds: allContractIds,
      });
      setResult(data);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to send credentials.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-panel" style={{ width: 'min(100%, 480px)', maxHeight: 'min(92vh, 600px)' }}>
        <div className="modal-header" style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border-light)' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Send Portal Access</h2>
            <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.83rem' }}>
              Customer: <strong>{customerName}</strong> · {allContractIds.join(', ')}
            </p>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="modal-form" style={{ padding: '20px 24px 24px' }}>
          {!result ? (
            <>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label style={{ fontWeight: 600, fontSize: '0.85rem', display: 'block', marginBottom: 6 }}>Customer Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="customer@email.com"
                  style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 14px', marginBottom: 16, fontSize: '0.83rem', color: '#64748b' }}>
                <strong style={{ color: '#0f172a' }}>What happens:</strong>
                <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>
                  <li>A random password is generated and hashed securely.</li>
                  <li>Login credentials are emailed to the customer.</li>
                  <li>The generated password is shown once below for your reference.</li>
                  <li>If a portal account already exists for this email, the password is reset.</li>
                </ul>
              </div>

              {error && <div style={{ background: '#fee2e2', color: '#991b1b', borderRadius: 8, padding: '10px 14px', fontSize: '0.85rem', marginBottom: 14 }}>{error}</div>}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSend} disabled={sending} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Mail size={15} />
                  {sending ? 'Sending...' : 'Send Credentials'}
                </button>
              </div>
            </>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
                <CheckCircle size={22} color="#15803d" />
                <div>
                  <div style={{ fontWeight: 700, color: '#15803d', fontSize: '0.95rem' }}>Portal access sent successfully</div>
                  <div style={{ color: '#166534', fontSize: '0.83rem', marginTop: 2 }}>Login credentials have been emailed to <strong>{result.email}</strong></div>
                </div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px 16px', marginBottom: 20, fontSize: '0.85rem', color: '#475569' }}>
                <div style={{ marginBottom: 6 }}><span style={{ color: '#64748b', fontWeight: 600 }}>Customer:</span> {customerName}</div>
                <div style={{ marginBottom: 6 }}><span style={{ color: '#64748b', fontWeight: 600 }}>Login email:</span> {result.email}</div>
                <div><span style={{ color: '#64748b', fontWeight: 600 }}>Contract(s):</span> {(result.contractIds || []).join(', ')}</div>
              </div>

              <p style={{ margin: '0 0 20px', fontSize: '0.82rem', color: '#94a3b8' }}>
                The customer can log in at <strong style={{ color: '#4f46e5' }}>/customer/login</strong> using their email and the password sent to them.
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary" onClick={onClose}>Done</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SendCredentialsModal;
