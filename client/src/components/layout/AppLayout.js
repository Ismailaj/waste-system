import React from 'react';
import Header from '../Header';
import Footer from '../Footer';
import { Breadcrumbs } from '../navigation';
import { SkipLink } from '../ui';
import { theme } from '../../theme';

const AppLayout = ({ 
  children, 
  showHeader = true, 
  showFooter = true, 
  showBreadcrumbs = false,
  breadcrumbItems = [],
  className = '',
  ...props 
}) => {
  const layoutStyles = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.colors.background.secondary,
  };

  const mainStyles = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  };

  const contentStyles = {
    flex: 1,
    padding: theme.spacing[6],
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
  };

  const breadcrumbContainerStyles = {
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
    padding: `0 ${theme.spacing[6]}`,
    backgroundColor: theme.colors.surface.primary,
    borderBottom: `1px solid ${theme.colors.gray[200]}`,
  };

  return (
    <div style={layoutStyles} className={`app-layout ${className}`} {...props}>
      <SkipLink href="#main-content" />
      {showHeader && <Header />}
      {showBreadcrumbs && (
        <div style={breadcrumbContainerStyles}>
          <Breadcrumbs items={breadcrumbItems} />
        </div>
      )}
      <main id="main-content" style={mainStyles}>
        <div style={contentStyles}>
          {children}
        </div>
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

// Layout variants for different page types
AppLayout.Auth = ({ children, className = '', ...props }) => (
  <div 
    style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background.secondary,
      padding: theme.spacing[4],
    }}
    className={`auth-layout ${className}`}
    {...props}
  >
    {children}
  </div>
);

AppLayout.Dashboard = ({ children, className = '', showBreadcrumbs = true, ...props }) => (
  <AppLayout 
    className={`dashboard-layout ${className}`} 
    showBreadcrumbs={showBreadcrumbs}
    {...props}
  >
    <div style={{
      backgroundColor: theme.colors.surface.primary,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing[6],
      boxShadow: theme.shadows.sm,
      border: `1px solid ${theme.colors.gray[200]}`,
    }}>
      {children}
    </div>
  </AppLayout>
);

AppLayout.Centered = ({ children, maxWidth = '600px', className = '', showBreadcrumbs = false, ...props }) => (
  <AppLayout 
    className={`centered-layout ${className}`} 
    showBreadcrumbs={showBreadcrumbs}
    {...props}
  >
    <div style={{
      maxWidth,
      margin: '0 auto',
      backgroundColor: theme.colors.surface.primary,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing[8],
      boxShadow: theme.shadows.md,
      border: `1px solid ${theme.colors.gray[200]}`,
    }}>
      {children}
    </div>
  </AppLayout>
);

export default AppLayout;