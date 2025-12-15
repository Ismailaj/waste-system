/**
 * Session management utilities for preserving form data
 */

const sessionStorage = new Map();

/**
 * Save form data to session storage
 * @param {string} sessionId - Session identifier
 * @param {string} formId - Form identifier
 * @param {Object} formData - Form data to save
 */
export const saveFormData = (sessionId, formId, formData) => {
  if (!sessionStorage.has(sessionId)) {
    sessionStorage.set(sessionId, new Map());
  }
  
  const userSession = sessionStorage.get(sessionId);
  userSession.set(formId, {
    data: formData,
    timestamp: new Date(),
    expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
  });
};

/**
 * Retrieve form data from session storage
 * @param {string} sessionId - Session identifier
 * @param {string} formId - Form identifier
 * @returns {Object|null} Saved form data or null if not found/expired
 */
export const getFormData = (sessionId, formId) => {
  if (!sessionStorage.has(sessionId)) {
    return null;
  }
  
  const userSession = sessionStorage.get(sessionId);
  if (!userSession.has(formId)) {
    return null;
  }
  
  const savedData = userSession.get(formId);
  
  // Check if data has expired
  if (new Date() > savedData.expiresAt) {
    userSession.delete(formId);
    return null;
  }
  
  return savedData.data;
};

/**
 * Clear form data from session storage
 * @param {string} sessionId - Session identifier
 * @param {string} formId - Form identifier (optional, clears all if not provided)
 */
export const clearFormData = (sessionId, formId = null) => {
  if (!sessionStorage.has(sessionId)) {
    return;
  }
  
  const userSession = sessionStorage.get(sessionId);
  
  if (formId) {
    userSession.delete(formId);
  } else {
    sessionStorage.delete(sessionId);
  }
};

/**
 * Clean up expired session data
 */
export const cleanupExpiredSessions = () => {
  const now = new Date();
  
  for (const [sessionId, userSession] of sessionStorage.entries()) {
    for (const [formId, savedData] of userSession.entries()) {
      if (now > savedData.expiresAt) {
        userSession.delete(formId);
      }
    }
    
    // Remove empty user sessions
    if (userSession.size === 0) {
      sessionStorage.delete(sessionId);
    }
  }
};

// Clean up expired sessions every 10 minutes
setInterval(cleanupExpiredSessions, 10 * 60 * 1000);