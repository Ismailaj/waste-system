import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../ui/Toast';
import { collectionsAPI } from '../../services/api';
import { Button, Card } from '../ui';
import CollectionsList from '../dashboard/CollectionsList';
import { theme } from '../../theme';

const CollectionsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    wasteCategory: '',
    page: 1,
    limit: 20,
  });

  useEffect(() => {
    loadCollections();
  }, [filters]);

  const loadCollections = async () => {
    try {
      setLoading(true);
      const response = await collectionsAPI.getAll(filters);
      setCollections(response.data.requests || []);
    } catch (error) {
      console.error('Error loading collections:', error);
      // Show mock data if API fails
      setCollections([
        {
          _id: '1',
          wasteCategory: 'organic',
          status: 'pending',
          pickupLocation: { address: '123 Main St' },
          createdAt: new Date().toISOString(),
        },
        {
          _id: '2',
          wasteCategory: 'recyclable',
          status: 'assigned',
          pickupLocation: { address: '456 Oak Ave' },
          createdAt: new Date().toISOString(),
        }
      ]);
      toast.error('Using demo data - API not available');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filtering
    }));
  };

  const getPageTitle = () => {
    switch (user?.role) {
      case 'admin':
        return 'All Collections';
      case 'collector':
        return 'Assigned Collections';
      case 'resident':
        return 'My Collection Requests';
      default:
        return 'Collections';
    }
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

  const filtersStyles = {
    display: 'flex',
    gap: theme.spacing[4],
    marginBottom: theme.spacing[6],
    flexWrap: 'wrap',
  };

  const selectStyles = {
    padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
    border: `1px solid ${theme.colors.gray[300]}`,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.fontSize.sm,
    backgroundColor: theme.colors.surface.primary,
    color: theme.colors.text.primary,
    minWidth: '150px',
  };

  return (
    <div style={headerStyles}>
        <h1 style={titleStyles}>{getPageTitle()}</h1>
        <div style={{ display: 'flex', gap: theme.spacing[3] }}>
          {user?.role === 'resident' && (
            <Button
              variant="primary"
              onClick={() => navigate('/collections/new')}
            >
              ➕ New Request
            </Button>
          )}
          <Button
            variant="outline"
            onClick={loadCollections}
            disabled={loading}
          >
            🔄 Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card variant="outlined" padding="md" style={{ marginBottom: theme.spacing[6] }}>
        <div style={filtersStyles}>
          <div>
            <label style={{
              display: 'block',
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing[1],
            }}>
              Status
            </label>
            <select
              style={selectStyles}
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing[1],
            }}>
              Waste Category
            </label>
            <select
              style={selectStyles}
              value={filters.wasteCategory}
              onChange={(e) => handleFilterChange('wasteCategory', e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="organic">Organic</option>
              <option value="recyclable">Recyclable</option>
              <option value="hazardous">Hazardous</option>
              <option value="general">General</option>
            </select>
          </div>

          {(filters.status || filters.wasteCategory) && (
            <div style={{ display: 'flex', alignItems: 'end' }}>
              <Button
                variant="ghost"
                onClick={() => setFilters({ status: '', wasteCategory: '', page: 1, limit: 20 })}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Collections List */}
      <CollectionsList
        collections={collections}
        userRole={user?.role}
        loading={loading}
        onCollectionUpdate={loadCollections}
      />
    </div>
  );
};

export default CollectionsPage;