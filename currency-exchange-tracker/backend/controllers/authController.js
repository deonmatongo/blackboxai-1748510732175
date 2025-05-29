const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Utility: Create and return JWT token
const generateToken = (userId, email) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not defined in environment');

  return jwt.sign(
    { userId, email },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  const { email, password } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email is already registered',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    const token = generateToken(newUser._id, newUser.email);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        email: newUser.email,
        userId: newUser._id,
      },
    });
  } catch (err) {
    console.error('Registration error:', err.stack);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during registration',
    });
  }
};

// @desc    Log in user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  const { email, password } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user._id, user.email);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        email: user.email,
        userId: user._id,
      },
    });
  } catch (err) {
    console.error('Login error:', err.stack);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during login',
    });
  }
};

module.exports = { register, login };
