/**
 * Data validation utilities
 */

/**
 * Validate data integrity for collection requests
 * @param {Object} data - Data to validate
 * @returns {Object} Validation result
 */
export const validateCollectionRequest = (data) => {
  const errors = [];
  
  // Required fields
  if (!data.wasteCategory) {
    errors.push('Waste category is required');
  }
  
  if (!data.pickupLocation?.address) {
    errors.push('Pickup address is required');
  }
  
  // Validate waste category
  const validCategories = ['organic', 'recyclable', 'hazardous', 'general'];
  if (data.wasteCategory && !validCategories.includes(data.wasteCategory)) {
    errors.push('Invalid waste category');
  }
  
  // Validate coordinates if provided
  if (data.pickupLocation?.coordinates) {
    const { lat, lng } = data.pickupLocation.coordinates;
    
    if (lat !== undefined && (isNaN(lat) || lat < -90 || lat > 90)) {
      errors.push('Invalid latitude value');
    }
    
    if (lng !== undefined && (isNaN(lng) || lng < -180 || lng > 180)) {
      errors.push('Invalid longitude value');
    }
  }
  
  // Validate string lengths
  if (data.pickupLocation?.address && data.pickupLocation.address.length > 200) {
    errors.push('Address cannot exceed 200 characters');
  }
  
  if (data.pickupLocation?.instructions && data.pickupLocation.instructions.length > 500) {
    errors.push('Instructions cannot exceed 500 characters');
  }
  
  if (data.notes && data.notes.length > 1000) {
    errors.push('Notes cannot exceed 1000 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate user data integrity
 * @param {Object} data - User data to validate
 * @returns {Object} Validation result
 */
export const validateUserData = (data) => {
  const errors = [];
  
  // Required fields
  if (!data.username) {
    errors.push('Username is required');
  }
  
  if (!data.email) {
    errors.push('Email is required');
  }
  
  if (!data.password) {
    errors.push('Password is required');
  }
  
  // Validate username
  if (data.username) {
    if (data.username.length < 3 || data.username.length > 30) {
      errors.push('Username must be between 3 and 30 characters');
    }
    
    if (!/^[a-zA-Z0-9_-]+$/.test(data.username)) {
      errors.push('Username can only contain letters, numbers, underscores, and hyphens');
    }
  }
  
  // Validate email
  if (data.email && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(data.email)) {
    errors.push('Invalid email format');
  }
  
  // Validate password
  if (data.password && data.password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  
  // Validate role
  if (data.role && !['resident', 'collector', 'admin'].includes(data.role)) {
    errors.push('Invalid role');
  }
  
  // Validate profile data if provided
  if (data.profile) {
    if (data.profile.firstName && data.profile.firstName.length > 50) {
      errors.push('First name cannot exceed 50 characters');
    }
    
    if (data.profile.lastName && data.profile.lastName.length > 50) {
      errors.push('Last name cannot exceed 50 characters');
    }
    
    if (data.profile.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(data.profile.phone)) {
      errors.push('Invalid phone number format');
    }
    
    if (data.profile.address && data.profile.address.length > 200) {
      errors.push('Address cannot exceed 200 characters');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Sanitize data to prevent XSS and injection attacks
 * @param {Object} data - Data to sanitize
 * @returns {Object} Sanitized data
 */
export const sanitizeData = (data) => {
  if (typeof data === 'string') {
    return data
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .trim(); // Remove leading/trailing whitespace
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeData(value);
    }
    return sanitized;
  }
  
  return data;
};

/**
 * Validate database query results
 * @param {Object} result - Database query result
 * @param {string} type - Expected result type
 * @returns {boolean} Whether result is valid
 */
export const validateQueryResult = (result, type = 'object') => {
  if (!result) {
    return false;
  }
  
  switch (type) {
    case 'user':
      return result._id && result.email && result.role;
    case 'collection':
      return result._id && result.wasteCategory && result.pickupLocation;
    case 'route':
      return result._id && result.collectorId && result.date;
    default:
      return typeof result === type;
  }
};