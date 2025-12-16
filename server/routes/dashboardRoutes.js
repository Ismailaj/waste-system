import express from "express";
import { User, CollectionRequest, CollectionRoute } from "../models/index.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

/**
 * @route   GET /api/dashboard
 * @desc    Get role-specific dashboard data
 * @access  Private
 */
router.get("/", authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let dashboardData = {
      user: req.user,
      role: userRole,
      timestamp: new Date()
    };

    switch (userRole) {
      case 'admin':
        // Admin dashboard - system overview
        const totalUsers = await User.countDocuments();
        const totalCollections = await CollectionRequest.countDocuments();
        const pendingCollections = await CollectionRequest.countDocuments({ status: 'pending' });
        const activeRoutes = await CollectionRoute.countDocuments({ 
          status: { $in: ['planned', 'active'] },
          date: { $gte: new Date().setHours(0, 0, 0, 0) }
        });

        const recentCollections = await CollectionRequest.find()
          .populate('requesterId', 'username email')
          .populate('assignedCollector', 'username email')
          .sort({ createdAt: -1 })
          .limit(5);

        dashboardData.adminData = {
          systemStats: {
            totalUsers,
            totalCollections,
            pendingCollections,
            activeRoutes
          },
          recentCollections,
          capabilities: [
            'Manage all users and roles',
            'View all collection requests',
            'Assign collections to collectors',
            'Create and manage routes',
            'Generate system reports',
            'View system statistics'
          ]
        };
        break;

      case 'collector':
        // Collector dashboard - assigned routes and collections
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayRoute = await CollectionRoute.findOne({
          collectorId: userId,
          date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
        }).populate('collections');

        const assignedCollections = await CollectionRequest.find({
          assignedCollector: userId,
          status: { $in: ['assigned', 'in-progress'] }
        }).populate('requesterId', 'username email profile');

        const completedToday = await CollectionRequest.countDocuments({
          assignedCollector: userId,
          status: 'completed',
          completedDate: { $gte: today }
        });

        dashboardData.collectorData = {
          todayRoute,
          assignedCollections,
          completedToday,
          totalAssigned: assignedCollections.length,
          capabilities: [
            'View assigned collection routes',
            'Update collection status (in-progress, completed)',
            'View collection details and locations',
            'Track daily completion progress'
          ]
        };
        break;

      case 'resident':
        // Resident dashboard - their collection requests
        const myCollections = await CollectionRequest.find({
          requesterId: userId
        }).populate('assignedCollector', 'username email profile')
          .sort({ createdAt: -1 })
          .limit(10);

        const myStats = {
          total: myCollections.length,
          pending: myCollections.filter(c => c.status === 'pending').length,
          inProgress: myCollections.filter(c => c.status === 'in-progress').length,
          completed: myCollections.filter(c => c.status === 'completed').length
        };

        const recentRequest = myCollections[0];

        dashboardData.residentData = {
          myCollections,
          myStats,
          recentRequest,
          capabilities: [
            'Create new collection requests',
            'View status of your requests',
            'Track collection progress',
            'Cancel pending requests',
            'View collection history'
          ]
        };
        break;

      default:
        return res.status(403).json({
          success: false,
          message: "Invalid user role"
        });
    }

    res.status(200).json({
      success: true,
      dashboard: dashboardData
    });

  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching dashboard data"
    });
  }
});

/**
 * @route   GET /api/dashboard/quick-actions
 * @desc    Get role-specific quick actions
 * @access  Private
 */
router.get("/quick-actions", authenticate, async (req, res) => {
  try {
    const userRole = req.user.role;
    let quickActions = [];

    switch (userRole) {
      case 'admin':
        quickActions = [
          {
            id: 'create-user',
            label: 'Create New User',
            icon: 'user-plus',
            endpoint: '/api/auth/register',
            method: 'POST'
          },
          {
            id: 'assign-collection',
            label: 'Assign Collection',
            icon: 'assignment',
            endpoint: '/api/admin/collections/assign',
            method: 'POST'
          },
          {
            id: 'view-reports',
            label: 'View Reports',
            icon: 'chart',
            endpoint: '/api/admin/reports/statistics',
            method: 'GET'
          },
          {
            id: 'manage-users',
            label: 'Manage Users',
            icon: 'users',
            endpoint: '/api/admin/users',
            method: 'GET'
          }
        ];
        break;

      case 'collector':
        quickActions = [
          {
            id: 'view-route',
            label: 'Today\'s Route',
            icon: 'route',
            endpoint: `/api/routes/collector/${req.user._id}`,
            method: 'GET'
          },
          {
            id: 'update-status',
            label: 'Update Collection Status',
            icon: 'check',
            endpoint: '/api/collections',
            method: 'PUT'
          },
          {
            id: 'view-assigned',
            label: 'Assigned Collections',
            icon: 'list',
            endpoint: '/api/collections?status=assigned',
            method: 'GET'
          }
        ];
        break;

      case 'resident':
        quickActions = [
          {
            id: 'create-request',
            label: 'New Collection Request',
            icon: 'plus',
            endpoint: '/api/collections',
            method: 'POST'
          },
          {
            id: 'view-requests',
            label: 'My Requests',
            icon: 'list',
            endpoint: '/api/collections',
            method: 'GET'
          },
          {
            id: 'track-status',
            label: 'Track Collection',
            icon: 'search',
            endpoint: '/api/collections',
            method: 'GET'
          }
        ];
        break;
    }

    res.status(200).json({
      success: true,
      quickActions,
      role: userRole
    });

  } catch (error) {
    console.error("Quick actions error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching quick actions"
    });
  }
});

export default router;