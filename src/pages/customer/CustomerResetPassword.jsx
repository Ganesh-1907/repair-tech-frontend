import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { apiClient } from '../../services/apiClient';

const inputStyle = {
  wrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
  icon: {
    position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
    color: '#94a3b8', pointerEvents: 'none', display: 'flex', alignItems: 'center',
  },
  input: {
    width: '100%', height: 48, padding: '0 44px',
    border: '1.5px solid #e2e8f0', borderRadius: 14, fontSize: '0.93rem',
    color: '#0f172a', background: '#fff', outline: 'none',
    fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color .15s',
  },
  eyeBtn: {
    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8',
    display: 'flex', alignItems: 'center', padding: 4,
  },
};

const CustomerResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [focused, setFocused] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await apiClient.post('/auth/customer/reset-password', { token, newPassword: form.password });
      setDone(true);
    } catch (err) {
      setError(err?.response?.data?.message || 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #ede9fe 0%, #f8fafc 60%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 8px 32px rgba(79,70,229,0.10)', padding: '40px 36px', maxWidth: 420, width: '100%', textAlign: 'center' }}>
          <p style={{ color: '#991b1b', fontWeight: 600 }}>Invalid or missing reset token.</p>
          <Link to="/customer/forgot-password" style={{ color: '#4f46e5', fontWeight: 600, fontSize: '0.88rem' }}>Request a new reset link</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #ede9fe 0%, #f8fafc 60%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 8px 32px rgba(79,70,229,0.10)', padding: '40px 36px', width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, background: '#ede9fe', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <Lock size={26} color="#4f46e5" />
          </div>
          <h1 style={{ margin: '0 0 6px', fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>Reset Password</h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem' }}>Choose a new password for your customer portal.</p>
        </div>

        {done ? (
          <div>
            <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 12, padding: '18px 20px', textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontWeight: 700, color: '#15803d', fontSize: '0.95rem', marginBottom: 4 }}>Password updated!</div>
              <div style={{ color: '#166534', fontSize: '0.85rem' }}>You can now sign in with your new password.</div>
            </div>
            <Link
              to="/customer/login"
              style={{
                display: 'block', textAlign: 'center', width: '100%', height: 48, lineHeight: '48px',
                background: '#4f46e5', color: '#fff', borderRadius: 14, fontWeight: 700,
                fontSize: '0.95rem', textDecoration: 'none',
              }}
            >
              Go to Customer Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ background: '#fee2e2', color: '#991b1b', borderRadius: 10, padding: '10px 14px', fontSize: '0.85rem', marginBottom: 16 }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                New Password
              </label>
              <div style={inputStyle.wrapper}>
                <span style={inputStyle.icon}><Lock size={17} /></span>
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  onFocus={() => setFocused((f) => ({ ...f, pwd: true }))}
                  onBlur={() => setFocused((f) => ({ ...f, pwd: false }))}
                  required
                  style={{ ...inputStyle.input, borderColor: focused.pwd ? '#4f46e5' : '#e2e8f0' }}
                />
                <button type="button" style={inputStyle.eyeBtn} onClick={() => setShowPwd((v) => !v)} tabIndex={-1}>
                  {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Confirm Password
              </label>
              <div style={inputStyle.wrapper}>
                <span style={inputStyle.icon}><Lock size={17} /></span>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  value={form.confirm}
                  onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
                  onFocus={() => setFocused((f) => ({ ...f, confirm: true }))}
                  onBlur={() => setFocused((f) => ({ ...f, confirm: false }))}
                  required
                  style={{ ...inputStyle.input, borderColor: focused.confirm ? '#4f46e5' : '#e2e8f0' }}
                />
                <button type="button" style={inputStyle.eyeBtn} onClick={() => setShowConfirm((v) => !v)} tabIndex={-1}>
                  {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', height: 48, background: loading ? '#a5b4fc' : '#4f46e5',
                color: '#fff', border: 'none', borderRadius: 14, fontSize: '0.95rem',
                fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}

        {!done && (
          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <Link to="/customer/login" style={{ color: '#4f46e5', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <ArrowLeft size={14} /> Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerResetPassword;
