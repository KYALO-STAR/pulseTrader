import React, { useState } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import './admin-login.scss';

const AdminLogin: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAdminAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Please enter the admin key');
      return;
    }

    if (login(password)) {
      // Successfully logged in - page will redirect via AdminApp component
    } else {
      setError('Invalid admin key');
      setPassword('');
    }
  };

  return (
    <div className="admin-login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>PulseTrader Admin</h1>
          <p>Secure Access Required</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="password">Admin Key</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin key"
                className="password-input"
                autoFocus
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-btn">
            Access Admin Panel
          </button>
        </form>

        <div className="login-footer">
          <p>This is a secure admin area. Only authorized personnel should access.</p>
        </div>
      </div>

      <div className="background-accent"></div>
    </div>
  );
};

export default AdminLogin;
