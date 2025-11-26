import axios from 'axios';

// Base URL Backend API
const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance dengan config default
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor: Tambahkan token ke setiap request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    // Login
    login: (telegram_user_id, username) => {
        return api.post('/auth/login', { telegram_user_id, username });
    },
    
    // Get current user info
    getCurrentUser: () => {
        return api.get('/auth/me');
    }
};

// Reports API
export const reportsAPI = {
    // Manager: Get all reports
    getAllReports: (params) => {
        return api.get('/reports', { params });
    },
    
    // Manager: Get statistics
    getStatistics: () => {
        return api.get('/reports/statistics');
    },
    
    // Host: Get my reports
    getMyReports: (params) => {
        return api.get('/reports/my-reports', { params });
    },
    
    // Get report by ID
    getReportById: (id) => {
        return api.get(`/reports/${id}`);
    },
    
    // Manager: Update report status
    updateReportStatus: (id, status, notes) => {
        return api.put(`/reports/${id}/status`, { status, notes });
    }
};

export default api;