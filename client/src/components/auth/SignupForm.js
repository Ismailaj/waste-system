import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Card, ErrorMessage } from '../ui';
import { useToast } from '../ui/Toast';
import { theme } from '../../theme';

const SignupForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'resident',
    profile: {
      firstName: '',
      lastName: '',
      phone: '',
      address: ''
    }
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('profile.')) {
      const profileField = name.split('.')[1];
      setFormData({
        ...formData,
        profile: {
          ...formData.profile,
          [profileField]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateStep1 = () => {
    if (!formData.username.trim()) {
      setError('Username is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setError('');
      setStep(2);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { confirmPassword, ...registrationData } = formData;
      const result = await register(registrationData);
      
      if (result.success) {
        toast.success(`Welcome to the system, ${result.user.username}!`);
        navigate('/dashboard');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const containerStyles = {
    width: '100%',
    maxWidth: '500px',
    margin: '0 auto',
  };

  const headerStyles = {
    textAlign: 'center',
    marginBottom: theme.spacing[8],
  };

  const logoStyles = {
    fontSize: theme.typography.fontSize['4xl'],
    marginBottom: theme.spacing[4],
  };

  const titleStyles = {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    margin: `0 0 ${theme.spacing[2]} 0`,
  };

  const subtitleStyles = {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    margin: 0,
  };

  const stepIndicatorStyles = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing[4],
    marginBottom: theme.spacing[8],
  };

  const stepStyles = (isActive, isCompleted) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '2.5rem',
    height: '2.5rem',
    borderRadius: theme.borderRadius.full,
    backgroundColor: isCompleted ? theme.colors.secondary[500] : isActive ? theme.colors.primary[500] : theme.colors.gray[200],
    color: isActive || isCompleted ? theme.colors.text.inverse : theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  });

  const formStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing[4],
  };

  const inputGroupStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing[1],
  };

  const labelStyles = {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
  };

  const inputStyles = {
    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
    border: `1px solid ${theme.colors.gray[300]}`,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.fontSize.base,
    backgroundColor: theme.colors.surface.primary,
    color: theme.colors.text.primary,
    transition: `border-color ${theme.transitions.duration[200]} ${theme.transitions.timing.inOut}`,
    outline: 'none',
  };

  const selectStyles = {
    ...inputStyles,
    cursor: 'pointer',
  };

  const textareaStyles = {
    ...inputStyles,
    minHeight: '100px',
    resize: 'vertical',
  };

  const buttonGroupStyles = {
    display: 'flex',
    gap: theme.spacing[3],
    marginTop: theme.spacing[4],
  };

  const linkStyles = {
    textAlign: 'center',
    marginTop: theme.spacing[6],
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  };

  const linkTextStyles = {
    color: theme.colors.primary[600],
    textDecoration: 'none',
    fontWeight: theme.typography.fontWeight.medium,
  };

  const roleDescriptions = {
    resident: 'Request waste collection services and track pickup status',
    collector: 'Manage collection routes and update pickup status',
  };

  const getRoleIcon = (role) => {
    const icons = {
      resident: '🏠',
      collector: '🚛',
    };
    return icons[role] || '👤';
  };

  const handleInputFocus = (e) => {
    e.target.style.borderColor = theme.colors.primary[400];
    e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary[100]}`;
  };

  const handleInputBlur = (e) => {
    e.target.style.borderColor = theme.colors.gray[300];
    e.target.style.boxShadow = 'none';
  };

  return (
    <div style={containerStyles}>
      <Card variant="elevated" padding="xl" shadow="lg">
        <div style={headerStyles}>
          <div style={logoStyles}>♻️</div>
          <h1 style={titleStyles}>Create Your Account</h1>
          <p style={subtitleStyles}>Join our waste management community</p>
        </div>

        {/* Step Indicator */}
        <div style={stepIndicatorStyles}>
          <div style={stepStyles(step === 1, step > 1)}>
            {step > 1 ? '✓' : '1'}
          </div>
          <div style={{
            width: '3rem',
            height: '2px',
            backgroundColor: step > 1 ? theme.colors.secondary[500] : theme.colors.gray[300],
          }} />
          <div style={stepStyles(step === 2, false)}>
            2
          </div>
        </div>

        {error && (
          <div style={{ marginBottom: theme.spacing[4] }}>
            <ErrorMessage
              type="error"
              title="Registration Error"
              message={error}
              showRetry={false}
              onDismiss={() => setError('')}
            />
          </div>
        )}

        <form onSubmit={step === 1 ? (e) => { e.preventDefault(); handleNextStep(); } : handleSubmit} style={formStyles}>
          {step === 1 ? (
            <>
              <h3 style={{
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.text.primary,
                margin: `0 0 ${theme.spacing[4]} 0`,
              }}>
                Account Information
              </h3>

              <div style={inputGroupStyles}>
                <label htmlFor="username" style={labelStyles}>
                  Username *
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  style={inputStyles}
                  placeholder="Choose a unique username"
                  required
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </div>

              <div style={inputGroupStyles}>
                <label htmlFor="email" style={labelStyles}>
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  style={inputStyles}
                  placeholder="Enter your email address"
                  required
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </div>

              <div style={inputGroupStyles}>
                <label htmlFor="password" style={labelStyles}>
                  Password *
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  style={inputStyles}
                  placeholder="Create a secure password (min. 6 characters)"
                  required
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </div>

              <div style={inputGroupStyles}>
                <label htmlFor="confirmPassword" style={labelStyles}>
                  Confirm Password *
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  style={inputStyles}
                  placeholder="Confirm your password"
                  required
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </div>

              <div style={inputGroupStyles}>
                <label htmlFor="role" style={labelStyles}>
                  Account Type *
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  style={selectStyles}
                  required
                >
                  <option value="resident">🏠 Resident</option>
                  <option value="collector">🚛 Waste Collector</option>
                </select>
                <div style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.text.secondary,
                  marginTop: theme.spacing[1],
                }}>
                  {getRoleIcon(formData.role)} {roleDescriptions[formData.role]}
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth={true}
              >
                Continue to Profile →
              </Button>
            </>
          ) : (
            <>
              <h3 style={{
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.text.primary,
                margin: `0 0 ${theme.spacing[4]} 0`,
              }}>
                Profile Information (Optional)
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: theme.spacing[4],
              }}>
                <div style={inputGroupStyles}>
                  <label htmlFor="profile.firstName" style={labelStyles}>
                    First Name
                  </label>
                  <input
                    type="text"
                    id="profile.firstName"
                    name="profile.firstName"
                    value={formData.profile.firstName}
                    onChange={handleChange}
                    style={inputStyles}
                    placeholder="Your first name"
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                  />
                </div>

                <div style={inputGroupStyles}>
                  <label htmlFor="profile.lastName" style={labelStyles}>
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="profile.lastName"
                    name="profile.lastName"
                    value={formData.profile.lastName}
                    onChange={handleChange}
                    style={inputStyles}
                    placeholder="Your last name"
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                  />
                </div>
              </div>

              <div style={inputGroupStyles}>
                <label htmlFor="profile.phone" style={labelStyles}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="profile.phone"
                  name="profile.phone"
                  value={formData.profile.phone}
                  onChange={handleChange}
                  style={inputStyles}
                  placeholder="Your phone number"
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </div>

              <div style={inputGroupStyles}>
                <label htmlFor="profile.address" style={labelStyles}>
                  Address
                </label>
                <textarea
                  id="profile.address"
                  name="profile.address"
                  value={formData.profile.address}
                  onChange={handleChange}
                  style={textareaStyles}
                  placeholder="Your address (for collection requests)"
                  rows="3"
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </div>

              <div style={buttonGroupStyles}>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => setStep(1)}
                  style={{ flex: 1 }}
                >
                  ← Back
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  disabled={loading}
                  style={{ flex: 2 }}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </div>
            </>
          )}
        </form>

        <div style={linkStyles}>
          Already have an account?{' '}
          <Link to="/login" style={linkTextStyles}>
            Sign in here
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default SignupForm;