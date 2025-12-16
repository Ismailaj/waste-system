import React from 'react';
import { theme } from '../../theme';

const ErrorMessage = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  type = 'error',
  showRetry = true,
  showDetails = false,
  onRetry,
  onDismiss,
  error,
  className = '',
  ...props
}) => {
  const [showErrorDetails, setShowErrorDetails] = React.useState(false);

  const types = {
    error: {
      icon: '❌',
      backgroundColor: theme.colors.status.error + '10',
      borderColor: theme.colors.status.error + '30',
      iconColor: theme.colors.status.error,
    },
    warning: {
      icon: '⚠️',
      backgroundColor: theme.colors.status.warning + '10',
      borderColor: theme.colors.status.warning + '30',
      iconColor: theme.colors.status.warning,
    },
    info: {
      icon: 'ℹ️',
      backgroundColor: theme.colors.status.info + '10',
      borderColor: theme.colors.status.info + '30',
      iconColor: theme.colors.status.info,
    },
    network: {
      icon: '🌐',
      backgroundColor: theme.colors.gray[100],
      borderColor: theme.colors.gray[300],
      iconColor: theme.colors.gray[600],
    },
  };

  const typeConfig = types[type] || types.error;

  const containerStyles = {
    backgroundColor: typeConfig.backgroundColor,
    border: `1px solid ${typeConfig.borderColor}`,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[6],
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing[4],
    maxWidth: '600px',
    margin: '0 auto',
  };

  const headerStyles = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing[3],
  };

  const iconStyles = {
    fontSize: theme.typography.fontSize['2xl'],
    flexShrink: 0,
    marginTop: theme.spacing[0.5],
  };

  const contentStyles = {
    flex: 1,
  };

  const titleStyles = {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    margin: `0 0 ${theme.spacing[2]} 0`,
  };

  const messageStyles = {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeight.relaxed,
    margin: 0,
  };

  const actionsStyles = {
    display: 'flex',
    gap: theme.spacing[3],
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  };

  const detailsStyles = {
    marginTop: theme.spacing[4],
    padding: theme.spacing[4],
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.gray[200]}`,
  };

  const errorTextStyles = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontFamily: theme.typography.fontFamily.mono.join(', '),
    whiteSpace: 'pre-wrap',
    overflow: 'auto',
    maxHeight: '200px',
  };

  const getErrorDetails = () => {
    if (!error) return 'No error details available';
    
    if (typeof error === 'string') return error;
    
    if (error.message) return error.message;
    
    try {
      return JSON.stringify(error, null, 2);
    } catch {
      return error.toString();
    }
  };

  return (
    <div style={containerStyles} className={`error-message ${className}`} {...props}>
      <div style={headerStyles}>
        <div style={iconStyles}>
          {typeConfig.icon}
        </div>
        
        <div style={contentStyles}>
          <h3 style={titleStyles}>{title}</h3>
          <p style={messageStyles}>{message}</p>
        </div>
      </div>

      {(showRetry || onDismiss || (showDetails && error)) && (
        <div style={actionsStyles}>
          {showDetails && error && (
            <button
              style={{
                background: 'transparent',
                border: 'none',
                color: theme.colors.text.secondary,
                fontSize: theme.typography.fontSize.sm,
                cursor: 'pointer',
                padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
                borderRadius: theme.borderRadius.sm,
              }}
              onClick={() => setShowErrorDetails(!showErrorDetails)}
            >
              {showErrorDetails ? 'Hide Details' : 'Show Details'}
            </button>
          )}
          
          {showRetry && onRetry && (
            <button
              style={{
                background: 'transparent',
                border: `1px solid ${theme.colors.primary[300]}`,
                color: theme.colors.primary[600],
                fontSize: theme.typography.fontSize.sm,
                cursor: 'pointer',
                padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
                borderRadius: theme.borderRadius.sm,
              }}
              onClick={onRetry}
            >
              🔄 Try Again
            </button>
          )}
          
          {onDismiss && (
            <button
              style={{
                background: theme.colors.primary[500],
                border: 'none',
                color: theme.colors.text.inverse,
                fontSize: theme.typography.fontSize.sm,
                cursor: 'pointer',
                padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
                borderRadius: theme.borderRadius.sm,
              }}
              onClick={onDismiss}
            >
              Dismiss
            </button>
          )}
        </div>
      )}

      {showErrorDetails && error && (
        <div style={detailsStyles}>
          <h4 style={{
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.text.primary,
            margin: `0 0 ${theme.spacing[2]} 0`,
          }}>
            Error Details
          </h4>
          <div style={errorTextStyles}>
            {getErrorDetails()}
          </div>
        </div>
      )}
    </div>
  );
};

// Specific error message components
export const NetworkError = ({ onRetry, ...props }) => (
  <ErrorMessage
    type="network"
    title="Connection Problem"
    message="Unable to connect to the server. Please check your internet connection and try again."
    onRetry={onRetry}
    {...props}
  />
);

export const NotFoundError = ({ resource = 'page', onGoBack, ...props }) => (
  <ErrorMessage
    type="warning"
    title={`${resource.charAt(0).toUpperCase() + resource.slice(1)} Not Found`}
    message={`The ${resource} you're looking for doesn't exist or has been moved.`}
    showRetry={false}
    onDismiss={onGoBack}
    {...props}
  />
);

export const PermissionError = ({ onGoBack, ...props }) => (
  <ErrorMessage
    type="warning"
    title="Access Denied"
    message="You don't have permission to access this resource. Please contact an administrator if you believe this is an error."
    showRetry={false}
    onDismiss={onGoBack}
    {...props}
  />
);

export const ValidationError = ({ errors = [], onDismiss, ...props }) => (
  <ErrorMessage
    type="warning"
    title="Validation Error"
    message={
      errors.length > 0 
        ? `Please fix the following errors:\n${errors.map(e => `• ${e}`).join('\n')}`
        : "Please check your input and try again."
    }
    showRetry={false}
    onDismiss={onDismiss}
    {...props}
  />
);

export default ErrorMessage;