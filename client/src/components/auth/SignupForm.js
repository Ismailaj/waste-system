import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../ui/Toast';

const SignupForm = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('resident');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleNextStep = () => {
    console.log('🔍 REGISTER DEBUG: Moving to step 2');
    
    // Validate step 1
    if (!username || !email || !password || !confirmPassword) {
      const errorMsg = 'Please fill in all required fields';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }
    
    if (username.length < 3) {
      const errorMsg = 'Username must be at least 3 characters long';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }
    
    if (password.length < 6) {
      const errorMsg = 'Password must be at least 6 characters long';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }
    
    if (password !== confirmPassword) {
      const errorMsg = 'Passwords do not match';
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
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🔍 REGISTER DEBUG: Form submitted!', { username, email, password, role, firstName, lastName, phone, address });
    
    setError('');
    setLoading(true);
    toast.info('Creating your account...');

    try {
      console.log('🔍 REGISTER DEBUG: Calling register API...');
      const registrationData = {
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        profile: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          address: address.trim()
        }
      };
      
      console.log('🔍 REGISTER DEBUG: Registration data:', registrationData);
      const result = await register(registrationData);
      console.log('🔍 REGISTER DEBUG: Register result:', result);
      
      if (result && result.success) {
        console.log('🔍 REGISTER DEBUG: Registration successful, navigating to dashboard');
        toast.success(`Welcome to the system, ${result.user.username}! 🎉`);
        navigate('/dashboard');
      } else {
        console.log('🔍 REGISTER DEBUG: Registration failed:', result?.message);
        const errorMsg = result?.message || 'Registration failed';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error('🔍 REGISTER DEBUG: Registration error:', err);
      let errorMsg = 'An unexpected error occurred';
      
      if (err.response) {
        // Server responded with error status
        const status = err.response.status;
        const serverData = err.response.data;
        const serverMessage = serverData?.message || serverData?.error;
        
        console.log('🔍 REGISTER DEBUG: Server response data:', serverData);
        
        if (status === 400) {
          // Show specific validation errors if available
          if (serverData?.errors && Array.isArray(serverData.errors)) {
            const validationErrors = serverData.errors.map(err => `${err.field}: ${err.message}`).join(', ');
            errorMsg = `Validation failed: ${validationErrors}`;
          } else {
            errorMsg = serverMessage || 'Invalid registration data. Please check your inputs.';
          }
        } else if (status === 409) {
          errorMsg = serverMessage || 'Username or email already exists. Please try different ones.';
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
      maxWidth: '500px',
      margin: '2rem auto',
      padding: '2rem',
      border: '1px solid #ddd',
      borderRadius: '8px',
      backgroundColor: '#fff',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Create Account</h2>
      
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
      
      {/* Step Indicator */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div style={{
          width: '30px',
          height: '30px',
          borderRadius: '50%',
          backgroundColor: step >= 1 ? '#007bff' : '#ddd',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold'
        }}>
          1
        </div>
        <div style={{
          width: '50px',
          height: '2px',
          backgroundColor: step >= 2 ? '#007bff' : '#ddd'
        }} />
        <div style={{
          width: '30px',
          height: '30px',
          borderRadius: '50%',
          backgroundColor: step >= 2 ? '#007bff' : '#ddd',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold'
        }}>
          2
        </div>
      </div>

      <form onSubmit={step === 1 ? (e) => { e.preventDefault(); handleNextStep(); } : handleSubmit}>
        {step === 1 ? (
          <>
            <h3 style={{ marginBottom: '1.5rem', color: '#333' }}>Account Information</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Username *
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  console.log('🔍 REGISTER DEBUG: Username changed:', e.target.value);
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                placeholder="Choose a unique username"
                required
              />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  console.log('🔍 REGISTER DEBUG: Email changed:', e.target.value);
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter your email address"
                required
              />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Password *
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  console.log('🔍 REGISTER DEBUG: Password changed');
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                placeholder="Must contain: uppercase, lowercase, number (min. 6 chars)"
                required
              />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Confirm Password *
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  console.log('🔍 REGISTER DEBUG: Confirm password changed');
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                placeholder="Confirm your password"
                required
              />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Account Type *
              </label>
              <select
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  console.log('🔍 REGISTER DEBUG: Role changed:', e.target.value);
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  cursor: 'pointer'
                }}
                required
              >
                <option value="resident">🏠 Resident</option>
                <option value="collector">🚛 Waste Collector</option>
              </select>
              <div style={{
                fontSize: '14px',
                color: '#666',
                marginTop: '5px'
              }}>
                {role === 'resident' 
                  ? '🏠 Request waste collection services and track pickup status'
                  : '🚛 Manage collection routes and update pickup status'
                }
              </div>
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
            >
              Continue to Profile →
            </button>
          </>
        ) : (
          <>
            <h3 style={{ marginBottom: '1.5rem', color: '#333' }}>Profile Information (Optional)</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Your first name"
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Your last name"
                />
              </div>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                placeholder="Your phone number"
              />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Address
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  minHeight: '80px',
                  resize: 'vertical'
                }}
                placeholder="Your address (for collection requests)"
                rows="3"
              />
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                type="button"
                onClick={() => setStep(1)}
                style={{
                  flex: 1,
                  padding: '12px',
                  margin: '8px 0',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                ← Back
              </button>
              
              <button 
                type="submit" 
                style={{
                  flex: 2,
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
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </>
        )}
      </form>
      
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <Link to="/login">Already have an account? Sign in</Link>
      </div>
    </div>
  );
};

export default SignupForm;