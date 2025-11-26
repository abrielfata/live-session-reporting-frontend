import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { reportsAPI } from '../services/api';
import './ManagerDashboard.css';

function ManagerDashboard() {
    const [statistics, setStatistics] = useState(null);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL'); // ALL, PENDING, VERIFIED, REJECTED

    // Fetch statistics
    useEffect(() => {
        fetchStatistics();
    }, []);

    // Fetch reports based on filter
    useEffect(() => {
        fetchReports();
    }, [filter]);

    const fetchStatistics = async () => {
        try {
            const response = await reportsAPI.getStatistics();
            setStatistics(response.data.data);
        } catch (error) {
            console.error('Error fetching statistics:', error);
        }
    };

    const fetchReports = async () => {
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
    };

    const handleUpdateStatus = async (reportId, newStatus) => {
        try {
            await reportsAPI.updateReportStatus(reportId, newStatus, '');
            alert(`Report berhasil di${newStatus === 'VERIFIED' ? 'verifikasi' : 'tolak'}`);
            fetchReports(); // Refresh data
            fetchStatistics(); // Refresh statistics
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Gagal mengupdate status');
        }
    };

    const formatCurrency = (amount) => {
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

    return (
        <div className="dashboard">
            <Navbar />
            
            <div className="dashboard-container">
                <h1>📊 Manager Dashboard</h1>

                {/* Statistics Cards */}
                {statistics && (
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon">📄</div>
                            <div className="stat-info">
                                <h3>{statistics.total_reports}</h3>
                                <p>Total Reports</p>
                            </div>
                        </div>

                        <div className="stat-card pending">
                            <div className="stat-icon">⏳</div>
                            <div className="stat-info">
                                <h3>{statistics.pending_reports}</h3>
                                <p>Pending</p>
                            </div>
                        </div>

                        <div className="stat-card verified">
                            <div className="stat-icon">✅</div>
                            <div className="stat-info">
                                <h3>{statistics.verified_reports}</h3>
                                <p>Verified</p>
                            </div>
                        </div>

                        <div className="stat-card rejected">
                            <div className="stat-icon">❌</div>
                            <div className="stat-info">
                                <h3>{statistics.rejected_reports}</h3>
                                <p>Rejected</p>
                            </div>
                        </div>

                        <div className="stat-card total-gmv">
                            <div className="stat-icon">💰</div>
                            <div className="stat-info">
                                <h3>{formatCurrency(statistics.total_verified_gmv)}</h3>
                                <p>Total Verified GMV</p>
                            </div>
                        </div>

                        <div className="stat-card avg-gmv">
                            <div className="stat-icon">📈</div>
                            <div className="stat-info">
                                <h3>{formatCurrency(statistics.avg_verified_gmv)}</h3>
                                <p>Average GMV</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filter Buttons */}
                <div className="filter-section">
                    <h2>Laporan Live Session</h2>
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

                {/* Reports Table */}
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
                                    <th>Status</th>
                                    <th>Tanggal</th>
                                    <th>Screenshot</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center' }}>
                                            Tidak ada laporan
                                        </td>
                                    </tr>
                                ) : (
                                    reports.map(report => (
                                        <tr key={report.id}>
                                            <td>#{report.id}</td>
                                            <td>
                                                <div>
                                                    <strong>{report.host_full_name}</strong>
                                                    <br />
                                                    <small>@{report.host_username}</small>
                                                </div>
                                            </td>
                                            <td><strong>{formatCurrency(report.reported_gmv)}</strong></td>
                                            <td>
                                                <span className={`status-badge ${report.status.toLowerCase()}`}>
                                                    {report.status}
                                                </span>
                                            </td>
                                            <td>{formatDate(report.created_at)}</td>
                                            <td>
                                                {report.screenshot_url ? (
                                                    <a 
                                                        href={report.screenshot_url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="view-link"
                                                    >
                                                        View
                                                    </a>
                                                ) : (
                                                    '-'
                                                )}
                                            </td>
                                            <td>
                                                {report.status === 'PENDING' && (
                                                    <div className="action-buttons">
                                                        <button 
                                                            className="btn-verify"
                                                            onClick={() => handleUpdateStatus(report.id, 'VERIFIED')}
                                                        >
                                                            ✓ Verify
                                                        </button>
                                                        <button 
                                                            className="btn-reject"
                                                            onClick={() => handleUpdateStatus(report.id, 'REJECTED')}
                                                        >
                                                            ✗ Reject
                                                        </button>
                                                    </div>
                                                )}
                                                {report.status !== 'PENDING' && (
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