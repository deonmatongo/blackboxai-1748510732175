module.exports = jest.fn(() => ({
    checkout: {
      sessions: {
        create: jest.fn().mockImplementation((params) => {
          if (!params.line_items || !params.line_items[0].price_data.unit_amount) {
            throw new Error('Invalid amount. Must be a positive number.');
          }
          return Promise.resolve({
            id: 'test_session_id',
            url: 'http://localhost/checkout',
          });
        }),
      },
    },
  }));