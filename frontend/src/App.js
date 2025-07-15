// frontend/src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext'; // AuthProvider aur useAuth import karo
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SchemesPage from './pages/SchemesPage';
import RulesPage from './pages/RulesPage';
import TransactionsPage from './pages/TransactionsPage';
import PrivateRoute from './components/PrivateRoute'; // PrivateRoute component banao
import axios from 'axios';
import HomePage from './pages/HomePage';


// Axios default settings (backend URL)
// Jab production mein deploy karoge, toh isko apne live backend URL se badal dena.
axios.defaults.baseURL = 'http://localhost:5000';

// Navbar Component (authentication state ke hisab se links dikhayega)
const Navbar = () => {
  const { token, logout } = useAuth();

  return (
    <nav style={{ padding: '15px 20px', backgroundColor: '#333', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ fontSize: '1.5em', fontWeight: 'bold' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Smart Savings</Link>
      </div>
      <div style={{ display: 'flex', gap: '20px' }}>
        {token ? (
          <>
            <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</Link>
            <Link to="/schemes" style={{ color: 'white', textDecoration: 'none' }}>Schemes</Link>
            <Link to="/rules" style={{ color: 'white', textDecoration: 'none' }}>Rules</Link>
            <Link to="/transactions" style={{ color: 'white', textDecoration: 'none' }}>Transactions</Link>
            <button onClick={logout} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1em' }}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>Login / Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

// Main App Component
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} /> 
          <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<LoginPage />} />{/* Default route */}

          {/* Protected Routes */}
          <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/schemes" element={<PrivateRoute><SchemesPage /></PrivateRoute>} />
          <Route path="/rules" element={<PrivateRoute><RulesPage /></PrivateRoute>} />
          <Route path="/transactions" element={<PrivateRoute><TransactionsPage /></PrivateRoute>} />

          {/* Fallback for unknown routes */}
          <Route path="*" element={<h1 style={{ textAlign: 'center', marginTop: '50px' }}>404 - Page Not Found</h1>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;