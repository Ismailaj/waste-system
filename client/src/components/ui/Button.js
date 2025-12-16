import React from 'react';
import { theme } from '../../theme';
import { createAriaAttributes, useKeyboardNavigation } from '../../utils/accessibility';
import { RippleEffect } from './VisualFeedback';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  type = 'button',
  className = '',
  ripple = true,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...props
}) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: theme.typography.fontFamily.sans.join(', '),
    fontWeight: theme.typography.fontWeight.medium,
    borderRadius: theme.borderRadius.md,
    border: 'none',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: `all ${theme.transitions.duration[200]} ${theme.transitions.timing.inOut}`,
    textDecoration: 'none',
    outline: 'none',
    position: 'relative',
    overflow: 'hidden',
    width: fullWidth ? '100%' : 'auto',
  };

  const variants = {
    primary: {
      backgroundColor: theme.colors.primary[500],
      color: theme.colors.text.inverse,
      boxShadow: theme.shadows.sm,
      ':hover': !disabled && !loading ? {
        backgroundColor: theme.colors.primary[600],
        boxShadow: theme.shadows.md,
      } : {},
      ':focus': {
        boxShadow: `0 0 0 3px ${theme.colors.primary[200]}`,
      },
    },
    secondary: {
      backgroundColor: theme.colors.secondary[500],
      color: theme.colors.text.inverse,
      boxShadow: theme.shadows.sm,
      ':hover': !disabled && !loading ? {
        backgroundColor: theme.colors.secondary[600],
        boxShadow: theme.shadows.md,
      } : {},
      ':focus': {
        boxShadow: `0 0 0 3px ${theme.colors.secondary[200]}`,
      },
    },
    outline: {
      backgroundColor: 'transparent',
      color: theme.colors.primary[600],
      border: `1px solid ${theme.colors.primary[300]}`,
      ':hover': !disabled && !loading ? {
        backgroundColor: theme.colors.primary[50],
        borderColor: theme.colors.primary[400],
      } : {},
      ':focus': {
        boxShadow: `0 0 0 3px ${theme.colors.primary[200]}`,
      },
    },
    ghost: {
      backgroundColor: 'transparent',
      color: theme.colors.text.secondary,
      ':hover': !disabled && !loading ? {
        backgroundColor: theme.colors.gray[100],
        color: theme.colors.text.primary,
      } : {},
      ':focus': {
        boxShadow: `0 0 0 3px ${theme.colors.gray[200]}`,
      },
    },
    danger: {
      backgroundColor: theme.colors.status.error,
      color: theme.colors.text.inverse,
      boxShadow: theme.shadows.sm,
      ':hover': !disabled && !loading ? {
        backgroundColor: '#dc2626',
        boxShadow: theme.shadows.md,
      } : {},
      ':focus': {
        boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.3)',
      },
    },
  };

  const sizes = {
    sm: {
      padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
      fontSize: theme.typography.fontSize.sm,
      minHeight: '2rem',
    },
    md: {
      padding: `${theme.spacing[2.5]} ${theme.spacing[4]}`,
      fontSize: theme.typography.fontSize.base,
      minHeight: '2.5rem',
    },
    lg: {
      padding: `${theme.spacing[3]} ${theme.spacing[6]}`,
      fontSize: theme.typography.fontSize.lg,
      minHeight: '3rem',
    },
  };

  const disabledStyles = {
    opacity: 0.6,
    cursor: 'not-allowed',
  };

  const buttonStyles = {
    ...baseStyles,
    ...variants[variant],
    ...sizes[size],
    ...(disabled || loading ? disabledStyles : {}),
  };

  const { handleKeyDown } = useKeyboardNavigation({
    onEnter: (e) => {
      if (!disabled && !loading) {
        onClick?.(e);
      }
    },
    onSpace: (e) => {
      if (!disabled && !loading) {
        onClick?.(e);
      }
    },
  });

  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  const ariaAttributes = createAriaAttributes({
    label: ariaLabel,
    describedBy: ariaDescribedBy,
    disabled: disabled || loading,
  });

  const ButtonContent = () => (
    <>
      {loading && (
        <>
          <span
            style={{
              marginRight: theme.spacing[2],
              display: 'inline-block',
              width: '1rem',
              height: '1rem',
              border: '2px solid transparent',
              borderTop: '2px solid currentColor',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
            aria-hidden="true"
          />
          <span className="sr-only">Loading...</span>
        </>
      )}
      {children}
    </>
  );

  if (ripple && !disabled && !loading) {
    return (
      <RippleEffect
        onClick={handleClick}
        disabled={disabled || loading}
        style={buttonStyles}
        onKeyDown={handleKeyDown}
        className={`btn btn-${variant} btn-${size} ${className}`}
        {...ariaAttributes}
        {...props}
      >
        <ButtonContent />
      </RippleEffect>
    );
  }

  return (
    <button
      type={type}
      style={buttonStyles}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled || loading}
      className={`btn btn-${variant} btn-${size} ${className}`}
      {...ariaAttributes}
      {...props}
    >
      <ButtonContent />
    </button>
  );
};

export default Button;