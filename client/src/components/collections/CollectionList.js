import React, { useState, useEffect } from 'react';
import { collectionsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const CollectionList = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    wasteCategory: '',
    page: 1
  });
  const { user, isCollector } = useAuth();

  useEffect(() => {
    loadCollections();
  }, [filters]);

  const loadCollections = async () => {
    try {
      setLoading(true);
      const response = await collectionsAPI.getAll(filters);
      setCollections(response.data.requests);
    } catch (error) {
      console.error('Error loading collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (collectionId, newStatus) => {
    try {
      await collectionsAPI.update(collectionId, { status: newStatus });
      loadCollections(); // Reload to get updated data
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
      page: 1 // Reset to first page when filtering
    });
  };

  if (loading) {
    return <div className="loading">Loading collections...</div>;
  }

  return (
    <div className="collection-list">
      <div className="filters">
        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="assigned">Assigned</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          name="wasteCategory"
          value={filters.wasteCategory}
          onChange={handleFilterChange}
        >
          <option value="">All Categories</option>
          <option value="general">General</option>
          <option value="organic">Organic</option>
          <option value="recyclable">Recyclable</option>
          <option value="hazardous">Hazardous</option>
        </select>
      </div>

      <div className="collections-grid">
        {collections.map((collection) => (
          <div key={collection._id} className="collection-card">
            <div className="collection-header">
              <span className={`status-badge status-${collection.status}`}>
                {collection.status}
              </span>
              <span className="waste-category">{collection.wasteCategory}</span>
            </div>
            
            <div className="collection-details">
              <p><strong>Address:</strong> {collection.pickupLocation.address}</p>
              {collection.pickupLocation.instructions && (
                <p><strong>Instructions:</strong> {collection.pickupLocation.instructions}</p>
              )}
              <p><strong>Created:</strong> {new Date(collection.createdAt).toLocaleDateString()}</p>
              
              {collection.assignedCollector && (
                <p><strong>Collector:</strong> {collection.assignedCollector.username}</p>
              )}
            </div>

            {isCollector && collection.assignedCollector?._id === user._id && (
              <div className="collection-actions">
                {collection.status === 'assigned' && (
                  <button
                    onClick={() => handleStatusUpdate(collection._id, 'in-progress')}
                    className="btn btn-primary"
                  >
                    Start Collection
                  </button>
                )}
                {collection.status === 'in-progress' && (
                  <button
                    onClick={() => handleStatusUpdate(collection._id, 'completed')}
                    className="btn btn-primary"
                  >
                    Mark Complete
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {collections.length === 0 && (
        <p className="no-collections">No collections found.</p>
      )}
    </div>
  );
};

export default CollectionList;