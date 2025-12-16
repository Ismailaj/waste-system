import React from 'react';
import { theme } from '../../theme';

const Card = ({
  children,
  variant = 'default',
  padding = 'md',
  shadow = 'base',
  hover = false,
  className = '',
  onClick,
  ...props
}) => {
  const baseStyles = {
    backgroundColor: theme.colors.surface.primary,
    borderRadius: theme.borderRadius.lg,
    border: `1px solid ${theme.colors.gray[200]}`,
    transition: `all ${theme.transitions.duration[200]} ${theme.transitions.timing.inOut}`,
    position: 'relative',
    overflow: 'hidden',
  };

  const variants = {
    default: {
      backgroundColor: theme.colors.surface.primary,
      border: `1px solid ${theme.colors.gray[200]}`,
    },
    elevated: {
      backgroundColor: theme.colors.surface.elevated,
      border: 'none',
      boxShadow: theme.shadows[shadow],
    },
    outlined: {
      backgroundColor: 'transparent',
      border: `2px solid ${theme.colors.gray[200]}`,
    },
    filled: {
      backgroundColor: theme.colors.background.secondary,
      border: 'none',
    },
  };

  const paddings = {
    none: { padding: 0 },
    sm: { padding: theme.spacing[3] },
    md: { padding: theme.spacing[4] },
    lg: { padding: theme.spacing[6] },
    xl: { padding: theme.spacing[8] },
  };

  const shadows = {
    none: {},
    sm: { boxShadow: theme.shadows.sm },
    base: { boxShadow: theme.shadows.base },
    md: { boxShadow: theme.shadows.md },
    lg: { boxShadow: theme.shadows.lg },
    xl: { boxShadow: theme.shadows.xl },
  };

  const hoverStyles = hover ? {
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: theme.shadows.lg,
      borderColor: theme.colors.primary[300],
    },
  } : {};

  const clickableStyles = onClick ? {
    cursor: 'pointer',
    ':hover': {
      borderColor: theme.colors.primary[300],
      boxShadow: theme.shadows.md,
    },
  } : {};

  const cardStyles = {
    ...baseStyles,
    ...variants[variant],
    ...paddings[padding],
    ...shadows[shadow],
    ...hoverStyles,
    ...clickableStyles,
  };

  return (
    <div
      style={cardStyles}
      onClick={onClick}
      className={`card card-${variant} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Card sub-components
Card.Header = ({ children, className = '', ...props }) => (
  <div
    style={{
      padding: `${theme.spacing[4]} ${theme.spacing[4]} ${theme.spacing[2]}`,
      borderBottom: `1px solid ${theme.colors.gray[200]}`,
      marginBottom: theme.spacing[4],
    }}
    className={`card-header ${className}`}
    {...props}
  >
    {children}
  </div>
);

Card.Body = ({ children, className = '', ...props }) => (
  <div
    style={{
      flex: 1,
    }}
    className={`card-body ${className}`}
    {...props}
  >
    {children}
  </div>
);

Card.Footer = ({ children, className = '', ...props }) => (
  <div
    style={{
      padding: `${theme.spacing[2]} ${theme.spacing[4]} ${theme.spacing[4]}`,
      borderTop: `1px solid ${theme.colors.gray[200]}`,
      marginTop: theme.spacing[4],
      backgroundColor: theme.colors.background.secondary,
    }}
    className={`card-footer ${className}`}
    {...props}
  >
    {children}
  </div>
);

export default Card;