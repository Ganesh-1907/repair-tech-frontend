import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Wrench } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './CustomerPortal.css';

const CustomerLogin = () => {
  const { customerLogin, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated && user?.role === 'customer') {
    navigate('/customer/dashboard', { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.password) {
      setError('Email and password are required.');
      return;
    }
    setLoading(true);
    setError('');
    const result = await customerLogin(form.email, form.password);
    setLoading(false);
    if (result.success) {
      if (result.user?.forcePasswordChange) {
        navigate('/customer/set-new-password', { replace: true });
      } else {
        navigate('/customer/dashboard', { replace: true });
      }
    } else {
      setError(result.message || 'Invalid email or password.');
    }
  };

  return (
    <div className="cp-login-page">
      <div className="cp-login-card">
        <div className="cp-login-logo">
          <div style={{ width: 52, height: 52, background: '#ede9fe', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <Wrench size={26} color="#4f46e5" />
          </div>
          <h1>Customer Portal</h1>
          <p>RepairTech Enterprise — Sign in to view your contracts & services</p>
        </div>

        {error && <div className="cp-login-error">{error}</div>}

        <form className="cp-login-form" onSubmit={handleSubmit}>
          <div className="cp-form-group">
            <label>Email Address</label>
            <input
              type="email"
              autoComplete="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div className="cp-form-group">
            <label>Password</label>
            <input
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            />
          </div>
          <button className="cp-login-btn" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: 18, textAlign: 'center' }}>
          <Link to="/customer/forgot-password" style={{ color: '#4f46e5', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none' }}>
            Forgot password?
          </Link>
        </div>
        <p style={{ marginTop: 12, textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8' }}>
          Credentials are sent to you by RepairTech team. Contact support if you need help.
        </p>
      </div>
    </div>
  );
};

export default CustomerLogin;
