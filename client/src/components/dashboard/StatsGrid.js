import React from 'react';
import { Card } from '../ui';
import { theme } from '../../theme';

const StatsGrid = ({ data, loading = false }) => {
  const gridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: theme.spacing[6],
    marginBottom: theme.spacing[6],
  };

  const statCardStyles = {
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
  };

  const statNumberStyles = {
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: theme.typography.fontWeight.bold,
    margin: `0 0 ${theme.spacing[2]} 0`,
    lineHeight: theme.typography.lineHeight.tight,
  };

  const statLabelStyles = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: theme.typography.fontWeight.medium,
  };

  const statDescriptionStyles = {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing[1],
  };

  const iconStyles = {
    fontSize: theme.typography.fontSize['2xl'],
    marginBottom: theme.spacing[3],
    opacity: 0.8,
  };

  const loadingOverlayStyles = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: loading ? 1 : 0,
    visibility: loading ? 'visible' : 'hidden',
    transition: `all ${theme.transitions.duration[200]} ${theme.transitions.timing.inOut}`,
  };

  const stats = [
    {
      id: 'today-collections',
      label: "Today's Collections",
      value: data?.today?.collections || 0,
      icon: '📦',
      color: theme.colors.primary[600],
      description: 'New requests today',
    },
    {
      id: 'completed-today',
      label: 'Completed Today',
      value: data?.today?.completedCollections || 0,
      icon: '✅',
      color: theme.colors.secondary[600],
      description: 'Successfully collected',
    },
    {
      id: 'active-routes',
      label: 'Active Routes',
      value: data?.today?.activeRoutes || 0,
      icon: '🗺️',
      color: theme.colors.accent[600],
      description: 'Routes in progress',
    },
    {
      id: 'total-users',
      label: 'Total Users',
      value: data?.overall?.totalUsers || 0,
      icon: '👥',
      color: theme.colors.gray[600],
      description: 'Registered users',
    },
    {
      id: 'pending-collections',
      label: 'Pending Collections',
      value: data?.overall?.pendingCollections || 0,
      icon: '⏳',
      color: theme.colors.status.warning,
      description: 'Awaiting assignment',
    },
    {
      id: 'total-collectors',
      label: 'Active Collectors',
      value: data?.overall?.totalCollectors || 0,
      icon: '🚛',
      color: theme.colors.primary[500],
      description: 'Available collectors',
    },
  ];

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing[6],
      }}>
        <h2 style={{
          fontSize: theme.typography.fontSize['2xl'],
          fontWeight: theme.typography.fontWeight.semibold,
          color: theme.colors.text.primary,
          margin: 0,
        }}>
          System Overview
        </h2>
        <div style={{
          fontSize: theme.typography.fontSize.sm,
          color: theme.colors.text.secondary,
        }}>
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      <div style={gridStyles}>
        {stats.map((stat) => (
          <Card
            key={stat.id}
            variant="elevated"
            padding="lg"
            hover={true}
            style={statCardStyles}
          >
            <div style={loadingOverlayStyles}>
              <div style={{
                width: '1.5rem',
                height: '1.5rem',
                border: `3px solid ${theme.colors.primary[200]}`,
                borderTop: `3px solid ${theme.colors.primary[600]}`,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }} />
            </div>

            <div style={iconStyles}>
              {stat.icon}
            </div>
            
            <div
              style={{
                ...statNumberStyles,
                color: stat.color,
              }}
            >
              {formatNumber(stat.value)}
            </div>
            
            <div style={statLabelStyles}>
              {stat.label}
            </div>
            
            <div style={statDescriptionStyles}>
              {stat.description}
            </div>

            {/* Background decoration */}
            <div style={{
              position: 'absolute',
              top: '-50%',
              right: '-50%',
              width: '100%',
              height: '100%',
              background: `linear-gradient(45deg, transparent 30%, ${stat.color}10 70%)`,
              borderRadius: '50%',
              zIndex: -1,
            }} />
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StatsGrid;