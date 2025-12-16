import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { theme } from '../../theme';

const Breadcrumbs = ({
  items = [],
  separator = '/',
  maxItems = 5,
  showHome = true,
  className = '',
  ...props
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Auto-generate breadcrumbs from current path if no items provided
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [];

    if (showHome) {
      breadcrumbs.push({
        label: 'Home',
        href: '/',
        isActive: location.pathname === '/',
      });
    }

    // Route mapping for better labels
    const routeLabels = {
      dashboard: 'Dashboard',
      collections: 'Collections',
      routes: 'Routes',
      admin: 'Administration',
      users: 'Users',
      reports: 'Reports',
      profile: 'Profile',
      settings: 'Settings',
      help: 'Help',
      new: 'New',
      edit: 'Edit',
    };

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      
      breadcrumbs.push({
        label: routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
        href: currentPath,
        isActive: isLast,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbItems = items.length > 0 ? items : generateBreadcrumbs();

  // Truncate breadcrumbs if they exceed maxItems
  const truncatedItems = breadcrumbItems.length > maxItems
    ? [
        breadcrumbItems[0],
        { label: '...', href: null, isEllipsis: true },
        ...breadcrumbItems.slice(-maxItems + 2)
      ]
    : breadcrumbItems;

  const containerStyles = {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing[2],
    padding: `${theme.spacing[3]} 0`,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  };

  const itemStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[2],
  };

  const linkStyles = {
    color: theme.colors.text.secondary,
    textDecoration: 'none',
    padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
    borderRadius: theme.borderRadius.base,
    transition: `all ${theme.transitions.duration[200]} ${theme.transitions.timing.inOut}`,
    cursor: 'pointer',
    fontSize: 'inherit',
  };

  const activeLinkStyles = {
    ...linkStyles,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.medium,
    cursor: 'default',
  };

  const separatorStyles = {
    color: theme.colors.text.tertiary,
    fontSize: theme.typography.fontSize.sm,
    userSelect: 'none',
  };

  const ellipsisStyles = {
    color: theme.colors.text.tertiary,
    padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
    cursor: 'default',
  };

  const handleItemClick = (item, e) => {
    if (item.isActive || item.isEllipsis || !item.href) {
      e.preventDefault();
      return;
    }

    if (item.onClick) {
      item.onClick(e);
    } else {
      navigate(item.href);
    }
  };

  if (truncatedItems.length <= 1) {
    return null; // Don't show breadcrumbs for single items
  }

  return (
    <nav
      style={containerStyles}
      className={`breadcrumbs ${className}`}
      aria-label="Breadcrumb navigation"
      {...props}
    >
      {truncatedItems.map((item, index) => (
        <div key={index} style={itemStyles}>
          {item.isEllipsis ? (
            <span style={ellipsisStyles} aria-hidden="true">
              {item.label}
            </span>
          ) : (
            <a
              href={item.href}
              style={item.isActive ? activeLinkStyles : linkStyles}
              onClick={(e) => handleItemClick(item, e)}
              onMouseEnter={(e) => {
                if (!item.isActive && !item.isEllipsis) {
                  e.target.style.backgroundColor = theme.colors.gray[100];
                  e.target.style.color = theme.colors.text.primary;
                }
              }}
              onMouseLeave={(e) => {
                if (!item.isActive && !item.isEllipsis) {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = theme.colors.text.secondary;
                }
              }}
              aria-current={item.isActive ? 'page' : undefined}
            >
              {item.icon && (
                <span style={{ marginRight: theme.spacing[1] }}>
                  {item.icon}
                </span>
              )}
              {item.label}
            </a>
          )}
          
          {index < truncatedItems.length - 1 && (
            <span style={separatorStyles} aria-hidden="true">
              {separator}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
};

// Hook for managing breadcrumb state
export const useBreadcrumbs = () => {
  const [breadcrumbs, setBreadcrumbs] = React.useState([]);

  const updateBreadcrumbs = (newBreadcrumbs) => {
    setBreadcrumbs(newBreadcrumbs);
  };

  const addBreadcrumb = (breadcrumb) => {
    setBreadcrumbs(prev => [...prev, breadcrumb]);
  };

  const removeBreadcrumb = (index) => {
    setBreadcrumbs(prev => prev.filter((_, i) => i !== index));
  };

  const clearBreadcrumbs = () => {
    setBreadcrumbs([]);
  };

  return {
    breadcrumbs,
    updateBreadcrumbs,
    addBreadcrumb,
    removeBreadcrumb,
    clearBreadcrumbs,
  };
};

// Context for breadcrumb management
const BreadcrumbContext = React.createContext();

export const BreadcrumbProvider = ({ children }) => {
  const breadcrumbState = useBreadcrumbs();
  
  return (
    <BreadcrumbContext.Provider value={breadcrumbState}>
      {children}
    </BreadcrumbContext.Provider>
  );
};

export const useBreadcrumbContext = () => {
  const context = React.useContext(BreadcrumbContext);
  if (!context) {
    throw new Error('useBreadcrumbContext must be used within a BreadcrumbProvider');
  }
  return context;
};

// Higher-order component for automatic breadcrumb management
export const withBreadcrumbs = (Component, breadcrumbConfig) => {
  return function BreadcrumbWrappedComponent(props) {
    const { updateBreadcrumbs } = useBreadcrumbContext();
    const location = useLocation();

    React.useEffect(() => {
      if (typeof breadcrumbConfig === 'function') {
        const breadcrumbs = breadcrumbConfig(props, location);
        updateBreadcrumbs(breadcrumbs);
      } else if (Array.isArray(breadcrumbConfig)) {
        updateBreadcrumbs(breadcrumbConfig);
      }
    }, [location.pathname, updateBreadcrumbs, props]);

    return <Component {...props} />;
  };
};

export default Breadcrumbs;