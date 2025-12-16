import React from 'react';
import { Button } from '../ui';
import { theme } from '../../theme';

const WelcomeHeader = ({ user, onRefresh, refreshing = false }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getRoleIcon = () => {
    const icons = {
      admin: '👑',
      collector: '🚛',
      resident: '🏠',
    };
    return icons[user?.role] || '👤';
  };

  const getRoleDescription = () => {
    const descriptions = {
      admin: 'System Administrator',
      collector: 'Waste Collector',
      resident: 'Resident',
    };
    return descriptions[user?.role] || 'User';
  };

  const headerStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: theme.spacing[4],
    padding: `${theme.spacing[6]} 0`,
    borderBottom: `1px solid ${theme.colors.gray[200]}`,
    marginBottom: theme.spacing[6],
  };

  const welcomeStyles = {
    flex: 1,
    minWidth: '300px',
  };

  const titleStyles = {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    margin: `0 0 ${theme.spacing[2]} 0`,
    lineHeight: theme.typography.lineHeight.tight,
  };

  const subtitleStyles = {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.secondary,
    margin: `0 0 ${theme.spacing[1]} 0`,
  };

  const roleStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing[2],
    padding: `${theme.spacing[1]} ${theme.spacing[3]}`,
    backgroundColor: theme.colors.primary[50],
    color: theme.colors.primary[700],
    borderRadius: theme.borderRadius.full,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  };

  const actionsStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[3],
    flexWrap: 'wrap',
  };

  const timeStyles = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    textAlign: 'right',
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div style={headerStyles}>
      <div style={welcomeStyles}>
        <h1 style={titleStyles}>
          {getGreeting()}, {user?.profile?.firstName || user?.username}!
        </h1>
        <p style={subtitleStyles}>
          Welcome back to your waste management dashboard
        </p>
        <div style={roleStyles}>
          <span>{getRoleIcon()}</span>
          <span>{getRoleDescription()}</span>
        </div>
      </div>

      <div style={actionsStyles}>
        <div style={timeStyles}>
          <div style={{ fontWeight: theme.typography.fontWeight.medium }}>
            {getCurrentDate()}
          </div>
          <div style={{ marginTop: theme.spacing[1] }}>
            {getCurrentTime()}
          </div>
        </div>

        <Button
          variant="outline"
          onClick={onRefresh}
          disabled={refreshing}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing[2],
          }}
        >
          {refreshing ? (
            <>
              <div style={{
                width: '1rem',
                height: '1rem',
                border: `2px solid ${theme.colors.primary[200]}`,
                borderTop: `2px solid ${theme.colors.primary[600]}`,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }} />
              Refreshing...
            </>
          ) : (
            <>
              🔄 Refresh
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default WelcomeHeader;