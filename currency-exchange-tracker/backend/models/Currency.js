const mongoose = require('mongoose');

const currencySchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Currency code is required'],
      unique: true,
      uppercase: true,
      minlength: 3,
      maxlength: 3,
    },
    name: {
      type: String,
      required: [true, 'Currency name is required'],
    },
    rate: {
      type: Number,
      required: [true, 'Exchange rate is required'],
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

module.exports = mongoose.model('Currency', currencySchema);