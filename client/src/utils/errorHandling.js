import React from 'react';

// Error handling utilities

export const getErrorMessage = (error) => {
  // Handle different types of errors
  if (typeof error === 'string') {
    return error;
  }

  // API response errors
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  // Network errors
  if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network Error')) {
    return 'Network connection failed. Please check your internet connection and try again.';
  }

  // Timeout errors
  if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
    return 'Request timed out. Please try again.';
  }

  // Authentication errors
  if (error?.response?.status === 401) {
    return 'Your session has expired. Please log in again.';
  }

  // Permission errors
  if (error?.response?.status === 403) {
    return 'You do not have permission to perform this action.';
  }

  // Not found errors
  if (error?.response?.status === 404) {
    return 'The requested resource was not found.';
  }

  // Server errors
  if (error?.response?.status >= 500) {
    return 'Server error occurred. Please try again later.';
  }

  // Validation errors
  if (error?.response?.status === 400) {
    if (error.response.data?.errors) {
      return `Validation failed: ${error.response.data.errors.map(e => e.message).join(', ')}`;
    }
    return error.response.data?.message || 'Invalid request. Please check your input.';
  }

  // Generic error message
  if (error?.message) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
};

export const getErrorType = (error) => {
  if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network Error')) {
    return 'network';
  }

  if (error?.response?.status === 401 || error?.response?.status === 403) {
    return 'permission';
  }

  if (error?.response?.status === 404) {
    return 'notFound';
  }

  if (error?.response?.status === 400) {
    return 'validation';
  }

  if (error?.response?.status >= 500) {
    return 'server';
  }

  return 'error';
};

export const shouldRetry = (error) => {
  // Don't retry authentication or permission errors
  if (error?.response?.status === 401 || error?.response?.status === 403) {
    return false;
  }

  // Don't retry validation errors
  if (error?.response?.status === 400) {
    return false;
  }

  // Don't retry not found errors
  if (error?.response?.status === 404) {
    return false;
  }

  // Retry network errors, timeouts, and server errors
  return true;
};

export const logError = (error, context = {}) => {
  const errorInfo = {
    message: getErrorMessage(error),
    type: getErrorType(error),
    timestamp: new Date().toISOString(),
    context,
    stack: error?.stack,
    response: error?.response?.data,
    status: error?.response?.status,
  };

  console.error('Application Error:', errorInfo);

  // In production, you might want to send this to an error tracking service
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to error tracking service
    // errorTrackingService.captureError(errorInfo);
  }

  return errorInfo;
};

// Hook for handling async operations with error handling
export const useAsyncOperation = () => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const execute = React.useCallback(async (asyncFunction, context = {}) => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFunction();
      return result;
    } catch (err) {
      const errorInfo = logError(err, context);
      setError(errorInfo);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = React.useCallback(() => {
    setError(null);
    setLoading(false);
  }, []);

  return {
    loading,
    error,
    execute,
    reset,
  };
};

// Retry utility with exponential backoff
export const retryWithBackoff = async (
  fn,
  maxRetries = 3,
  baseDelay = 1000,
  maxDelay = 10000
) => {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if it's not a retryable error
      if (!shouldRetry(error)) {
        throw error;
      }

      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
      
      console.log(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

// Error boundary fallback components
export const createErrorFallback = (title, message, showRetry = true) => {
  return (error, retry) => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      padding: '2rem',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💥</div>
      <h2 style={{ marginBottom: '0.5rem' }}>{title}</h2>
      <p style={{ marginBottom: '2rem', color: '#666' }}>{message}</p>
      {showRetry && (
        <button
          onClick={retry}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
          }}
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default {
  getErrorMessage,
  getErrorType,
  shouldRetry,
  logError,
  useAsyncOperation,
  retryWithBackoff,
  createErrorFallback,
};