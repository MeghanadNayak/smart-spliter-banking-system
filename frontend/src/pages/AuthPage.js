// frontend/src/pages/AuthPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Navigation ke liye
import { useAuth } from '../context/AuthContext'; 

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true); // Login ya Register form dikhana hai
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(''); // Success/Error messages ke liye
  const navigate = useNavigate(); // Navigate hook use kiya
  const { login } = useAuth();
  // Form submit handle karna
  const handleSubmit = async (e) => {
    e.preventDefault(); // Default form submission rokna
    setMessage(''); // Puraana message clear karna

    try {
      let response;
      if (isLogin) {
        // Login API call
        response = await axios.post('/api/auth/login', { email, password });
        login(response.data.token); // Token localStorage mein save kiya
        setMessage('Login successful!');
        console.log('Logged in successfully, Token:', response.data.token);
        navigate('/dashboard'); // Login ke baad Dashboard par navigate karo
      } else {
        // Register API call
        response = await axios.post('/api/auth/register', { username, email, password });
        setMessage('Registration successful! Please login.');
        console.log('Registered successfully:', response.data);
        setIsLogin(true); // Register hone ke baad Login form dikhao
      }
    } catch (error) {
      console.error('Authentication error:', error.response ? error.response.data : error.message);
      setMessage(error.response ? error.response.data.message : 'An error occurred.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h2>{isLogin ? 'Login' : 'Register'}</h2>
      <form onSubmit={handleSubmit}>
        {!isLogin && ( // Register form ke liye username field
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required={!isLogin}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
        )}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>
        <button
          type="submit"
          style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {isLogin ? 'Login' : 'Register'}
        </button>
      </form>

      {message && <p style={{ marginTop: '15px', color: message.includes('successful') ? 'green' : 'red' }}>{message}</p>}

      <p style={{ marginTop: '20px', textAlign: 'center' }}>
        {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
        <button
          onClick={() => {
            setIsLogin(!isLogin); // Login/Register form toggle karna
            setMessage(''); // Message clear karna
            setUsername(''); // Fields clear karna
            setEmail('');
            setPassword('');
          }}
          style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}
        >
          {isLogin ? 'Register here' : 'Login here'}
        </button>
      </p>
    </div>
  );
}

export default AuthPage;