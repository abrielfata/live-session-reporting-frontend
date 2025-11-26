import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { reportsAPI } from '../services/api';
import './HostDashboard.css';

function HostDashboard() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        fetchMyReports();
    }, [filter]);

    const fetchMyReports = async () => {
        setLoading(true);
        try {
            const params = filter !== 'ALL' ? { status: filter } : {};
            const response = await reportsAPI.getMyReports(params);
            setReports(response.data.data.reports);
        } catch (error) {
            console.error('Error fetching my reports:', error);
        } finally {
            setLoading(false);
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

    // Calculate statistics from reports
    const stats = {
        total: reports.length,
        pending: reports.filter(r => r.status === 'PENDING').length,
        verified: reports.filter(r => r.status === 'VERIFIED').length,
        rejected: reports.filter(r => r.status === 'REJECTED').length,
        totalGMV: reports
            .filter(r => r.status === 'VERIFIED')
            .reduce((sum, r) => sum + parseFloat(r.reported_gmv), 0)
    };

    return (
        <div className="dashboard">
            <Navbar />
            
            <div className="dashboard-container">
                <h1>📱 Host Dashboard</h1>
                <p className="subtitle">Laporan Live Session Anda</p>

                {/* Statistics Cards */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">📄</div>
                        <div className="stat-info">
                            <h3>{stats.total}</h3>
                            <p>Total Laporan</p>
                        </div>
                    </div>

                    <div className="stat-card pending">
                        <div className="stat-icon">⏳</div>
                        <div className="stat-info">
                            <h3>{stats.pending}</h3>
                            <p>Pending</p>
                        </div>
                    </div>

                    <div className="stat-card verified">
                        <div className="stat-icon">✅</div>
                        <div className="stat-info">
                            <h3>{stats.verified}</h3>
                            <p>Verified</p>
                        </div>
                    </div>

                    <div className="stat-card rejected">
                        <div className="stat-icon">❌</div>
                        <div className="stat-info">
                            <h3>{stats.rejected}</h3>
                            <p>Rejected</p>
                        </div>
                    </div>

                    <div className="stat-card total-gmv">
                        <div className="stat-icon">💰</div>
                        <div className="stat-info">
                            <h3>{formatCurrency(stats.totalGMV)}</h3>
                            <p>Total Verified GMV</p>
                        </div>
                    </div>
                </div>

                {/* Filter Buttons */}
                <div className="filter-section">
                    <h2>Daftar Laporan</h2>
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

                {/* Reports List */}
                {loading ? (
                    <div className="loading">Loading reports...</div>
                ) : (
                    <div className="reports-list">
                        {reports.length === 0 ? (
                            <div className="empty-state">
                                <p>📭 Belum ada laporan</p>
                                <small>Kirim screenshot GMV Anda melalui Telegram Bot</small>
                            </div>
                        ) : (
                            reports.map(report => (
                                <div key={report.id} className="report-card">
                                    <div className="report-header">
                                        <div>
                                            <h3>Report #{report.id}</h3>
                                            <p className="report-date">{formatDate(report.created_at)}</p>
                                        </div>
                                        <span className={`status-badge ${report.status.toLowerCase()}`}>
                                            {report.status}
                                        </span>
                                    </div>
                                    
                                    <div className="report-body">
                                        <div className="report-info">
                                            <div className="info-item">
                                                <span className="info-label">GMV:</span>
                                                <span className="info-value">{formatCurrency(report.reported_gmv)}</span>
                                            </div>
                                            {report.notes && (
                                                <div className="info-item">
                                                    <span className="info-label">Notes:</span>
                                                    <span className="info-value">{report.notes}</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {report.screenshot_url && (
                                            <a 
                                                href={report.screenshot_url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="view-screenshot"
                                            >
                                                📷 View Screenshot
                                            </a>
                                        )}
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

export default HostDashboard;