import express from "express";
import CollectionRequest from "../models/CollectionRequest.js";
import User from "../models/User.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validateCollectionRequest } from "../middleware/validation.js";
import { generateUniqueId } from "../utils/auth.js";
import { sendCompletionNotification, sendStatusUpdateNotification } from "../utils/notifications.js";

const router = express.Router();

/**
 * @route   POST /api/collections
 * @desc    Create a new collection request
 * @access  Private (Residents)
 */
router.post("/", authenticate, authorize('resident', 'admin'), validateCollectionRequest, async (req, res) => {
  try {
    const { wasteCategory, pickupLocation, notes } = req.body;

    // Create collection request with pending status and unique identifier
    const collectionData = {
      requesterId: req.user._id,
      wasteCategory,
      pickupLocation,
      notes,
      status: 'pending'
    };

    const newRequest = await CollectionRequest.create(collectionData);

    // Populate requester information
    await newRequest.populate('requesterId', 'username email profile');

    res.status(201).json({
      success: true,
      message: "Collection request created successfully",
      request: newRequest,
      uniqueId: newRequest._id.toString()
    });

  } catch (error) {
    console.error("Collection request creation error:", error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error creating collection request"
    });
  }
});

/**
 * @route   GET /api/collections
 * @desc    Get collection requests (filtered by user role)
 * @access  Private
 */
router.get("/", authenticate, async (req, res) => {
  try {
    const { status, wasteCategory, page = 1, limit = 10 } = req.query;
    
    // Build query based on user role
    let query = {};
    
    switch (req.user.role) {
      case 'admin':
        // Admins see all requests
        break;
      case 'collector':
        // Collectors see only assigned requests
        query.assignedCollector = req.user._id;
        break;
      case 'resident':
        // Residents see only their own requests
        query.requesterId = req.user._id;
        break;
      default:
        return res.status(403).json({
          success: false,
          message: "Invalid user role"
        });
    }

    // Add filters if provided
    if (status) {
      query.status = status;
    }
    if (wasteCategory) {
      query.wasteCategory = wasteCategory;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get requests with pagination
    const requests = await CollectionRequest.find(query)
      .populate('requesterId', 'username email profile')
      .populate('assignedCollector', 'username email profile')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await CollectionRequest.countDocuments(query);

    res.status(200).json({
      success: true,
      requests,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error("Get collection requests error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching collection requests"
    });
  }
});

/**
 * @route   GET /api/collections/:id
 * @desc    Get a specific collection request
 * @access  Private
 */
router.get("/:id", authenticate, async (req, res) => {
  try {
    const request = await CollectionRequest.findById(req.params.id)
      .populate('requesterId', 'username email profile')
      .populate('assignedCollector', 'username email profile');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Collection request not found"
      });
    }

    // Check if user can view this request
    const canView = request.canBeUpdatedBy(req.user._id.toString(), req.user.role) || 
                   req.user.role === 'admin' ||
                   (req.user.role === 'collector' && request.assignedCollector && 
                    request.assignedCollector._id.toString() === req.user._id.toString());

    if (!canView) {
      return res.status(403).json({
        success: false,
        message: "Access denied to this collection request"
      });
    }

    res.status(200).json({
      success: true,
      request
    });

  } catch (error) {
    console.error("Get collection request error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching collection request"
    });
  }
});

/**
 * @route   PUT /api/collections/:id
 * @desc    Update collection request status
 * @access  Private
 */
router.put("/:id", authenticate, async (req, res) => {
  try {
    const { status, notes, scheduledDate } = req.body;

    const request = await CollectionRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Collection request not found"
      });
    }

    // Check if user can update this request
    if (!request.canBeUpdatedBy(req.user._id.toString(), req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied to update this collection request"
      });
    }

    // Update allowed fields
    const oldStatus = request.status;
    if (status && ['pending', 'assigned', 'in-progress', 'completed', 'cancelled'].includes(status)) {
      request.status = status;
    }
    
    if (notes !== undefined) {
      request.notes = notes;
    }

    if (scheduledDate && req.user.role === 'admin') {
      request.scheduledDate = new Date(scheduledDate);
    }

    // Record timestamp for status changes
    request.updatedAt = new Date();

    await request.save();

    // Send notifications for status changes
    if (oldStatus !== request.status) {
      try {
        const requester = await User.findById(request.requesterId);
        
        if (request.status === 'completed' && requester) {
          await sendCompletionNotification(request, requester);
        } else if (requester) {
          await sendStatusUpdateNotification(request, requester, oldStatus, request.status);
        }
      } catch (notificationError) {
        console.error('Error sending notification:', notificationError);
        // Don't fail the request if notification fails
      }
    }
    await request.populate('requesterId', 'username email profile');
    await request.populate('assignedCollector', 'username email profile');

    res.status(200).json({
      success: true,
      message: "Collection request updated successfully",
      request
    });

  } catch (error) {
    console.error("Update collection request error:", error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error updating collection request"
    });
  }
});

/**
 * @route   PUT /api/collections/:id/assign
 * @desc    Assign collection request to collector (Admin only)
 * @access  Private (Admin)
 */
router.put("/:id/assign", authenticate, authorize('admin'), async (req, res) => {
  try {
    const { collectorId } = req.body;

    if (!collectorId) {
      return res.status(400).json({
        success: false,
        message: "Collector ID is required"
      });
    }

    const request = await CollectionRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Collection request not found"
      });
    }

    // Verify collector exists and has correct role
    const collector = await CollectionRequest.model('User').findById(collectorId);
    if (!collector || collector.role !== 'collector') {
      return res.status(400).json({
        success: false,
        message: "Invalid collector ID"
      });
    }

    // Assign collector and update status
    request.assignedCollector = collectorId;
    request.status = 'assigned';
    await request.save();

    await request.populate('requesterId', 'username email profile');
    await request.populate('assignedCollector', 'username email profile');

    res.status(200).json({
      success: true,
      message: "Collection request assigned successfully",
      request
    });

  } catch (error) {
    console.error("Assign collection request error:", error);
    res.status(500).json({
      success: false,
      message: "Server error assigning collection request"
    });
  }
});

/**
 * @route   DELETE /api/collections/:id
 * @desc    Cancel collection request
 * @access  Private
 */
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const request = await CollectionRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Collection request not found"
      });
    }

    // Check if user can cancel this request
    const canCancel = (req.user.role === 'resident' && request.requesterId.toString() === req.user._id.toString() && request.status === 'pending') ||
                     req.user.role === 'admin';

    if (!canCancel) {
      return res.status(403).json({
        success: false,
        message: "Cannot cancel this collection request"
      });
    }

    // Update status to cancelled instead of deleting
    request.status = 'cancelled';
    await request.save();

    res.status(200).json({
      success: true,
      message: "Collection request cancelled successfully"
    });

  } catch (error) {
    console.error("Cancel collection request error:", error);
    res.status(500).json({
      success: false,
      message: "Server error cancelling collection request"
    });
  }
});

/**
 * @route   GET /api/collections/search/date-range
 * @desc    Search collection requests by date range
 * @access  Private
 */
router.get("/search/date-range", authenticate, async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 10 } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required"
      });
    }

    // Build base query for user role
    let query = {};
    switch (req.user.role) {
      case 'admin':
        break;
      case 'collector':
        query.assignedCollector = req.user._id;
        break;
      case 'resident':
        query.requesterId = req.user._id;
        break;
    }

    // Add date range filter
    query.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const requests = await CollectionRequest.find(query)
      .populate('requesterId', 'username email profile')
      .populate('assignedCollector', 'username email profile')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await CollectionRequest.countDocuments(query);

    res.status(200).json({
      success: true,
      requests,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error("Date range search error:", error);
    res.status(500).json({
      success: false,
      message: "Server error searching collection requests"
    });
  }
});

export default router;