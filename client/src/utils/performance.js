import React from 'react';

// Debounce hook for performance optimization
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Throttle hook for performance optimization
export const useThrottle = (value, limit) => {
  const [throttledValue, setThrottledValue] = React.useState(value);
  const lastRan = React.useRef(Date.now());

  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
};

// Intersection Observer hook for lazy loading
export const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = React.useState(false);
  const [hasIntersected, setHasIntersected] = React.useState(false);
  const elementRef = React.useRef();

  React.useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isElementIntersecting = entry.isIntersecting;
        setIsIntersecting(isElementIntersecting);
        
        if (isElementIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [hasIntersected, options]);

  return { elementRef, isIntersecting, hasIntersected };
};

// Lazy loading component
export const LazyLoad = ({ 
  children, 
  placeholder = null, 
  once = true,
  className = '',
  ...props 
}) => {
  const { elementRef, isIntersecting, hasIntersected } = useIntersectionObserver();
  
  const shouldRender = once ? hasIntersected : isIntersecting;

  return (
    <div ref={elementRef} className={className} {...props}>
      {shouldRender ? children : placeholder}
    </div>
  );
};

// Image lazy loading component
export const LazyImage = ({
  src,
  alt,
  placeholder,
  className = '',
  style = {},
  onLoad,
  onError,
  ...props
}) => {
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);
  const { elementRef, hasIntersected } = useIntersectionObserver();

  const handleLoad = (e) => {
    setLoaded(true);
    onLoad?.(e);
  };

  const handleError = (e) => {
    setError(true);
    onError?.(e);
  };

  const imageStyles = {
    transition: 'opacity 0.3s ease-in-out',
    opacity: loaded ? 1 : 0,
    ...style,
  };

  return (
    <div ref={elementRef} className={className} style={{ position: 'relative' }}>
      {hasIntersected && (
        <img
          src={src}
          alt={alt}
          style={imageStyles}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      )}
      
      {(!loaded || error) && placeholder && (
        <div
          style={{
            position: loaded ? 'absolute' : 'static',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {placeholder}
        </div>
      )}
    </div>
  );
};

// Memoization helper for expensive calculations
export const useMemoizedValue = (factory, deps) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useMemo(factory, deps);
};

// Callback memoization
export const useMemoizedCallback = (callback, deps) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useCallback(callback, deps);
};

// Virtual scrolling hook for large lists
export const useVirtualScrolling = (items, itemHeight, containerHeight) => {
  const [scrollTop, setScrollTop] = React.useState(0);
  
  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );
  
  const visibleItems = items.slice(visibleStart, visibleEnd);
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleStart * itemHeight;

  const handleScroll = (e) => {
    setScrollTop(e.target.scrollTop);
  };

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    visibleStart,
    visibleEnd,
  };
};

// Performance monitoring hook
export const usePerformanceMonitor = (name) => {
  const startTime = React.useRef();
  const [metrics, setMetrics] = React.useState({});

  const start = React.useCallback(() => {
    startTime.current = performance.now();
  }, []);

  const end = React.useCallback(() => {
    if (startTime.current) {
      const duration = performance.now() - startTime.current;
      setMetrics(prev => ({
        ...prev,
        [name]: duration,
      }));
      
      // Log performance in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`Performance [${name}]: ${duration.toFixed(2)}ms`);
      }
    }
  }, [name]);

  return { start, end, metrics };
};

// Preload resources
export const preloadResource = (href, as = 'fetch', crossorigin = 'anonymous') => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  if (crossorigin) link.crossOrigin = crossorigin;
  document.head.appendChild(link);
};

// Prefetch resources
export const prefetchResource = (href) => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  document.head.appendChild(link);
};

// Bundle splitting helper
export const lazyImport = (importFunc) => {
  return React.lazy(importFunc);
};

// Error boundary for lazy components
export const LazyComponentWrapper = ({ children, fallback = null }) => {
  return (
    <React.Suspense fallback={fallback}>
      {children}
    </React.Suspense>
  );
};

// Optimize re-renders with React.memo
export const optimizeComponent = (Component, areEqual) => {
  return React.memo(Component, areEqual);
};

// Local storage with performance optimization
export const useOptimizedLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = React.useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = React.useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
};

export default {
  useDebounce,
  useThrottle,
  useIntersectionObserver,
  LazyLoad,
  LazyImage,
  useMemoizedValue,
  useMemoizedCallback,
  useVirtualScrolling,
  usePerformanceMonitor,
  preloadResource,
  prefetchResource,
  lazyImport,
  LazyComponentWrapper,
  optimizeComponent,
  useOptimizedLocalStorage,
};