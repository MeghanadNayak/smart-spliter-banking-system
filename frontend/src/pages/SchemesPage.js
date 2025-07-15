// frontend/src/pages/SchemesPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function SchemesPage() {
  const { token } = useAuth();
  const [schemes, setSchemes] = useState([]);
  const [newSchemeName, setNewSchemeName] = useState('');
  const [newSchemeDescription, setNewSchemeDescription] = useState('');
  const [newSchemeTargetAmount, setNewSchemeTargetAmount] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // State for editing an existing scheme
  const [editScheme, setEditScheme] = useState(null); // scheme object jo edit ho raha hai
  const [editSchemeName, setEditSchemeName] = useState('');
  const [editSchemeDescription, setEditSchemeDescription] = useState('');
  const [editSchemeTargetAmount, setEditSchemeTargetAmount] = useState('');

  // Schemes fetch karne ka function
  const fetchSchemes = async () => {
    try {
      setError('');
      const response = await axios.get('/api/schemes');
      setSchemes(response.data);
    } catch (err) {
      console.error('Error fetching schemes:', err.response ? err.response.data : err.message);
      setError('Failed to fetch schemes. Please try again.');
    }
  };

  // Component mount hone par schemes fetch karo
  useEffect(() => {
    if (token) {
      fetchSchemes();
    }
  }, [token]);

  // Naya scheme add karne ka function
  const handleAddScheme = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!newSchemeName || !newSchemeTargetAmount) {
      setError('Scheme Name and Target Amount are required.');
      return;
    }

    try {
      await axios.post('/api/schemes', {
        schemeName: newSchemeName,
        description: newSchemeDescription,
        targetAmount: parseFloat(newSchemeTargetAmount),
      });
      setMessage('Scheme added successfully!');
      setNewSchemeName('');
      setNewSchemeDescription('');
      setNewSchemeTargetAmount('');
      fetchSchemes(); // Naya scheme add hone ke baad list update karo
    } catch (err) {
      console.error('Error adding scheme:', err.response ? err.response.data : err.message);
      setError(err.response ? err.response.data.message : 'Failed to add scheme.');
    }
  };

  // Edit button click hone par
  const handleEditClick = (scheme) => {
    setEditScheme(scheme);
    setEditSchemeName(scheme.schemeName);
    setEditSchemeDescription(scheme.description || '');
    setEditSchemeTargetAmount(scheme.targetAmount.toString());
    setMessage('');
    setError('');
  };

  // Update scheme submit hone par
  const handleUpdateScheme = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!editSchemeName || !editSchemeTargetAmount) {
      setError('Scheme Name and Target Amount are required.');
      return;
    }

    try {
      await axios.put(`/api/schemes/${editScheme._id}`, {
        schemeName: editSchemeName,
        description: editSchemeDescription,
        targetAmount: parseFloat(editSchemeTargetAmount),
      });
      setMessage('Scheme updated successfully!');
      setEditScheme(null); // Edit form band karo
      fetchSchemes(); // List update karo
    } catch (err) {
      console.error('Error updating scheme:', err.response ? err.response.data : err.message);
      setError(err.response ? err.response.data.message : 'Failed to update scheme.');
    }
  };

  // Delete scheme
  const handleDeleteScheme = async (schemeId) => {
    if (window.confirm('Are you sure you want to delete this scheme? This will also delete associated sub-account and rules.')) {
      try {
        setMessage('');
        setError('');
        await axios.delete(`/api/schemes/${schemeId}`);
        setMessage('Scheme deleted successfully!');
        fetchSchemes(); // List update karo
      } catch (err) {
        console.error('Error deleting scheme:', err.response ? err.response.data : err.message);
        setError(err.response ? err.response.data.message : 'Failed to delete scheme.');
      }
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>My Savings Schemes</h2>

      {/* Messages */}
      {message && <p style={{ color: 'green', marginTop: '10px' }}>{message}</p>}
      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

      {/* Add New Scheme Form */}
      {!editScheme && ( // Agar edit mode mein nahi hai toh hi Add form dikhao
        <div style={{ marginBottom: '30px', border: '1px solid #eee', padding: '20px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
          <h3>Add New Scheme</h3>
          <form onSubmit={handleAddScheme}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Scheme Name:</label>
              <input
                type="text"
                value={newSchemeName}
                onChange={(e) => setNewSchemeName(e.target.value)}
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Description (Optional):</label>
              <textarea
                value={newSchemeDescription}
                onChange={(e) => setNewSchemeDescription(e.target.value)}
                rows="3"
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              ></textarea>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Target Amount:</label>
              <input
                type="number"
                value={newSchemeTargetAmount}
                onChange={(e) => setNewSchemeTargetAmount(e.target.value)}
                required
                min="0"
                step="0.01"
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <button
              type="submit"
              style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Add Scheme
            </button>
          </form>
        </div>
      )}

      {/* Edit Scheme Form */}
      {editScheme && ( // Agar edit mode mein hai toh hi Edit form dikhao
        <div style={{ marginBottom: '30px', border: '1px solid #eee', padding: '20px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
          <h3>Edit Scheme: {editScheme.schemeName}</h3>
          <form onSubmit={handleUpdateScheme}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Scheme Name:</label>
              <input
                type="text"
                value={editSchemeName}
                onChange={(e) => setEditSchemeName(e.target.value)}
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Description (Optional):</label>
              <textarea
                value={editSchemeDescription}
                onChange={(e) => setEditSchemeDescription(e.target.value)}
                rows="3"
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              ></textarea>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Target Amount:</label>
              <input
                type="number"
                value={editSchemeTargetAmount}
                onChange={(e) => setEditSchemeTargetAmount(e.target.value)}
                required
                min="0"
                step="0.01"
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <button
              type="submit"
              style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' }}
            >
              Update Scheme
            </button>
            <button
              type="button"
              onClick={() => setEditScheme(null)} // Cancel button
              style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Schemes List */}
      <h3>Existing Schemes</h3>
      {schemes.length === 0 ? (
        <p>No schemes found. Add a new one above!</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {schemes.map((scheme) => (
            <li key={scheme._id} style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '10px', borderRadius: '8px', backgroundColor: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#007bff' }}>{scheme.schemeName}</h4>
                <p style={{ margin: '0 0 5px 0' }}>{scheme.description || 'No description'}</p>
                <p style={{ margin: '0', fontSize: '0.9em', color: '#555' }}>
                  Target: ₹{scheme.targetAmount ? scheme.targetAmount.toFixed(2) : 'N/A'} | Balance: ₹{scheme.currentBalance ? scheme.currentBalance.toFixed(2) : '0.00'}
                </p>
              </div>
              <div>
                <button
                  onClick={() => handleEditClick(scheme)}
                  style={{ padding: '8px 12px', backgroundColor: '#ffc107', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteScheme(scheme._id)}
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

export default SchemesPage;