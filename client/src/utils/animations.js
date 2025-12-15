import React from 'react';
import { theme } from '../theme';
import { prefersReducedMotion } from './accessibility';

// Animation presets
export const animations = {
  // Fade animations
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: theme.transitions.duration[300],
    timing: theme.transitions.timing.out,
  },
  
  fadeOut: {
    from: { opacity: 1 },
    to: { opacity: 0 },
    duration: theme.transitions.duration[200],
    timing: theme.transitions.timing.in,
  },

  // Slide animations
  slideInUp: {
    from: { transform: 'translateY(20px)', opacity: 0 },
    to: { transform: 'translateY(0)', opacity: 1 },
    duration: theme.transitions.duration[300],
    timing: theme.transitions.timing.out,
  },

  slideInDown: {
    from: { transform: 'translateY(-20px)', opacity: 0 },
    to: { transform: 'translateY(0)', opacity: 1 },
    duration: theme.transitions.duration[300],
    timing: theme.transitions.timing.out,
  },

  slideInLeft: {
    from: { transform: 'translateX(-20px)', opacity: 0 },
    to: { transform: 'translateX(0)', opacity: 1 },
    duration: theme.transitions.duration[300],
    timing: theme.transitions.timing.out,
  },

  slideInRight: {
    from: { transform: 'translateX(20px)', opacity: 0 },
    to: { transform: 'translateX(0)', opacity: 1 },
    duration: theme.transitions.duration[300],
    timing: theme.transitions.timing.out,
  },

  // Scale animations
  scaleIn: {
    from: { transform: 'scale(0.95)', opacity: 0 },
    to: { transform: 'scale(1)', opacity: 1 },
    duration: theme.transitions.duration[200],
    timing: theme.transitions.timing.out,
  },

  scaleOut: {
    from: { transform: 'scale(1)', opacity: 1 },
    to: { transform: 'scale(0.95)', opacity: 0 },
    duration: theme.transitions.duration[150],
    timing: theme.transitions.timing.in,
  },

  // Bounce animation
  bounce: {
    keyframes: [
      { transform: 'translateY(0)' },
      { transform: 'translateY(-10px)' },
      { transform: 'translateY(0)' },
    ],
    duration: theme.transitions.duration[500],
    timing: 'ease-in-out',
  },

  // Pulse animation
  pulse: {
    keyframes: [
      { transform: 'scale(1)' },
      { transform: 'scale(1.05)' },
      { transform: 'scale(1)' },
    ],
    duration: theme.transitions.duration[1000],
    timing: 'ease-in-out',
    iterationCount: 'infinite',
  },

  // Shake animation for errors
  shake: {
    keyframes: [
      { transform: 'translateX(0)' },
      { transform: 'translateX(-10px)' },
      { transform: 'translateX(10px)' },
      { transform: 'translateX(-10px)' },
      { transform: 'translateX(0)' },
    ],
    duration: theme.transitions.duration[500],
    timing: 'ease-in-out',
  },
};

// Create CSS animation string
export const createAnimation = (animationConfig) => {
  if (prefersReducedMotion()) {
    return 'none';
  }

  const { keyframes, duration, timing, iterationCount = 1, delay = 0 } = animationConfig;

  if (keyframes) {
    // For keyframe animations, we'd need to inject CSS
    return `${duration} ${timing} ${delay} ${iterationCount}`;
  }

  return `${duration} ${timing} ${delay}`;
};

// Transition utilities
export const createTransition = (properties = 'all', duration = theme.transitions.duration[200], timing = theme.transitions.timing.inOut) => {
  if (prefersReducedMotion()) {
    return 'none';
  }

  const props = Array.isArray(properties) ? properties.join(', ') : properties;
  return `${props} ${duration} ${timing}`;
};

// Smooth scroll utility
export const smoothScrollTo = (element, options = {}) => {
  if (typeof element === 'string') {
    element = document.querySelector(element);
  }

  if (!element) return;

  const defaultOptions = {
    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    block: 'start',
    inline: 'nearest',
    ...options,
  };

  element.scrollIntoView(defaultOptions);
};

// Animation hook
export const useAnimation = (animationName, trigger = true) => {
  const [isAnimating, setIsAnimating] = React.useState(false);
  const elementRef = React.useRef();

  React.useEffect(() => {
    if (!trigger || !elementRef.current || prefersReducedMotion()) return;

    const element = elementRef.current;
    const animation = animations[animationName];
    
    if (!animation) return;

    setIsAnimating(true);

    // Apply animation styles
    const { from, to, duration, timing } = animation;
    
    // Set initial state
    Object.assign(element.style, from);
    
    // Force reflow
    void element.offsetHeight;
    
    // Apply transition
    element.style.transition = createTransition('all', duration, timing);
    
    // Apply final state
    Object.assign(element.style, to);

    const handleTransitionEnd = () => {
      setIsAnimating(false);
      element.removeEventListener('transitionend', handleTransitionEnd);
    };

    element.addEventListener('transitionend', handleTransitionEnd);

    return () => {
      element.removeEventListener('transitionend', handleTransitionEnd);
    };
  }, [animationName, trigger]);

  return { elementRef, isAnimating };
};

// Stagger animation for lists
export const useStaggerAnimation = (items, delay = 100) => {
  const [visibleItems, setVisibleItems] = React.useState([]);

  React.useEffect(() => {
    if (prefersReducedMotion()) {
      setVisibleItems(items);
      return;
    }

    setVisibleItems([]);
    
    items.forEach((_, index) => {
      setTimeout(() => {
        setVisibleItems(prev => [...prev, items[index]]);
      }, index * delay);
    });
  }, [items, delay]);

  return visibleItems;
};

// Hover animation hook
export const useHoverAnimation = (hoverStyles = {}, restStyles = {}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const elementRef = React.useRef();

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (elementRef.current) {
      Object.assign(elementRef.current.style, hoverStyles);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (elementRef.current) {
      Object.assign(elementRef.current.style, restStyles);
    }
  };

  return {
    elementRef,
    isHovered,
    hoverProps: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    },
  };
};

// Focus animation hook
export const useFocusAnimation = (focusStyles = {}, blurStyles = {}) => {
  const [isFocused, setIsFocused] = React.useState(false);
  const elementRef = React.useRef();

  const handleFocus = () => {
    setIsFocused(true);
    if (elementRef.current) {
      Object.assign(elementRef.current.style, focusStyles);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (elementRef.current) {
      Object.assign(elementRef.current.style, blurStyles);
    }
  };

  return {
    elementRef,
    isFocused,
    focusProps: {
      onFocus: handleFocus,
      onBlur: handleBlur,
    },
  };
};

// Page transition hook
export const usePageTransition = () => {
  const [isTransitioning, setIsTransitioning] = React.useState(false);

  const startTransition = () => {
    setIsTransitioning(true);
  };

  const endTransition = () => {
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  };

  return {
    isTransitioning,
    startTransition,
    endTransition,
  };
};

export default {
  animations,
  createAnimation,
  createTransition,
  smoothScrollTo,
  useAnimation,
  useStaggerAnimation,
  useHoverAnimation,
  useFocusAnimation,
  usePageTransition,
};