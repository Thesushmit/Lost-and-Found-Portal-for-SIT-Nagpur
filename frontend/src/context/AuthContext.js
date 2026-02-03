import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from "jwt-decode";
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Check if token is expired
                if (decoded.exp * 1000 < Date.now()) {
                    localStorage.removeItem('token');
                    setUser(null);
                } else {
                    // Fetch user details if needed, or just set basic info from token/localStorage
                    // For now, we'll try to fetch fresh user data from backend
                    api.get('/auth/me')
                        .then(res => setUser(res.data))
                        .catch(() => {
                            localStorage.removeItem('token');
                            setUser(null);
                        })
                        .finally(() => setLoading(false));
                    return; // Exit here to wait for api call
                }
            } catch (e) {
                localStorage.removeItem('token');
                setUser(null);
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        return res.data;
    };

    const signupStudent = async (data) => {
        const res = await api.post('/auth/signup/student', data);
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        return res.data;
    };

    const signupStaff = async (data) => {
        const res = await api.post('/auth/signup/staff', data);
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, signupStudent, signupStaff, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
