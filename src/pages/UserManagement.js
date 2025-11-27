import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { usersAPI } from '../services/api';
import './UserManagement.css';

function UserManagement() {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPendingUsers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await usersAPI.getPendingUsers();
            setPendingUsers(response.data.data);
        } catch (error) {
            console.error('Error fetching pending users:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPendingUsers();
    }, [fetchPendingUsers]);

    const handleApprove = async (userId, userName) => {
        if (!window.confirm(`Approve user "${userName}"?`)) {
            return;
        }

        try {
            await usersAPI.approveUser(userId);
            alert(`User "${userName}" has been approved!`);
            fetchPendingUsers(); // Refresh list
        } catch (error) {
            console.error('Error approving user:', error);
            alert('Failed to approve user');
        }
    };

    const handleReject = async (userId, userName) => {
        if (!window.confirm(`Reject and delete user "${userName}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await usersAPI.rejectUser(userId);
            alert(`User "${userName}" has been rejected and deleted.`);
            fetchPendingUsers(); // Refresh list
        } catch (error) {
            console.error('Error rejecting user:', error);
            alert('Failed to reject user');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="user-management">
            <Navbar />
            
            <div className="user-management-container">
                <h1>User Management</h1>
                <p>Review and approve new user registrations</p>

                <div className="section-header">
                    <h2>Pending Approvals</h2>
                    {pendingUsers.length > 0 && (
                        <span className="pending-count">
                            {pendingUsers.length} pending
                        </span>
                    )}
                </div>

                {loading ? (
                    <div className="loading">Loading pending users...</div>
                ) : (
                    <div className="users-grid">
                        {pendingUsers.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">✅</div>
                                <h3>All Caught Up!</h3>
                                <p>No pending user approvals at the moment.</p>
                            </div>
                        ) : (
                            pendingUsers.map(user => (
                                <div key={user.id} className="user-card">
                                    <div className="user-card-header">
                                        <div className="user-info">
                                            <h3>{user.full_name}</h3>
                                            <small>@{user.username}</small>
                                        </div>
                                        <span className="pending-badge">
                                            PENDING APPROVAL
                                        </span>
                                    </div>
                                    
                                    <div className="user-card-body">
                                        <div className="user-details">
                                            <div className="detail-item">
                                                <span className="detail-label">Telegram ID:</span>
                                                <span className="detail-value">{user.telegram_user_id}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Role:</span>
                                                <span className="detail-value">{user.role}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Registered:</span>
                                                <span className="detail-value">{formatDate(user.created_at)}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="user-actions">
                                            <button 
                                                className="btn-approve"
                                                onClick={() => handleApprove(user.id, user.full_name)}
                                            >
                                                ✓ Approve User
                                            </button>
                                            <button 
                                                className="btn-reject-user"
                                                onClick={() => handleReject(user.id, user.full_name)}
                                            >
                                                ✗ Reject User
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default UserManagement;