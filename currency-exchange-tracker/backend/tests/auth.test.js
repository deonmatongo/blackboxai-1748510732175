const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
require('dotenv').config();

// Mock dependencies for currencyRoutes.js
jest.mock('../middleware/protect', () => jest.fn((req, res, next) => next()));
jest.mock('../middleware/adminMiddleware', () => ({
  adminMiddleware: jest.fn((req, res, next) => next()),
}));
jest.mock('../controllers/currencyController', () => ({
  getExchangeRates: jest.fn(),
  convertCurrencyHandler: jest.fn(),
  getConversionHistory: jest.fn(),
  createCurrencyRecord: jest.fn().mockImplementation((req, res) => res.status(201).json({})),
  getAllCurrencies: jest.fn(),
  updateCurrencyRecord: jest.fn(),
  deleteCurrencyRecord: jest.fn(),
}));

jest.setTimeout(30000); // Increase timeout for long-running tests

describe('Registration Route', () => {
  beforeAll(async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI_TEST, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    } catch (error) {
      console.error('Database connection failed:', error.message);
      throw error;
    }
  });

  afterEach(async () => {
    try {
      await User.deleteMany(); // Only delete users to avoid corrupting other collections
    } catch (error) {
      console.warn('Failed to delete users:', error.message);
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'testuser@example.com', password: 'password123' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data).toHaveProperty('email', 'testuser@example.com');
  });

  it('should not allow duplicate email registration', async () => {
    // First registration
    await request(app).post('/api/auth/register').send({
      email: 'duplicate@example.com',
      password: 'password123',
    });

    // Duplicate registration
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'duplicate@example.com', password: 'password123' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Email is already registered');
  });
});