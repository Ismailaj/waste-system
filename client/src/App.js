import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, ErrorBoundary, LoadingSpinner } from './components/ui';
import { AppLayout } from './components/layout';
import { LazyComponentWrapper } from './utils/performance';
import { usePerformanceOptimization } from './hooks/usePerformanceOptimization';
import { ProgressiveEnhancement } from './utils/networkOptimization';
import './App.css';

// Lazy load components for better performance
const HomePage = React.lazy(() => import('./components/HomePage'));
const LoginForm = React.lazy(() => import('./components/auth/LoginForm'));
const SignupForm = React.lazy(() => import('./components/auth/SignupForm'));
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const DebugLogin = React.lazy(() => import('./components/DebugLogin'));
const CollectionsPage = React.lazy(() => import('./components/pages/CollectionsPage'));
const ProfilePage = React.lazy(() => import('./components/pages/ProfilePage'));
const HelpPage = React.lazy(() => import('./components/pages/HelpPage'));

// Loading fallback component
const PageLoadingFallback = () => (
  <AppLayout showHeader={false} showFooter={false}>
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '50vh',
    }}>
      <LoadingSpinner size="lg" text="Loading..." />
    </div>
  </AppLayout>
);

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <PageLoadingFallback />;
  }
  
  return isAuthenticated ? (
    <LazyComponentWrapper fallback={<PageLoadingFallback />}>
      {children}
    </LazyComponentWrapper>
  ) : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <PageLoadingFallback />;
  }
  
  return !isAuthenticated ? (
    <LazyComponentWrapper fallback={<PageLoadingFallback />}>
      {children}
    </LazyComponentWrapper>
  ) : <Navigate to="/dashboard" />;
};

function AppContent() {
  const { isAuthenticated } = useAuth();
  const { 
    criticalLoaded, 
    recommendations 
  } = usePerformanceOptimization();

  // Show performance recommendations if any
  React.useEffect(() => {
    if (recommendations.length > 0 && process.env.NODE_ENV === 'development') {
      console.log('Performance recommendations:', recommendations);
    }
  }, [recommendations]);

  // Show loading screen until critical resources are loaded
  if (!criticalLoaded) {
    return <PageLoadingFallback />;
  }

  return (
    <ProgressiveEnhancement requiresOnline={false}>
      <Routes>
      <Route 
        path="/" 
        element={
          isAuthenticated ? <Navigate to="/dashboard" /> : <HomePage />
        } 
      />
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <AppLayout.Auth>
              <LoginForm />
            </AppLayout.Auth>
          </PublicRoute>
        } 
      />
      <Route 
        path="/register" 
        element={
          <PublicRoute>
            <AppLayout.Auth>
              <SignupForm />
            </AppLayout.Auth>
          </PublicRoute>
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <AppLayout.Dashboard>
              <Dashboard />
            </AppLayout.Dashboard>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/collections" 
        element={
          <ProtectedRoute>
            <CollectionsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/help" 
        element={
          <ProtectedRoute>
            <HelpPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/debug" 
        element={
          <AppLayout showFooter={false}>
            <DebugLogin />
          </AppLayout>
        } 
      />
      </Routes>
    </ProgressiveEnhancement>
  );
}

function App() {
  return (
    <ErrorBoundary fullScreen={true}>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <AppContent />
          </Router>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;