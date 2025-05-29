const express = require('express');
const router = express.Router();
const currencyController = require('../controllers/currencyController');
const { protect, adminMiddleware } = require('../middleware/authMiddleware');

// Debugging logs for development (remove these in production)
console.log('protect middleware loaded:', typeof protect === 'function');
console.log('adminMiddleware loaded:', typeof adminMiddleware === 'function');
console.log('currencyController methods:', Object.keys(currencyController));

// Public route: Fetch exchange rates (no authentication needed)
router.get('/rates', currencyController.getExchangeRates);

// Protected route: Convert currency (authentication required)
router.post('/convert', protect, currencyController.convertCurrencyHandler);

// Protected route: Fetch conversion history for a user
router.get('/history', protect, currencyController.getConversionHistory);

// Admin routes for currency management (admin authorization required)
router.post(
  '/admin/currencies',
  protect,
  adminMiddleware,
  currencyController.createCurrencyRecord
);
router.get(
  '/admin/currencies',
  protect,
  adminMiddleware,
  currencyController.getAllCurrencies
);
router.put(
  '/admin/currencies/:id',
  protect,
  adminMiddleware,
  currencyController.updateCurrencyRecord
);
router.delete(
  '/admin/currencies/:id',
  protect,
  adminMiddleware,
  currencyController.deleteCurrencyRecord
);

module.exports = router;