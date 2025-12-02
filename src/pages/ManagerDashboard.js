import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { reportsAPI } from '../services/api';
import './ManagerDashboard.css';

function ManagerDashboard() {
    const [statistics, setStatistics] = useState(null);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchStatistics = useCallback(async () => {
        try {
            const response = await reportsAPI.getStatistics();
            setStatistics(response.data.data);
        } catch (error) {
            console.error('Error fetching statistics:', error);
        }
    }, []);

    const fetchReports = useCallback(async () => {
        setLoading(true);
        try {
            const params = filter !== 'ALL' ? { status: filter } : {};
            const response = await reportsAPI.getAllReports(params);
            setReports(response.data.data.reports);
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchStatistics();
    }, [fetchStatistics]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const handleUpdateStatus = async (reportId, newStatus) => {
        try {
            await reportsAPI.updateReportStatus(reportId, newStatus, '');
            alert(`Report berhasil di${newStatus === 'VERIFIED' ? 'verifikasi' : 'tolak'}`);
            fetchReports();
            fetchStatistics();
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Gagal mengupdate status');
        }
    };

    const formatCurrency = (amount) => {
        // Format dalam jutaan atau ribuan untuk lebih compact
        if (amount >= 1000000) {
            return 'Rp ' + (amount / 1000000).toFixed(1) + 'M';
        } else if (amount >= 1000) {
            return 'Rp ' + (amount / 1000).toFixed(0) + 'K';
        }
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
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

    // Filter reports berdasarkan search term
    const filteredReports = reports.filter(report => {
        const searchLower = searchTerm.toLowerCase();
        return (
            report.host_full_name.toLowerCase().includes(searchLower) ||
            report.host_username.toLowerCase().includes(searchLower)
        );
    });

    // Hitung analytics per host
    const hostAnalytics = () => {
        const hostMap = {};
        
        reports.forEach(report => {
            const hostId = report.host_username;
            if (!hostMap[hostId]) {
                hostMap[hostId] = {
                    name: report.host_full_name,
                    username: report.host_username,
                    totalReports: 0,
                    verifiedReports: 0,
                    totalGMV: 0
                };
            }
            
            hostMap[hostId].totalReports++;
            if (report.status === 'VERIFIED') {
                hostMap[hostId].verifiedReports++;
                hostMap[hostId].totalGMV += parseFloat(report.reported_gmv);
            }
        });
        
        return Object.values(hostMap).sort((a, b) => b.totalGMV - a.totalGMV);
    };

    return (
        <div className="dashboard">
            <Navbar />
            
            <div className="dashboard-container">
                <h1>Manager Dashboard</h1>
                <p>Manage and review live session reports</p>

                {statistics && (
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-info">
                                <h3>{statistics.total_reports}</h3>
                                <p>Total Reports</p>
                            </div>
                        </div>

                        <div className="stat-card pending">
                            <div className="stat-info">
                                <h3>{statistics.pending_reports}</h3>
                                <p>Pending</p>
                            </div>
                        </div>

                        <div className="stat-card verified">
                            <div className="stat-info">
                                <h3>{statistics.verified_reports}</h3>
                                <p>Verified</p>
                            </div>
                        </div>

                        <div className="stat-card rejected">
                            <div className="stat-info">
                                <h3>{statistics.rejected_reports}</h3>
                                <p>Rejected</p>
                            </div>
                        </div>

                        <div className="stat-card total-gmv">
                            <div className="stat-info">
                                <h3>{formatCurrency(statistics.total_verified_gmv)}</h3>
                                <p>Total GMV</p>
                            </div>
                        </div>

                        <div className="stat-card avg-gmv">
                            <div className="stat-info">
                                <h3>{formatCurrency(statistics.avg_verified_gmv)}</h3>
                                <p>Average GMV</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="filter-section">
                    <h2>Session Reports</h2>
                    <div className="filter-controls">
                        <div className="search-box">
                            <input
                                type="text"
                                placeholder="Search host name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="filter-buttons">
                            <button 
                                className={filter === 'ALL' ? 'active' : ''} 
                                onClick={() => setFilter('ALL')}
                            >
                                All
                            </button>
                            <button 
                                className={filter === 'PENDING' ? 'active' : ''} 
                                onClick={() => setFilter('PENDING')}
                            >
                                Pending
                            </button>
                            <button 
                                className={filter === 'VERIFIED' ? 'active' : ''} 
                                onClick={() => setFilter('VERIFIED')}
                            >
                                Verified
                            </button>
                            <button 
                                className={filter === 'REJECTED' ? 'active' : ''} 
                                onClick={() => setFilter('REJECTED')}
                            >
                                Rejected
                            </button>
                        </div>
                    </div>
                </div>

                {/* Host Analytics */}
                {!loading && reports.length > 0 && (
                    <div className="host-analytics">
                        <h3>Host Performance</h3>
                        <div className="host-list">
                            {hostAnalytics().map(host => (
                                <div key={host.username} className="host-item">
                                    <div>
                                        <div className="host-name">{host.name}</div>
                                        <small style={{ color: '#95a5a6', fontSize: '12px' }}>@{host.username}</small>
                                    </div>
                                    <div className="host-stat">
                                        <span className="host-stat-label">Total Reports</span>
                                        <span className="host-stat-value">{host.totalReports}</span>
                                    </div>
                                    <div className="host-stat">
                                        <span className="host-stat-label">Verified</span>
                                        <span className="host-stat-value">{host.verifiedReports}</span>
                                    </div>
                                    <div className="host-stat">
                                        <span className="host-stat-label">Total GMV</span>
                                        <span className="host-stat-value">{formatCurrency(host.totalGMV)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="loading">Loading reports...</div>
                ) : (
                    <div className="table-container">
                        <table className="reports-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Host</th>
                                    <th>GMV</th>
                                    <th>Durasi</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredReports.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center' }}>
                                            {searchTerm ? 'No reports found for this search' : 'No reports available'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredReports.map(report => (
                                        <tr key={report.id}>
                                            <td>#{report.id}</td>
                                            <td>
                                                <div className="host-info">
                                                    <strong>{report.host_full_name}</strong>
                                                    <small>@{report.host_username}</small>
                                                </div>
                                            </td>
                                            <td><strong>{formatCurrency(report.reported_gmv)}</strong></td>
                                            <td>
                                                <span style={{ 
                                                    color: report.live_duration ? '#2c3e50' : '#95a5a6',
                                                    fontWeight: report.live_duration ? '500' : 'normal',
                                                    fontSize: '13px'
                                                }}>
                                                    ⏱️ {report.live_duration || 'N/A'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${report.status.toLowerCase()}`}>
                                                    {report.status}
                                                </span>
                                            </td>
                                            <td>{formatDate(report.created_at)}</td>
                                            <td>
                                                {report.status === 'PENDING' ? (
                                                    <div className="action-buttons">
                                                        <button 
                                                            className="btn-verify"
                                                            onClick={() => handleUpdateStatus(report.id, 'VERIFIED')}
                                                        >
                                                            Verify
                                                        </button>
                                                        <button 
                                                            className="btn-reject"
                                                            onClick={() => handleUpdateStatus(report.id, 'REJECTED')}
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span style={{ color: '#999' }}>-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ManagerDashboard;