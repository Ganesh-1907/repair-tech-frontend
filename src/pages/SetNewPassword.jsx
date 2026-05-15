import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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

const SetNewPassword = () => {
  const { user, setNewPassword, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [focused, setFocused] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    const result = await setNewPassword(form.password);
    setLoading(false);
    if (result.success) {
      navigate(result.user?.role === 'staff' ? '/admin/staff-portal' : '/', { replace: true });
    } else {
      setError(result.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 8px 32px rgba(15,23,42,0.10)', padding: '40px 36px', width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, background: '#f1f5f9', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <KeyRound size={26} color="#4f46e5" />
          </div>
          <h1 style={{ margin: '0 0 6px', fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>Set New Password</h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem' }}>
            Welcome, <strong>{user?.name || 'there'}</strong>! Choose a new password to continue.
          </p>
        </div>

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
              fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', transition: 'background .15s',
            }}
          >
            {loading ? 'Saving...' : 'Set Password & Continue'}
          </button>
        </form>

        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.83rem', cursor: 'pointer' }}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetNewPassword;
