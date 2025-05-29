const axios = require('axios');
const NodeCache = require('node-cache');
const ConversionHistory = require('../models/ConversionHistory');
const Currency = require('../models/Currency');

// Cache configuration for exchange rates
const exchangeRateCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });
const NBP_API_URL = 'https://api.nbp.pl/api/exchangerates/tables/A?format=json';

// Utility function to handle errors
const handleError = (res, error, message, statusCode = 500) => {
  console.error(`${message}:`, error.stack || error.message);
  res.status(statusCode).json({ message });
};

// Fetch exchange rates from external API or cache
const fetchExchangeRates = async () => {
  const cachedRates = exchangeRateCache.get('exchangeRates');
  if (cachedRates) return cachedRates;

  const response = await axios.get(NBP_API_URL);
  const rates = response.data[0].rates;
  exchangeRateCache.set('exchangeRates', rates);
  return rates;
};

// Fetch exchange rates (public route)
const getExchangeRates = async (req, res) => {
  try {
    const rates = await fetchExchangeRates();
    res.status(200).json({ rates });
  } catch (error) {
    handleError(res, error, 'Failed to fetch exchange rates');
  }
};

// Convert currency (protected route)
const convertCurrencyHandler = async (req, res) => {
  try {
    const { amount, fromCurrency, toCurrency } = req.body;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized: user not authenticated' });
    }

    // Validate input
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ message: 'Amount must be a positive number' });
    }

    if (!fromCurrency || !toCurrency) {
      return res.status(400).json({ message: 'Both fromCurrency and toCurrency are required' });
    }

    // Fetch exchange rates
    const rates = await fetchExchangeRates();

    // Get rates for fromCurrency and toCurrency
    const fromRate = fromCurrency === 'PLN' ? 1 : rates.find((r) => r.code === fromCurrency)?.mid;
    const toRate = toCurrency === 'PLN' ? 1 : rates.find((r) => r.code === toCurrency)?.mid;

    if (!fromRate) {
      return res.status(400).json({ message: `Invalid fromCurrency: ${fromCurrency}` });
    }
    if (!toRate) {
      return res.status(400).json({ message: `Invalid toCurrency: ${toCurrency}` });
    }

    // Perform conversion
    const convertedAmount = (amount * fromRate) / toRate;

    // Save conversion history in the database
    const conversion = new ConversionHistory({
      userId: req.user.id,
      fromCurrency,
      toCurrency,
      amount,
      convertedAmount,
    });

    await conversion.save();

    res.status(200).json({ convertedAmount, fromCurrency, toCurrency });
  } catch (error) {
    handleError(res, error, 'Failed to convert currency');
  }
};

// Get conversion history for the authenticated user (protected route)
const getConversionHistory = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized: user not authenticated' });
    }

    const history = await ConversionHistory.find({ userId: req.user.id });
    res.status(200).json(history);
  } catch (error) {
    handleError(res, error, 'Failed to fetch conversion history');
  }
};

// Create a new currency record (admin-only route)
const createCurrencyRecord = async (req, res) => {
  try {
    const { code, name, rate } = req.body;

    if (!code || !name || typeof rate !== 'number') {
      return res.status(400).json({ message: 'Invalid currency data' });
    }

    const newCurrency = new Currency({ code, name, rate });
    await newCurrency.save();

    res.status(201).json(newCurrency);
  } catch (error) {
    handleError(res, error, 'Failed to create currency record');
  }
};

// Fetch all currencies (admin-only route)
const getAllCurrencies = async (req, res) => {
  try {
    const currencies = await Currency.find({});
    res.status(200).json(currencies);
  } catch (error) {
    handleError(res, error, 'Failed to fetch currencies');
  }
};

// Update an existing currency record (admin-only route)
const updateCurrencyRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const updatedCurrency = await Currency.findByIdAndUpdate(id, updatedData, { new: true });
    if (!updatedCurrency) {
      return res.status(404).json({ message: 'Currency not found' });
    }

    res.status(200).json(updatedCurrency);
  } catch (error) {
    handleError(res, error, 'Failed to update currency record');
  }
};

// Delete a currency record (admin-only route)
const deleteCurrencyRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCurrency = await Currency.findByIdAndDelete(id);
    if (!deletedCurrency) {
      return res.status(404).json({ message: 'Currency not found' });
    }

    res.status(200).json({ message: 'Currency deleted successfully' });
  } catch (error) {
    handleError(res, error, 'Failed to delete currency record');
  }
};

// Export all controller methods
module.exports = {
  getExchangeRates,
  convertCurrencyHandler,
  getConversionHistory,
  createCurrencyRecord,
  getAllCurrencies,
  updateCurrencyRecord,
  deleteCurrencyRecord,
};