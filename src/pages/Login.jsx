import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ChevronRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    navigate(result.user?.role === 'staff' ? '/admin/staff-portal' : '/');
  };

  return (
    <div className="login-page">
      <div className="login-card card">
        <div className="login-header">
          <div className="logo-icon">R</div>
          <h1>RepairTech</h1>
          <p>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error ? <div className="login-error-alert">{error}</div> : null}
          <div className="form-group">
            <label htmlFor="login-email">Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} />
              <input
                id="login-email"
                type="email"
                placeholder="ganesh.bora@gmail.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <div className="input-with-icon">
              <Lock size={18} />
              <input
                id="login-password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Signing In...' : 'Sign In'}
            <ChevronRight size={18} />
          </button>
        </form>

        <div className="login-footer">
          <p>Do not have an account? <span>Contact Admin</span></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
