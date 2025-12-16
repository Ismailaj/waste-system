import React from 'react';
import { Button, Card } from './';
import { theme } from '../../theme';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // You can also log the error to an error reporting service here
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom error UI
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }

      // Default error UI
      const containerStyles = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: this.props.fullScreen ? '100vh' : '400px',
        padding: theme.spacing[8],
        textAlign: 'center',
      };

      const iconStyles = {
        fontSize: '4rem',
        marginBottom: theme.spacing[4],
      };

      const titleStyles = {
        fontSize: theme.typography.fontSize['2xl'],
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.text.primary,
        margin: `0 0 ${theme.spacing[3]} 0`,
      };

      const messageStyles = {
        fontSize: theme.typography.fontSize.lg,
        color: theme.colors.text.secondary,
        margin: `0 0 ${theme.spacing[6]} 0`,
        maxWidth: '600px',
        lineHeight: theme.typography.lineHeight.relaxed,
      };

      const actionsStyles = {
        display: 'flex',
        gap: theme.spacing[3],
        flexWrap: 'wrap',
        justifyContent: 'center',
      };

      const detailsStyles = {
        marginTop: theme.spacing[8],
        padding: theme.spacing[4],
        backgroundColor: theme.colors.gray[50],
        borderRadius: theme.borderRadius.md,
        border: `1px solid ${theme.colors.gray[200]}`,
        maxWidth: '800px',
        width: '100%',
      };

      const errorTextStyles = {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.text.secondary,
        fontFamily: theme.typography.fontFamily.mono.join(', '),
        textAlign: 'left',
        whiteSpace: 'pre-wrap',
        overflow: 'auto',
        maxHeight: '200px',
      };

      return (
        <div style={containerStyles}>
          <div style={iconStyles}>💥</div>
          
          <h1 style={titleStyles}>
            Oops! Something went wrong
          </h1>
          
          <p style={messageStyles}>
            We're sorry, but something unexpected happened. This error has been logged 
            and our team will investigate. You can try refreshing the page or going back 
            to continue using the application.
          </p>

          <div style={actionsStyles}>
            <Button
              variant="primary"
              onClick={this.handleRetry}
            >
              🔄 Try Again
            </Button>
            
            <Button
              variant="outline"
              onClick={this.handleReload}
            >
              🔃 Reload Page
            </Button>
            
            <Button
              variant="ghost"
              onClick={() => window.history.back()}
            >
              ← Go Back
            </Button>
          </div>

          {/* Error details for development */}
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <Card variant="outlined" padding="md" style={detailsStyles}>
              <h3 style={{
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.status.error,
                margin: `0 0 ${theme.spacing[3]} 0`,
              }}>
                Error Details (Development Mode)
              </h3>
              
              <div style={errorTextStyles}>
                <strong>Error:</strong> {this.state.error.toString()}
                {this.state.errorInfo && (
                  <>
                    <br /><br />
                    <strong>Component Stack:</strong>
                    {this.state.errorInfo.componentStack}
                  </>
                )}
              </div>
            </Card>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export const useErrorHandler = () => {
  const [error, setError] = React.useState(null);

  const resetError = () => setError(null);

  const handleError = React.useCallback((error) => {
    console.error('Error caught by useErrorHandler:', error);
    setError(error);
  }, []);

  // Throw error to be caught by ErrorBoundary
  if (error) {
    throw error;
  }

  return { handleError, resetError };
};

// Higher-order component for wrapping components with error boundary
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  const WrappedComponent = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

export default ErrorBoundary;