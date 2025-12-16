import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '../ui';
import { theme } from '../../theme';

const SimplePage = ({ 
  title, 
  description, 
  icon = '📄',
  showBackButton = true,
  children 
}) => {
  const navigate = useNavigate();

  const containerStyles = {
    maxWidth: '800px',
    margin: '0 auto',
    padding: theme.spacing[6],
  };

  const headerStyles = {
    textAlign: 'center',
    marginBottom: theme.spacing[8],
  };

  const iconStyles = {
    fontSize: '4rem',
    marginBottom: theme.spacing[4],
  };

  const titleStyles = {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[4],
  };

  const descriptionStyles = {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeight.relaxed,
    marginBottom: theme.spacing[6],
  };

  return (
    <div style={containerStyles}>
        <div style={headerStyles}>
          <div style={iconStyles}>{icon}</div>
          <h1 style={titleStyles}>{title}</h1>
          {description && (
            <p style={descriptionStyles}>{description}</p>
          )}
          {showBackButton && (
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              style={{ marginRight: theme.spacing[3] }}
            >
              ← Back
            </Button>
          )}
          <Button
            variant="primary"
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard
          </Button>
        </div>

        {children && (
          <Card padding="lg">
            {children}
          </Card>
        )}
      </div>
    </div>
  );
};

export default SimplePage;