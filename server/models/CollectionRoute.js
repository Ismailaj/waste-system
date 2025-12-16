import mongoose from "mongoose";

// Define schema for collection routes according to design requirements
const collectionRouteSchema = new mongoose.Schema(
  {
    collectorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Collector ID is required'],
      validate: {
        validator: async function(collectorId) {
          const collector = await mongoose.model('User').findById(collectorId);
          return collector && collector.role === 'collector';
        },
        message: 'Collector ID must reference a user with collector role'
      }
    },

    date: {
      type: Date,
      required: [true, 'Route date is required'],
      validate: {
        validator: function(date) {
          // Allow current date and future dates
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return date >= today;
        },
        message: 'Route date cannot be in the past'
      }
    },

    collections: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CollectionRequest',
      validate: {
        validator: async function(collectionId) {
          const collection = await mongoose.model('CollectionRequest').findById(collectionId);
          return collection && ['assigned', 'in-progress', 'completed'].includes(collection.status);
        },
        message: 'Collection must be assigned, in-progress, or completed to be in a route'
      }
    }],

    optimizedOrder: [{
      type: Number,
      min: [0, 'Order index must be non-negative']
    }],

    status: {
      type: String,
      enum: {
        values: ['planned', 'active', 'completed'],
        message: 'Route status must be planned, active, or completed'
      },
      default: 'planned'
    }
  },
  {
    timestamps: true // automatically adds createdAt and updatedAt
  }
);

// Indexes for better query performance
collectionRouteSchema.index({ collectorId: 1 });
collectionRouteSchema.index({ date: 1 });
collectionRouteSchema.index({ status: 1 });

// Compound indexes for common queries
collectionRouteSchema.index({ collectorId: 1, status: 1 });

// Ensure unique route per collector per date (this also serves as the compound index)
collectionRouteSchema.index({ collectorId: 1, date: 1 }, { unique: true });

// Pre-save middleware to validate optimized order
collectionRouteSchema.pre('save', function(next) {
  // Ensure optimizedOrder array length matches collections array length
  if (this.collections.length > 0 && this.optimizedOrder.length !== this.collections.length) {
    // Auto-generate sequential order if not provided or mismatched
    this.optimizedOrder = Array.from({ length: this.collections.length }, (_, i) => i);
  }
  
  // Validate that optimizedOrder contains valid indices
  if (this.optimizedOrder.length > 0) {
    const maxIndex = this.collections.length - 1;
    const validOrder = this.optimizedOrder.every(index => 
      Number.isInteger(index) && index >= 0 && index <= maxIndex
    );
    
    if (!validOrder) {
      return next(new Error('Optimized order contains invalid indices'));
    }
    
    // Check for duplicate indices
    const uniqueIndices = new Set(this.optimizedOrder);
    if (uniqueIndices.size !== this.optimizedOrder.length) {
      return next(new Error('Optimized order contains duplicate indices'));
    }
  }
  
  next();
});

// Instance method to get collections in optimized order
collectionRouteSchema.methods.getOptimizedCollections = function() {
  if (!this.collections || this.collections.length === 0) {
    return [];
  }
  
  return this.optimizedOrder.map(index => this.collections[index]);
};

// Instance method to add collection to route
collectionRouteSchema.methods.addCollection = function(collectionId) {
  if (!this.collections.includes(collectionId)) {
    this.collections.push(collectionId);
    this.optimizedOrder.push(this.collections.length - 1);
  }
};

// Instance method to remove collection from route
collectionRouteSchema.methods.removeCollection = function(collectionId) {
  const index = this.collections.indexOf(collectionId);
  if (index > -1) {
    this.collections.splice(index, 1);
    // Rebuild optimized order
    this.optimizedOrder = Array.from({ length: this.collections.length }, (_, i) => i);
  }
};

// Static method to get route for collector on specific date
collectionRouteSchema.statics.getCollectorRoute = function(collectorId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return this.findOne({
    collectorId,
    date: { $gte: startOfDay, $lte: endOfDay }
  }).populate('collections');
};

// Static method to optimize route order (simple distance-based for now)
collectionRouteSchema.statics.optimizeRoute = function(collections) {
  // Simple optimization: sort by address (in real implementation, would use GPS coordinates)
  const sorted = collections
    .map((collection, index) => ({ collection, originalIndex: index }))
    .sort((a, b) => {
      const addressA = a.collection.pickupLocation?.address || '';
      const addressB = b.collection.pickupLocation?.address || '';
      return addressA.localeCompare(addressB);
    });
  
  return sorted.map(item => item.originalIndex);
};

const CollectionRoute = mongoose.model("CollectionRoute", collectionRouteSchema);
export default CollectionRoute;