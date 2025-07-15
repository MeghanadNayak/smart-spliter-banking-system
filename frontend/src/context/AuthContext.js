// frontend/src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [user, setUser] = useState(null); // User details yahan store honge
    const [isLoggedIn, setIsLoggedIn] = useState(!!token); // Token hai toh logged in

    // Axios ko interceptor se configure karna
    // Har outgoing request mein Authorization header add karna
    axios.interceptors.request.use(
        (config) => {
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // Jab token badle, toh login status update karo
    useEffect(() => {
        setIsLoggedIn(!!token);
        if (token) {
            // Future mein yahan user details fetch kar sakte hain
            // Example: getUserDetails(token).then(data => setUser(data));
        } else {
            setUser(null);
        }
    }, [token]);

    // Login function
    const login = (newToken) => {
        setToken(newToken);
        localStorage.setItem('token', newToken);
        // navigate('/dashboard'); // Navigation yahan se hata diya hai, AuthPage se hi hoga
    };

    // Logout function
    const logout = () => {
        setToken(null);
        localStorage.removeItem('token');
        setUser(null);
        // navigate('/auth'); // Logout ke baad AuthPage par navigate kar sakte hain
    };

    return (
        <AuthContext.Provider value={{ token, user, isLoggedIn, login, logout, setToken }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};