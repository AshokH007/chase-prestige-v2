import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL || '';
let API_BASE = rawApiUrl;

if (rawApiUrl && !rawApiUrl.startsWith('http')) {
    API_BASE = `https://${rawApiUrl}`;
    if (!rawApiUrl.includes('.')) {
        API_BASE += '.onrender.com';
    }
}

const api = axios.create({
    baseURL: API_BASE ? `${API_BASE}/api` : '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('banking_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token expired or invalid
            sessionStorage.removeItem('banking_token');
            // Ideally redirect to login or update context, but context will handle state sync
            // We can emit an event or just let the UI react to failed calls
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
