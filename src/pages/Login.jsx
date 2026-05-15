import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ChevronRight, Eye, EyeOff } from 'lucide-react';

const fieldStyle = {
  wrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    position: 'absolute',
    left: 14,
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#94a3b8',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    height: 48,
    padding: '0 44px 0 44px',
    border: '1.5px solid #e2e8f0',
    borderRadius: 14,
    fontSize: '0.93rem',
    color: '#0f172a',
    background: '#fff',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    transition: 'border-color .15s',
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#94a3b8',
    display: 'flex',
    alignItems: 'center',
    padding: 4,
  },
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);
    if (!result.success) {
      setError(result.message);
      return;
    }
    if (result.user?.forcePasswordChange) {
      navigate('/set-new-password', { replace: true });
      return;
    }
    navigate(result.user?.role === 'staff' ? '/admin/staff-portal' : '/');
  };

  return (
    <div className="login-page">
      <div className="login-card card">
        <div className="login-header">
          <div className="logo-icon">R</div>
          <h1>RepairBoy</h1>
          <p>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="login-error-alert">{error}</div>}

          {/* Email field */}
          <div className="form-group">
            <label htmlFor="login-email" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
              Email Address
            </label>
            <div style={fieldStyle.wrapper}>
              <span style={fieldStyle.icon}><Mail size={17} /></span>
              <input
                id="login-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                required
                style={{
                  ...fieldStyle.input,
                  borderColor: emailFocused ? '#4f46e5' : '#e2e8f0',
                  paddingRight: 14,
                }}
              />
            </div>
          </div>

          {/* Password field */}
          <div className="form-group">
            <label htmlFor="login-password" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
              Password
            </label>
            <div style={fieldStyle.wrapper}>
              <span style={fieldStyle.icon}><Lock size={17} /></span>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPassFocused(true)}
                onBlur={() => setPassFocused(false)}
                required
                style={{
                  ...fieldStyle.input,
                  borderColor: passFocused ? '#4f46e5' : '#e2e8f0',
                }}
              />
              <button
                type="button"
                style={fieldStyle.eyeBtn}
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Signing In...' : 'Sign In'}
            <ChevronRight size={18} />
          </button>
        </form>

        <div className="login-footer">
          <p>
            <Link to="/forgot-password" style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none', fontSize: '0.85rem' }}>
              Forgot password?
            </Link>
          </p>
          <p style={{ marginTop: 6 }}>Do not have an account? <span>Contact Admin</span></p>
          <p style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #f1f5f9', fontSize: '0.82rem', color: '#94a3b8' }}>
            Customer?{' '}
            <Link to="/customer/login" style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>
              Sign in to Customer Portal →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
