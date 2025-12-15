import React from 'react';

// Network connection hook
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const [connectionType, setConnectionType] = React.useState('unknown');
  const [effectiveType, setEffectiveType] = React.useState('4g');

  React.useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    const updateConnectionInfo = () => {
      if ('connection' in navigator) {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (connection) {
          setConnectionType(connection.type || 'unknown');
          setEffectiveType(connection.effectiveType || '4g');
        }
      }
    };

    // Initial check
    updateConnectionInfo();

    // Event listeners
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    if ('connection' in navigator) {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (connection) {
        connection.addEventListener('change', updateConnectionInfo);
      }
    }

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      
      if ('connection' in navigator) {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (connection) {
          connection.removeEventListener('change', updateConnectionInfo);
        }
      }
    };
  }, []);

  const isSlowConnection = effectiveType === 'slow-2g' || effectiveType === '2g';
  const isFastConnection = effectiveType === '4g';

  return {
    isOnline,
    connectionType,
    effectiveType,
    isSlowConnection,
    isFastConnection,
  };
};

// Progressive enhancement component
export const ProgressiveEnhancement = ({ 
  children, 
  fallback = null, 
  requiresFastConnection = false,
  requiresOnline = true,
}) => {
  const { isOnline, isSlowConnection, isFastConnection } = useNetworkStatus();

  if (requiresOnline && !isOnline) {
    return fallback || (
      <div style={{ 
        padding: '1rem', 
        textAlign: 'center', 
        color: '#666',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        border: '1px solid #ddd',
      }}>
        <p>This feature requires an internet connection.</p>
        <p>Please check your connection and try again.</p>
      </div>
    );
  }

  if (requiresFastConnection && isSlowConnection) {
    return fallback || (
      <div style={{ 
        padding: '1rem', 
        textAlign: 'center', 
        color: '#666',
        backgroundColor: '#fff3cd',
        borderRadius: '8px',
        border: '1px solid #ffeaa7',
      }}>
        <p>This feature is optimized for faster connections.</p>
        <p>Some functionality may be limited on slower networks.</p>
      </div>
    );
  }

  return children;
};

// Adaptive loading component
export const AdaptiveLoader = ({ 
  children, 
  lowQualityFallback = null,
  loadingComponent = null,
}) => {
  const { isSlowConnection } = useNetworkStatus();
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    // Simulate loading delay based on connection
    const delay = isSlowConnection ? 2000 : 500;
    const timer = setTimeout(() => setIsLoaded(true), delay);
    return () => clearTimeout(timer);
  }, [isSlowConnection]);

  if (!isLoaded) {
    return loadingComponent || (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: '2rem',
      }}>
        <div style={{
          width: '2rem',
          height: '2rem',
          border: '3px solid #f3f3f3',
          borderTop: '3px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
      </div>
    );
  }

  if (isSlowConnection && lowQualityFallback) {
    return lowQualityFallback;
  }

  return children;
};

// Preload critical resources
export const preloadCriticalResources = () => {
  // Preload critical CSS
  const criticalCSS = [
    '/static/css/main.css',
  ];

  // Preload critical JavaScript
  const criticalJS = [
    '/static/js/main.js',
  ];

  // Preload critical images
  const criticalImages = [
    '/static/media/logo.svg',
  ];

  criticalCSS.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    document.head.appendChild(link);
  });

  criticalJS.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'script';
    link.href = href;
    document.head.appendChild(link);
  });

  criticalImages.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = href;
    document.head.appendChild(link);
  });
};

// Service worker registration for offline support
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
};

// Resource hints for better performance
export const addResourceHints = () => {
  // DNS prefetch for external domains
  const externalDomains = [
    'fonts.googleapis.com',
    'fonts.gstatic.com',
  ];

  externalDomains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = `//${domain}`;
    document.head.appendChild(link);
  });

  // Preconnect to critical third-party origins
  const criticalOrigins = [
    'https://fonts.googleapis.com',
  ];

  criticalOrigins.forEach(origin => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = origin;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

// Optimize images based on connection
export const getOptimizedImageSrc = (baseSrc, { isSlowConnection, devicePixelRatio = 1 }) => {
  if (!baseSrc) return baseSrc;

  const extension = baseSrc.split('.').pop();
  const baseName = baseSrc.replace(`.${extension}`, '');

  // Use WebP if supported and connection is good
  const supportsWebP = (() => {
    const canvas = document.createElement('canvas');
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  })();

  // Determine quality based on connection
  let quality = 'high';
  if (isSlowConnection) {
    quality = 'low';
  } else if (devicePixelRatio > 1) {
    quality = 'high';
  }

  // Return optimized URL
  if (supportsWebP && !isSlowConnection) {
    return `${baseName}_${quality}.webp`;
  }

  return `${baseName}_${quality}.${extension}`;
};

// Critical resource loading strategy
export const useCriticalResourceLoading = () => {
  const [criticalLoaded, setCriticalLoaded] = React.useState(false);
  const [nonCriticalLoaded, setNonCriticalLoaded] = React.useState(false);

  React.useEffect(() => {
    // Load critical resources first
    const loadCritical = async () => {
      try {
        // Simulate critical resource loading
        await new Promise(resolve => setTimeout(resolve, 100));
        setCriticalLoaded(true);
      } catch (error) {
        console.error('Failed to load critical resources:', error);
      }
    };

    // Load non-critical resources after critical ones
    const loadNonCritical = async () => {
      try {
        // Wait for critical resources
        if (criticalLoaded) {
          await new Promise(resolve => setTimeout(resolve, 500));
          setNonCriticalLoaded(true);
        }
      } catch (error) {
        console.error('Failed to load non-critical resources:', error);
      }
    };

    loadCritical();
    
    if (criticalLoaded) {
      loadNonCritical();
    }
  }, [criticalLoaded]);

  return { criticalLoaded, nonCriticalLoaded };
};

export default {
  useNetworkStatus,
  ProgressiveEnhancement,
  AdaptiveLoader,
  preloadCriticalResources,
  registerServiceWorker,
  addResourceHints,
  getOptimizedImageSrc,
  useCriticalResourceLoading,
};