const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'token': `Bearer ${token}` })
    };
};

export const api = {
    // Auth endpoints
    login: async (credentials) => {
        const response = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Login failed');
        return data;
    },

    register: async (userData) => {
        const response = await fetch(`${BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Registration failed');
        return data;
    },

    // Business endpoints
    getBusinesses: async (params) => {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${BASE_URL}/api/businesses?${query}`, {
            method: 'GET',
            headers: getHeaders(),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch businesses');
        return data;
    },

    addBusiness: async (businessData) => {
        const response = await fetch(`${BASE_URL}/api/businesses`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(businessData),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to add business');
        return data;
    },

    importBusinesses: async (businesses) => {
        const response = await fetch(`${BASE_URL}/api/businesses/import`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(businesses),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to import businesses');
        return data;
    },

    updateBusiness: async (id, businessData) => {
        const response = await fetch(`${BASE_URL}/api/businesses/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(businessData),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to update business');
        return data;
    },

    deleteBusiness: async (id) => {
        const response = await fetch(`${BASE_URL}/api/businesses/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to delete business');
        return data;
    },

    // Staff/User endpoints
    getStaff: async () => {
        const response = await fetch(`${BASE_URL}/api/users`, {
            method: 'GET',
            headers: getHeaders(),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch staff');
        return data;
    },

    assignBusinesses: async (payload) => {
        const response = await fetch(`${BASE_URL}/api/businesses/assign`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to assign businesses');
        return data;
    }
};
