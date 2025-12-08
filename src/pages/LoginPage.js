import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import './LoginPage.css';

function LoginPage() {
    const [telegramUserId, setTelegramUserId] = useState('');
    const [password, setPassword] = useState(''); // ✅ CHANGED from username
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // ✅ NEW
    
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        // Validasi input
        if (!telegramUserId || !password) {
            setError('Telegram User ID dan Password wajib diisi');
            return;
        }

        setLoading(true);

        // Call login API
        const result = await login(telegramUserId, password);

        setLoading(false);

        if (result.success) {
            // Redirect based on role
            if (result.user.role === 'MANAGER') {
                navigate('/manager');
            } else if (result.user.role === 'HOST') {
                navigate('/host');
            }
        } else {
            setError(result.message || 'Login failed');
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h1>Live Session Reporting</h1>
                <p className="subtitle">Please sign in to continue</p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Telegram User ID</label>
                        <input
                            type="text"
                            placeholder="Example: 123456789"
                            value={telegramUserId}
                            onChange={(e) => setTelegramUserId(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    {/* ✅ CHANGED: Password field */}
                    <div className="form-group">
                        <label>Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                                style={{ paddingRight: '45px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '10px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    color: '#7f8c8d'
                                }}
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <button type="submit" disabled={loading}>
                        {loading ? 'Loading...' : 'Login'}
                    </button>
                </form>

                <div className="login-info">
                    <p><strong>How to Get User ID?</strong></p>
                    <p>1. Open Telegram Bot</p>
                    <p>2. Type <code>/start</code></p>
                    <p>3. Follow registration steps</p>
                    <p>4. Your User ID will be sent to you</p>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;