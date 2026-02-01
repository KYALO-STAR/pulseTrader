import React, { useState } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import './admin-login.scss';

const AdminLogin: React.FC = () => {
    const [email, setEmail] = useState(''); // New state for email
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login, loading: authLoading } = useAdminAuth(); // Use authLoading from context

    const handleSubmit = async (e: React.FormEvent) => {
        // Make handleSubmit async
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Please enter both email and password.');
            return;
        }

        // login now returns a Promise<boolean>
        const success = await login(email, password);

        if (!success) {
            setError('Invalid email or password.');
            setPassword('');
        }
        // No need to setLoading(false) here, as authLoading from context handles it
    };

    return (
        <div className='admin-login-container'>
            <div className='login-card'>
                <div className='login-header'>
                    <h1>PulseTrader Admin</h1>
                    <p>Secure Access Required</p>
                </div>

                <form onSubmit={handleSubmit} className='login-form'>
                    <div className='form-group'>
                        <label htmlFor='email'>Email</label>
                        <input
                            type='email'
                            id='email'
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder='Enter admin email'
                            className='input-field' // Use input-field class from admin-panel.scss
                            autoFocus
                        />
                    </div>
                    <div className='form-group'>
                        <label htmlFor='password'>Password</label>
                        <div className='password-input-wrapper'>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id='password'
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder='Enter admin password'
                                className='input-field password-input' // Use input-field class
                            />
                            <button
                                type='button'
                                className='toggle-password'
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                    </div>

                    {error && <div className='error-message'>{error}</div>}

                    <button type='submit' className='login-btn' disabled={authLoading}>
                        {authLoading ? 'Authenticating...' : 'Access Admin Panel'}
                    </button>
                </form>

                <div className='login-footer'>
                    <p>This is a secure admin area. Only authorized personnel should access.</p>
                </div>
            </div>

            <div className='background-accent'></div>
        </div>
    );
};

export default AdminLogin;
