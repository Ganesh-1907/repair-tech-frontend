import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Key, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { apiClient } from '../../services/apiClient';

const CustomerForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = Request OTP, 2 = Verify OTP & Reset
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [demoOtp, setDemoOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [focusField, setFocusField] = useState('');

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await apiClient.post('/auth/customer/forgot-password', {
        email: email.trim().toLowerCase(),
      });
      if (data.success) {
        setDemoOtp(data.otp);
        setStep(2);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to request OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await apiClient.post('/auth/customer/reset-password-otp', {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        newPassword,
      });
      if (data.success) {
        setSuccess(true);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Password reset failed. Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #ede9fe 0%, #f8fafc 60%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 8px 32px rgba(79,70,229,0.10)', padding: '40px 36px', width: '100%', maxWidth: 420 }}>
        
        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle size={28} color="#15803d" />
            </div>
            <h1 style={{ margin: '0 0 10px', fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>Success!</h1>
            <p style={{ margin: '0 0 24px', color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Your password has been successfully reset. You can now log in to the portal with your new credentials.
            </p>
            <Link to="/customer/login" style={{
              display: 'block', width: '100%', height: 48, background: '#4f46e5', color: '#fff',
              borderRadius: 14, fontSize: '0.95rem', fontWeight: 700, textDecoration: 'none',
              lineHeight: '48px', transition: 'background .15s'
            }}>
              Go to Login
            </Link>
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ width: 52, height: 52, background: '#ede9fe', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                {step === 1 ? <Mail size={26} color="#4f46e5" /> : <Key size={26} color="#4f46e5" />}
              </div>
              <h1 style={{ margin: '0 0 6px', fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                {step === 1 ? 'Forgot Password' : 'Reset Password'}
              </h1>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem' }}>
                {step === 1 ? 'Enter your portal email to request an OTP code.' : 'Enter the OTP code and your new password.'}
              </p>
            </div>

            {error && (
              <div style={{ background: '#fee2e2', color: '#991b1b', borderRadius: 10, padding: '10px 14px', fontSize: '0.85rem', marginBottom: 16 }}>
                {error}
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleRequestOtp}>
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
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusField('email')}
                      onBlur={() => setFocusField('')}
                      required
                      style={{
                        width: '100%', height: 48, padding: '0 14px 0 44px',
                        border: `1.5px solid ${focusField === 'email' ? '#4f46e5' : '#e2e8f0'}`, borderRadius: 14,
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
                  {loading ? 'Requesting OTP...' : 'Send OTP Code'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword}>
                {demoOtp && (
                  <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: '12px 14px', fontSize: '0.85rem', color: '#1e40af', marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontWeight: 700 }}>Demo Code Sent:</span>
                    <span>Your OTP is: <strong style={{ fontSize: '1.05rem', color: '#2563eb' }}>{demoOtp}</strong></span>
                  </div>
                )}

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    OTP Code
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
                      <Key size={17} />
                    </span>
                    <input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      onFocus={() => setFocusField('otp')}
                      onBlur={() => setFocusField('')}
                      required
                      style={{
                        width: '100%', height: 48, padding: '0 14px 0 44px',
                        border: `1.5px solid ${focusField === 'otp' ? '#4f46e5' : '#e2e8f0'}`, borderRadius: 14,
                        fontSize: '0.93rem', color: '#0f172a', background: '#fff', outline: 'none',
                        fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color .15s',
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    New Password
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
                      <Lock size={17} />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      onFocus={() => setFocusField('password')}
                      onBlur={() => setFocusField('')}
                      required
                      style={{
                        width: '100%', height: 48, padding: '0 44px 0 44px',
                        border: `1.5px solid ${focusField === 'password' ? '#4f46e5' : '#e2e8f0'}`, borderRadius: 14,
                        fontSize: '0.93rem', color: '#0f172a', background: '#fff', outline: 'none',
                        fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color .15s',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: 14, background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    Confirm New Password
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
                      <Lock size={17} />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onFocus={() => setFocusField('confirmPassword')}
                      onBlur={() => setFocusField('')}
                      required
                      style={{
                        width: '100%', height: 48, padding: '0 44px 0 44px',
                        border: `1.5px solid ${focusField === 'confirmPassword' ? '#4f46e5' : '#e2e8f0'}`, borderRadius: 14,
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
                  {loading ? 'Resetting Password...' : 'Reset Password'}
                </button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{
                    width: '100%', height: 36, background: 'none', color: '#64748b',
                    border: 'none', marginTop: 10, fontSize: '0.88rem', fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Change Email / Request New OTP
                </button>
              </form>
            )}
          </>
        )}

        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <Link to="/customer/login" style={{ color: '#4f46e5', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <ArrowLeft size={14} /> Back to Customer Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CustomerForgotPassword;
