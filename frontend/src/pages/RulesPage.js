// frontend/src/pages/RulesPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function RulesPage() {
  const { token } = useAuth();
  const [rules, setRules] = useState([]);
  const [schemes, setSchemes] = useState([]); // Rules ke liye schemes fetch karne honge
  const [newRuleSchemeId, setNewRuleSchemeId] = useState('');
  const [newRulePercentage, setNewRulePercentage] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // State for editing an existing rule
  const [editRule, setEditRule] = useState(null);
  const [editRuleSchemeId, setEditRuleSchemeId] = useState('');
  const [editRulePercentage, setEditRulePercentage] = useState('');

  // Schemes fetch karne ka function (dropdown ke liye)
  const fetchSchemes = async () => {
    try {
      const response = await axios.get('/api/schemes');
      setSchemes(response.data);
    } catch (err) {
      console.error('Error fetching schemes for rules:', err.response ? err.response.data : err.message);
      setError('Failed to load schemes for rules.');
    }
  };

  // Rules fetch karne ka function
  const fetchRules = async () => {
    try {
      setError('');
      const response = await axios.get('/api/rules'); // Make sure this endpoint works!
      setRules(response.data);
    } catch (err) {
      console.error('Error fetching rules:', err.response ? err.response.data : err.message);
      setError('Failed to fetch rules. Please try again.');
    }
  };

  // Component mount hone par schemes aur rules fetch karo
  useEffect(() => {
    if (token) {
      fetchSchemes();
      fetchRules();
    }
  }, [token]);

  // Naya rule add karne ka function
  const handleAddRule = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!newRuleSchemeId || !newRulePercentage) {
      setError('Scheme and Percentage are required.');
      return;
    }

    if (parseFloat(newRulePercentage) <= 0 || parseFloat(newRulePercentage) > 100) {
        setError('Percentage must be between 1 and 100.');
        return;
    }

    try {
      await axios.post('/api/rules', {
        schemeId: newRuleSchemeId,
        percentage: parseFloat(newRulePercentage),
      });
      setMessage('Rule added successfully!');
      setNewRuleSchemeId('');
      setNewRulePercentage('');
      fetchRules(); // Naya rule add hone ke baad list update karo
    } catch (err) {
      console.error('Error adding rule:', err.response ? err.response.data : err.message);
      setError(err.response ? err.response.data.message : 'Failed to add rule.');
    }
  };

  // Edit button click hone par
  const handleEditClick = (rule) => {
    setEditRule(rule);
    setEditRuleSchemeId(rule.schemeId._id || rule.schemeId); // schemeId object ya string ho sakti hai
    setEditRulePercentage(rule.percentage.toString());
    setMessage('');
    setError('');
  };

  // Update rule submit hone par
  const handleUpdateRule = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!editRuleSchemeId || !editRulePercentage) {
      setError('Scheme and Percentage are required.');
      return;
    }

    if (parseFloat(editRulePercentage) <= 0 || parseFloat(editRulePercentage) > 100) {
        setError('Percentage must be between 1 and 100.');
        return;
    }

    try {
      await axios.put(`/api/rules/${editRule._id}`, {
        schemeId: editRuleSchemeId,
        percentage: parseFloat(editRulePercentage),
      });
      setMessage('Rule updated successfully!');
      setEditRule(null); // Edit form band karo
      fetchRules(); // List update karo
    } catch (err) {
      console.error('Error updating rule:', err.response ? err.response.data : err.message);
      setError(err.response ? err.response.data.message : 'Failed to update rule.');
    }
  };

  // Delete rule
  const handleDeleteRule = async (ruleId) => {
    if (window.confirm('Are you sure you want to delete this rule?')) {
      try {
        setMessage('');
        setError('');
        await axios.delete(`/api/rules/${ruleId}`);
        setMessage('Rule deleted successfully!');
        fetchRules(); // List update karo
      } catch (err) {
        console.error('Error deleting rule:', err.response ? err.response.data : err.message);
        setError(err.response ? err.response.data.message : 'Failed to delete rule.');
      }
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>My Splitting Rules</h2>

      {/* Messages */}
      {message && <p style={{ color: 'green', marginTop: '10px' }}>{message}</p>}
      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

      {/* Add New Rule Form */}
      {!editRule && (
        <div style={{ marginBottom: '30px', border: '1px solid #eee', padding: '20px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
          <h3>Add New Rule</h3>
          <form onSubmit={handleAddRule}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Select Scheme:</label>
              <select
                value={newRuleSchemeId}
                onChange={(e) => setNewRuleSchemeId(e.target.value)}
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="">-- Select a Scheme --</option>
                {schemes.map((scheme) => (
                  <option key={scheme._id} value={scheme._id}>
                    {scheme.schemeName}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Percentage (%):</label>
              <input
                type="number"
                value={newRulePercentage}
                onChange={(e) => setNewRulePercentage(e.target.value)}
                required
                min="1"
                max="100"
                step="0.01"
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <button
              type="submit"
              style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Add Rule
            </button>
          </form>
        </div>
      )}

      {/* Edit Rule Form */}
      {editRule && (
        <div style={{ marginBottom: '30px', border: '1px solid #eee', padding: '20px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
          <h3>Edit Rule for "{editRule.schemeId.schemeName || 'Loading...'}"</h3>
          <form onSubmit={handleUpdateRule}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Select Scheme:</label>
              <select
                value={editRuleSchemeId}
                onChange={(e) => setEditRuleSchemeId(e.target.value)}
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                disabled // Scheme cannot be changed when editing a rule
              >
                <option value="">-- Select a Scheme --</option>
                {schemes.map((scheme) => (
                  <option key={scheme._id} value={scheme._id}>
                    {scheme.schemeName}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Percentage (%):</label>
              <input
                type="number"
                value={editRulePercentage}
                onChange={(e) => setEditRulePercentage(e.target.value)}
                required
                min="1"
                max="100"
                step="0.01"
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <button
              type="submit"
              style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' }}
            >
              Update Rule
            </button>
            <button
              type="button"
              onClick={() => setEditRule(null)}
              style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Rules List */}
      <h3>Existing Rules</h3>
      {rules.length === 0 ? (
        <p>No splitting rules found. Add a new one above!</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {rules.map((rule) => (
            <li key={rule._id} style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '10px', borderRadius: '8px', backgroundColor: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#007bff' }}>
                  Scheme: {rule.schemeId ? rule.schemeId.schemeName : 'Unknown Scheme'}
                </h4>
                <p style={{ margin: '0', fontSize: '0.9em', color: '#555' }}>
                  Percentage: {rule.percentage}%
                </p>
              </div>
              <div>
                <button
                  onClick={() => handleEditClick(rule)}
                  style={{ padding: '8px 12px', backgroundColor: '#ffc107', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteRule(rule._id)}
                  style={{ padding: '8px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default RulesPage;