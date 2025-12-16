import React from 'react';
import { 
  preloadCriticalResources, 
  addResourceHints, 
  registerServiceWorker,
  useNetworkStatus,
  useCriticalResourceLoading 
} from '../utils/networkOptimization';
import { usePerformanceMonitor } from '../utils/performance';

// Main performance optimization hook
export const usePerformanceOptimization = () => {
  const { isOnline, isSlowConnection, isFastConnection } = useNetworkStatus();
  const { criticalLoaded, nonCriticalLoaded } = useCriticalResourceLoading();
  const { start: startMonitoring, end: endMonitoring, metrics } = usePerformanceMonitor('app-performance');

  // Initialize performance optimizations once
  React.useEffect(() => {
    startMonitoring();

    // Add resource hints for better loading
    addResourceHints();

    // Preload critical resources
    preloadCriticalResources();

    // Register service worker for offline support
    registerServiceWorker();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // End monitoring when critical resources are loaded
  React.useEffect(() => {
    if (criticalLoaded) {
      endMonitoring();
    }
  }, [criticalLoaded, endMonitoring]);

  // Performance recommendations based on connection
  const getPerformanceRecommendations = React.useCallback(() => {
    const recommendations = [];

    if (isSlowConnection) {
      recommendations.push({
        type: 'warning',
        message: 'Slow connection detected. Some features may be limited.',
        action: 'Consider using data saver mode.',
      });
    }

    if (!isOnline) {
      recommendations.push({
        type: 'error',
        message: 'No internet connection.',
        action: 'Some features may not work offline.',
      });
    }

    if (isFastConnection && !nonCriticalLoaded) {
      recommendations.push({
        type: 'info',
        message: 'Loading enhanced features...',
        action: 'Please wait while we optimize your experience.',
      });
    }

    return recommendations;
  }, [isSlowConnection, isOnline, isFastConnection, nonCriticalLoaded]);

  return {
    isOnline,
    isSlowConnection,
    isFastConnection,
    criticalLoaded,
    nonCriticalLoaded,
    metrics,
    recommendations: getPerformanceRecommendations(),
  };
};

// Component performance monitoring hook
export const useComponentPerformance = (componentName) => {
  const { start, end, metrics } = usePerformanceMonitor(componentName);
  const [renderCount, setRenderCount] = React.useState(0);
  const mountTime = React.useRef(Date.now());

  // Track renders - use a ref instead to avoid infinite loops
  const renderCountRef = React.useRef(0);
  renderCountRef.current += 1;

  // Track mount/unmount
  React.useEffect(() => {
    start();
    
    return () => {
      end();
      const totalTime = Date.now() - mountTime.current;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`Component ${componentName} performance:`, {
          renderCount: renderCountRef.current,
          totalMountTime: totalTime,
          metrics,
        });
      }
    };
  }, [componentName, start, end, metrics]);

  return {
    renderCount: renderCountRef.current,
    metrics,
    mountTime: mountTime.current,
  };
};

// Memory usage monitoring hook
export const useMemoryMonitoring = () => {
  const [memoryInfo, setMemoryInfo] = React.useState(null);

  React.useEffect(() => {
    const updateMemoryInfo = () => {
      if ('memory' in performance) {
        setMemoryInfo({
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
        });
      }
    };

    // Initial check
    updateMemoryInfo();

    // Update every 5 seconds in development
    let interval;
    if (process.env.NODE_ENV === 'development') {
      interval = setInterval(updateMemoryInfo, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  const getMemoryUsagePercentage = () => {
    if (!memoryInfo) return 0;
    return (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100;
  };

  const isMemoryUsageHigh = () => {
    return getMemoryUsagePercentage() > 80;
  };

  return {
    memoryInfo,
    memoryUsagePercentage: getMemoryUsagePercentage(),
    isMemoryUsageHigh: isMemoryUsageHigh(),
  };
};

// Bundle size monitoring
export const useBundleAnalysis = () => {
  const [bundleInfo, setBundleInfo] = React.useState({
    totalSize: 0,
    loadedChunks: [],
    pendingChunks: [],
  });

  React.useEffect(() => {
    // Monitor webpack chunks if available
    if (window.__webpack_require__ && window.__webpack_require__.cache) {
      const cache = window.__webpack_require__.cache;
      const loadedModules = Object.keys(cache).length;
      
      setBundleInfo(prev => ({
        ...prev,
        loadedModules,
      }));
    }

    // Monitor resource loading
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const jsEntries = entries.filter(entry => 
        entry.name.includes('.js') || entry.name.includes('.css')
      );

      setBundleInfo(prev => ({
        ...prev,
        totalSize: prev.totalSize + jsEntries.reduce((sum, entry) => sum + (entry.transferSize || 0), 0),
      }));
    });

    observer.observe({ entryTypes: ['resource'] });

    return () => observer.disconnect();
  }, []);

  return bundleInfo;
};

// Performance budget monitoring
export const usePerformanceBudget = (budgets = {}) => {
  const defaultBudgets = React.useMemo(() => ({
    firstContentfulPaint: 2000, // 2 seconds
    largestContentfulPaint: 4000, // 4 seconds
    firstInputDelay: 100, // 100ms
    cumulativeLayoutShift: 0.1, // 0.1 score
    totalBlockingTime: 300, // 300ms
    ...budgets,
  }), [budgets]);

  const [performanceMetrics, setPerformanceMetrics] = React.useState({});
  const [budgetViolations, setBudgetViolations] = React.useState([]);

  React.useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach(entry => {
        const metric = entry.name || entry.entryType;
        const value = entry.value || entry.duration || entry.startTime;
        
        setPerformanceMetrics(prev => ({
          ...prev,
          [metric]: value,
        }));

        // Check budget violations
        if (defaultBudgets[metric] && value > defaultBudgets[metric]) {
          setBudgetViolations(prev => [
            ...prev.filter(v => v.metric !== metric),
            {
              metric,
              value,
              budget: defaultBudgets[metric],
              violation: value - defaultBudgets[metric],
              timestamp: Date.now(),
            },
          ]);
        }
      });
    });

    // Observe different performance entry types
    try {
      observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] });
    } catch (error) {
      console.warn('Some performance metrics not supported:', error);
    }

    return () => observer.disconnect();
  }, [defaultBudgets]);

  return {
    performanceMetrics,
    budgetViolations,
    budgets: defaultBudgets,
  };
};

export default {
  usePerformanceOptimization,
  useComponentPerformance,
  useMemoryMonitoring,
  useBundleAnalysis,
  usePerformanceBudget,
};