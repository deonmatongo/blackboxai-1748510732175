// app.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const authRoutes = require('./routes/authRoutes');
const currencyRoutes = require('./routes/currencyRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const app = express();

// Middleware setup
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Currency Exchange Tracker API',
      version: '1.0.0',
      description: 'API documentation for the Currency Exchange Tracker',
    },
    servers: [
      {
        url: `${process.env.API_BASE_URL || 'http://localhost:5000'}/api`,
      },
    ],
  },
  apis: ['./routes/*.js', './models/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes setup
app.use('/api/auth', authRoutes);
app.use('/api/currency', currencyRoutes);
app.use('/api/payment', paymentRoutes);

// Handle 404 and errors
app.use(notFound);
app.use(errorHandler);

if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
}

module.exports = app;
