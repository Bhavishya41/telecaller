import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BACKEND_URL;
// Analytics microservice endpoint (Port 5000)
const ANALYTICS_URL = import.meta.env.VITE_ANALYTICS_URL || 'http://localhost:5000';

export const analyticsApi = {
    getMetrics: (leads) => axios.post(`${ANALYTICS_URL}/api/analytics/metrics`, leads).then((res) => res.data),
};

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Injects token into headers
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.token = `Bearer ${token}`;
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Unwraps response data & handles 401 redirects
axiosInstance.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/auth';
        }
        const message = error.response?.data?.message || error.message || 'Request failed';
        return Promise.reject(new Error(message));
    }
);

export const api = {
    // Auth endpoints
    login: (credentials) => axiosInstance.post('/auth/login', credentials),
    register: (userData) => axiosInstance.post('/auth/register', userData),

    // Business endpoints
    getBusinesses: (params) => axiosInstance.get('/businesses', { params }),
    getBusinessById: (id) => axiosInstance.get(`/businesses/${id}`),
    addBusiness: (businessData) => axiosInstance.post('/businesses', businessData),
    importBusinesses: (businesses) => axiosInstance.post('/businesses/import', businesses),
    updateBusiness: (id, businessData) => axiosInstance.put(`/businesses/${id}`, businessData),
    deleteBusiness: (id) => axiosInstance.delete(`/businesses/${id}`),

    // Staff/User endpoints
    getStaff: () => axiosInstance.get('/users'),
    assignBusinesses: (payload) => axiosInstance.put('/businesses/assign', payload),
};

export default api;