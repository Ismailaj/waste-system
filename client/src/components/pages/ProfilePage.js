import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../ui/Toast';
import { Button, Card } from '../ui';
import { AppLayout } from '../layout';
import { theme } from '../../theme';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.profile?.firstName || '',
    lastName: user?.profile?.lastName || '',
    phone: user?.profile?.phone || '',
    address: user?.profile?.address || '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await updateProfile(formData);
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.profile?.firstName || '',
      lastName: user?.profile?.lastName || '',
      phone: user?.profile?.phone || '',
      address: user?.profile?.address || '',
    });
    setEditing(false);
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
    alignItems: 'center',
    marginBottom: theme.spacing[6],
    flexWrap: 'wrap',
    gap: theme.spacing[4],
  };

  const titleStyles = {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    margin: 0,
  };

  const formStyles = {
    display: 'grid',
    gap: theme.spacing[4],
  };

  const inputGroupStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing[1],
  };

  const labelStyles = {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
  };

  const inputStyles = {
    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
    border: `1px solid ${theme.colors.gray[300]}`,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.fontSize.base,
    backgroundColor: theme.colors.surface.primary,
    color: theme.colors.text.primary,
    transition: `border-color ${theme.transitions.duration[200]} ${theme.transitions.timing.inOut}`,
  };

  const readOnlyInputStyles = {
    ...inputStyles,
    backgroundColor: theme.colors.gray[50],
    cursor: 'not-allowed',
  };

  const avatarStyles = {
    width: '5rem',
    height: '5rem',
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary[100],
    color: theme.colors.primary[600],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    border: `3px solid ${theme.colors.primary[200]}`,
    margin: '0 auto',
  };

  const roleCardStyles = {
    textAlign: 'center',
    padding: theme.spacing[6],
  };

  const getUserInitials = () => {
    if (formData.firstName && formData.lastName) {
      return `${formData.firstName[0]}${formData.lastName[0]}`.toUpperCase();
    }
    return user?.username?.[0]?.toUpperCase() || 'U';
  };

  return (
    <AppLayout showBreadcrumbs={true}>
      <div style={headerStyles}>
        <h1 style={titleStyles}>Profile Settings</h1>
        <div style={{ display: 'flex', gap: theme.spacing[3] }}>
          {!editing ? (
            <Button
              variant="primary"
              onClick={() => setEditing(true)}
            >
              ✏️ Edit Profile
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                loading={loading}
              >
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: theme.spacing[6],
      }}>
        {/* Profile Info Card */}
        <Card variant="elevated" padding="lg" style={roleCardStyles}>
          <div style={avatarStyles}>
            {getUserInitials()}
          </div>
          
          <h3 style={{
            fontSize: theme.typography.fontSize.xl,
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.text.primary,
            margin: `${theme.spacing[4]} 0 ${theme.spacing[2]} 0`,
          }}>
            {formData.firstName && formData.lastName 
              ? `${formData.firstName} ${formData.lastName}`
              : user?.username
            }
          </h3>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: theme.spacing[2],
            padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
            backgroundColor: theme.colors.primary[50],
            color: theme.colors.primary[700],
            borderRadius: theme.borderRadius.full,
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.medium,
            marginBottom: theme.spacing[4],
          }}>
            <span>{getRoleIcon()}</span>
            <span>{getRoleDescription()}</span>
          </div>

          <div style={{
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.text.secondary,
          }}>
            <p style={{ margin: `0 0 ${theme.spacing[1]} 0` }}>
              <strong>Username:</strong> {user?.username}
            </p>
            <p style={{ margin: `0 0 ${theme.spacing[1]} 0` }}>
              <strong>Email:</strong> {user?.email}
            </p>
            <p style={{ margin: 0 }}>
              <strong>Member since:</strong> {new Date(user?.createdAt).toLocaleDateString()}
            </p>
          </div>
        </Card>

        {/* Profile Form Card */}
        <Card variant="elevated" padding="lg">
          <h3 style={{
            fontSize: theme.typography.fontSize.xl,
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.text.primary,
            margin: `0 0 ${theme.spacing[6]} 0`,
          }}>
            Personal Information
          </h3>

          <form style={formStyles} onSubmit={(e) => e.preventDefault()}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: theme.spacing[4],
            }}>
              <div style={inputGroupStyles}>
                <label style={labelStyles}>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  style={editing ? inputStyles : readOnlyInputStyles}
                  disabled={!editing}
                  placeholder="Enter your first name"
                />
              </div>

              <div style={inputGroupStyles}>
                <label style={labelStyles}>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  style={editing ? inputStyles : readOnlyInputStyles}
                  disabled={!editing}
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            <div style={inputGroupStyles}>
              <label style={labelStyles}>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                style={editing ? inputStyles : readOnlyInputStyles}
                disabled={!editing}
                placeholder="Enter your phone number"
              />
            </div>

            <div style={inputGroupStyles}>
              <label style={labelStyles}>Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                style={{
                  ...editing ? inputStyles : readOnlyInputStyles,
                  minHeight: '100px',
                  resize: 'vertical',
                }}
                disabled={!editing}
                placeholder="Enter your address"
              />
            </div>

            {/* Read-only fields */}
            <div style={{
              padding: theme.spacing[4],
              backgroundColor: theme.colors.gray[50],
              borderRadius: theme.borderRadius.md,
              border: `1px solid ${theme.colors.gray[200]}`,
            }}>
              <h4 style={{
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.text.primary,
                margin: `0 0 ${theme.spacing[3]} 0`,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Account Information
              </h4>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: theme.spacing[4],
              }}>
                <div style={inputGroupStyles}>
                  <label style={labelStyles}>Username</label>
                  <input
                    type="text"
                    value={user?.username || ''}
                    style={readOnlyInputStyles}
                    disabled
                  />
                </div>

                <div style={inputGroupStyles}>
                  <label style={labelStyles}>Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    style={readOnlyInputStyles}
                    disabled
                  />
                </div>
              </div>

              <p style={{
                fontSize: theme.typography.fontSize.xs,
                color: theme.colors.text.tertiary,
                margin: `${theme.spacing[3]} 0 0 0`,
              }}>
                Username and email cannot be changed. Contact an administrator if you need to update these fields.
              </p>
            </div>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ProfilePage;