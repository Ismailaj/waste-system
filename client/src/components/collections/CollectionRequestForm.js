import React, { useState } from 'react';
import { collectionsAPI } from '../../services/api';

const CollectionRequestForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    wasteCategory: 'general',
    pickupLocation: {
      address: '',
      coordinates: {
        lat: '',
        lng: ''
      },
      instructions: ''
    },
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('pickupLocation.')) {
      const field = name.split('.')[1];
      if (field === 'lat' || field === 'lng') {
        setFormData({
          ...formData,
          pickupLocation: {
            ...formData.pickupLocation,
            coordinates: {
              ...formData.pickupLocation.coordinates,
              [field]: value
            }
          }
        });
      } else {
        setFormData({
          ...formData,
          pickupLocation: {
            ...formData.pickupLocation,
            [field]: value
          }
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Clean up coordinates if empty
      const requestData = { ...formData };
      if (!requestData.pickupLocation.coordinates.lat || !requestData.pickupLocation.coordinates.lng) {
        delete requestData.pickupLocation.coordinates;
      } else {
        requestData.pickupLocation.coordinates.lat = parseFloat(requestData.pickupLocation.coordinates.lat);
        requestData.pickupLocation.coordinates.lng = parseFloat(requestData.pickupLocation.coordinates.lng);
      }

      const response = await collectionsAPI.create(requestData);
      
      if (response.data.success) {
        // Reset form
        setFormData({
          wasteCategory: 'general',
          pickupLocation: {
            address: '',
            coordinates: { lat: '', lng: '' },
            instructions: ''
          },
          notes: ''
        });
        
        if (onSuccess) {
          onSuccess(response.data.request);
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create collection request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="collection-request-form">
      <h3>Request Waste Collection</h3>
      
      {error && <div className="error">{error}</div>}
      
      <div className="form-group">
        <label htmlFor="wasteCategory">Waste Category</label>
        <select
          id="wasteCategory"
          name="wasteCategory"
          value={formData.wasteCategory}
          onChange={handleChange}
          required
        >
          <option value="general">General Waste</option>
          <option value="organic">Organic Waste</option>
          <option value="recyclable">Recyclable</option>
          <option value="hazardous">Hazardous Waste</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="pickupLocation.address">Pickup Address</label>
        <textarea
          id="pickupLocation.address"
          name="pickupLocation.address"
          value={formData.pickupLocation.address}
          onChange={handleChange}
          required
          rows="3"
          placeholder="Enter the full pickup address"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="pickupLocation.lat">Latitude (Optional)</label>
          <input
            type="number"
            id="pickupLocation.lat"
            name="pickupLocation.lat"
            value={formData.pickupLocation.coordinates.lat}
            onChange={handleChange}
            step="any"
            min="-90"
            max="90"
          />
        </div>

        <div className="form-group">
          <label htmlFor="pickupLocation.lng">Longitude (Optional)</label>
          <input
            type="number"
            id="pickupLocation.lng"
            name="pickupLocation.lng"
            value={formData.pickupLocation.coordinates.lng}
            onChange={handleChange}
            step="any"
            min="-180"
            max="180"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="pickupLocation.instructions">Special Instructions</label>
        <textarea
          id="pickupLocation.instructions"
          name="pickupLocation.instructions"
          value={formData.pickupLocation.instructions}
          onChange={handleChange}
          rows="2"
          placeholder="Any special instructions for the collector"
        />
      </div>

      <div className="form-group">
        <label htmlFor="notes">Additional Notes</label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows="3"
          placeholder="Any additional information"
        />
      </div>

      <button 
        type="submit" 
        className="btn btn-primary"
        disabled={loading}
      >
        {loading ? 'Submitting...' : 'Submit Request'}
      </button>
    </form>
  );
};

export default CollectionRequestForm;