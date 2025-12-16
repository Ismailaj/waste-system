import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from './ui';
import { theme } from '../theme';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setShowUserMenu(false);
  };

  const handleLogoClick = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  // Role-based navigation items
  const getNavigationItems = () => {
    if (!user) return [];

    const baseItems = [
      { label: 'Dashboard', path: '/dashboard', roles: ['resident', 'collector', 'admin'] },
    ];

    const roleSpecificItems = {
      resident: [
        { label: 'My Requests', path: '/collections', roles: ['resident'] },
        { label: 'New Request', path: '/collections/new', roles: ['resident'] },
      ],
      collector: [
        { label: 'My Routes', path: '/routes', roles: ['collector'] },
        { label: 'Collections', path: '/collections', roles: ['collector'] },
      ],
      admin: [
        { label: 'Users', path: '/admin/users', roles: ['admin'] },
        { label: 'Collections', path: '/collections', roles: ['admin'] },
        { label: 'Routes', path: '/admin/routes', roles: ['admin'] },
        { label: 'Reports', path: '/admin/reports', roles: ['admin'] },
      ],
    };

    return [...baseItems, ...(roleSpecificItems[user.role] || [])];
  };

  const navigationItems = getNavigationItems();

  const headerStyles = {
    backgroundColor: theme.colors.surface.primary,
    borderBottom: `1px solid ${theme.colors.gray[200]}`,
    boxShadow: theme.shadows.sm,
    position: 'sticky',
    top: 0,
    zIndex: theme.zIndex.sticky,
  };

  const containerStyles = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: `0 ${theme.spacing[4]}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '4rem',
  };

  const logoStyles = {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary[600],
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[2],
  };

  const navStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[6],
  };

  const navItemStyles = {
    color: theme.colors.text.secondary,
    textDecoration: 'none',
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
    borderRadius: theme.borderRadius.md,
    transition: `all ${theme.transitions.duration[200]} ${theme.transitions.timing.inOut}`,
    cursor: 'pointer',
  };

  const activeNavItemStyles = {
    ...navItemStyles,
    color: theme.colors.primary[600],
    backgroundColor: theme.colors.primary[50],
  };

  const userMenuStyles = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[3],
  };

  const userInfoStyles = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    fontSize: theme.typography.fontSize.sm,
  };

  const userNameStyles = {
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.medium,
  };

  const userRoleStyles = {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.xs,
    textTransform: 'capitalize',
  };

  const avatarStyles = {
    width: '2.5rem',
    height: '2.5rem',
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary[100],
    color: theme.colors.primary[600],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: theme.typography.fontWeight.semibold,
    cursor: 'pointer',
    border: `2px solid ${theme.colors.primary[200]}`,
    transition: `all ${theme.transitions.duration[200]} ${theme.transitions.timing.inOut}`,
  };

  const dropdownStyles = {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: theme.spacing[2],
    backgroundColor: theme.colors.surface.primary,
    border: `1px solid ${theme.colors.gray[200]}`,
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadows.lg,
    minWidth: '200px',
    zIndex: theme.zIndex.dropdown,
    opacity: showUserMenu ? 1 : 0,
    visibility: showUserMenu ? 'visible' : 'hidden',
    transform: showUserMenu ? 'translateY(0)' : 'translateY(-10px)',
    transition: `all ${theme.transitions.duration[200]} ${theme.transitions.timing.inOut}`,
  };

  const dropdownItemStyles = {
    display: 'block',
    width: '100%',
    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
    color: theme.colors.text.secondary,
    textDecoration: 'none',
    fontSize: theme.typography.fontSize.sm,
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    transition: `all ${theme.transitions.duration[150]} ${theme.transitions.timing.inOut}`,
  };

  const mobileMenuButtonStyles = {
    display: 'none',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '2rem',
    height: '2rem',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    gap: '3px',
  };

  const hamburgerLineStyles = {
    width: '18px',
    height: '2px',
    backgroundColor: theme.colors.text.primary,
    transition: `all ${theme.transitions.duration[200]} ${theme.transitions.timing.inOut}`,
  };

  const mobileNavStyles = {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface.primary,
    border: `1px solid ${theme.colors.gray[200]}`,
    borderTop: 'none',
    boxShadow: theme.shadows.lg,
    display: showMobileMenu ? 'block' : 'none',
    zIndex: theme.zIndex.dropdown,
  };

  const getUserInitials = () => {
    if (user?.profile?.firstName && user?.profile?.lastName) {
      return `${user.profile.firstName[0]}${user.profile.lastName[0]}`.toUpperCase();
    }
    return user?.username?.[0]?.toUpperCase() || 'U';
  };

  const getRoleIcon = () => {
    const icons = {
      admin: '👑',
      collector: '🚛',
      resident: '🏠',
    };
    return icons[user?.role] || '👤';
  };

  return (
    <header style={headerStyles}>
      <div style={containerStyles}>
        {/* Logo */}
        <div style={logoStyles} onClick={handleLogoClick}>
          <span style={{ fontSize: theme.typography.fontSize['3xl'] }}>♻️</span>
          <span className="hidden sm:block">Waste Management</span>
          <span className="sm:hidden">WMS</span>
        </div>

        {/* Desktop Navigation */}
        <nav style={{ ...navStyles, display: user ? 'flex' : 'none' }} className="hidden md:flex">
          {navigationItems.map((item) => (
            <a
              key={item.path}
              href={item.path}
              onClick={(e) => {
                e.preventDefault();
                navigate(item.path);
              }}
              style={location.pathname === item.path ? activeNavItemStyles : navItemStyles}
              onMouseEnter={(e) => {
                if (location.pathname !== item.path) {
                  e.target.style.color = theme.colors.text.primary;
                  e.target.style.backgroundColor = theme.colors.gray[50];
                }
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== item.path) {
                  e.target.style.color = theme.colors.text.secondary;
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* User Menu */}
        {user ? (
          <div style={userMenuStyles}>
            {/* Desktop User Info */}
            <div style={userInfoStyles} className="hidden sm:flex">
              <span style={userNameStyles}>
                {user.profile?.firstName || user.username}
              </span>
              <span style={userRoleStyles}>
                {getRoleIcon()} {user.role}
              </span>
            </div>

            {/* User Avatar */}
            <div
              style={avatarStyles}
              onClick={toggleUserMenu}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = theme.colors.primary[200];
                e.target.style.borderColor = theme.colors.primary[300];
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = theme.colors.primary[100];
                e.target.style.borderColor = theme.colors.primary[200];
              }}
            >
              {getUserInitials()}
            </div>

            {/* User Dropdown */}
            <div style={dropdownStyles}>
              <div style={{ padding: theme.spacing[4], borderBottom: `1px solid ${theme.colors.gray[200]}` }}>
                <div style={{ fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.medium }}>
                  {user.profile?.firstName || user.username}
                </div>
                <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary }}>
                  {user.email}
                </div>
              </div>
              <button
                style={dropdownItemStyles}
                onClick={() => {
                  navigate('/profile');
                  setShowUserMenu(false);
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = theme.colors.gray[50];
                  e.target.style.color = theme.colors.text.primary;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = theme.colors.text.secondary;
                }}
              >
                Profile Settings
              </button>
              <button
                style={dropdownItemStyles}
                onClick={handleLogout}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = theme.colors.status.error;
                  e.target.style.color = theme.colors.text.inverse;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = theme.colors.text.secondary;
                }}
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: theme.spacing[3] }}>
            <Button
              variant="ghost"
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate('/register')}
            >
              Sign Up
            </Button>
          </div>
        )}

        {/* Mobile Menu Button */}
        <button
          style={{ ...mobileMenuButtonStyles, display: user ? 'flex' : 'none' }}
          className="md:hidden"
          onClick={toggleMobileMenu}
        >
          <div style={hamburgerLineStyles} />
          <div style={hamburgerLineStyles} />
          <div style={hamburgerLineStyles} />
        </button>
      </div>

      {/* Mobile Navigation */}
      {user && (
        <div style={mobileNavStyles} className="md:hidden">
          {navigationItems.map((item) => (
            <a
              key={item.path}
              href={item.path}
              onClick={(e) => {
                e.preventDefault();
                navigate(item.path);
                setShowMobileMenu(false);
              }}
              style={{
                display: 'block',
                padding: theme.spacing[4],
                color: location.pathname === item.path ? theme.colors.primary[600] : theme.colors.text.secondary,
                textDecoration: 'none',
                borderBottom: `1px solid ${theme.colors.gray[200]}`,
                backgroundColor: location.pathname === item.path ? theme.colors.primary[50] : 'transparent',
              }}
            >
              {item.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
};

export default Header;