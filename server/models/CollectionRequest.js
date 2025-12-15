import mongoose from "mongoose";

// Define schema for collection requests according to design requirements
const collectionRequestSchema = new mongoose.Schema(
  {
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Requester ID is required']
    },

    wasteCategory: {
      type: String,
      enum: {
        values: ['organic', 'recyclable', 'hazardous', 'general'],
        message: 'Waste category must be organic, recyclable, hazardous, or general'
      },
      required: [true, 'Waste category is required']
    },

    pickupLocation: {
      address: {
        type: String,
        required: [true, 'Pickup address is required'],
        trim: true,
        maxlength: [200, 'Address cannot exceed 200 characters']
      },
      coordinates: {
        lat: {
          type: Number,
          min: [-90, 'Latitude must be between -90 and 90'],
          max: [90, 'Latitude must be between -90 and 90']
        },
        lng: {
          type: Number,
          min: [-180, 'Longitude must be between -180 and 180'],
          max: [180, 'Longitude must be between -180 and 180']
        }
      },
      instructions: {
        type: String,
        trim: true,
        maxlength: [500, 'Instructions cannot exceed 500 characters']
      }
    },

    status: {
      type: String,
      enum: {
        values: ['pending', 'assigned', 'in-progress', 'completed', 'cancelled'],
        message: 'Status must be pending, assigned, in-progress, completed, or cancelled'
      },
      default: 'pending'
    },

    assignedCollector: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      validate: {
        validator: async function(collectorId) {
          if (!collectorId) return true; // Optional field
          const collector = await mongoose.model('User').findById(collectorId);
          return collector && collector.role === 'collector';
        },
        message: 'Assigned collector must be a user with collector role'
      }
    },

    scheduledDate: {
      type: Date,
      validate: {
        validator: function(date) {
          return !date || date >= new Date();
        },
        message: 'Scheduled date cannot be in the past'
      }
    },

    completedDate: {
      type: Date,
      validate: {
        validator: function(date) {
          return !date || (this.status === 'completed');
        },
        message: 'Completed date can only be set when status is completed'
      }
    },

    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters']
    }
  },
  {
    timestamps: true // automatically adds createdAt and updatedAt
  }
);

// Indexes for better query performance
collectionRequestSchema.index({ requesterId: 1 });
collectionRequestSchema.index({ assignedCollector: 1 });
collectionRequestSchema.index({ status: 1 });
collectionRequestSchema.index({ wasteCategory: 1 });
collectionRequestSchema.index({ createdAt: -1 });
collectionRequestSchema.index({ scheduledDate: 1 });

// Compound indexes for common queries
collectionRequestSchema.index({ status: 1, assignedCollector: 1 });
collectionRequestSchema.index({ requesterId: 1, status: 1 });

// Pre-save middleware to set completed date
collectionRequestSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'completed' && !this.completedDate) {
    this.completedDate = new Date();
  }
  next();
});

// Instance method to check if request can be updated by user
collectionRequestSchema.methods.canBeUpdatedBy = function(userId, userRole) {
  // Admins can update any request
  if (userRole === 'admin') return true;
  
  // Collectors can update requests assigned to them
  if (userRole === 'collector' && this.assignedCollector && this.assignedCollector.toString() === userId) {
    return true;
  }
  
  // Residents can update their own requests (only if not assigned yet)
  if (userRole === 'resident' && this.requesterId.toString() === userId && this.status === 'pending') {
    return true;
  }
  
  return false;
};

// Static method to get requests by role
collectionRequestSchema.statics.getByRole = function(userId, userRole) {
  let query = {};
  
  switch (userRole) {
    case 'admin':
      // Admins see all requests
      break;
    case 'collector':
      // Collectors see only assigned requests
      query.assignedCollector = userId;
      break;
    case 'resident':
      // Residents see only their own requests
      query.requesterId = userId;
      break;
    default:
      // Invalid role, return empty query that matches nothing
      query._id = null;
  }
  
  return this.find(query);
};

const CollectionRequest = mongoose.model("CollectionRequest", collectionRequestSchema);
export default CollectionRequest;