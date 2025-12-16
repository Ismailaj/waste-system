import React from 'react';
import { generateId, createAriaAttributes, srOnlyStyles } from '../../utils/accessibility';
import { theme } from '../../theme';

// Accessible form field wrapper
export const FormField = ({
  children,
  label,
  error,
  hint,
  required = false,
  className = '',
  ...props
}) => {
  const fieldId = React.useMemo(() => generateId('field'), []);
  const errorId = React.useMemo(() => generateId('error'), []);
  const hintId = React.useMemo(() => generateId('hint'), []);

  const fieldStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing[1],
    marginBottom: theme.spacing[4],
  };

  const labelStyles = {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[1],
  };

  const requiredStyles = {
    color: theme.colors.status.error,
    fontSize: theme.typography.fontSize.sm,
  };

  const hintStyles = {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing[1],
  };

  const errorStyles = {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.status.error,
    marginTop: theme.spacing[1],
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[1],
  };

  // Clone children to add accessibility attributes
  const enhancedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      const ariaAttributes = createAriaAttributes({
        describedBy: [
          hint ? hintId : null,
          error ? errorId : null,
        ].filter(Boolean).join(' ') || undefined,
      });

      return React.cloneElement(child, {
        id: fieldId,
        'aria-invalid': error ? 'true' : 'false',
        'aria-required': required ? 'true' : 'false',
        ...ariaAttributes,
        ...child.props,
      });
    }
    return child;
  });

  return (
    <div style={fieldStyles} className={`form-field ${className}`} {...props}>
      {label && (
        <label htmlFor={fieldId} style={labelStyles}>
          {label}
          {required && (
            <>
              <span style={requiredStyles} aria-hidden="true">*</span>
              <span style={srOnlyStyles}>(required)</span>
            </>
          )}
        </label>
      )}
      
      {enhancedChildren}
      
      {hint && (
        <div id={hintId} style={hintStyles}>
          {hint}
        </div>
      )}
      
      {error && (
        <div id={errorId} style={errorStyles} role="alert" aria-live="polite">
          <span aria-hidden="true">⚠️</span>
          {error}
        </div>
      )}
    </div>
  );
};

// Accessible input component
export const AccessibleInput = React.forwardRef(({
  type = 'text',
  placeholder,
  disabled = false,
  className = '',
  onFocus,
  onBlur,
  ...props
}, ref) => {
  const [focused, setFocused] = React.useState(false);

  const inputStyles = {
    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
    border: `1px solid ${focused ? theme.colors.primary[400] : theme.colors.gray[300]}`,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.fontSize.base,
    backgroundColor: disabled ? theme.colors.gray[50] : theme.colors.surface.primary,
    color: disabled ? theme.colors.text.disabled : theme.colors.text.primary,
    transition: `all ${theme.transitions.duration[200]} ${theme.transitions.timing.inOut}`,
    outline: 'none',
    boxShadow: focused ? `0 0 0 3px ${theme.colors.primary[100]}` : 'none',
    cursor: disabled ? 'not-allowed' : 'text',
  };

  const handleFocus = (e) => {
    setFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setFocused(false);
    onBlur?.(e);
  };

  return (
    <input
      ref={ref}
      type={type}
      placeholder={placeholder}
      disabled={disabled}
      style={inputStyles}
      className={`accessible-input ${className}`}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...props}
    />
  );
});

AccessibleInput.displayName = 'AccessibleInput';

// Accessible select component
export const AccessibleSelect = React.forwardRef(({
  children,
  disabled = false,
  className = '',
  onFocus,
  onBlur,
  ...props
}, ref) => {
  const [focused, setFocused] = React.useState(false);

  const selectStyles = {
    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
    border: `1px solid ${focused ? theme.colors.primary[400] : theme.colors.gray[300]}`,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.fontSize.base,
    backgroundColor: disabled ? theme.colors.gray[50] : theme.colors.surface.primary,
    color: disabled ? theme.colors.text.disabled : theme.colors.text.primary,
    transition: `all ${theme.transitions.duration[200]} ${theme.transitions.timing.inOut}`,
    outline: 'none',
    boxShadow: focused ? `0 0 0 3px ${theme.colors.primary[100]}` : 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
    backgroundPosition: 'right 0.75rem center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '1.5em 1.5em',
    paddingRight: '2.5rem',
  };

  const handleFocus = (e) => {
    setFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setFocused(false);
    onBlur?.(e);
  };

  return (
    <select
      ref={ref}
      disabled={disabled}
      style={selectStyles}
      className={`accessible-select ${className}`}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...props}
    >
      {children}
    </select>
  );
});

AccessibleSelect.displayName = 'AccessibleSelect';

// Accessible textarea component
export const AccessibleTextarea = React.forwardRef(({
  placeholder,
  disabled = false,
  rows = 3,
  className = '',
  onFocus,
  onBlur,
  ...props
}, ref) => {
  const [focused, setFocused] = React.useState(false);

  const textareaStyles = {
    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
    border: `1px solid ${focused ? theme.colors.primary[400] : theme.colors.gray[300]}`,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.fontSize.base,
    backgroundColor: disabled ? theme.colors.gray[50] : theme.colors.surface.primary,
    color: disabled ? theme.colors.text.disabled : theme.colors.text.primary,
    transition: `all ${theme.transitions.duration[200]} ${theme.transitions.timing.inOut}`,
    outline: 'none',
    boxShadow: focused ? `0 0 0 3px ${theme.colors.primary[100]}` : 'none',
    cursor: disabled ? 'not-allowed' : 'text',
    resize: 'vertical',
    minHeight: `${rows * 1.5}rem`,
    fontFamily: 'inherit',
  };

  const handleFocus = (e) => {
    setFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setFocused(false);
    onBlur?.(e);
  };

  return (
    <textarea
      ref={ref}
      placeholder={placeholder}
      disabled={disabled}
      rows={rows}
      style={textareaStyles}
      className={`accessible-textarea ${className}`}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...props}
    />
  );
});

AccessibleTextarea.displayName = 'AccessibleTextarea';

// Skip link component for keyboard navigation
export const SkipLink = ({ href = '#main-content', children = 'Skip to main content' }) => {
  const skipLinkStyles = {
    position: 'absolute',
    top: '-40px',
    left: '6px',
    background: theme.colors.primary[600],
    color: theme.colors.text.inverse,
    padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
    borderRadius: theme.borderRadius.md,
    textDecoration: 'none',
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    zIndex: theme.zIndex.modal,
    transition: `top ${theme.transitions.duration[200]} ${theme.transitions.timing.inOut}`,
  };

  const skipLinkFocusStyles = {
    ...skipLinkStyles,
    top: '6px',
  };

  return (
    <a
      href={href}
      style={skipLinkStyles}
      onFocus={(e) => {
        Object.assign(e.target.style, skipLinkFocusStyles);
      }}
      onBlur={(e) => {
        Object.assign(e.target.style, skipLinkStyles);
      }}
    >
      {children}
    </a>
  );
};

export default {
  FormField,
  AccessibleInput,
  AccessibleSelect,
  AccessibleTextarea,
  SkipLink,
};