// Breadcrumb utility functions and configurations

export const generateBreadcrumbsFromPath = (pathname, userRole = null) => {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs = [];

  // Always start with home/dashboard
  breadcrumbs.push({
    label: 'Dashboard',
    href: '/dashboard',
    icon: '🏠',
    isActive: pathname === '/dashboard',
  });

  // Route configurations with role-based labels
  const routeConfig = {
    collections: {
      label: 'Collections',
      icon: '📦',
      roles: ['resident', 'collector', 'admin'],
    },
    routes: {
      label: 'Routes',
      icon: '🗺️',
      roles: ['collector', 'admin'],
    },
    admin: {
      label: 'Administration',
      icon: '👑',
      roles: ['admin'],
    },
    users: {
      label: 'Users',
      icon: '👥',
      roles: ['admin'],
    },
    reports: {
      label: 'Reports',
      icon: '📊',
      roles: ['admin'],
    },
    profile: {
      label: 'Profile',
      icon: '👤',
      roles: ['resident', 'collector', 'admin'],
    },
    settings: {
      label: 'Settings',
      icon: '⚙️',
      roles: ['resident', 'collector', 'admin'],
    },
    help: {
      label: 'Help',
      icon: '❓',
      roles: ['resident', 'collector', 'admin'],
    },
    new: {
      label: 'New',
      icon: '➕',
      roles: ['resident', 'collector', 'admin'],
    },
    edit: {
      label: 'Edit',
      icon: '✏️',
      roles: ['resident', 'collector', 'admin'],
    },
  };

  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === segments.length - 1;
    const config = routeConfig[segment];

    // Skip if user doesn't have permission for this route
    if (config && userRole && !config.roles.includes(userRole)) {
      return;
    }

    breadcrumbs.push({
      label: config?.label || segment.charAt(0).toUpperCase() + segment.slice(1),
      href: currentPath,
      icon: config?.icon,
      isActive: isLast,
    });
  });

  return breadcrumbs;
};

// Predefined breadcrumb configurations for common pages
export const breadcrumbConfigs = {
  dashboard: () => [
    { label: 'Dashboard', href: '/dashboard', icon: '🏠', isActive: true },
  ],

  collections: (userRole) => [
    { label: 'Dashboard', href: '/dashboard', icon: '🏠' },
    { 
      label: userRole === 'resident' ? 'My Requests' : 'Collections', 
      href: '/collections', 
      icon: '📦', 
      isActive: true 
    },
  ],

  newCollection: (userRole) => [
    { label: 'Dashboard', href: '/dashboard', icon: '🏠' },
    { 
      label: userRole === 'resident' ? 'My Requests' : 'Collections', 
      href: '/collections', 
      icon: '📦' 
    },
    { label: 'New Request', href: '/collections/new', icon: '➕', isActive: true },
  ],

  routes: () => [
    { label: 'Dashboard', href: '/dashboard', icon: '🏠' },
    { label: 'Routes', href: '/routes', icon: '🗺️', isActive: true },
  ],

  adminUsers: () => [
    { label: 'Dashboard', href: '/dashboard', icon: '🏠' },
    { label: 'Administration', href: '/admin', icon: '👑' },
    { label: 'Users', href: '/admin/users', icon: '👥', isActive: true },
  ],

  adminReports: () => [
    { label: 'Dashboard', href: '/dashboard', icon: '🏠' },
    { label: 'Administration', href: '/admin', icon: '👑' },
    { label: 'Reports', href: '/admin/reports', icon: '📊', isActive: true },
  ],

  profile: () => [
    { label: 'Dashboard', href: '/dashboard', icon: '🏠' },
    { label: 'Profile', href: '/profile', icon: '👤', isActive: true },
  ],

  help: () => [
    { label: 'Dashboard', href: '/dashboard', icon: '🏠' },
    { label: 'Help', href: '/help', icon: '❓', isActive: true },
  ],
};

// Hook for easy breadcrumb management in components
export const useBreadcrumbConfig = (configKey, userRole = null) => {
  const config = breadcrumbConfigs[configKey];
  
  if (!config) {
    console.warn(`Breadcrumb config '${configKey}' not found`);
    return [];
  }

  return typeof config === 'function' ? config(userRole) : config;
};

// Utility to create custom breadcrumbs
export const createBreadcrumb = (label, href, options = {}) => ({
  label,
  href,
  icon: options.icon,
  isActive: options.isActive || false,
  onClick: options.onClick,
});

// Utility to update the last breadcrumb as active
export const setLastBreadcrumbActive = (breadcrumbs) => {
  if (breadcrumbs.length === 0) return breadcrumbs;
  
  return breadcrumbs.map((breadcrumb, index) => ({
    ...breadcrumb,
    isActive: index === breadcrumbs.length - 1,
  }));
};

export default {
  generateBreadcrumbsFromPath,
  breadcrumbConfigs,
  useBreadcrumbConfig,
  createBreadcrumb,
  setLastBreadcrumbActive,
};