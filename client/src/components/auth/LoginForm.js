import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../ui/Toast';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🔍 LOGIN DEBUG: Form submitted!', { email, password });
    
    // Client-side validation with toast messages
    if (!email || !password) {
      const errorMsg = 'Please fill in all fields';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const errorMsg = 'Please enter a valid email address';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }
    
    setError('');
    setLoading(true);
    toast.info('Signing you in...');

    try {
      console.log('🔍 LOGIN DEBUG: Calling login API...');
      const loginData = {
        email: email.trim().toLowerCase(),
        password
      };
      
      console.log('🔍 LOGIN DEBUG: Login data:', loginData);
      const result = await login(loginData);
      console.log('🔍 LOGIN DEBUG: Login result:', result);
      
      if (result && result.success) {
        console.log('🔍 LOGIN DEBUG: Login successful, navigating to dashboard');
        toast.success(`Welcome back, ${result.user.username}! 🎉`);
        navigate('/dashboard');
      } else {
        console.log('🔍 LOGIN DEBUG: Login failed:', result?.message);
        const errorMsg = result?.message || 'Login failed';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error('🔍 LOGIN DEBUG: Login error:', err);
      let errorMsg = 'An unexpected error occurred';
      
      if (err.response) {
        // Server responded with error status
        const status = err.response.status;
        const serverMessage = err.response.data?.message || err.response.data?.error;
        
        if (status === 400) {
          errorMsg = serverMessage || 'Invalid email or password';
        } else if (status === 401) {
          errorMsg = serverMessage || 'Invalid email or password';
        } else if (status === 404) {
          errorMsg = 'Account not found. Please check your email or sign up.';
        } else if (status === 500) {
          errorMsg = 'Server error. Please try again later.';
        } else {
          errorMsg = serverMessage || `Server error (${status}). Please try again.`;
        }
      } else if (err.request) {
        // Network error
        errorMsg = 'Cannot connect to server. Please check if the server is running on port 5000.';
      }
      
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '400px',
      margin: '2rem auto',
      padding: '2rem',
      border: '1px solid #ddd',
      borderRadius: '8px',
      backgroundColor: '#fff',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Login</h2>
      
      {error && (
        <div style={{
          color: 'red',
          margin: '10px 0',
          padding: '10px',
          backgroundColor: '#ffe6e6',
          border: '1px solid #ff0000',
          borderRadius: '4px'
        }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Email:
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              console.log('🔍 LOGIN DEBUG: Email changed:', e.target.value);
            }}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
            placeholder="Enter your email"
            required
          />
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Password:
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              console.log('🔍 LOGIN DEBUG: Password changed');
            }}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
            placeholder="Enter your password"
            required
          />
        </div>
        
        <button 
          type="submit" 
          style={{
            width: '100%',
            padding: '12px',
            margin: '8px 0',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <Link to="/register">Don't have an account? Sign up</Link>
      </div>
      
      <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <h4>Demo Credentials:</h4>
        <p><strong>Admin:</strong> admin@wastemanagement.com / Admin123!</p>
        <p><strong>Collector:</strong> john.collector@wastemanagement.com / Collector123!</p>
        <p><strong>Resident:</strong> alice.resident@email.com / Resident123!</p>
      </div>
    </div>
  );
};

export default LoginForm;