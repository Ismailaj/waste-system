import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Card, ErrorMessage } from '../ui';
import { useToast } from '../ui/Toast';
import { theme } from '../../theme';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(formData);
      
      if (result.success) {
        toast.success(`Welcome back, ${result.user.username}!`);
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
    maxWidth: '400px',
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

  // Demo credentials info
  const demoCredentialsStyles = {
    marginTop: theme.spacing[6],
    padding: theme.spacing[4],
    backgroundColor: theme.colors.primary[50],
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.primary[200]}`,
  };

  const demoTitleStyles = {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary[700],
    margin: `0 0 ${theme.spacing[2]} 0`,
  };

  const demoListStyles = {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary[600],
    margin: 0,
    paddingLeft: theme.spacing[4],
  };

  return (
    <div style={containerStyles}>
      <Card variant="elevated" padding="xl" shadow="lg">
        <div style={headerStyles}>
          <div style={logoStyles}>♻️</div>
          <h1 style={titleStyles}>Welcome Back</h1>
          <p style={subtitleStyles}>Sign in to your waste management account</p>
        </div>

        {error && (
          <div style={{ marginBottom: theme.spacing[4] }}>
            <ErrorMessage
              type="error"
              title="Login Failed"
              message={error}
              showRetry={false}
              onDismiss={() => setError('')}
            />
          </div>
        )}

        <form onSubmit={handleSubmit} style={formStyles}>
          <div style={inputGroupStyles}>
            <label htmlFor="email" style={labelStyles}>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={inputStyles}
              placeholder="Enter your email"
              required
              onFocus={(e) => {
                e.target.style.borderColor = theme.colors.primary[400];
                e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary[100]}`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = theme.colors.gray[300];
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={inputGroupStyles}>
            <label htmlFor="password" style={labelStyles}>
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={inputStyles}
              placeholder="Enter your password"
              required
              onFocus={(e) => {
                e.target.style.borderColor = theme.colors.primary[400];
                e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary[100]}`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = theme.colors.gray[300];
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth={true}
            loading={loading}
            disabled={loading || !formData.email || !formData.password}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <div style={linkStyles}>
          Don't have an account?{' '}
          <Link to="/register" style={linkTextStyles}>
            Create one here
          </Link>
        </div>

        {/* Demo Credentials */}
        <div style={demoCredentialsStyles}>
          <div style={demoTitleStyles}>Demo Credentials:</div>
          <ul style={demoListStyles}>
            <li><strong>Admin:</strong> admin@wastemanagement.com / Admin123!</li>
            <li><strong>Collector:</strong> john.collector@wastemanagement.com / Collector123!</li>
            <li><strong>Resident:</strong> alice.resident@email.com / Resident123!</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default LoginForm;