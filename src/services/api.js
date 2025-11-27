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
    login: (telegram_user_id, username) => {
        return api.post('/auth/login', { telegram_user_id, username });
    },
    getCurrentUser: () => {
        return api.get('/auth/me');
    }
};

// Reports API
export const reportsAPI = {
    getAllReports: (params) => {
        return api.get('/reports', { params });
    },
    getStatistics: () => {
        return api.get('/reports/statistics');
    },
    getMyReports: (params) => {
        return api.get('/reports/my-reports', { params });
    },
    getReportById: (id) => {
        return api.get(`/reports/${id}`);
    },
    updateReportStatus: (id, status, notes) => {
        return api.put(`/reports/${id}/status`, { status, notes });
    }
};

// Users API
export const usersAPI = {
    getPendingUsers: () => {
        return api.get('/users/pending');
    },
    approveUser: (userId) => {
        return api.put(`/users/${userId}/approve`);
    },
    rejectUser: (userId) => {
        return api.delete(`/users/${userId}/reject`);
    }
};

// ✅ NEW: Hosts API (Full CRUD)
export const hostsAPI = {
    // Get all hosts with optional filters
    getAllHosts: (params) => {
        return api.get('/hosts', { params });
    },
    
    // Get host by ID
    getHostById: (id) => {
        return api.get(`/hosts/${id}`);
    },
    
    // Create new host
    createHost: (hostData) => {
        return api.post('/hosts', hostData);
    },
    
    // Update host
    updateHost: (id, hostData) => {
        return api.put(`/hosts/${id}`, hostData);
    },
    
    // Delete host
    deleteHost: (id) => {
        return api.delete(`/hosts/${id}`);
    },
    
    // Toggle host active status
    toggleHostStatus: (id) => {
        return api.patch(`/hosts/${id}/toggle-status`);
    }
};

export default api;