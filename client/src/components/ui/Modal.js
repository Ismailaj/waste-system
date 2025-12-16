import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { theme } from '../../theme';
import { trapFocus, useFocusManagement, generateId, createAriaAttributes } from '../../utils/accessibility';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className = '',
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...props
}) => {
  const modalId = React.useMemo(() => generateId('modal'), []);
  const titleId = React.useMemo(() => generateId('modal-title'), []);
  const { captureFocus, restoreFocus } = useFocusManagement();
  // Handle escape key and focus trapping
  useEffect(() => {
    if (!isOpen) return;

    // Capture focus when modal opens
    captureFocus();

    const handleKeyDown = (e) => {
      if (closeOnEscape && e.key === 'Escape') {
        onClose();
        return;
      }

      // Trap focus within modal
      const modalElement = document.getElementById(modalId);
      if (modalElement) {
        trapFocus(modalElement, e);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    // Focus the modal when it opens
    setTimeout(() => {
      const modalElement = document.getElementById(modalId);
      if (modalElement) {
        modalElement.focus();
      }
    }, 100);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore focus when modal closes
      restoreFocus();
    };
  }, [isOpen, closeOnEscape, onClose, modalId, captureFocus, restoreFocus]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const overlayStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: theme.zIndex.modal,
    padding: theme.spacing[4],
  };

  const sizes = {
    sm: { maxWidth: '400px' },
    md: { maxWidth: '500px' },
    lg: { maxWidth: '700px' },
    xl: { maxWidth: '900px' },
    full: { maxWidth: '95vw', maxHeight: '95vh' },
  };

  const modalStyles = {
    backgroundColor: theme.colors.surface.primary,
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadows['2xl'],
    width: '100%',
    maxHeight: '90vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    ...sizes[size],
  };

  const headerStyles = {
    padding: theme.spacing[6],
    borderBottom: `1px solid ${theme.colors.gray[200]}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const titleStyles = {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    margin: 0,
  };

  const closeButtonStyles = {
    background: 'none',
    border: 'none',
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.text.secondary,
    cursor: 'pointer',
    padding: theme.spacing[1],
    borderRadius: theme.borderRadius.base,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '2rem',
    height: '2rem',
    transition: `all ${theme.transitions.duration[200]} ${theme.transitions.timing.inOut}`,
  };

  const bodyStyles = {
    padding: theme.spacing[6],
    flex: 1,
    overflow: 'auto',
  };

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const ariaAttributes = createAriaAttributes({
    label: ariaLabel || title,
    labelledBy: title ? titleId : undefined,
    describedBy: ariaDescribedBy,
  });

  const modalContent = (
    <div 
      style={overlayStyles} 
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
    >
      <div 
        id={modalId}
        style={modalStyles} 
        className={`modal modal-${size} ${className}`}
        tabIndex={-1}
        {...ariaAttributes}
        {...props}
      >
        {title && (
          <div style={headerStyles}>
            <h2 id={titleId} style={titleStyles}>{title}</h2>
            <button
              style={closeButtonStyles}
              onClick={onClose}
              aria-label="Close modal"
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = theme.colors.gray[100];
                e.target.style.color = theme.colors.text.primary;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = theme.colors.text.secondary;
              }}
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
        )}
        <div style={bodyStyles}>
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

// Modal sub-components
Modal.Header = ({ children, className = '', ...props }) => (
  <div
    style={{
      padding: theme.spacing[6],
      borderBottom: `1px solid ${theme.colors.gray[200]}`,
    }}
    className={`modal-header ${className}`}
    {...props}
  >
    {children}
  </div>
);

Modal.Body = ({ children, className = '', ...props }) => (
  <div
    style={{
      padding: theme.spacing[6],
      flex: 1,
      overflow: 'auto',
    }}
    className={`modal-body ${className}`}
    {...props}
  >
    {children}
  </div>
);

Modal.Footer = ({ children, className = '', ...props }) => (
  <div
    style={{
      padding: theme.spacing[6],
      borderTop: `1px solid ${theme.colors.gray[200]}`,
      backgroundColor: theme.colors.background.secondary,
      display: 'flex',
      justifyContent: 'flex-end',
      gap: theme.spacing[3],
    }}
    className={`modal-footer ${className}`}
    {...props}
  >
    {children}
  </div>
);

export default Modal;