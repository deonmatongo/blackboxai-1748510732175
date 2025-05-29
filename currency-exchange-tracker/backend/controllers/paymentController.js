const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY || 'test_stripe_key');

const createCheckoutSession = async ({ amount, currency, description }) => {
  return await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [{
      price_data: {
        currency: currency,
        product_data: {
          name: description,
        },
        unit_amount: amount,
      },
      quantity: 1,
    }],
    success_url: process.env.SUCCESS_URL || 'http://localhost/success',
    cancel_url: process.env.CANCEL_URL || 'http://localhost/cancel',
  });
};

module.exports = { createCheckoutSession };
