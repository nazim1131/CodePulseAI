const express = require('express');
const Stripe = require('stripe');
const User = require('../models/User');
const { protect } = require('../middlewares/auth');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const router = express.Router();
const webhookRouter = express.Router();

// ─────────────────────────────────────────────
// POST /api/billing/checkout
// Creates a Stripe Checkout session (subscription)
// ─────────────────────────────────────────────
router.post('/checkout', protect, async (req, res) => {
  try {
    // Debug logs
    console.log('[Billing] Stripe Key:', process.env.STRIPE_SECRET_KEY ? 'Loaded ✓' : 'MISSING ✗');
    console.log('[Billing] Price ID:', process.env.STRIPE_PRO_PRICE_ID || 'MISSING ✗');

    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set in .env');
    }

    if (!process.env.STRIPE_PRO_PRICE_ID) {
      throw new Error(
        'STRIPE_PRO_PRICE_ID is not set in .env — go to Stripe Dashboard → Products → copy the Price ID (starts with price_)'
      );
    }

    const { plan } = req.body;

    // Select price based on plan (defaults to pro)
    const priceId =
      plan === 'team'
        ? process.env.STRIPE_TEAM_PRICE_ID || process.env.STRIPE_PRO_PRICE_ID
        : process.env.STRIPE_PRO_PRICE_ID;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?payment=success`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/pricing?payment=cancelled`,
      client_reference_id: req.user._id.toString(),
      customer_email: req.user.email || undefined,
      metadata: {
        userId: req.user._id.toString()
      }
    });

    console.log('[Billing] Session created:', session.id);
    res.status(200).json({ url: session.url });

  } catch (error) {
    console.error('[Billing] Stripe Checkout Error:', error.message);
    res.status(500).json({
      error: true,
      message: error.message,
      missingConfig: error.message.includes('not set in .env')
    });
  }
});

// ─────────────────────────────────────────────
// POST /api/billing/webhook
// Stripe sends events here (raw body required — handled in index.js)
// ─────────────────────────────────────────────
webhookRouter.post('/', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  if (!endpointSecret) {
    // Allow local testing without webhook signing
    try {
      event = JSON.parse(req.body.toString());
    } catch {
      return res.status(400).send('Invalid JSON');
    }
  } else {
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.warn('[Billing] Webhook signature failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId || session.client_reference_id;
        if (userId) {
          const user = await User.findById(userId);
          if (user) {
            user.plan = 'pro';
            user.scanLimit = 250;
            user.subscriptionId = session.subscription;
            user.stripeCustomerId = session.customer;
            await user.save();
            console.log(`[Billing] User ${userId} upgraded to PRO`);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await User.updateMany(
          { subscriptionId: subscription.id },
          { plan: 'free', scanLimit: 50 }
        );
        console.log(`[Billing] Subscription ${subscription.id} deleted — users reset to FREE`);
        break;
      }

      default:
        console.log(`[Billing] Unhandled event: ${event.type}`);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('[Billing] Webhook processing error:', err.message);
    res.status(500).send('Webhook server error');
  }
});

module.exports = { router, webhookRouter };
