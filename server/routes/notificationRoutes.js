import express from "express";
import { CollectionRequest } from "../models/index.js";
import { authenticate } from "../middleware/auth.js";
import { getUserNotifications, markNotificationAsRead } from "../utils/notifications.js";

const router = express.Router();

/**
 * @route   GET /api/notifications
 * @desc    Get user notifications
 * @access  Private
 */
router.get("/", authenticate, async (req, res) => {
  try {
    const notifications = getUserNotifications(req.user._id);
    
    res.status(200).json({
      success: true,
      notifications
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching notifications"
    });
  }
});

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.put("/:id/read", authenticate, async (req, res) => {
  try {
    const notification = markNotificationAsRead(req.params.id, req.user._id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification
    });
  } catch (error) {
    console.error("Mark notification as read error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating notification"
    });
  }
});

/**
 * @route   GET /api/notifications/history/:collectionId
 * @desc    Get collection request history and status progression
 * @access  Private
 */
router.get("/history/:collectionId", authenticate, async (req, res) => {
  try {
    const { collectionId } = req.params;

    const collection = await CollectionRequest.findById(collectionId)
      .populate('requesterId', 'username email profile')
      .populate('assignedCollector', 'username email profile');

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: "Collection request not found"
      });
    }

    // Check if user can view this collection
    const canView = collection.requesterId._id.toString() === req.user._id.toString() ||
                   (collection.assignedCollector && collection.assignedCollector._id.toString() === req.user._id.toString()) ||
                   req.user.role === 'admin';

    if (!canView) {
      return res.status(403).json({
        success: false,
        message: "Access denied to view this collection history"
      });
    }

    // Create status progression history
    const statusHistory = [
      {
        status: 'pending',
        timestamp: collection.createdAt,
        description: 'Collection request created'
      }
    ];

    if (collection.assignedCollector) {
      statusHistory.push({
        status: 'assigned',
        timestamp: collection.updatedAt,
        description: `Assigned to collector: ${collection.assignedCollector.username}`,
        assignedTo: collection.assignedCollector.username
      });
    }

    if (collection.status === 'in-progress') {
      statusHistory.push({
        status: 'in-progress',
        timestamp: collection.updatedAt,
        description: 'Collection in progress'
      });
    }

    if (collection.status === 'completed' && collection.completedDate) {
      statusHistory.push({
        status: 'completed',
        timestamp: collection.completedDate,
        description: 'Collection completed successfully'
      });
    }

    if (collection.status === 'cancelled') {
      statusHistory.push({
        status: 'cancelled',
        timestamp: collection.updatedAt,
        description: 'Collection request cancelled'
      });
    }

    res.status(200).json({
      success: true,
      collection,
      statusHistory
    });

  } catch (error) {
    console.error("Get collection history error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching collection history"
    });
  }
});

export default router;