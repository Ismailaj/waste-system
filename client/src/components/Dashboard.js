import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { collectionsAPI, adminAPI } from '../services/api';
import CollectionRequestForm from './collections/CollectionRequestForm';

const Dashboard = () => {
  const { user, isAdmin, isCollector, isResident } = useAuth();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
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
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewCollection = (newCollection) => {
    setCollections([newCollection, ...collections]);
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {user?.profile?.firstName || user?.username}!</h1>
        <p>Role: {user?.role}</p>
      </div>

      {isAdmin && dashboardData && (
        <div className="admin-stats">
          <h2>System Overview</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Today's Collections</h3>
              <p className="stat-number">{dashboardData.today.collections}</p>
            </div>
            <div className="stat-card">
              <h3>Completed Today</h3>
              <p className="stat-number">{dashboardData.today.completedCollections}</p>
            </div>
            <div className="stat-card">
              <h3>Active Routes</h3>
              <p className="stat-number">{dashboardData.today.activeRoutes}</p>
            </div>
            <div className="stat-card">
              <h3>Total Users</h3>
              <p className="stat-number">{dashboardData.overall.totalUsers}</p>
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-content">
        {isResident && (
          <div className="resident-section">
            <CollectionRequestForm onSuccess={handleNewCollection} />
          </div>
        )}

        <div className="collections-section">
          <h2>
            {isAdmin ? 'Recent Collections' : 
             isCollector ? 'Assigned Collections' : 
             'My Collection Requests'}
          </h2>
          
          {collections.length === 0 ? (
            <p>No collections found.</p>
          ) : (
            <div className="collections-list">
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
                    {collection.notes && (
                      <p><strong>Notes:</strong> {collection.notes}</p>
                    )}
                    <p><strong>Created:</strong> {new Date(collection.createdAt).toLocaleDateString()}</p>
                    
                    {isAdmin && collection.requesterId && (
                      <p><strong>Requester:</strong> {collection.requesterId.username}</p>
                    )}
                    
                    {collection.assignedCollector && (
                      <p><strong>Collector:</strong> {collection.assignedCollector.username}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;