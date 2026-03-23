const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { getFirestore } = require('../config/firebase');
const { authenticateToken } = require('../middleware/auth');
const { sendPaymentFailedEmail } = require('../services/emailService');
const { getStripePriceId, getBaseTier } = require('../config/tiers');

// POST /api/payment/create-checkout-session
router.post('/create-checkout-session', authenticateToken, async (req, res) => {
  const { tier } = req.body;
  const priceId = getStripePriceId(tier);

  if (!priceId) {
    return res.status(400).json({ success: false, error: 'Invalid tier or tier not configured', code: 'INVALID_TIER' });
  }

  try {
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    const userData = userDoc.data() || {};

    // Get or create Stripe customer
    let customerId = userData.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: userData.displayName || '',
        metadata: { uid: req.user.uid },
      });
      customerId = customer.id;
      await db.collection('users').doc(req.user.uid).update({ stripeCustomerId: customerId });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL}/dashboard?upgrade=success&tier=${tier}`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing?cancelled=true`,
      metadata: { uid: req.user.uid, tier },
      subscription_data: { metadata: { uid: req.user.uid, tier } },
    });

    return res.json({ success: true, sessionId: session.id, url: session.url });
  } catch (err) {
    console.error('Checkout session error:', err);
    return res.status(500).json({ success: false, error: 'Failed to create checkout session', code: 'STRIPE_ERROR' });
  }
});

// POST /api/payment/webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  const db = getFirestore();

  // Idempotency: skip events already processed
  const processedRef = db.collection('processedWebhooks').doc(event.id);
  const alreadyProcessed = await processedRef.get();
  if (alreadyProcessed.exists) {
    return res.json({ received: true });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const uid = session.metadata?.uid;
        const tier = getBaseTier(session.metadata?.tier); // strip _annual suffix
        if (uid && tier) {
          await db.collection('users').doc(uid).update({
            tier,
            stripeSubscriptionId: session.subscription,
            stripeCustomerId: session.customer,
            subscriptionStatus: 'active',
            subscribedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          console.log(`✅ User ${uid} upgraded to ${tier}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customer = subscription.customer;
        const snapshot = await db.collection('users').where('stripeCustomerId', '==', customer).limit(1).get();
        if (!snapshot.empty) {
          await snapshot.docs[0].ref.update({
            tier: 'starter',
            subscriptionStatus: 'cancelled',
            updatedAt: new Date().toISOString(),
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const snapshot = await db.collection('users').where('stripeCustomerId', '==', invoice.customer).limit(1).get();
        if (!snapshot.empty) {
          const userData = snapshot.docs[0].data();
          sendPaymentFailedEmail(userData.email, userData.displayName).catch(() => {});
          await snapshot.docs[0].ref.update({ subscriptionStatus: 'past_due', updatedAt: new Date().toISOString() });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object;
        const snapshot = await db.collection('users').where('stripeSubscriptionId', '==', sub.id).limit(1).get();
        if (!snapshot.empty) {
          await snapshot.docs[0].ref.update({
            subscriptionStatus: sub.status,
            updatedAt: new Date().toISOString(),
          });
        }
        break;
      }
    }

    // Mark event as processed
    await processedRef.set({ type: event.type, processedAt: new Date().toISOString() });

    return res.json({ received: true });
  } catch (err) {
    console.error('Webhook processing error:', err);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// GET /api/payment/current-subscription
router.get('/current-subscription', authenticateToken, async (req, res) => {
  try {
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    const userData = userDoc.data() || {};

    if (!userData.stripeSubscriptionId) {
      return res.json({ success: true, subscription: null, tier: userData.tier || 'starter' });
    }

    const subscription = await stripe.subscriptions.retrieve(userData.stripeSubscriptionId);
    return res.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        plan: subscription.items.data[0]?.price?.nickname || userData.tier,
      },
      tier: userData.tier,
    });
  } catch (err) {
    console.error('Subscription fetch error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch subscription', code: 'STRIPE_ERROR' });
  }
});

// GET /api/payment/invoices
router.get('/invoices', authenticateToken, async (req, res) => {
  try {
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    const { stripeCustomerId } = userDoc.data() || {};

    if (!stripeCustomerId) return res.json({ success: true, invoices: [] });

    const invoices = await stripe.invoices.list({ customer: stripeCustomerId, limit: 24 });
    return res.json({
      success: true,
      invoices: invoices.data.map(inv => ({
        id: inv.id,
        date: new Date(inv.created * 1000).toISOString(),
        amount: inv.amount_paid / 100,
        currency: inv.currency.toUpperCase(),
        status: inv.status,
        pdf: inv.invoice_pdf,
        description: inv.lines.data[0]?.description || '',
      })),
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to fetch invoices', code: 'STRIPE_ERROR' });
  }
});

// POST /api/payment/cancel-subscription
router.post('/cancel-subscription', authenticateToken, async (req, res) => {
  try {
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    const { stripeSubscriptionId } = userDoc.data() || {};

    if (!stripeSubscriptionId) {
      return res.status(404).json({ success: false, error: 'No active subscription', code: 'NO_SUBSCRIPTION' });
    }

    const updated = await stripe.subscriptions.update(stripeSubscriptionId, { cancel_at_period_end: true });

    await db.collection('users').doc(req.user.uid).update({
      subscriptionStatus: 'cancelling',
      updatedAt: new Date().toISOString(),
    });

    return res.json({
      success: true,
      message: 'Subscription will cancel at end of billing period',
      cancelAt: new Date(updated.cancel_at * 1000).toISOString(),
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to cancel subscription', code: 'STRIPE_ERROR' });
  }
});

module.exports = router;
