import React, { useState } from 'react';
import { Button } from '../ui';
import { theme } from '../../theme';

const QuickAccessMenu = ({ userRole, onAction, refreshing = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTooltip, setShowTooltip] = useState(null);

  const getQuickActions = () => {
    const baseActions = [
      {
        id: 'refresh-data',
        label: 'Refresh',
        icon: '🔄',
        tooltip: 'Refresh dashboard data',
        shortcut: 'R',
        roles: ['resident', 'collector', 'admin'],
      },
    ];

    const roleActions = {
      resident: [
        {
          id: 'new-request',
          label: 'New Request',
          icon: '➕',
          tooltip: 'Create new collection request',
          shortcut: 'N',
        },
        {
          id: 'view-collections',
          label: 'My Requests',
          icon: '📦',
          tooltip: 'View my collection requests',
          shortcut: 'C',
        },
      ],
      collector: [
        {
          id: 'view-routes',
          label: 'My Routes',
          icon: '🗺️',
          tooltip: 'View assigned routes',
          shortcut: 'R',
        },
        {
          id: 'view-collections',
          label: 'Collections',
          icon: '📦',
          tooltip: 'View assigned collections',
          shortcut: 'C',
        },
      ],
      admin: [
        {
          id: 'manage-users',
          label: 'Users',
          icon: '👥',
          tooltip: 'Manage system users',
          shortcut: 'U',
        },
        {
          id: 'view-reports',
          label: 'Reports',
          icon: '📊',
          tooltip: 'View system reports',
          shortcut: 'P',
        },
        {
          id: 'view-collections',
          label: 'Collections',
          icon: '📦',
          tooltip: 'View all collections',
          shortcut: 'C',
        },
      ],
    };

    return [...baseActions, ...(roleActions[userRole] || [])];
  };

  const actions = getQuickActions();

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyPress = (e) => {
      // Only trigger if no input is focused and Ctrl/Cmd is pressed
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (!e.ctrlKey && !e.metaKey) return;

      const action = actions.find(a => a.shortcut?.toLowerCase() === e.key.toLowerCase());
      if (action) {
        e.preventDefault();
        onAction(action);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [actions, onAction]);

  const menuStyles = {
    position: 'fixed',
    bottom: theme.spacing[6],
    right: theme.spacing[6],
    zIndex: theme.zIndex.fixed,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: theme.spacing[2],
  };

  const toggleButtonStyles = {
    width: '3.5rem',
    height: '3.5rem',
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary[600],
    color: theme.colors.text.inverse,
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: theme.typography.fontSize.xl,
    boxShadow: theme.shadows.lg,
    transition: `all ${theme.transitions.duration[200]} ${theme.transitions.timing.inOut}`,
    transform: isExpanded ? 'rotate(45deg)' : 'rotate(0deg)',
  };

  const actionButtonStyles = {
    width: '3rem',
    height: '3rem',
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface.primary,
    color: theme.colors.text.primary,
    border: `1px solid ${theme.colors.gray[200]}`,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: theme.typography.fontSize.lg,
    boxShadow: theme.shadows.md,
    transition: `all ${theme.transitions.duration[200]} ${theme.transitions.timing.inOut}`,
    opacity: isExpanded ? 1 : 0,
    transform: isExpanded ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.8)',
    visibility: isExpanded ? 'visible' : 'hidden',
  };

  const tooltipStyles = {
    position: 'absolute',
    right: '100%',
    top: '50%',
    transform: 'translateY(-50%)',
    marginRight: theme.spacing[3],
    backgroundColor: theme.colors.gray[800],
    color: theme.colors.text.inverse,
    padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.fontSize.sm,
    whiteSpace: 'nowrap',
    boxShadow: theme.shadows.lg,
    zIndex: theme.zIndex.tooltip,
    opacity: showTooltip ? 1 : 0,
    visibility: showTooltip ? 'visible' : 'hidden',
    transition: `all ${theme.transitions.duration[200]} ${theme.transitions.timing.inOut}`,
  };

  const handleActionClick = (action) => {
    onAction(action);
    setIsExpanded(false);
  };

  return (
    <div style={menuStyles}>
      {/* Action Buttons */}
      {actions.slice(1).map((action, index) => (
        <div
          key={action.id}
          style={{ 
            position: 'relative',
            transitionDelay: `${index * 50}ms`,
          }}
        >
          <button
            style={actionButtonStyles}
            onClick={() => handleActionClick(action)}
            onMouseEnter={() => setShowTooltip(action.id)}
            onMouseLeave={() => setShowTooltip(null)}
            disabled={refreshing && action.id === 'refresh-data'}
            title={action.tooltip}
          >
            {refreshing && action.id === 'refresh-data' ? (
              <div style={{
                width: '1rem',
                height: '1rem',
                border: `2px solid ${theme.colors.primary[200]}`,
                borderTop: `2px solid ${theme.colors.primary[600]}`,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }} />
            ) : (
              action.icon
            )}
          </button>
          
          {/* Tooltip */}
          {showTooltip === action.id && (
            <div style={tooltipStyles}>
              {action.tooltip}
              {action.shortcut && (
                <span style={{
                  marginLeft: theme.spacing[2],
                  padding: `${theme.spacing[0.5]} ${theme.spacing[1]}`,
                  backgroundColor: theme.colors.gray[700],
                  borderRadius: theme.borderRadius.sm,
                  fontSize: theme.typography.fontSize.xs,
                }}>
                  Ctrl+{action.shortcut}
                </span>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Toggle Button */}
      <button
        style={toggleButtonStyles}
        onClick={() => setIsExpanded(!isExpanded)}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = theme.colors.primary[700];
          e.target.style.transform = `${isExpanded ? 'rotate(45deg)' : 'rotate(0deg)'} scale(1.1)`;
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = theme.colors.primary[600];
          e.target.style.transform = `${isExpanded ? 'rotate(45deg)' : 'rotate(0deg)'} scale(1)`;
        }}
        title="Quick Actions Menu"
      >
        ➕
      </button>
    </div>
  );
};

export default QuickAccessMenu;