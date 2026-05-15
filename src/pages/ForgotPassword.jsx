import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { apiClient } from '../services/apiClient';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiClient.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
      setSent(true);
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 8px 32px rgba(15,23,42,0.10)', padding: '40px 36px', width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, background: '#f1f5f9', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <Mail size={26} color="#4f46e5" />
          </div>
          <h1 style={{ margin: '0 0 6px', fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>Forgot Password</h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem' }}>Enter your email and we'll send a reset link.</p>
        </div>

        {sent ? (
          <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 12, padding: '18px 20px', textAlign: 'center' }}>
            <div style={{ fontWeight: 700, color: '#15803d', fontSize: '0.95rem', marginBottom: 6 }}>Check your email</div>
            <div style={{ color: '#166534', fontSize: '0.85rem' }}>
              If an account exists for <strong>{email}</strong>, a password reset link has been sent.
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ background: '#fee2e2', color: '#991b1b', borderRadius: 10, padding: '10px 14px', fontSize: '0.85rem', marginBottom: 16 }}>
                {error}
              </div>
            )}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Email Address
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
                  <Mail size={17} />
                </span>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  required
                  style={{
                    width: '100%', height: 48, padding: '0 14px 0 44px',
                    border: `1.5px solid ${focused ? '#4f46e5' : '#e2e8f0'}`, borderRadius: 14,
                    fontSize: '0.93rem', color: '#0f172a', background: '#fff', outline: 'none',
                    fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color .15s',
                  }}
                />
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
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <Link to="/login" style={{ color: '#4f46e5', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <ArrowLeft size={14} /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
