import React from 'react';
import { theme } from '../../theme';
import { createTransition } from '../../utils/animations';

// Ripple effect component for buttons
export const RippleEffect = ({ children, onClick, disabled = false, ...props }) => {
  const [ripples, setRipples] = React.useState([]);
  const containerRef = React.useRef();

  const addRipple = (event) => {
    if (disabled) return;

    const rect = containerRef.current.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const newRipple = {
      x,
      y,
      size,
      id: Date.now(),
    };

    setRipples(prev => [...prev, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);

    onClick?.(event);
  };

  return (
    <div
      ref={containerRef}
      onClick={addRipple}
      style={{
        position: 'relative',
        overflow: 'hidden',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      {...props}
    >
      {children}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          style={{
            position: 'absolute',
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            transform: 'scale(0)',
            animation: 'ripple 0.6s linear',
            animationName: 'ripple',
            pointerEvents: 'none',
          }}
        />
      ))}

    </div>
  );
};

// Skeleton loader for content
export const SkeletonLoader = ({ 
  width = '100%', 
  height = '20px', 
  borderRadius = theme.borderRadius.md,
  className = '',
  style = {},
}) => {
  return (
    <div
      className={`animate-pulse ${className}`}
      style={{
        width,
        height,
        backgroundColor: theme.colors.gray[200],
        borderRadius,
        backgroundImage: `linear-gradient(90deg, ${theme.colors.gray[200]} 25%, ${theme.colors.gray[100]} 50%, ${theme.colors.gray[200]} 75%)`,
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        ...style,
      }}
    />
  );
};

// Progress indicator
export const ProgressBar = ({ 
  progress = 0, 
  height = '8px',
  color = theme.colors.primary[500],
  backgroundColor = theme.colors.gray[200],
  animated = true,
  className = '',
  style = {},
}) => {
  return (
    <div
      className={className}
      style={{
        width: '100%',
        height,
        backgroundColor,
        borderRadius: theme.borderRadius.full,
        overflow: 'hidden',
        ...style,
      }}
    >
      <div
        style={{
          width: `${Math.min(100, Math.max(0, progress))}%`,
          height: '100%',
          backgroundColor: color,
          borderRadius: theme.borderRadius.full,
          transition: animated ? createTransition('width', '0.3s') : 'none',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {animated && progress > 0 && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)`,
              animation: 'progress-shine 2s infinite',
            }}
          />
        )}
      </div>

    </div>
  );
};

// Floating action button with animation
export const FloatingActionButton = ({ 
  children, 
  onClick, 
  position = 'bottom-right',
  color = theme.colors.primary[500],
  size = '56px',
  className = '',
  style = {},
  ...props 
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const positionStyles = {
    'bottom-right': { bottom: '24px', right: '24px' },
    'bottom-left': { bottom: '24px', left: '24px' },
    'top-right': { top: '24px', right: '24px' },
    'top-left': { top: '24px', left: '24px' },
  };

  return (
    <button
      className={`smooth-hover ${className}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'fixed',
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: color,
        border: 'none',
        boxShadow: theme.shadows.lg,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '24px',
        zIndex: 1000,
        transform: isHovered ? 'scale(1.1)' : 'scale(1)',
        transition: createTransition(['transform', 'box-shadow']),
        ...positionStyles[position],
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
};

// Pulse animation for notifications
export const PulseIndicator = ({ 
  size = '12px',
  color = theme.colors.error,
  className = '',
  style = {},
}) => {
  return (
    <div
      className={`animate-pulse ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: color,
        position: 'relative',
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          backgroundColor: color,
          animation: 'pulse-ring 2s infinite',
        }}
      />

    </div>
  );
};

// Smooth scroll to top button
export const ScrollToTopButton = ({ 
  threshold = 300,
  smooth = true,
  className = '',
  style = {},
}) => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > threshold) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: smooth ? 'smooth' : 'auto',
    });
  };

  if (!isVisible) return null;

  return (
    <FloatingActionButton
      onClick={scrollToTop}
      className={`animate-fade-in ${className}`}
      style={style}
    >
      ↑
    </FloatingActionButton>
  );
};

export default {
  RippleEffect,
  SkeletonLoader,
  ProgressBar,
  FloatingActionButton,
  PulseIndicator,
  ScrollToTopButton,
};