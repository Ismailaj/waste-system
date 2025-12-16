import React from 'react';
import { useAuth } from '../../context/AuthContext';
import SimplePage from './SimplePage';
import { theme } from '../../theme';

const ProfilePage = () => {
  const { user } = useAuth();

  const profileInfo = (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
      gap: theme.spacing[4] 
    }}>
      <div style={{ 
        padding: theme.spacing[4], 
        backgroundColor: theme.colors.gray[50], 
        borderRadius: theme.borderRadius.md 
      }}>
        <strong>Username:</strong> {user?.username || 'Not set'}
      </div>
      <div style={{ 
        padding: theme.spacing[4], 
        backgroundColor: theme.colors.gray[50], 
        borderRadius: theme.borderRadius.md 
      }}>
        <strong>Email:</strong> {user?.email || 'Not set'}
      </div>
      <div style={{ 
        padding: theme.spacing[4], 
        backgroundColor: theme.colors.gray[50], 
        borderRadius: theme.borderRadius.md 
      }}>
        <strong>Role:</strong> {user?.role || 'Not set'}
      </div>
      <div style={{ 
        padding: theme.spacing[4], 
        backgroundColor: theme.colors.gray[50], 
        borderRadius: theme.borderRadius.md 
      }}>
        <strong>Member Since:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Not available'}
      </div>
    </div>
  );

  return (
    <SimplePage
      title="User Profile"
      description="View and manage your account information"
      icon="👤"
    >
      {profileInfo}
    </SimplePage>
  );
};

export default ProfilePage;