import express from "express";
import { User, CollectionRequest, CollectionRoute } from "../models/index.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

/**
 * @route   GET /api/admin/users
 * @desc    List all users (Admin only)
 * @access  Private (Admin)
 */
router.get("/users", authenticate, authorize('admin'), async (req, res) => {
  try {
    const { role, page = 1, limit = 10, search } = req.query;

    let query = {};

    // Filter by role if provided
    if (role && ['resident', 'collector', 'admin'].includes(role)) {
      query.role = role;
    }

    // Search by username or email if provided
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      users,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching users"
    });
  }
});

/**
 * @route   PUT /api/admin/users/:id/role
 * @desc    Update user role (Admin only)
 * @access  Private (Admin)
 */
router.put("/users/:id/role", authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['resident', 'collector', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Valid role is required (resident, collector, or admin)"
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Prevent admin from changing their own role
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot change your own role"
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: "User role updated successfully",
      user: user.toJSON()
    });

  } catch (error) {
    console.error("Update user role error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating user role"
    });
  }
});

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user account while preserving historical data (Admin only)
 * @access  Private (Admin)
 */
router.delete("/users/:id", authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Prevent admin from deleting their own account
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete your own account"
      });
    }

    // Check if user has associated collection requests
    const userCollections = await CollectionRequest.find({
      $or: [
        { requesterId: id },
        { assignedCollector: id }
      ]
    });

    // If user has collections, we preserve historical data by not deleting the user
    // Instead, we could mark them as inactive or anonymize their data
    if (userCollections.length > 0) {
      // For now, we'll update collection requests to remove personal references
      // but keep the historical data intact
      
      // Update collection requests where user is requester
      await CollectionRequest.updateMany(
        { requesterId: id },
        { 
          $unset: { requesterId: 1 },
          $set: { 
            notes: `${user.username} (deleted user) - ${userCollections.find(c => c.requesterId?.toString() === id)?.notes || ''}`.trim()
          }
        }
      );

      // Update collection requests where user is assigned collector
      await CollectionRequest.updateMany(
        { assignedCollector: id },
        { $unset: { assignedCollector: 1 } }
      );

      // Update routes where user is collector
      await CollectionRoute.updateMany(
        { collectorId: id },
        { $unset: { collectorId: 1 } }
      );
    }

    // Delete the user
    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully. Historical collection data preserved.",
      preservedCollections: userCollections.length
    });

  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error deleting user"
    });
  }
});

/**
 * @route   GET /api/admin/reports/statistics
 * @desc    Generate collection statistics and performance metrics (Admin only)
 * @access  Private (Admin)
 */
router.get("/reports/statistics", authenticate, authorize('admin'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Set default date range if not provided
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

    // Collection statistics
    const totalCollections = await CollectionRequest.countDocuments({
      createdAt: { $gte: start, $lte: end }
    });

    const collectionsByStatus = await CollectionRequest.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const collectionsByCategory = await CollectionRequest.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: "$wasteCategory",
          count: { $sum: 1 }
        }
      }
    ]);

    // Performance metrics
    const completedCollections = await CollectionRequest.find({
      status: 'completed',
      createdAt: { $gte: start, $lte: end },
      completedDate: { $exists: true }
    });

    let averageCompletionTime = 0;
    if (completedCollections.length > 0) {
      const totalCompletionTime = completedCollections.reduce((sum, collection) => {
        return sum + (collection.completedDate - collection.createdAt);
      }, 0);
      averageCompletionTime = totalCompletionTime / completedCollections.length / (1000 * 60 * 60); // Convert to hours
    }

    // User statistics
    const totalUsers = await User.countDocuments();
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 }
        }
      }
    ]);

    // Route statistics
    const totalRoutes = await CollectionRoute.countDocuments({
      date: { $gte: start, $lte: end }
    });

    const routesByStatus = await CollectionRoute.aggregate([
      {
        $match: {
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Collector performance
    const collectorPerformance = await CollectionRequest.aggregate([
      {
        $match: {
          status: 'completed',
          assignedCollector: { $exists: true },
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: "$assignedCollector",
          completedCollections: { $sum: 1 },
          avgCompletionTime: {
            $avg: {
              $subtract: ["$completedDate", "$createdAt"]
            }
          }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "collector"
        }
      },
      {
        $unwind: "$collector"
      },
      {
        $project: {
          collectorName: "$collector.username",
          completedCollections: 1,
          avgCompletionTimeHours: {
            $divide: ["$avgCompletionTime", 1000 * 60 * 60]
          }
        }
      },
      {
        $sort: { completedCollections: -1 }
      }
    ]);

    const statistics = {
      dateRange: { start, end },
      collections: {
        total: totalCollections,
        byStatus: collectionsByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byCategory: collectionsByCategory.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        averageCompletionTimeHours: Math.round(averageCompletionTime * 100) / 100
      },
      users: {
        total: totalUsers,
        byRole: usersByRole.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      },
      routes: {
        total: totalRoutes,
        byStatus: routesByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      },
      collectorPerformance
    };

    res.status(200).json({
      success: true,
      statistics
    });

  } catch (error) {
    console.error("Generate statistics error:", error);
    res.status(500).json({
      success: false,
      message: "Server error generating statistics"
    });
  }
});

/**
 * @route   POST /api/admin/collections/assign
 * @desc    Assign collection request to collector (Admin only)
 * @access  Private (Admin)
 */
router.post("/collections/assign", authenticate, authorize('admin'), async (req, res) => {
  try {
    const { collectionId, collectorId, scheduledDate } = req.body;

    if (!collectionId || !collectorId) {
      return res.status(400).json({
        success: false,
        message: "Collection ID and Collector ID are required"
      });
    }

    // Verify collection exists
    const collection = await CollectionRequest.findById(collectionId);
    if (!collection) {
      return res.status(404).json({
        success: false,
        message: "Collection request not found"
      });
    }

    // Verify collector exists and has correct role
    const collector = await User.findById(collectorId);
    if (!collector || collector.role !== 'collector') {
      return res.status(400).json({
        success: false,
        message: "Invalid collector ID"
      });
    }

    // Update collection
    collection.assignedCollector = collectorId;
    collection.status = 'assigned';
    if (scheduledDate) {
      collection.scheduledDate = new Date(scheduledDate);
    }

    await collection.save();

    // Try to find or create a route for this collector on the scheduled date
    const targetDate = scheduledDate ? new Date(scheduledDate) : new Date();
    let route = await CollectionRoute.getCollectorRoute(collectorId, targetDate);

    if (!route) {
      // Create new route
      route = await CollectionRoute.create({
        collectorId,
        date: targetDate,
        collections: [collectionId],
        status: 'planned'
      });
    } else {
      // Add to existing route
      route.addCollection(collectionId);
      await route.save();
    }

    await collection.populate('requesterId', 'username email profile');
    await collection.populate('assignedCollector', 'username email profile');

    res.status(200).json({
      success: true,
      message: "Collection assigned successfully",
      collection,
      route: route._id
    });

  } catch (error) {
    console.error("Assign collection error:", error);
    res.status(500).json({
      success: false,
      message: "Server error assigning collection"
    });
  }
});

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get admin dashboard data aggregation (Admin only)
 * @access  Private (Admin)
 */
router.get("/dashboard", authenticate, authorize('admin'), async (req, res) => {
  try {
    // Get current date for today's statistics
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // Get this week's date range
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // Today's statistics
    const todayStats = {
      collections: await CollectionRequest.countDocuments({
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      }),
      completedCollections: await CollectionRequest.countDocuments({
        status: 'completed',
        completedDate: { $gte: startOfDay, $lte: endOfDay }
      }),
      activeRoutes: await CollectionRoute.countDocuments({
        date: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: ['planned', 'active'] }
      })
    };

    // This week's statistics
    const weekStats = {
      collections: await CollectionRequest.countDocuments({
        createdAt: { $gte: startOfWeek }
      }),
      completedCollections: await CollectionRequest.countDocuments({
        status: 'completed',
        completedDate: { $gte: startOfWeek }
      })
    };

    // Overall system statistics
    const overallStats = {
      totalUsers: await User.countDocuments(),
      totalCollectors: await User.countDocuments({ role: 'collector' }),
      totalResidents: await User.countDocuments({ role: 'resident' }),
      totalCollections: await CollectionRequest.countDocuments(),
      pendingCollections: await CollectionRequest.countDocuments({ status: 'pending' }),
      inProgressCollections: await CollectionRequest.countDocuments({ status: 'in-progress' })
    };

    // Recent collections (last 10)
    const recentCollections = await CollectionRequest.find()
      .populate('requesterId', 'username email')
      .populate('assignedCollector', 'username email')
      .sort({ createdAt: -1 })
      .limit(10);

    // Active collectors today
    const activeCollectors = await CollectionRoute.find({
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['planned', 'active'] }
    }).populate('collectorId', 'username email profile');

    const dashboardData = {
      today: todayStats,
      thisWeek: weekStats,
      overall: overallStats,
      recentCollections,
      activeCollectors
    };

    res.status(200).json({
      success: true,
      dashboard: dashboardData
    });

  } catch (error) {
    console.error("Get dashboard data error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching dashboard data"
    });
  }
});

export default router;