import React from 'react';

const StatusBadge = ({ status, size = 'normal' }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#ffc107';
      case 'assigned':
        return '#007bff';
      case 'in-progress':
        return '#28a745';
      case 'completed':
        return '#17a2b8';
      case 'cancelled':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'in-progress':
        return 'In Progress';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const badgeStyle = {
    backgroundColor: getStatusColor(status),
    color: 'white',
    padding: size === 'small' ? '0.2rem 0.5rem' : '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: size === 'small' ? '0.7rem' : '0.8rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    display: 'inline-block'
  };

  return (
    <span style={badgeStyle}>
      {getStatusText(status)}
    </span>
  );
};

export default StatusBadge;