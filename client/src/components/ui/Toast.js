import React, { useState, useEffect, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import { theme } from '../../theme';

// Toast Context
const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Toast Provider
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      type: 'info',
      duration: 5000,
      ...toast,
    };

    setToasts(prev => [...prev, newToast]);

    // Auto remove toast after duration
    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const removeAllToasts = () => {
    setToasts([]);
  };

  // Convenience methods
  const toast = {
    success: (message, options = {}) => addToast({ ...options, type: 'success', message }),
    error: (message, options = {}) => addToast({ ...options, type: 'error', message }),
    warning: (message, options = {}) => addToast({ ...options, type: 'warning', message }),
    info: (message, options = {}) => addToast({ ...options, type: 'info', message }),
    custom: (content, options = {}) => addToast({ ...options, content }),
  };

  return (
    <ToastContext.Provider value={{ toast, removeToast, removeAllToasts }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

// Toast Container
const ToastContainer = ({ toasts, onRemove }) => {
  const containerStyles = {
    position: 'fixed',
    top: theme.spacing[4],
    right: theme.spacing[4],
    zIndex: theme.zIndex.toast,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing[2],
    maxWidth: '400px',
  };

  if (toasts.length === 0) return null;

  return createPortal(
    <div style={containerStyles}>
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>,
    document.body
  );
};

// Individual Toast Item
const ToastItem = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => onRemove(toast.id), 200);
  };

  const typeStyles = {
    success: {
      backgroundColor: theme.colors.status.success,
      color: theme.colors.text.inverse,
      borderColor: theme.colors.status.success,
    },
    error: {
      backgroundColor: theme.colors.status.error,
      color: theme.colors.text.inverse,
      borderColor: theme.colors.status.error,
    },
    warning: {
      backgroundColor: theme.colors.status.warning,
      color: theme.colors.text.inverse,
      borderColor: theme.colors.status.warning,
    },
    info: {
      backgroundColor: theme.colors.status.info,
      color: theme.colors.text.inverse,
      borderColor: theme.colors.status.info,
    },
  };

  const toastStyles = {
    backgroundColor: theme.colors.surface.primary,
    border: `1px solid ${theme.colors.gray[200]}`,
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadows.lg,
    padding: theme.spacing[4],
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing[3],
    minWidth: '300px',
    transform: isVisible && !isRemoving ? 'translateX(0)' : 'translateX(100%)',
    opacity: isVisible && !isRemoving ? 1 : 0,
    transition: `all ${theme.transitions.duration[200]} ${theme.transitions.timing.inOut}`,
    ...typeStyles[toast.type],
  };

  const contentStyles = {
    flex: 1,
    fontSize: theme.typography.fontSize.sm,
    lineHeight: theme.typography.lineHeight.normal,
  };

  const closeButtonStyles = {
    background: 'none',
    border: 'none',
    color: 'currentColor',
    cursor: 'pointer',
    fontSize: theme.typography.fontSize.lg,
    padding: 0,
    opacity: 0.7,
    transition: `opacity ${theme.transitions.duration[200]} ${theme.transitions.timing.inOut}`,
  };

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  return (
    <div style={toastStyles}>
      <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
        <span style={{ fontSize: theme.typography.fontSize.base }}>
          {icons[toast.type]}
        </span>
        <div style={contentStyles}>
          {toast.content || toast.message}
        </div>
      </div>
      <button
        style={closeButtonStyles}
        onClick={handleRemove}
        onMouseEnter={(e) => e.target.style.opacity = 1}
        onMouseLeave={(e) => e.target.style.opacity = 0.7}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
};

export default ToastItem;