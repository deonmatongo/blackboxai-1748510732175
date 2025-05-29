const express = require('express');
const router = express.Router();

// New endpoint for creating a mock Stripe checkout session
router.post('/checkout', async (req, res) => {
  const { amount, currency, description } = req.body;
  
  // Validate amount
  if (!amount || typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount. Must be a positive number.' });
  }
  
  // Validate currency: Expect 3-letter code
  if (!currency || typeof currency !== 'string' || currency.length !== 3) {
    return res.status(400).json({ error: 'Invalid currency. Currency code must be a 3-letter string.' });
  }
  
  // Validate description
  if (!description || typeof description !== 'string' || description.trim() === '') {
    return res.status(400).json({ error: 'Invalid description. Description cannot be empty.' });
  }
  
  // Respond with mock session data
  return res.status(200).json({
    id: 'mockSessionId',
    url: 'https://mock.stripe.url/session'
  });
});

// Mock payment processing
router.post('/process', async (req, res) => {
  try {
    const { amount, items } = req.body;

    // Input validation
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount. Must be a positive number.' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Invalid items. Must be a non-empty array.' });
    }

    // Mock successful payment
    const payment = {
      id: Math.floor(Math.random() * 1000000),
      amount,
      items,
      status: 'completed',
      timestamp: new Date(),
    };

    res.status(200).json({ 
      message: 'Payment processed successfully',
      payment 
    });

  } catch (err) {
    console.error('Error in payment processing:', err);
    res.status(500).json({
      message: 'An unexpected error occurred. Please try again later.',
    });
  }
});

// Get payment history
router.get('/history', async (req, res) => {
  try {
    // Mock payment history
    const payments = [
      {
        id: 123456,
        amount: 100.50,
        status: 'completed',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        id: 123457,
        amount: 75.25,
        status: 'completed',
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
      }
    ];

    res.status(200).json({ payments });

  } catch (err) {
    console.error('Error fetching payment history:', err);
    res.status(500).json({
      message: 'An unexpected error occurred. Please try again later.',
    });
  }
});

module.exports = router;
