import React, { useState, useEffect, useCallback } from 'react';
import { reportsAPI } from '../services/api';
import './ManagerDashboard.css';

function ManagerDashboard() {
    const [statistics, setStatistics] = useState(null);
    const [reports, setReports] = useState([]);
    const [hostStats, setHostStats] = useState([]);
    const [availableMonths, setAvailableMonths] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Month filter state
    const [selectedMonth, setSelectedMonth] = useState('current');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // Fetch available months for dropdown
    const fetchAvailableMonths = useCallback(async () => {
        try {
            const response = await reportsAPI.getAvailableMonths();
            setAvailableMonths(response.data.data);
        } catch (error) {
            console.error('Error fetching available months:', error);
        }
    }, []);

    // Fetch statistics with month filter
    const fetchStatistics = useCallback(async () => {
        try {
            const params = {};
            if (selectedMonth !== 'all') {
                if (selectedMonth === 'current') {
                    params.month = new Date().getMonth() + 1;
                    params.year = new Date().getFullYear();
                } else {
                    params.month = parseInt(selectedMonth);
                    params.year = selectedYear;
                }
            }
            
            const response = await reportsAPI.getStatistics(params);
            setStatistics(response.data.data);
        } catch (error) {
            console.error('Error fetching statistics:', error);
        }
    }, [selectedMonth, selectedYear]);

    // Fetch host statistics with live hours
    const fetchHostStatistics = useCallback(async () => {
        try {
            const params = {};
            if (selectedMonth !== 'all') {
                if (selectedMonth === 'current') {
                    params.month = new Date().getMonth() + 1;
                    params.year = new Date().getFullYear();
                } else {
                    params.month = parseInt(selectedMonth);
                    params.year = selectedYear;
                }
            }
            
            const response = await reportsAPI.getMonthlyHostStatistics(params);
            setHostStats(response.data.data);
        } catch (error) {
            console.error('Error fetching host statistics:', error);
        }
    }, [selectedMonth, selectedYear]);

    // Fetch reports with month filter
    const fetchReports = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (filter !== 'ALL') params.status = filter;
            
            if (selectedMonth !== 'all') {
                if (selectedMonth === 'current') {
                    params.month = new Date().getMonth() + 1;
                    params.year = new Date().getFullYear();
                } else {
                    params.month = parseInt(selectedMonth);
                    params.year = selectedYear;
                }
            }
            
            const response = await reportsAPI.getAllReports(params);
            setReports(response.data.data.reports);
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    }, [filter, selectedMonth, selectedYear]);

    useEffect(() => {
        fetchAvailableMonths();
    }, [fetchAvailableMonths]);

    useEffect(() => {
        fetchStatistics();
        fetchHostStatistics();
    }, [fetchStatistics, fetchHostStatistics]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const handleUpdateStatus = async (reportId, newStatus) => {
        try {
            await reportsAPI.updateReportStatus(reportId, newStatus, '');
            alert(`Report berhasil di${newStatus === 'VERIFIED' ? 'verifikasi' : 'tolak'}`);
            fetchReports();
            fetchStatistics();
            fetchHostStatistics();
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Gagal mengupdate status');
        }
    };

    const formatCurrency = (amount) => {
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

    const formatHours = (hours) => {
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);
        if (h === 0) return `${m} menit`;
        if (m === 0) return `${h} jam`;
        return `${h} jam ${m} menit`;
    };

    const getMonthDisplay = () => {
        if (selectedMonth === 'all') return 'All Time';
        if (selectedMonth === 'current') {
            const now = new Date();
            return now.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
        }
        const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                           'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        return `${monthNames[selectedMonth - 1]} ${selectedYear}`;
    };

    // Filter reports by search term
    const filteredReports = reports.filter(report => {
        const searchLower = searchTerm.toLowerCase();
        return (
            report.host_full_name.toLowerCase().includes(searchLower) ||
            report.host_username.toLowerCase().includes(searchLower)
        );
    });

    return (
        <div className="dashboard">            
            <div className="dashboard-container">
                <h1>Manager Dashboard</h1>
                <p>Manage and review live session reports</p>

                {/* Month Filter */}
                <div className="month-filter-section">
                    <div className="month-filter-label">
                        <strong>📅 Period:</strong> {getMonthDisplay()}
                    </div>
                    <select 
                        className="month-filter-select"
                        value={selectedMonth}
                        onChange={(e) => {
                            setSelectedMonth(e.target.value);
                            if (e.target.value !== 'current' && e.target.value !== 'all') {
                                // Extract year from available months if needed
                                const selected = availableMonths.find(m => m.month === parseInt(e.target.value));
                                if (selected) setSelectedYear(selected.year);
                            }
                        }}
                    >
                        <option value="current">Current Month</option>
                        <option value="all">All Time</option>
                        <optgroup label="History">
                            {availableMonths.map(month => (
                                <option key={`${month.year}-${month.month}`} value={month.month}>
                                    {month.display_name} ({month.report_count} reports)
                                </option>
                            ))}
                        </optgroup>
                    </select>
                </div>

                {/* Statistics Cards */}
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

                {/* Host Performance Analytics with Live Hours */}
                {!loading && hostStats.length > 0 && (
                    <div className="host-analytics">
                        <h3>Host Performance - {getMonthDisplay()}</h3>
                        <div className="host-list">
                            {hostStats.map(host => (
                                <div key={host.host_id} className="host-item-extended">
                                    <div className="host-name-section">
                                        <div className="host-name">{host.host_full_name}</div>
                                        <small style={{ color: '#95a5a6', fontSize: '12px' }}>
                                            @{host.host_username}
                                        </small>
                                    </div>
                                    <div className="host-stat">
                                        <span className="host-stat-label">Reports</span>
                                        <span className="host-stat-value">{host.total_reports}</span>
                                    </div>
                                    <div className="host-stat">
                                        <span className="host-stat-label">Verified</span>
                                        <span className="host-stat-value">{host.verified_reports}</span>
                                    </div>
                                    <div className="host-stat">
                                        <span className="host-stat-label">Total GMV</span>
                                        <span className="host-stat-value">{formatCurrency(host.total_gmv)}</span>
                                    </div>
                                    <div className="host-stat live-hours">
                                        <span className="host-stat-label">Live Hours</span>
                                        <span className="host-stat-value" style={{ color: '#656565ff' }}>
                                            {host.total_live_hours ? formatHours(parseFloat(host.total_live_hours)) : '0 jam'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Reports Table */}
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
                                            {searchTerm ? 'No reports found' : 'No reports available'}
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
                                                    color: report.live_duration ? '#c5c2bfff' : '#95a5a6',
                                                    fontWeight: report.live_duration ? '500' : 'normal',
                                                    fontSize: '13px'
                                                }}>
                                                    {report.live_duration || 'N/A'}
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