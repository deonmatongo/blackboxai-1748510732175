// ✅ Define mock BEFORE anything else
const mockCreateSession = jest.fn();

// ✅ Mock Stripe module before importing paymentRoutes
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: mockCreateSession,
      },
    },
  }));
});

// ✅ Import necessary dependencies
const express = require('express');
const paymentRoutes = require('../routes/paymentRoutes');
const request = require('supertest');

// ✅ Setup Express app
const app = express();
app.use(express.json());
app.use('/api', paymentRoutes);

describe('POST /api/checkout', () => {
  beforeEach(() => {
    mockCreateSession.mockReset(); // Reset mocks before each test
  });

  it('should create a Stripe session and return session data', async () => {
    mockCreateSession.mockResolvedValue({
      id: 'mockSessionId',
      url: 'https://mock.stripe.url/session',
    });

    const response = await request(app)
      .post('/api/checkout')
      .send({
        amount: 1000,
        currency: 'usd',
        description: 'Test payment',
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', 'mockSessionId');
    expect(response.body).toHaveProperty('url', 'https://mock.stripe.url/session');
  });

  it('should return 400 for invalid amount', async () => {
    const response = await request(app)
      .post('/api/checkout')
      .send({
        amount: -1000,
        currency: 'usd',
        description: 'Invalid amount',
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/Invalid amount/i);
  });

  it('should return 400 for invalid currency', async () => {
    const response = await request(app)
      .post('/api/checkout')
      .send({
        amount: 1000,
        currency: 'us', // Invalid
        description: 'Invalid currency',
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/Invalid currency/i);
  });

  it('should return 400 for missing description', async () => {
    const response = await request(app)
      .post('/api/checkout')
      .send({
        amount: 1000,
        currency: 'usd',
        description: '',
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/Invalid description/i);
  });
});
