// frontend/src/pages/TransactionsPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function TransactionsPage() {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [mainAccountBalance, setMainAccountBalance] = useState(0);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalSchemeId, setWithdrawalSchemeId] = useState(''); // Withdrawal kis scheme se ho raha hai
  const [schemes, setSchemes] = useState([]); // Schemes for withdrawal dropdown
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Main Account Balance fetch karne ka function
  const fetchMainAccountBalance = async () => {
    try {
      const response = await axios.get('/api/transactions/account/balance');
      setMainAccountBalance(response.data.balance);
    } catch (err) {
      console.error('Error fetching main account balance:', err.response ? err.response.data : err.message);
      setError('Failed to fetch main account balance.');
    }
  };

  // Transactions fetch karne ka function
  const fetchTransactions = async () => {
    try {
      setError('');
      const response = await axios.get('/api/transactions'); // Make sure this endpoint works!
      setTransactions(response.data);
    } catch (err) {
      console.error('Error fetching transactions:', err.response ? err.response.data : err.message);
      setError('Failed to fetch transactions. Please try again.');
    }
  };

  // Schemes fetch karne ka function (withdrawal dropdown ke liye)
  const fetchSchemes = async () => {
    try {
      const response = await axios.get('/api/schemes');
      setSchemes(response.data);
    } catch (err) {
      console.error('Error fetching schemes for withdrawal:', err.response ? err.response.data : err.message);
      // Optional: Don't set global error if only schemes for dropdown fail
    }
  };

  // Component mount hone par data fetch karo
  useEffect(() => {
    if (token) {
      fetchMainAccountBalance();
      fetchTransactions();
      fetchSchemes();
    }
  }, [token]);

  // Deposit handle karna
  const handleDeposit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setError('Please enter a valid deposit amount.');
      return;
    }

    try {
      await axios.post('/api/transactions/deposit', {
        amount: parseFloat(depositAmount),
      });
      setMessage('Deposit successful and funds split!');
      setDepositAmount('');
      fetchMainAccountBalance(); // Update main balance
      fetchTransactions();      // Update transactions list
      // Note: Sub-account balances will be updated on the backend.
      // For frontend to reflect, we'd need to re-fetch schemes data on dashboard or here.
    } catch (err) {
      console.error('Error making deposit:', err.response ? err.response.data : err.message);
      setError(err.response ? err.response.data.message : 'Failed to make deposit.');
    }
  };

  // Withdrawal handle karna
  const handleWithdrawal = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!withdrawalAmount || parseFloat(withdrawalAmount) <= 0) {
      setError('Please enter a valid withdrawal amount.');
      return;
    }
    if (!withdrawalSchemeId) {
        setError('Please select a scheme for withdrawal.');
        return;
    }

    try {
      await axios.post('/api/transactions/withdraw', {
        amount: parseFloat(withdrawalAmount),
        schemeId: withdrawalSchemeId, // Kis scheme se nikaal rahe hain
      });
      setMessage('Withdrawal successful!');
      setWithdrawalAmount('');
      setWithdrawalSchemeId('');
      fetchMainAccountBalance(); // Update main balance
      fetchTransactions();      // Update transactions list
      // Note: Sub-account balances will be updated on the backend.
    } catch (err) {
      console.error('Error making withdrawal:', err.response ? err.response.data : err.message);
      setError(err.response ? err.response.data.message : 'Failed to make withdrawal.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Transactions</h2>

      {/* Messages */}
      {message && <p style={{ color: 'green', marginTop: '10px' }}>{message}</p>}
      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        {/* Deposit Form */}
        <div style={{ border: '1px solid #eee', padding: '20px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
          <h3>Add Deposit (Income)</h3>
          <form onSubmit={handleDeposit}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Amount:</label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                required
                min="0.01"
                step="0.01"
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <button
              type="submit"
              style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Deposit Funds
            </button>
          </form>
        </div>

        {/* Withdrawal Form */}
        <div style={{ border: '1px solid #eee', padding: '20px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
          <h3>Make Withdrawal</h3>
          <form onSubmit={handleWithdrawal}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Withdraw from Scheme:</label>
              <select
                value={withdrawalSchemeId}
                onChange={(e) => setWithdrawalSchemeId(e.target.value)}
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="">-- Select a Scheme --</option>
                {schemes.map((scheme) => (
                  <option key={scheme._id} value={scheme._id}>
                    {scheme.schemeName} (Balance: ₹{scheme.currentBalance ? scheme.currentBalance.toFixed(2) : '0.00'})
                  </option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Amount:</label>
              <input
                type="number"
                value={withdrawalAmount}
                onChange={(e) => setWithdrawalAmount(e.target.value)}
                required
                min="0.01"
                step="0.01"
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <button
              type="submit"
              style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Withdraw Funds
            </button>
          </form>
        </div>
      </div>

      <h3>Main Account Balance: ₹{mainAccountBalance.toFixed(2)}</h3>

      {/* Transactions List */}
      <h3>Recent Transactions</h3>
      {transactions.length === 0 ? (
        <p>No transactions found yet.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {transactions.map((transaction) => (
            <li key={transaction._id} style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '10px', borderRadius: '8px', backgroundColor: '#fff' }}>
              <p style={{ margin: '0 0 5px 0' }}>
                <strong>Type:</strong> <span style={{ color: transaction.type === 'deposit' ? 'green' : 'red' }}>{transaction.type.toUpperCase()}</span>
                <span style={{ float: 'right', fontSize: '0.9em', color: '#555' }}>
                  {new Date(transaction.date).toLocaleString()}
                </span>
              </p>
              <p style={{ margin: '0 0 5px 0' }}>
                <strong>Amount:</strong> ₹{transaction.amount.toFixed(2)}
              </p>
              {transaction.schemeId && ( // Withdrawal ke case mein scheme ID hoga
                  <p style={{ margin: '0', fontSize: '0.9em', color: '#555' }}>
                      <strong>Scheme:</strong> {transaction.schemeId.schemeName}
                  </p>
              )}
              {transaction.description && (
                <p style={{ margin: '0', fontSize: '0.9em', color: '#555' }}>
                  <strong>Description:</strong> {transaction.description}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default TransactionsPage;