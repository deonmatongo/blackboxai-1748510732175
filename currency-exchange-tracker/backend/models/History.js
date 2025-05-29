const mongoose = require('mongoose');

const historySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true, // Ensure userId is always provided
    },
    actionType: {
      type: String,
      enum: ['exchange', 'payment'], // Allowed actions
      required: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed, // Allows storing flexible data
      required: true, // Ensure details are always present
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Add indexes for optimized queries
historySchema.index({ userId: 1, actionType: 1, createdAt: -1 }); // Compound index for frequent queries

// Export both the model and the schema
const History = mongoose.model('History', historySchema);
module.exports = History;