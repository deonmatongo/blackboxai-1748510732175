const mongoose = require('mongoose');

const conversionHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fromCurrency: {
      type: String,
      required: true,
      uppercase: true,
      match: [/^[A-Z]{3}$/, 'Invalid ISO currency code'],
    },
    toCurrency: {
      type: String,
      required: true,
      uppercase: true,
      match: [/^[A-Z]{3}$/, 'Invalid ISO currency code'],
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Amount must be greater than or equal to 0'],
    },
    convertedAmount: {
      type: Number,
      required: true,
      min: [0, 'Converted amount must be greater than or equal to 0'],
    },
  },
  { timestamps: true }
);

conversionHistorySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('ConversionHistory', conversionHistorySchema);