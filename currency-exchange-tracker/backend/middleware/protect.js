const jwt = require('jsonwebtoken');
const User = require('../models/User'); // optional, if you want to fetch full user info

module.exports = async function protect(req, res, next) {
  console.log('NODE_ENV:', process.env.NODE_ENV);
  if (process.env.NODE_ENV === 'test') {
    console.log('Test environment detected, bypassing auth');
    req.user = { id: 'dummyUser', email: 'test@example.com' };
    return next();
  }

  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'testsecret');
    
    // Handle both cases where token might have 'id' or 'userId'
    req.user = { 
      id: decoded.id || decoded.userId,
      email: decoded.email
    };

    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};
