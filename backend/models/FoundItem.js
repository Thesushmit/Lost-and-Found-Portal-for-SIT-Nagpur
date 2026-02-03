const mongoose = require('mongoose');

// Found Item Schema (3NF: No transitive dependency)
// Location is normalized to avoid redundancy
const foundItemSchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  // Location where item was found
  foundLocation: {
    type: String,
    required: true,
    trim: true
  },
  // Date and time when item was found
  foundDate: {
    type: Date,
    required: true
  },
  foundTime: {
    type: String,
    required: true
  },
  // Location where item is deposited
  depositLocation: {
    type: String,
    required: true,
    trim: true
  },
  // Reference to user who uploaded (foreign key - normalized)
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Status of the item
  status: {
    type: String,
    enum: ['available', 'claimed', 'returned'],
    default: 'available'
  },
  // Category for better organization
  category: {
    type: String,
    enum: ['electronics', 'documents', 'accessories', 'clothing', 'books', 'others'],
    default: 'others'
  },
  // Claim Details - stored when someone claims the item
  claimDetails: {
    claimantName: {
      type: String,
      trim: true
    },
    claimantEmail: {
      type: String,
      trim: true
    },
    claimantPhone: {
      type: String,
      trim: true
    },
    claimantId: {
      type: String,
      trim: true
    },
    ownershipProof: {
      type: String,
      trim: true
    },
    claimedAt: {
      type: Date
    },
    claimedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
foundItemSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for better query performance
foundItemSchema.index({ status: 1, createdAt: -1 });
foundItemSchema.index({ category: 1 });

const FoundItem = mongoose.model('FoundItem', foundItemSchema);

module.exports = FoundItem;
