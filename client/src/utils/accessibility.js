// Accessibility utilities and helpers

// Generate unique IDs for form elements and ARIA relationships
let idCounter = 0;
export const generateId = (prefix = 'element') => {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
};

// Keyboard navigation helpers
export const KEYBOARD_KEYS = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
};

// Check if an element is focusable
export const isFocusable = (element) => {
  if (!element || element.disabled) return false;
  
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ];
  
  return focusableSelectors.some(selector => element.matches(selector));
};

// Get all focusable elements within a container
export const getFocusableElements = (container) => {
  if (!container) return [];
  
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(', ');
  
  return Array.from(container.querySelectorAll(focusableSelectors))
    .filter(element => {
      // Check if element is visible
      const style = window.getComputedStyle(element);
      return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
    });
};

// Trap focus within a container (useful for modals)
export const trapFocus = (container, event) => {
  const focusableElements = getFocusableElements(container);
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  if (event.key === KEYBOARD_KEYS.TAB) {
    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    }
  }
};

// Restore focus to a previously focused element
export const createFocusManager = () => {
  let previouslyFocusedElement = null;
  
  return {
    capture: () => {
      previouslyFocusedElement = document.activeElement;
    },
    restore: () => {
      if (previouslyFocusedElement && typeof previouslyFocusedElement.focus === 'function') {
        previouslyFocusedElement.focus();
        previouslyFocusedElement = null;
      }
    },
  };
};

// Announce content to screen readers
export const announceToScreenReader = (message, priority = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

// Screen reader only text utility
export const srOnlyStyles = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

// ARIA attributes helpers
export const createAriaAttributes = (options = {}) => {
  const attributes = {};
  
  if (options.label) {
    attributes['aria-label'] = options.label;
  }
  
  if (options.labelledBy) {
    attributes['aria-labelledby'] = options.labelledBy;
  }
  
  if (options.describedBy) {
    attributes['aria-describedby'] = options.describedBy;
  }
  
  if (options.expanded !== undefined) {
    attributes['aria-expanded'] = options.expanded.toString();
  }
  
  if (options.selected !== undefined) {
    attributes['aria-selected'] = options.selected.toString();
  }
  
  if (options.checked !== undefined) {
    attributes['aria-checked'] = options.checked.toString();
  }
  
  if (options.disabled !== undefined) {
    attributes['aria-disabled'] = options.disabled.toString();
  }
  
  if (options.hidden !== undefined) {
    attributes['aria-hidden'] = options.hidden.toString();
  }
  
  if (options.current) {
    attributes['aria-current'] = options.current;
  }
  
  if (options.live) {
    attributes['aria-live'] = options.live;
  }
  
  if (options.role) {
    attributes['role'] = options.role;
  }
  
  return attributes;
};

// Keyboard navigation hook
export const useKeyboardNavigation = (options = {}) => {
  const {
    onEnter,
    onSpace,
    onEscape,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onHome,
    onEnd,
  } = options;
  
  const handleKeyDown = (event) => {
    switch (event.key) {
      case KEYBOARD_KEYS.ENTER:
        if (onEnter) {
          event.preventDefault();
          onEnter(event);
        }
        break;
      case KEYBOARD_KEYS.SPACE:
        if (onSpace) {
          event.preventDefault();
          onSpace(event);
        }
        break;
      case KEYBOARD_KEYS.ESCAPE:
        if (onEscape) {
          event.preventDefault();
          onEscape(event);
        }
        break;
      case KEYBOARD_KEYS.ARROW_UP:
        if (onArrowUp) {
          event.preventDefault();
          onArrowUp(event);
        }
        break;
      case KEYBOARD_KEYS.ARROW_DOWN:
        if (onArrowDown) {
          event.preventDefault();
          onArrowDown(event);
        }
        break;
      case KEYBOARD_KEYS.ARROW_LEFT:
        if (onArrowLeft) {
          event.preventDefault();
          onArrowLeft(event);
        }
        break;
      case KEYBOARD_KEYS.ARROW_RIGHT:
        if (onArrowRight) {
          event.preventDefault();
          onArrowRight(event);
        }
        break;
      case KEYBOARD_KEYS.HOME:
        if (onHome) {
          event.preventDefault();
          onHome(event);
        }
        break;
      case KEYBOARD_KEYS.END:
        if (onEnd) {
          event.preventDefault();
          onEnd(event);
        }
        break;
      default:
        break;
    }
  };
  
  return { handleKeyDown };
};

// Focus management hook
export const useFocusManagement = () => {
  const focusManager = createFocusManager();
  
  const focusFirst = (container) => {
    const focusableElements = getFocusableElements(container);
    focusableElements[0]?.focus();
  };
  
  const focusLast = (container) => {
    const focusableElements = getFocusableElements(container);
    focusableElements[focusableElements.length - 1]?.focus();
  };
  
  return {
    captureFocus: focusManager.capture,
    restoreFocus: focusManager.restore,
    focusFirst,
    focusLast,
    trapFocus,
  };
};

// Color contrast checker (basic implementation)
export const checkColorContrast = (foreground, background) => {
  // Convert hex to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : null;
  };
  
  // Calculate relative luminance
  const getLuminance = (rgb) => {
    const { r, g, b } = rgb;
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };
  
  const fg = hexToRgb(foreground);
  const bg = hexToRgb(background);
  
  if (!fg || !bg) return null;
  
  const fgLuminance = getLuminance(fg);
  const bgLuminance = getLuminance(bg);
  
  const lighter = Math.max(fgLuminance, bgLuminance);
  const darker = Math.min(fgLuminance, bgLuminance);
  
  const contrast = (lighter + 0.05) / (darker + 0.05);
  
  return {
    ratio: contrast,
    AA: contrast >= 4.5,
    AAA: contrast >= 7,
  };
};

// Reduced motion preference
export const prefersReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// High contrast preference
export const prefersHighContrast = () => {
  return window.matchMedia('(prefers-contrast: high)').matches;
};

export default {
  generateId,
  KEYBOARD_KEYS,
  isFocusable,
  getFocusableElements,
  trapFocus,
  createFocusManager,
  announceToScreenReader,
  srOnlyStyles,
  createAriaAttributes,
  useKeyboardNavigation,
  useFocusManagement,
  checkColorContrast,
  prefersReducedMotion,
  prefersHighContrast,
};