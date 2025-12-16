import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '../ui';
import { theme } from '../../theme';

const CollectionsList = ({ 
  collections, 
  userRole, 
  loading = false, 
  onCollectionUpdate 
}) => {
  const navigate = useNavigate();

  const getStatusColor = (status) => {
    const colors = {
      pending: theme.colors.status.warning,
      assigned: theme.colors.status.info,
      'in-progress': theme.colors.primary[600],
      completed: theme.colors.status.success,
      cancelled: theme.colors.status.error,
    };
    return colors[status] || theme.colors.gray[500];
  };

  const getWasteCategoryIcon = (category) => {
    const icons = {
      organic: '🌱',
      recyclable: '♻️',
      hazardous: '⚠️',
      general: '🗑️',
    };
    return icons[category] || '📦';
  };

  const getSectionTitle = () => {
    switch (userRole) {
      case 'admin':
        return 'Recent Collections';
      case 'collector':
        return 'Assigned Collections';
      case 'resident':
        return 'My Collection Requests';
      default:
        return 'Collections';
    }
  };

  const listStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing[4],
  };

  const headerStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[4],
  };

  const titleStyles = {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    margin: 0,
  };

  const collectionCardStyles = {
    position: 'relative',
    transition: `all ${theme.transitions.duration[200]} ${theme.transitions.timing.inOut}`,
  };

  const cardHeaderStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing[3],
    flexWrap: 'wrap',
    gap: theme.spacing[2],
  };

  const statusBadgeStyles = (status) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing[1],
    padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
    backgroundColor: `${getStatusColor(status)}20`,
    color: getStatusColor(status),
    borderRadius: theme.borderRadius.full,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  });

  const categoryBadgeStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing[1],
    padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
    backgroundColor: theme.colors.gray[100],
    color: theme.colors.text.secondary,
    borderRadius: theme.borderRadius.base,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
    textTransform: 'capitalize',
  };

  const detailsStyles = {
    display: 'grid',
    gap: theme.spacing[2],
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  };

  const detailRowStyles = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing[2],
  };

  const labelStyles = {
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
    minWidth: '80px',
    flexShrink: 0,
  };

  const emptyStateStyles = {
    textAlign: 'center',
    padding: theme.spacing[8],
    color: theme.colors.text.secondary,
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
    borderRadius: theme.borderRadius.lg,
    opacity: loading ? 1 : 0,
    visibility: loading ? 'visible' : 'hidden',
    transition: `all ${theme.transitions.duration[200]} ${theme.transitions.timing.inOut}`,
    zIndex: 1,
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleViewAll = () => {
    navigate('/collections');
  };

  const handleViewCollection = (collection) => {
    navigate(`/collections/${collection._id}`);
  };

  return (
    <Card variant="elevated" padding="lg" style={{ position: 'relative' }}>
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

      <div style={headerStyles}>
        <h3 style={titleStyles}>
          {getSectionTitle()}
        </h3>
        {collections.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewAll}
          >
            View All
          </Button>
        )}
      </div>

      {collections.length === 0 ? (
        <div style={emptyStateStyles}>
          <div style={{ fontSize: theme.typography.fontSize['3xl'], marginBottom: theme.spacing[3] }}>
            📦
          </div>
          <p style={{ margin: 0, fontSize: theme.typography.fontSize.lg }}>
            No collections found
          </p>
          <p style={{ margin: `${theme.spacing[2]} 0 0 0`, fontSize: theme.typography.fontSize.sm }}>
            {userRole === 'resident' 
              ? 'Create your first collection request to get started'
              : 'Collections will appear here when available'
            }
          </p>
        </div>
      ) : (
        <div style={listStyles}>
          {collections.map((collection) => (
            <Card
              key={collection._id}
              variant="outlined"
              padding="md"
              hover={true}
              style={collectionCardStyles}
              onClick={() => handleViewCollection(collection)}
            >
              <div style={cardHeaderStyles}>
                <div style={{ display: 'flex', gap: theme.spacing[2], flexWrap: 'wrap' }}>
                  <div style={statusBadgeStyles(collection.status)}>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: getStatusColor(collection.status),
                    }} />
                    {collection.status}
                  </div>
                  <div style={categoryBadgeStyles}>
                    {getWasteCategoryIcon(collection.wasteCategory)}
                    {collection.wasteCategory}
                  </div>
                </div>
                <div style={{
                  fontSize: theme.typography.fontSize.xs,
                  color: theme.colors.text.tertiary,
                }}>
                  {formatDate(collection.createdAt)}
                </div>
              </div>

              <div style={detailsStyles}>
                <div style={detailRowStyles}>
                  <span style={labelStyles}>Address:</span>
                  <span>{collection.pickupLocation.address}</span>
                </div>

                {collection.pickupLocation.instructions && (
                  <div style={detailRowStyles}>
                    <span style={labelStyles}>Instructions:</span>
                    <span>{collection.pickupLocation.instructions}</span>
                  </div>
                )}

                {collection.notes && (
                  <div style={detailRowStyles}>
                    <span style={labelStyles}>Notes:</span>
                    <span>{collection.notes}</span>
                  </div>
                )}

                {userRole === 'admin' && collection.requesterId && (
                  <div style={detailRowStyles}>
                    <span style={labelStyles}>Requester:</span>
                    <span>{collection.requesterId.username}</span>
                  </div>
                )}

                {collection.assignedCollector && (
                  <div style={detailRowStyles}>
                    <span style={labelStyles}>Collector:</span>
                    <span>{collection.assignedCollector.username}</span>
                  </div>
                )}

                {collection.scheduledDate && (
                  <div style={detailRowStyles}>
                    <span style={labelStyles}>Scheduled:</span>
                    <span>{formatDate(collection.scheduledDate)}</span>
                  </div>
                )}

                {collection.completedDate && (
                  <div style={detailRowStyles}>
                    <span style={labelStyles}>Completed:</span>
                    <span>{formatDate(collection.completedDate)}</span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </Card>
  );
};

export default CollectionsList;