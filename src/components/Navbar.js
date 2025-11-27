import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { usersAPI } from '../services/api';
import './Navbar.css';

function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [pendingCount, setPendingCount] = useState(0);

    // Fetch pending users count (only for Manager)
    useEffect(() => {
        if (user?.role === 'MANAGER') {
            fetchPendingCount();
            
            // Refresh count every 30 seconds
            const interval = setInterval(fetchPendingCount, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const fetchPendingCount = async () => {
        try {
            const response = await usersAPI.getPendingUsers();
            setPendingCount(response.data.total);
        } catch (error) {
            console.error('Error fetching pending count:', error);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-left">
                    <div className="navbar-logo">
                        <h2>Live Session Reporting</h2>
                    </div>
                    
                    {/* Navigation Links - Only show for Manager */}
                    {user?.role === 'MANAGER' && (
                        <div className="navbar-links">
                            <NavLink 
                                to="/manager" 
                                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                            >
                                Dashboard
                            </NavLink>
                            
                            <NavLink 
                                to="/hosts" 
                                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                            >
                                Hosts
                            </NavLink>
                            
                            <NavLink 
                                to="/users" 
                                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                                style={{ position: 'relative' }}
                            >
                                Pending Users
                                {pendingCount > 0 && (
                                    <span className="pending-badge">{pendingCount}</span>
                                )}
                            </NavLink>
                        </div>
                    )}
                </div>
                
                <div className="navbar-right">
                    <div className="user-info">
                        <span className="user-name">{user?.full_name || user?.username}</span>
                        <span className="user-role">{user?.role}</span>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;