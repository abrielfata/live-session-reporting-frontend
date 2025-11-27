import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from './utils/AuthContext';
import LoginPage from './pages/LoginPage';
import ManagerDashboard from './pages/ManagerDashboard';
import HostDashboard from './pages/HostDashboard';

import './App.css';

// Loading Component
function LoadingScreen() {
    return (
        <div className="loading-screen">
            <div className="loading-spinner"></div>
        </div>
    );
}

// 404 Component
function NotFound() {
    return (
        <div className="not-found">
            <h1>404</h1>
            <p>Halaman tidak ditemukan</p>
            <Link to="/">Kembali ke Dashboard</Link>
        </div>
    );
}

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }) {
    const { user, loading } = useAuth();

    if (loading) {
        return <LoadingScreen />;
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/login" />;
    }

    return children;
}

function App() {
    const { user, loading } = useAuth();

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <Router>
            <div className="App">
                <Routes>
                    {/* Route Default */}
                    <Route 
                        path="/" 
                        element={
                            user ? (
                                user.role === 'MANAGER' ? 
                                    <Navigate to="/manager" /> : 
                                    <Navigate to="/host" />
                            ) : (
                                <Navigate to="/login" />
                            )
                        } 
                    />
                    
                    {/* Route Login */}
                    <Route path="/login" element={<LoginPage />} />
                    
                    {/* Protected Route: Manager Dashboard */}
                    <Route 
                        path="/manager" 
                        element={
                            <ProtectedRoute allowedRoles={['MANAGER']}>
                                <ManagerDashboard />
                            </ProtectedRoute>
                        } 
                    />
                    
                    {/* Protected Route: Host Dashboard */}
                    <Route 
                        path="/host" 
                        element={
                            <ProtectedRoute allowedRoles={['HOST']}>
                                <HostDashboard />
                            </ProtectedRoute>
                        } 
                    />
                    
                    {/* Route 404 */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;