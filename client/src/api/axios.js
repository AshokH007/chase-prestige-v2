import axios from 'axios';

const api = axios.create({
    baseURL: '/api', // Proxy will handle this in Vite
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('token');
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
            sessionStorage.removeItem('token');
            // Ideally redirect to login or update context, but context will handle state sync
            // We can emit an event or just let the UI react to failed calls
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
