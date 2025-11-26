import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import './LoginPage.css';

function LoginPage() {
    const [telegramUserId, setTelegramUserId] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        // Validasi input
        if (!telegramUserId || !username) {
            setError('Telegram User ID dan Username wajib diisi');
            return;
        }

        setLoading(true);

        // Call login API
        const result = await login(telegramUserId, username);

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
                <h1>🔐 Live Session Reporting</h1>
                <p className="subtitle">Silakan login untuk melanjutkan</p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Telegram User ID</label>
                        <input
                            type="text"
                            placeholder="Contoh: 123456789"
                            value={telegramUserId}
                            onChange={(e) => setTelegramUserId(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            placeholder="Contoh: john_doe"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    {error && (
                        <div className="error-message">
                            ⚠️ {error}
                        </div>
                    )}

                    <button type="submit" disabled={loading}>
                        {loading ? 'Loading...' : 'Login'}
                    </button>
                </form>

                <div className="login-info">
                    <p>💡 <strong>Demo Accounts:</strong></p>
                    <p>Manager: <code>123456789</code></p>
                    <p>Host: <code>987654321</code></p>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;