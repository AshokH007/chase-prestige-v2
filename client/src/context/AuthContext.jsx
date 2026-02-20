import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Dynamic API URL for production vs development
    const rawApiUrl = import.meta.env.VITE_API_URL || '';
    let API_BASE = rawApiUrl;

    if (rawApiUrl && !rawApiUrl.startsWith('http')) {
        API_BASE = `https://${rawApiUrl}`;
        // If it's the internal Render host, append the TLD
        if (!rawApiUrl.includes('.')) {
            API_BASE += '.onrender.com';
        }
    }

    useEffect(() => {
        console.log('🏦 BankSim API Entry Point:', API_BASE);
        try {
            const storedUser = sessionStorage.getItem('banking_user');
            const token = sessionStorage.getItem('banking_token');
            if (storedUser && token && storedUser !== 'undefined') {
                setUser(JSON.parse(storedUser));
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            }
        } catch (err) {
            console.error('Core Hydration Failure', err);
            sessionStorage.clear();
        } finally {
            setIsLoading(false);
        }
    }, []);

    const login = async (identifier, password) => {
        setError(null);
        try {
            const response = await axios.post(`${API_BASE}/api/auth/login`, { identifier, password });
            const { token, user } = response.data;

            sessionStorage.setItem('banking_token', token);
            sessionStorage.setItem('banking_user', JSON.stringify(user));
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            setUser(user);
            return true;
        } catch (err) {
            console.group('🏦 Authentication Failure Diagnostic');
            console.error('Target URL:', `${API_BASE}/api/auth/login`);
            console.error('Status:', err.response?.status);
            console.error('Data:', err.response?.data);
            console.error('Network Error:', err.message);
            console.groupEnd();

            setError(err.response?.data?.message || 'Authentication service failure');
            return false;
        }
    };

    const logout = async () => {
        try {
            await axios.post(`${API_BASE}/api/auth/logout`);
        } catch (err) {
            console.error('Logout revocation failed');
        } finally {
            sessionStorage.removeItem('banking_token');
            sessionStorage.removeItem('banking_user');
            delete axios.defaults.headers.common['Authorization'];
            setUser(null);
            window.location.href = '/login';
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading, error, API_BASE }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
