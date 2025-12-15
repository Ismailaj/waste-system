import express from "express";
import { CollectionRoute, CollectionRequest, User } from "../models/index.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

/**
 * @route   GET /api/routes/collector/:id
 * @desc    Get assigned routes for collector
 * @access  Private (Collector, Admin)
 */
router.get("/collector/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    // Check authorization - collectors can only view their own routes, admins can view any
    if (req.user.role === 'collector' && req.user._id.toString() !== id) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Collectors can only view their own routes."
      });
    }

    if (req.user.role !== 'collector' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only collectors and admins can view routes."
      });
    }

    // Verify collector exists
    const collector = await User.findById(id);
    if (!collector || collector.role !== 'collector') {
      return res.status(404).json({
        success: false,
        message: "Collector not found"
      });
    }

    // Get route for specific date or current date
    const targetDate = date ? new Date(date) : new Date();
    const route = await CollectionRoute.getCollectorRoute(id, targetDate);

    if (!route) {
      return res.status(200).json({
        success: true,
        message: "No route assigned for this date",
        route: null,
        collections: []
      });
    }

    // Get collections in optimized order
    const optimizedCollections = route.getOptimizedCollections();

    res.status(200).json({
      success: true,
      route,
      collections: optimizedCollections,
      optimizedOrder: route.optimizedOrder
    });

  } catch (error) {
    console.error("Get collector route error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching collector route"
    });
  }
});

/**
 * @route   PUT /api/routes/:id/assign
 * @desc    Assign collection to route (Admin only)
 * @access  Private (Admin)
 */
router.put("/:id/assign", authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { collectionId } = req.body;

    if (!collectionId) {
      return res.status(400).json({
        success: false,
        message: "Collection ID is required"
      });
    }

    // Find the route
    const route = await CollectionRoute.findById(id);
    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Route not found"
      });
    }

    // Find the collection request
    const collection = await CollectionRequest.findById(collectionId);
    if (!collection) {
      return res.status(404).json({
        success: false,
        message: "Collection request not found"
      });
    }

    // Verify collection can be assigned
    if (!['pending', 'assigned'].includes(collection.status)) {
      return res.status(400).json({
        success: false,
        message: "Collection request cannot be assigned in its current status"
      });
    }

    // Add collection to route
    route.addCollection(collectionId);
    
    // Update collection status and assigned collector
    collection.assignedCollector = route.collectorId;
    collection.status = 'assigned';

    // Save both documents
    await Promise.all([route.save(), collection.save()]);

    // Populate and return updated route
    await route.populate('collections');
    await route.populate('collectorId', 'username email profile');

    res.status(200).json({
      success: true,
      message: "Collection assigned to route successfully",
      route
    });

  } catch (error) {
    console.error("Assign collection to route error:", error);
    res.status(500).json({
      success: false,
      message: "Server error assigning collection to route"
    });
  }
});

/**
 * @route   POST /api/routes
 * @desc    Create a new route for collector (Admin only)
 * @access  Private (Admin)
 */
router.post("/", authenticate, authorize('admin'), async (req, res) => {
  try {
    const { collectorId, date, collections = [] } = req.body;

    if (!collectorId) {
      return res.status(400).json({
        success: false,
        message: "Collector ID is required"
      });
    }

    // Verify collector exists
    const collector = await User.findById(collectorId);
    if (!collector || collector.role !== 'collector') {
      return res.status(400).json({
        success: false,
        message: "Invalid collector ID"
      });
    }

    // Create route
    const routeData = {
      collectorId,
      date: date ? new Date(date) : new Date(),
      collections,
      status: 'planned'
    };

    const newRoute = await CollectionRoute.create(routeData);
    
    // If collections are provided, update their status
    if (collections.length > 0) {
      await CollectionRequest.updateMany(
        { _id: { $in: collections } },
        { 
          assignedCollector: collectorId,
          status: 'assigned'
        }
      );
    }

    await newRoute.populate('collections');
    await newRoute.populate('collectorId', 'username email profile');

    res.status(201).json({
      success: true,
      message: "Route created successfully",
      route: newRoute
    });

  } catch (error) {
    console.error("Create route error:", error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Route already exists for this collector on this date"
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error creating route"
    });
  }
});

/**
 * @route   PUT /api/routes/:id/status
 * @desc    Update collection status in route (Collector, Admin)
 * @access  Private
 */
router.put("/:id/status", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { collectionId, status } = req.body;

    if (!collectionId || !status) {
      return res.status(400).json({
        success: false,
        message: "Collection ID and status are required"
      });
    }

    // Find the route
    const route = await CollectionRoute.findById(id);
    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Route not found"
      });
    }

    // Check authorization
    if (req.user.role === 'collector' && route.collectorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Collectors can only update their own routes."
      });
    }

    // Find the collection
    const collection = await CollectionRequest.findById(collectionId);
    if (!collection) {
      return res.status(404).json({
        success: false,
        message: "Collection request not found"
      });
    }

    // Verify collection is in this route
    if (!route.collections.includes(collectionId)) {
      return res.status(400).json({
        success: false,
        message: "Collection is not assigned to this route"
      });
    }

    // Verify collector is assigned to this collection
    if (collection.assignedCollector.toString() !== route.collectorId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Collection is not assigned to this collector"
      });
    }

    // Update collection status with timestamp
    const oldStatus = collection.status;
    collection.status = status;
    collection.updatedAt = new Date();

    // Set completed date if status is completed
    if (status === 'completed' && oldStatus !== 'completed') {
      collection.completedDate = new Date();
    }

    await collection.save();

    // Check if all collections in route are completed
    const routeCollections = await CollectionRequest.find({
      _id: { $in: route.collections }
    });

    const allCompleted = routeCollections.every(col => col.status === 'completed');
    if (allCompleted && route.status !== 'completed') {
      route.status = 'completed';
      await route.save();
    }

    await collection.populate('requesterId', 'username email profile');

    res.status(200).json({
      success: true,
      message: "Collection status updated successfully",
      collection,
      routeCompleted: allCompleted
    });

  } catch (error) {
    console.error("Update collection status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating collection status"
    });
  }
});

/**
 * @route   PUT /api/routes/:id/optimize
 * @desc    Optimize route order (Admin only)
 * @access  Private (Admin)
 */
router.put("/:id/optimize", authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const route = await CollectionRoute.findById(id).populate('collections');
    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Route not found"
      });
    }

    // Optimize the route order
    const optimizedOrder = CollectionRoute.optimizeRoute(route.collections);
    route.optimizedOrder = optimizedOrder;

    await route.save();

    res.status(200).json({
      success: true,
      message: "Route optimized successfully",
      route,
      optimizedOrder
    });

  } catch (error) {
    console.error("Optimize route error:", error);
    res.status(500).json({
      success: false,
      message: "Server error optimizing route"
    });
  }
});

/**
 * @route   GET /api/routes
 * @desc    Get all routes (Admin only)
 * @access  Private (Admin)
 */
router.get("/", authenticate, authorize('admin'), async (req, res) => {
  try {
    const { date, status, page = 1, limit = 10 } = req.query;

    let query = {};

    // Add filters
    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const routes = await CollectionRoute.find(query)
      .populate('collectorId', 'username email profile')
      .populate('collections')
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await CollectionRoute.countDocuments(query);

    res.status(200).json({
      success: true,
      routes,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error("Get routes error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching routes"
    });
  }
});

export default router;