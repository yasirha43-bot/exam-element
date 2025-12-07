import express from 'express';
import Stripe from 'stripe';
import pool from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const SUBSCRIPTION_PRICE = 499; // £4.99 in pence

// Create checkout session
router.post('/create-checkout-session', authMiddleware, async (req, res) => {
  try {
    const user = await pool.query('SELECT email, stripe_customer_id FROM users WHERE id = $1', [req.user.id]);

    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    let customerId = user.rows[0].stripe_customer_id;

    // Create customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.rows[0].email,
      });
      customerId = customer.id;

      await pool.query('UPDATE users SET stripe_customer_id = $1 WHERE id = $2', [customerId, req.user.id]);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: 'Science Revision Premium',
              description: 'Unlimited flashcards, quizzes, mock exams, and analytics',
            },
            unit_amount: SUBSCRIPTION_PRICE,
            recurring: {
              interval: 'month',
              interval_count: 1,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.CLIENT_URL}/dashboard?payment=cancelled`,
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Checkout session error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Stripe webhook endpoint
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    switch (event.type) {
      case 'customer.subscription.updated':
      case 'customer.subscription.created':
        {
          const subscription = event.data.object;
          const customer = await stripe.customers.retrieve(subscription.customer);
          const userResult = await pool.query('SELECT id FROM users WHERE stripe_customer_id = $1', [subscription.customer]);

          if (userResult.rows.length > 0) {
            const userId = userResult.rows[0].id;
            await pool.query(
              'UPDATE users SET is_subscribed = TRUE, stripe_subscription_id = $1 WHERE id = $2',
              [subscription.id, userId]
            );

            await pool.query(
              'INSERT INTO subscription_events (user_id, event_type, stripe_event_id) VALUES ($1, $2, $3)',
              [userId, 'subscription_created', event.id]
            );
          }
        }
        break;

      case 'customer.subscription.deleted':
        {
          const subscription = event.data.object;
          const userResult = await pool.query('SELECT id FROM users WHERE stripe_subscription_id = $1', [subscription.id]);

          if (userResult.rows.length > 0) {
            const userId = userResult.rows[0].id;
            await pool.query(
              'UPDATE users SET is_subscribed = FALSE WHERE id = $1',
              [userId]
            );

            await pool.query(
              'INSERT INTO subscription_events (user_id, event_type, stripe_event_id) VALUES ($1, $2, $3)',
              [userId, 'subscription_cancelled', event.id]
            );
          }
        }
        break;

      case 'invoice.payment_failed':
        {
          const invoice = event.data.object;
          const userResult = await pool.query('SELECT id FROM users WHERE stripe_customer_id = $1', [invoice.customer]);

          if (userResult.rows.length > 0) {
            const userId = userResult.rows[0].id;
            await pool.query(
              'UPDATE users SET is_subscribed = FALSE WHERE id = $1',
              [userId]
            );
          }
        }
        break;
    }

    res.json({received: true});
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Get subscription status
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT is_subscribed FROM users WHERE id = $1', [req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ is_subscribed: result.rows[0].is_subscribed });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: 'Failed to check subscription status' });
  }
});

export default router;
