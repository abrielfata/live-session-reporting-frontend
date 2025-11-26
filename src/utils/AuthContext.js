import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check if user already logged in (token exists)
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Verify token dengan backend
            authAPI.getCurrentUser()
                .then(response => {
                    setUser(response.data.data);
                    setLoading(false);
                })
                .catch(error => {
                    console.error('Token invalid:', error);
                    localStorage.removeItem('token');
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (telegram_user_id, username) => {
        try {
            const response = await authAPI.login(telegram_user_id, username);
            const { token, user: userData } = response.data.data;
            
            // Save token to localStorage
            localStorage.setItem('token', token);
            
            // Set user state
            setUser(userData);
            
            return { success: true, user: userData };
        } catch (error) {
            console.error('Login error:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || 'Login failed' 
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook untuk menggunakan auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};