import React from 'react';
import { theme } from '../../theme';

const LoadingSpinner = ({
  size = 'md',
  color = 'primary',
  text = '',
  fullScreen = false,
  overlay = false,
  className = '',
  ...props
}) => {
  const sizes = {
    xs: '1rem',
    sm: '1.5rem',
    md: '2rem',
    lg: '3rem',
    xl: '4rem',
  };

  const colors = {
    primary: theme.colors.primary[600],
    secondary: theme.colors.secondary[600],
    white: '#ffffff',
    gray: theme.colors.gray[600],
  };

  const spinnerSize = sizes[size];
  const spinnerColor = colors[color] || color;

  const containerStyles = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[3],
    ...(fullScreen && {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: overlay ? 'rgba(255, 255, 255, 0.9)' : theme.colors.background.primary,
      zIndex: theme.zIndex.modal,
    }),
    ...(overlay && !fullScreen && {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      zIndex: theme.zIndex.dropdown,
    }),
  };

  const spinnerStyles = {
    width: spinnerSize,
    height: spinnerSize,
    border: `3px solid ${spinnerColor}20`,
    borderTop: `3px solid ${spinnerColor}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  };

  const textStyles = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
  };

  return (
    <div style={containerStyles} className={`loading-spinner ${className}`} {...props}>
      <div style={spinnerStyles} />
      {text && <div style={textStyles}>{text}</div>}
    </div>
  );
};

// Skeleton loader component
export const SkeletonLoader = ({
  width = '100%',
  height = '1rem',
  borderRadius = theme.borderRadius.base,
  className = '',
  ...props
}) => {
  const skeletonStyles = {
    width,
    height,
    borderRadius,
    backgroundColor: theme.colors.gray[200],
    backgroundImage: `linear-gradient(90deg, ${theme.colors.gray[200]} 25%, ${theme.colors.gray[100]} 50%, ${theme.colors.gray[200]} 75%)`,
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
  };

  return (
    <div style={skeletonStyles} className={`skeleton-loader ${className}`} {...props} />
  );
};

// Card skeleton for loading states
export const CardSkeleton = ({ lines = 3, showAvatar = false }) => {
  return (
    <div style={{
      padding: theme.spacing[4],
      border: `1px solid ${theme.colors.gray[200]}`,
      borderRadius: theme.borderRadius.lg,
      backgroundColor: theme.colors.surface.primary,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing[3],
        marginBottom: theme.spacing[4],
      }}>
        {showAvatar && (
          <SkeletonLoader
            width="3rem"
            height="3rem"
            borderRadius={theme.borderRadius.full}
          />
        )}
        <div style={{ flex: 1 }}>
          <SkeletonLoader
            width="60%"
            height="1.25rem"
            style={{ marginBottom: theme.spacing[2] }}
          />
          <SkeletonLoader width="40%" height="1rem" />
        </div>
      </div>
      
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonLoader
          key={index}
          width={index === lines - 1 ? '80%' : '100%'}
          height="1rem"
          style={{ marginBottom: theme.spacing[2] }}
        />
      ))}
    </div>
  );
};

// Loading overlay component
export const LoadingOverlay = ({ 
  isLoading, 
  children, 
  text = 'Loading...', 
  spinnerSize = 'md' 
}) => {
  return (
    <div style={{ position: 'relative' }}>
      {children}
      {isLoading && (
        <LoadingSpinner
          size={spinnerSize}
          text={text}
          overlay={true}
        />
      )}
    </div>
  );
};

// Page loading component
export const PageLoader = ({ text = 'Loading page...' }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      padding: theme.spacing[8],
    }}>
      <LoadingSpinner size="lg" color="primary" />
      <div style={{
        marginTop: theme.spacing[4],
        fontSize: theme.typography.fontSize.lg,
        color: theme.colors.text.secondary,
        fontWeight: theme.typography.fontWeight.medium,
      }}>
        {text}
      </div>
      <div style={{
        marginTop: theme.spacing[2],
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.text.tertiary,
      }}>
        Please wait while we load your content...
      </div>
    </div>
  );
};

// Add shimmer animation to CSS
const shimmerKeyframes = `
  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
`;

// Inject shimmer animation if not already present
if (typeof document !== 'undefined' && !document.querySelector('#shimmer-animation')) {
  const style = document.createElement('style');
  style.id = 'shimmer-animation';
  style.textContent = shimmerKeyframes;
  document.head.appendChild(style);
}

export default LoadingSpinner;