import React, { useState, useEffect } from 'react';
import { X, Mail, CheckCircle, Link2 } from 'lucide-react';
import { customerPortalService } from '../../services/customerPortalService';

/**
 * Props:
 *  contractId      - string
 *  contractIds     - string[]  (optional, for linking multiple)
 *  customerName    - string
 *  email           - string   (pre-fill)
 *  emailLocked     - boolean  (optional, prevents changing email in this modal)
 *  onClose         - () => void
 */
const SendCredentialsModal = ({ contractId, contractIds, customerName, email: initialEmail, emailLocked = false, onClose }) => {
  const [email, setEmail] = useState(initialEmail || '');
  const [accounts, setAccounts] = useState([]);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [linking, setLinking] = useState(false);
  const [result, setResult] = useState(null);
  const [linkResult, setLinkResult] = useState(null);
  const [error, setError] = useState('');

  const allContractIds = [...new Set([
    ...(Array.isArray(contractIds) ? contractIds : []),
    ...(contractId ? [contractId] : []),
  ])];

  const targetContractId = contractId || allContractIds[0];

  useEffect(() => {
    customerPortalService.getCustomerAccounts()
      .then(setAccounts)
      .catch((err) => console.error('Failed to fetch customer accounts:', err))
      .finally(() => setAccountsLoading(false));
  }, []);

  const existingAccount = accounts.find(
    (acc) => acc.email === email.trim().toLowerCase()
  );

  const isAlreadyLinked = existingAccount && existingAccount.contractIds.includes(targetContractId);

  const handleSend = async () => {
    if (!email.trim()) { setError('No email is saved for this customer. Edit the lead and add an email before sending portal access.'); return; }
    if (!email.includes('@')) { setError('Please enter a valid email.'); return; }
    setSending(true);
    setError('');
    try {
      const data = await customerPortalService.sendPortalCredentials({
        email: email.trim().toLowerCase(),
        customerName,
        contractId: targetContractId,
        contractIds: allContractIds,
      });
      setResult(data);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to send credentials.');
    } finally {
      setSending(false);
    }
  };

  const handleLinkContract = async () => {
    if (!email.trim()) return;
    setLinking(true);
    setError('');
    try {
      const data = await customerPortalService.addContract({
        email: email.trim().toLowerCase(),
        contractId: targetContractId,
      });
      if (data.success) {
        setLinkResult({ email: email.trim().toLowerCase(), contractIds: data.contractIds });
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to link contract.');
    } finally {
      setLinking(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-panel" style={{ width: 'min(100%, 480px)', maxHeight: 'min(92vh, 600px)' }}>
        <div className="modal-header" style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border-light)' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Send Portal Access</h2>
            <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.83rem' }}>
              Customer: <strong>{customerName}</strong> · {targetContractId}
            </p>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="modal-form" style={{ padding: '20px 24px 24px' }}>
          {accountsLoading ? (
            <div style={{ textAlign: 'center', padding: '30px 0' }}>
              <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Checking portal accounts status...</span>
            </div>
          ) : result ? (
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
          ) : linkResult ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
                <CheckCircle size={22} color="#15803d" />
                <div>
                  <div style={{ fontWeight: 700, color: '#15803d', fontSize: '0.95rem' }}>Contract Linked Successfully</div>
                  <div style={{ color: '#166534', fontSize: '0.83rem', marginTop: 2 }}>The contract <strong>{targetContractId}</strong> was successfully linked to the customer account.</div>
                </div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px 16px', marginBottom: 20, fontSize: '0.85rem', color: '#475569' }}>
                <div style={{ marginBottom: 6 }}><span style={{ color: '#64748b', fontWeight: 600 }}>Login email:</span> {linkResult.email}</div>
                <div><span style={{ color: '#64748b', fontWeight: 600 }}>All Linked Contracts:</span> {linkResult.contractIds.join(', ')}</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary" onClick={onClose}>Done</button>
              </div>
            </div>
          ) : (
            <>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label style={{ fontWeight: 600, fontSize: '0.85rem', display: 'block', marginBottom: 6 }}>Sending To</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    if (!emailLocked) setEmail(e.target.value);
                  }}
                  placeholder={emailLocked ? 'No email saved on lead' : 'customer@email.com'}
                  readOnly={emailLocked}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: 10,
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    background: emailLocked ? '#f8fafc' : '#fff',
                    color: email ? '#0f172a' : '#ef4444',
                    cursor: emailLocked ? 'not-allowed' : 'text',
                  }}
                />
                {emailLocked && (
                  <p style={{ margin: '6px 0 0', color: email ? '#64748b' : '#dc2626', fontSize: '0.78rem', lineHeight: 1.4 }}>
                    {email
                      ? 'This email comes from the lead/contract record.'
                      : 'This record has no email saved. Edit the details first.'}
                  </p>
                )}
              </div>

              {existingAccount ? (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '14px', marginBottom: 16, fontSize: '0.83rem', color: '#166534' }}>
                  <div style={{ fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle size={14} color="#15803d" />
                    Portal Account Already Exists
                  </div>
                  <div>
                    This email is already registered on the customer portal.
                  </div>
                  <div style={{ marginTop: 8, fontSize: '0.8rem', color: '#166534', background: 'rgba(255,255,255,0.5)', padding: '6px 8px', borderRadius: 6 }}>
                    <strong>Linked contract(s):</strong> {existingAccount.contractIds.join(', ')}
                  </div>
                </div>
              ) : (
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 14px', marginBottom: 16, fontSize: '0.83rem', color: '#64748b' }}>
                  <strong style={{ color: '#0f172a' }}>What happens:</strong>
                  <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>
                    <li>A random password is generated and hashed securely.</li>
                    <li>Login credentials are emailed to the customer.</li>
                    <li>The generated password is shown once below for your reference.</li>
                  </ul>
                </div>
              )}

              {error && <div style={{ background: '#fee2e2', color: '#991b1b', borderRadius: 8, padding: '10px 14px', fontSize: '0.85rem', marginBottom: 14 }}>{error}</div>}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button className="btn btn-secondary" onClick={onClose}>Cancel</button>

                {existingAccount ? (
                  <>
                    {!isAlreadyLinked && (
                      <button className="btn btn-primary" onClick={handleLinkContract} disabled={linking} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#10b981', borderColor: '#10b981' }}>
                        <Link2 size={15} />
                        {linking ? 'Linking...' : 'Link Contract'}
                      </button>
                    )}
                    <button className="btn btn-secondary" onClick={handleSend} disabled={sending} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Mail size={15} />
                      {sending ? 'Resetting...' : 'Reset & Resend Password'}
                    </button>
                  </>
                ) : (
                  <button className="btn btn-primary" onClick={handleSend} disabled={sending || (emailLocked && !email.trim())} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Mail size={15} />
                    {sending ? 'Sending...' : 'Send Credentials'}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SendCredentialsModal;
