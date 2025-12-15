/**
 * Notification utilities for the waste management system
 */

// In a real implementation, this would integrate with email services, SMS, push notifications, etc.
// For now, we'll create a simple notification logging system

const notifications = [];

/**
 * Send completion notification to resident
 * @param {Object} collection - Collection request object
 * @param {Object} resident - Resident user object
 */
export const sendCompletionNotification = async (collection, resident) => {
  try {
    const notification = {
      id: Date.now().toString(),
      type: 'completion',
      recipientId: resident._id,
      recipientEmail: resident.email,
      collectionId: collection._id,
      message: `Your waste collection request for ${collection.wasteCategory} waste at ${collection.pickupLocation.address} has been completed.`,
      timestamp: new Date(),
      status: 'sent'
    };

    // In a real implementation, you would:
    // - Send email via service like SendGrid, AWS SES, etc.
    // - Send SMS via service like Twilio
    // - Send push notification via Firebase, etc.
    
    // For now, we'll just log it
    notifications.push(notification);
    console.log(`Notification sent to ${resident.email}: ${notification.message}`);

    return notification;
  } catch (error) {
    console.error('Error sending completion notification:', error);
    throw error;
  }
};

/**
 * Send assignment notification to collector
 * @param {Object} collection - Collection request object
 * @param {Object} collector - Collector user object
 */
export const sendAssignmentNotification = async (collection, collector) => {
  try {
    const notification = {
      id: Date.now().toString(),
      type: 'assignment',
      recipientId: collector._id,
      recipientEmail: collector.email,
      collectionId: collection._id,
      message: `You have been assigned a new collection: ${collection.wasteCategory} waste at ${collection.pickupLocation.address}.`,
      timestamp: new Date(),
      status: 'sent'
    };

    notifications.push(notification);
    console.log(`Assignment notification sent to ${collector.email}: ${notification.message}`);

    return notification;
  } catch (error) {
    console.error('Error sending assignment notification:', error);
    throw error;
  }
};

/**
 * Send status update notification
 * @param {Object} collection - Collection request object
 * @param {Object} recipient - Recipient user object
 * @param {string} oldStatus - Previous status
 * @param {string} newStatus - New status
 */
export const sendStatusUpdateNotification = async (collection, recipient, oldStatus, newStatus) => {
  try {
    const notification = {
      id: Date.now().toString(),
      type: 'status_update',
      recipientId: recipient._id,
      recipientEmail: recipient.email,
      collectionId: collection._id,
      message: `Your collection request status has been updated from "${oldStatus}" to "${newStatus}".`,
      timestamp: new Date(),
      status: 'sent'
    };

    notifications.push(notification);
    console.log(`Status update notification sent to ${recipient.email}: ${notification.message}`);

    return notification;
  } catch (error) {
    console.error('Error sending status update notification:', error);
    throw error;
  }
};

/**
 * Get notifications for a user
 * @param {string} userId - User ID
 * @returns {Array} Array of notifications
 */
export const getUserNotifications = (userId) => {
  return notifications.filter(notification => 
    notification.recipientId.toString() === userId.toString()
  ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

/**
 * Get all notifications (admin only)
 * @returns {Array} Array of all notifications
 */
export const getAllNotifications = () => {
  return notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

/**
 * Mark notification as read
 * @param {string} notificationId - Notification ID
 * @param {string} userId - User ID
 */
export const markNotificationAsRead = (notificationId, userId) => {
  const notification = notifications.find(n => 
    n.id === notificationId && n.recipientId.toString() === userId.toString()
  );
  
  if (notification) {
    notification.status = 'read';
    notification.readAt = new Date();
  }
  
  return notification;
};