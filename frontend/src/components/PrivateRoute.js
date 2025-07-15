// frontend/src/components/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { token } = useAuth();
  // Agar token hai, toh children (protected component) render karo,
  // warna /login par redirect kar do.
  return token ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;