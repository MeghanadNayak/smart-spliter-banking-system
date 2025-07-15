// frontend/src/pages/DashboardPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // Agar AuthContext use kar rahe ho

function DashboardPage() {
    const { token } = useAuth(); // Auth token yahan se le sakte hain
    const [mainAccountBalance, setMainAccountBalance] = useState(0);
    const [schemes, setSchemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Main Account Balance fetch karne ka function
    const fetchMainAccountBalance = async () => {
        try {
            // Updated URL to fetch main account balance
            const response = await axios.get('/api/transactions/account/balance');
            setMainAccountBalance(response.data.balance);
        } catch (err) {
            console.error('Error fetching main account balance:', err.response ? err.response.data : err.message);
            setError('Failed to load main account balance.');
        }
    };

    // Schemes (with sub-account balances) fetch karne ka function
    const fetchSchemes = async () => {
        try {
            const response = await axios.get('/api/schemes'); // Schemes fetch karega (includes currentBalance from backend)
            setSchemes(response.data);
        } catch (err) {
            console.error('Error fetching schemes for dashboard:', err.response ? err.response.data : err.message);
            setError('Failed to load scheme details.');
        }
    };

    // Component mount hone par data fetch karo
    useEffect(() => {
        if (token) { // Sirf tab fetch karo jab user authenticated ho
            setLoading(true);
            const fetchData = async () => {
                await fetchMainAccountBalance();
                await fetchSchemes();
                setLoading(false);
            };
            fetchData();
        } else {
            setLoading(false); // Agar token nahi hai toh loading khatam
            setError('Please log in to view dashboard details.');
        }
    }, [token]); // Token change hone par re-fetch

    if (loading) {
        return <div style={{ padding: '20px' }}>Loading dashboard...</div>;
    }

    return (
        <div style={{ padding: '20px' }}>
            <h2>Dashboard</h2>

            {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

            <div style={{ marginBottom: '30px', border: '1px solid #007bff', padding: '20px', borderRadius: '8px', backgroundColor: '#e9f5ff' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#007bff' }}>Main Account Balance</h3>
                <p style={{ fontSize: '2em', fontWeight: 'bold', margin: '0' }}>
                    ₹{mainAccountBalance.toFixed(2)}
                </p>
            </div>

            <h3>My Savings Progress</h3>
            {schemes.length === 0 ? (
                <p>No schemes created yet. Go to the Schemes page to add your first scheme!</p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                    {schemes.map((scheme) => (
                        <div key={scheme._id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>{scheme.schemeName}</h4>
                            <p style={{ margin: '0 0 5px 0', fontSize: '0.9em', color: '#666' }}>{scheme.description}</p>
                            <p style={{ margin: '0', fontSize: '1.1em', fontWeight: 'bold' }}>
                                Balance: ₹{scheme.currentBalance ? scheme.currentBalance.toFixed(2) : '0.00'}
                            </p>
                            <p style={{ margin: '0', fontSize: '0.9em', color: '#888' }}>
                                Target: ₹{scheme.targetAmount ? scheme.targetAmount.toFixed(2) : 'N/A'}
                            </p>
                            {scheme.targetAmount > 0 && (
                                <div style={{ marginTop: '10px', backgroundColor: '#e0e0e0', borderRadius: '5px', overflow: 'hidden' }}>
                                    <div
                                        style={{
                                            width: `${Math.min((scheme.currentBalance / scheme.targetAmount) * 100, 100).toFixed(0)}%`,
                                            backgroundColor: '#28a745',
                                            height: '15px',
                                            borderRadius: '5px',
                                            textAlign: 'center',
                                            color: 'white',
                                            fontSize: '0.8em',
                                            lineHeight: '15px'
                                        }}
                                    >
                                        {Math.min((scheme.currentBalance / scheme.targetAmount) * 100, 100).toFixed(0)}%
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default DashboardPage;