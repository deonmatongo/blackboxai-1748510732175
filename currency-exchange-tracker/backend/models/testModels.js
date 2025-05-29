const mongoose = require('mongoose');
const User = require('./User');
const Currency = require('./Currency');
const ConversionHistory = require('./ConversionHistory');
const Payment = require('./Payment');

const testModels = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/currency-exchange', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB.');

    // Test User Model
    const user = await User.create({
      email: 'testuser@example.com',
      password: 'password123',
    });
    console.log('User created:', user);

    // Test Currency Model
    const currency = await Currency.create({
      code: 'USD',
      name: 'United States Dollar',
      rate: 1.0,
    });
    console.log('Currency created:', currency);

    // Test ConversionHistory Model
    const conversion = await ConversionHistory.create({
      userId: user._id,
      fromCurrency: 'USD',
      toCurrency: 'EUR',
      amount: 100,
      convertedAmount: 85,
    });
    console.log('Conversion History created:', conversion);

    // Test Payment Model
    const payment = await Payment.create({
      userId: user._id,
      amount: 1000,
      currency: 'USD',
      status: 'completed',
      transactionId: 'txn_123456',
    });
    console.log('Payment created:', payment);

    // Close the connection
    await mongoose.connection.close();
    console.log('Connection closed.');
  } catch (err) {
    console.error('Error testing models:', err.message);
    process.exit(1);
  }
};

testModels();