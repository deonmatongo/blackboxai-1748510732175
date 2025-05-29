const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const app = require('../app');
const ConversionHistory = require('../models/ConversionHistory');

jest.mock('axios');

let testToken;
let mockUserId;

beforeAll(async () => {
  mockUserId = new mongoose.Types.ObjectId();
  testToken = jwt.sign(
    { id: mockUserId },
    process.env.JWT_SECRET || 'testsecret',
    { expiresIn: '1h' }
  );

  const dbUri = process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1:27017/currency_test';

  await mongoose.connect(dbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Currency Routes Integration Tests', () => {
  describe('POST /api/currency/convert', () => {
    it('should convert currency successfully', async () => {
      const mockedExchangeRates = [
        { code: 'USD', mid: 4.0 },
        { code: 'EUR', mid: 5.0 },
      ];

      axios.get.mockResolvedValue({ data: [{ rates: mockedExchangeRates }] });

      const res = await request(app)
        .post('/api/currency/convert')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ fromCurrency: 'USD', toCurrency: 'EUR', amount: 100 });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('convertedAmount');
    });

    it('should return 400 for invalid fromCurrency', async () => {
      const mockedExchangeRates = [{ code: 'EUR', mid: 5.0 }];
      axios.get.mockResolvedValue({ data: [{ rates: mockedExchangeRates }] });

      const res = await request(app)
        .post('/api/currency/convert')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ fromCurrency: 'INVALID', toCurrency: 'EUR', amount: 100 });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Invalid fromCurrency: INVALID');
    });

    it('should return 400 for invalid toCurrency', async () => {
      const mockedExchangeRates = [{ code: 'USD', mid: 4.0 }];
      axios.get.mockResolvedValue({ data: [{ rates: mockedExchangeRates }] });

      const res = await request(app)
        .post('/api/currency/convert')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ fromCurrency: 'USD', toCurrency: 'INVALID', amount: 100 });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Invalid toCurrency: INVALID');
    });

    it('should return 500 on external API failure', async () => {
      axios.get.mockRejectedValue(new Error('Failed'));

      const res = await request(app)
        .post('/api/currency/convert')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ fromCurrency: 'USD', toCurrency: 'EUR', amount: 100 });

      expect(res.statusCode).toBe(500);
    });
  });

  describe('GET /api/currency/history', () => {
    it('should return conversion history for user', async () => {
      await ConversionHistory.create({
        userId: mockUserId,
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        amount: 100,
        convertedAmount: 85,
      });

      const res = await request(app)
        .get('/api/currency/history')
        .set('Authorization', `Bearer ${testToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should return an empty array when no history exists', async () => {
      await ConversionHistory.deleteMany({ userId: mockUserId });

      const res = await request(app)
        .get('/api/currency/history')
        .set('Authorization', `Bearer ${testToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });
  });
});