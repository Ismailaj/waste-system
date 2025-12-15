import React, { useState } from 'react';
import { authAPI } from '../services/api';

const DebugLogin = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testCredentials = [
    {
      email: 'admin@wastemanagement.com',
      password: 'Admin123!',
      role: 'admin'
    },
    {
      email: 'john.collector@wastemanagement.com',
      password: 'Collector123!',
      role: 'collector'
    },
    {
      email: 'alice.resident@email.com',
      password: 'Resident123!',
      role: 'resident'
    }
  ];

  const testLogin = async (credentials) => {
    setLoading(true);
    setResult(null);
    
    try {
      console.log('Testing login with:', credentials);
      const response = await authAPI.login(credentials);
      console.log('Login response:', response.data);
      
      setResult({
        success: true,
        data: response.data,
        credentials: credentials
      });
    } catch (error) {
      console.error('Login error:', error);
      setResult({
        success: false,
        error: error.response?.data || error.message,
        credentials: credentials
      });
    }
    
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>🧪 Login Debug Tool</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Test Credentials:</h3>
        {testCredentials.map((cred, index) => (
          <div key={index} style={{ margin: '10px 0' }}>
            <button 
              onClick={() => testLogin(cred)}
              disabled={loading}
              style={{ 
                padding: '10px', 
                marginRight: '10px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Test {cred.role}: {cred.email}
            </button>
          </div>
        ))}
      </div>

      {loading && <div>🔄 Testing login...</div>}

      {result && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          border: '1px solid #ccc', 
          borderRadius: '4px',
          backgroundColor: result.success ? '#d4edda' : '#f8d7da'
        }}>
          <h3>{result.success ? '✅ Success' : '❌ Failed'}</h3>
          
          <div><strong>Tested:</strong> {result.credentials.email}</div>
          <div><strong>Password:</strong> {result.credentials.password}</div>
          
          {result.success ? (
            <div>
              <div><strong>User:</strong> {result.data.user.username}</div>
              <div><strong>Role:</strong> {result.data.user.role}</div>
              <div><strong>Token:</strong> {result.data.token.substring(0, 50)}...</div>
            </div>
          ) : (
            <div>
              <div><strong>Error:</strong> {JSON.stringify(result.error, null, 2)}</div>
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: '30px', fontSize: '12px', color: '#666' }}>
        <h4>API Configuration:</h4>
        <div>Base URL: {process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}</div>
        <div>Current URL: {window.location.origin}</div>
      </div>
    </div>
  );
};

export default DebugLogin;