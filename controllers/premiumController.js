const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.createCheckoutSession = async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: `${req.protocol}://${req.get(
        'host'
      )}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.protocol}://${req.get('host')}/cancel`,
      customer_email: req.user.email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Premium Subscription',
              images: ['https://images.app.goo.gl/NCUJu3ZUG9Hk9kM46'],
            },
            unit_amount: 999, // Amount in cents, so $9.99
            recurring: {
              interval: 'month', // or 'year' for annual subscription
            },
          },
          quantity: 1,
        },
      ],
    });

    res.status(200).json({
      status: 'success',
      sessionId: session.id,
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};
