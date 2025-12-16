import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, ErrorBoundary, LoadingSpinner } from './components/ui';
import { AppLayout } from './components/layout';
import './App.css';

// Import components
import HomePage from './components/HomePage';
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';
import SimplePage from './components/pages/SimplePage';

// Lazy load dashboard and other components
const Dashboard = React.lazy(() => import('./components/Dashboard'));
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
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <PageLoadingFallback />;
  }
  
  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  
  // Temporarily disable performance optimization for testing
  // const { 
  //   criticalLoaded, 
  //   recommendations 
  // } = usePerformanceOptimization();

  // Show performance recommendations if any
  // React.useEffect(() => {
  //   if (recommendations.length > 0 && process.env.NODE_ENV === 'development') {
  //     console.log('Performance recommendations:', recommendations);
  //   }
  // }, [recommendations]);

  // Show loading screen until critical resources are loaded
  // if (!criticalLoaded) {
  //   return <PageLoadingFallback />;
  // }

  if (loading) {
    return <PageLoadingFallback />;
  }

  return (
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
              <React.Suspense fallback={<PageLoadingFallback />}>
                <Dashboard />
              </React.Suspense>
            </AppLayout.Dashboard>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/collections" 
        element={
          <ProtectedRoute>
            <AppLayout>
              <React.Suspense fallback={<PageLoadingFallback />}>
                <CollectionsPage />
              </React.Suspense>
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <AppLayout>
              <React.Suspense fallback={<PageLoadingFallback />}>
                <ProfilePage />
              </React.Suspense>
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/help" 
        element={
          <AppLayout>
            <React.Suspense fallback={<PageLoadingFallback />}>
              <HelpPage />
            </React.Suspense>
          </AppLayout>
        } 
      />
      <Route 
        path="/collections/new" 
        element={
          <ProtectedRoute>
            <AppLayout>
              <SimplePage
                title="New Collection Request"
                description="Create a new waste collection request"
                icon="➕"
              />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <AppLayout>
              <SimplePage
                title="Settings"
                description="Manage your application settings and preferences"
                icon="⚙️"
              />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/reports" 
        element={
          <ProtectedRoute>
            <AppLayout>
              <SimplePage
                title="Reports"
                description="View collection reports and analytics"
                icon="📊"
              />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/contact" 
        element={
          <AppLayout>
            <SimplePage
              title="Contact Us"
              description="Get in touch with our support team"
              icon="📞"
              showBackButton={false}
            />
          </AppLayout>
        } 
      />
      <Route 
        path="*" 
        element={
          <AppLayout>
            <div style={{ 
              padding: '4rem 2rem', 
              textAlign: 'center',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              <h1 style={{ 
                fontSize: '4rem', 
                margin: '0 0 1rem 0',
                color: '#6b7280'
              }}>
                404
              </h1>
              <h2 style={{ 
                fontSize: '1.5rem', 
                margin: '0 0 1rem 0',
                color: '#374151'
              }}>
                Page Not Found
              </h2>
              <p style={{ 
                color: '#6b7280',
                marginBottom: '2rem'
              }}>
                The page you're looking for doesn't exist.
              </p>
              <button
                onClick={() => window.location.href = '/'}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  textDecoration: 'none'
                }}
              >
                Go Home
              </button>
            </div>
          </AppLayout>
        } 
      />
      </Routes>
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