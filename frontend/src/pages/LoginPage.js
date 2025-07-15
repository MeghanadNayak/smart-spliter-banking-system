// frontend/src/pages/LoginPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const [isLogin, setIsLogin] = useState(true); // Default to true (Login form dikhega pehle)
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState(''); // Email state add kiya
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      let response;
      if (isLogin) {
        // Login logic (username aur password hi bhejenge)
        response = await axios.post('/api/users/login', { username, password });
        setMessage('Login successful!');
        if (response.data.token) {
          authLogin(response.data.token);
          navigate('/dashboard');
        }
      } else {
        // Register logic (username, email, aur password bhejenge)
        response = await axios.post('/api/users/register', { username, email, password });
        setMessage('Registration successful! Please log in.');
        setIsLogin(true); // Registration ke baad login form par automatically switch karo
      }
      setUsername(''); // Input fields clear karo
      setEmail('');    // Email field clear karo
      setPassword(''); // Input fields clear karo
    } catch (err) {
      console.error('Authentication error:', err.response ? err.response.data : err.message);
      setError(err.response ? err.response.data.message : 'An error occurred. Please try again.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', backgroundColor: '#fff' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '25px', color: '#333' }}>
        {isLogin ? 'Login' : 'Register'}
      </h2>

      {message && <p style={{ color: 'green', textAlign: 'center', marginBottom: '15px' }}>{message}</p>}
      {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '15px' }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        {/* Username field - login aur register dono mein dikhega */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
          />
        </div>

        {/* Email field - Sirf Register form mein dikhega */}
        {!isLogin && ( // Conditional rendering: Agar Login form nahi hai (yani Register form hai) toh hi dikhao
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Email:</label>
            <input
              type="email" // Type email set kiya
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required // Email ko required rakha hai registration ke liye
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
            />
          </div>
        )}

        {/* Password field - login aur register dono mein dikhega */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
          />
        </div>
        <button
          type="submit"
          style={{ width: '100%', padding: '12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1.1em', cursor: 'pointer', transition: 'background-color 0.2s' }}
        >
          {isLogin ? 'Login' : 'Register'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9em', color: '#555' }}>
        {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
        <button
          onClick={() => {
            setIsLogin(!isLogin); // isLogin state ko toggle karegi
            setMessage(''); // State change par messages clear karo
            setError('');   // State change par errors clear karo
            setUsername(''); // Form reset karo jab switch karein
            setEmail('');    // Email field reset karo
            setPassword(''); // Form reset karo jab switch karein
          }}
          style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline', padding: '0', fontSize: '1em' }}
        >
          {isLogin ? 'Register here' : 'Login here'}
        </button>
      </p>
    </div>
  );
}

export default LoginPage;