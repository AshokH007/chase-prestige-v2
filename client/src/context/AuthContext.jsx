import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [sessionPin, setSessionPin] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // API_BASE is now handled inside the api instance
    const API_BASE = api.defaults.baseURL.replace('/api', '');

    useEffect(() => {
        console.log('🏦 BankSim API Entry Point:', API_BASE);
        try {
            const storedUser = sessionStorage.getItem('banking_user');
            const token = sessionStorage.getItem('banking_token');
            const storedPin = sessionStorage.getItem('banking_pin');
            if (storedUser && token && storedUser !== 'undefined') {
                setUser(JSON.parse(storedUser));
                setSessionPin(storedPin);

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
            const response = await api.post('/auth/login', { identifier, password });
            const { token, user, sessionPin: pin } = response.data;

            sessionStorage.setItem('banking_token', token);
            sessionStorage.setItem('banking_user', JSON.stringify(user));
            sessionStorage.setItem('banking_pin', pin);
            sessionStorage.setItem('banking_pin_ts', Date.now());


            setUser(user);
            setSessionPin(pin);
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
            await api.post('/auth/logout');
        } catch (err) {
            console.error('Logout revocation failed');
        } finally {
            sessionStorage.removeItem('banking_token');
            sessionStorage.removeItem('banking_user');
            sessionStorage.removeItem('banking_pin');

            setUser(null);
            setSessionPin(null);
            window.location.href = '/login';
        }
    };

    return (
        <AuthContext.Provider value={{ user, sessionPin, login, logout, isLoading, error, API_BASE }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
