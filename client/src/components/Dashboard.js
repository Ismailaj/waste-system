import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from './ui/Toast';
import { collectionsAPI, adminAPI } from '../services/api';
import { Button, Card } from './ui';
import QuickAccessMenu from './dashboard/QuickAccessMenu';
import StatsGrid from './dashboard/StatsGrid';
import CollectionsList from './dashboard/CollectionsList';
import WelcomeHeader from './dashboard/WelcomeHeader';
import { theme } from '../theme';

const Dashboard = () => {
  const { user, isAdmin, isCollector, isResident } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadDashboardData = async (showRefreshToast = false) => {
    try {
      setLoading(!showRefreshToast);
      setRefreshing(showRefreshToast);
      
      if (isAdmin) {
        const [collectionsRes, dashboardRes] = await Promise.all([
          collectionsAPI.getAll({ limit: 10 }),
          adminAPI.getDashboard()
        ]);
        setCollections(collectionsRes.data.requests);
        setDashboardData(dashboardRes.data.dashboard);
      } else {
        const collectionsRes = await collectionsAPI.getAll({ limit: 10 });
        setCollections(collectionsRes.data.requests);
      }

      if (showRefreshToast) {
        toast.success('Dashboard data refreshed');
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData(true);
  };

  const handleNewCollection = (newCollection) => {
    setCollections([newCollection, ...collections]);
    toast.success('Collection request created successfully');
  };

  const handleQuickAction = (action) => {
    switch (action.id) {
      case 'new-request':
        navigate('/collections/new');
        break;
      case 'view-collections':
        navigate('/collections');
        break;
      case 'view-routes':
        navigate('/routes');
        break;
      case 'manage-users':
        navigate('/admin/users');
        break;
      case 'view-reports':
        navigate('/admin/reports');
        break;
      case 'refresh-data':
        handleRefresh();
        break;
      default:
        console.log('Quick action:', action);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh',
        fontSize: theme.typography.fontSize.lg,
        color: theme.colors.text.secondary,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing[3],
        }}>
          <div style={{
            width: '1.5rem',
            height: '1.5rem',
            border: `3px solid ${theme.colors.primary[200]}`,
            borderTop: `3px solid ${theme.colors.primary[600]}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
          Loading dashboard...
        </div>
      </div>
    );
  }

  const dashboardStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing[6],
    position: 'relative',
  };

  const contentGridStyles = {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: theme.spacing[6],
  };

  return (
    <div style={dashboardStyles}>
      {/* Quick Access Menu */}
      <QuickAccessMenu 
        userRole={user?.role}
        onAction={handleQuickAction}
        refreshing={refreshing}
      />

      {/* Welcome Header */}
      <WelcomeHeader 
        user={user}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      {/* Admin Stats */}
      {isAdmin && dashboardData && (
        <StatsGrid 
          data={dashboardData}
          loading={refreshing}
        />
      )}

      {/* Main Content */}
      <div style={contentGridStyles}>
        {/* Quick Actions Card for Residents */}
        {isResident && (
          <Card variant="elevated" padding="lg">
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: theme.spacing[4],
            }}>
              <h3 style={{
                fontSize: theme.typography.fontSize.xl,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.text.primary,
                margin: 0,
              }}>
                Quick Actions
              </h3>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: theme.spacing[4],
            }}>
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/collections/new')}
                style={{ justifyContent: 'flex-start', gap: theme.spacing[3] }}
              >
                <span style={{ fontSize: theme.typography.fontSize.lg }}>➕</span>
                New Collection Request
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/collections')}
                style={{ justifyContent: 'flex-start', gap: theme.spacing[3] }}
              >
                <span style={{ fontSize: theme.typography.fontSize.lg }}>📦</span>
                View My Requests
              </Button>
            </div>
          </Card>
        )}

        {/* Collections List */}
        <CollectionsList
          collections={collections}
          userRole={user?.role}
          loading={refreshing}
          onCollectionUpdate={loadDashboardData}
        />

        {/* Additional Role-Specific Content */}
        {isCollector && (
          <Card variant="elevated" padding="lg">
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: theme.spacing[4],
            }}>
              <h3 style={{
                fontSize: theme.typography.fontSize.xl,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.text.primary,
                margin: 0,
              }}>
                Today's Route
              </h3>
              <Button
                variant="outline"
                onClick={() => navigate('/routes')}
              >
                View Full Route
              </Button>
            </div>
            
            <div style={{
              padding: theme.spacing[4],
              backgroundColor: theme.colors.primary[50],
              borderRadius: theme.borderRadius.md,
              textAlign: 'center',
            }}>
              <p style={{
                color: theme.colors.text.secondary,
                margin: 0,
              }}>
                🗺️ Check your assigned routes and update collection status
              </p>
            </div>
          </Card>
        )}

        {isAdmin && (
          <Card variant="elevated" padding="lg">
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: theme.spacing[4],
            }}>
              <h3 style={{
                fontSize: theme.typography.fontSize.xl,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.text.primary,
                margin: 0,
              }}>
                System Management
              </h3>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: theme.spacing[4],
            }}>
              <Button
                variant="outline"
                onClick={() => navigate('/admin/users')}
                style={{ justifyContent: 'flex-start', gap: theme.spacing[3] }}
              >
                <span style={{ fontSize: theme.typography.fontSize.lg }}>👥</span>
                Manage Users
              </Button>
              
              <Button
                variant="outline"
                onClick={() => navigate('/admin/routes')}
                style={{ justifyContent: 'flex-start', gap: theme.spacing[3] }}
              >
                <span style={{ fontSize: theme.typography.fontSize.lg }}>🗺️</span>
                Manage Routes
              </Button>
              
              <Button
                variant="outline"
                onClick={() => navigate('/admin/reports')}
                style={{ justifyContent: 'flex-start', gap: theme.spacing[3] }}
              >
                <span style={{ fontSize: theme.typography.fontSize.lg }}>📊</span>
                View Reports
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;