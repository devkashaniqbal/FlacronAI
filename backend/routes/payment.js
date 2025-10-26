// Payment Routes for FlacronAI
// Handles Stripe payment integration for tier upgrades

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getFirestore } = require('../config/firebase');
const { TIERS } = require('../config/tiers');

// Initialize Stripe with your secret key
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Create Stripe Checkout Session
 * POST /api/payment/create-checkout-session
 *
 * This endpoint creates a Stripe checkout session for upgrading to a paid tier.
 *
 * Request body:
 * {
 *   "tier": "professional" | "agency" | "enterprise",
 *   "priceId": "price_xxx", // Stripe price ID
 *   "userId": "user_id"
 * }
 */
router.post('/create-checkout-session', authenticateToken, async (req, res) => {
  try {
    const { tier, priceId, userId } = req.body;

    // Validate tier
    if (!tier || !TIERS[tier]) {
      return res.status(400).json({
        success: false,
        error: 'Invalid tier specified'
      });
    }

    // Don't allow checkout for starter tier (it's free)
    if (tier === 'starter') {
      return res.status(400).json({
        success: false,
        error: 'Starter tier is free. No payment required.'
      });
    }

    // Validate user
    if (req.user.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    // Get user data
    const db = getFirestore();
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const userData = userDoc.data();

    // Check if already on this tier
    if (userData.tier === tier) {
      return res.status(400).json({
        success: false,
        error: `Already subscribed to ${tier} tier`
      });
    }

    // Map tier to Stripe price ID from environment variables
    const priceMap = {
      professional: process.env.STRIPE_PRICE_PROFESSIONAL,
      agency: process.env.STRIPE_PRICE_AGENCY,
      enterprise: process.env.STRIPE_PRICE_ENTERPRISE
    };

    const stripePriceId = priceMap[tier] || priceId;

    if (!stripePriceId) {
      return res.status(400).json({
        success: false,
        error: 'Invalid price configuration. Please contact support.'
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: stripePriceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/checkout?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/checkout?canceled=true`,
      client_reference_id: userId,
      customer_email: userData.email,
      metadata: {
        userId: userId,
        tier: tier,
        previousTier: userData.tier
      }
    });

    res.json({
      success: true,
      url: session.url,
      sessionId: session.id
    });

  } catch (error) {
    console.error('Create checkout session error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create checkout session'
    });
  }
});

/**
 * Stripe Webhook Handler
 * POST /api/payment/webhook
 *
 * Handles Stripe webhook events:
 * - checkout.session.completed: Upgrade user tier after successful payment
 * - invoice.paid: Handle recurring subscription payments
 * - customer.subscription.deleted: Downgrade user when subscription is cancelled
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  console.log('🔔 Webhook received!');

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log(`✅ Webhook verified: ${event.type}`);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      console.log('💳 Processing checkout.session.completed');
      const session = event.data.object;
      await handleCheckoutComplete(session);
      break;

    case 'invoice.paid':
      console.log('💰 Processing invoice.paid');
      const invoice = event.data.object;
      await handleInvoicePaid(invoice);
      break;

    case 'customer.subscription.updated':
      console.log('🔄 Processing customer.subscription.updated');
      const updatedSub = event.data.object;
      await handleSubscriptionUpdate(updatedSub);
      break;

    case 'customer.subscription.deleted':
      console.log('❌ Processing customer.subscription.deleted');
      const subscription = event.data.object;
      await handleSubscriptionCancelled(subscription);
      break;

    default:
      console.log(`⚠️  Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

/**
 * Verify Checkout Session (Fallback if webhook doesn't fire)
 * GET /api/payment/verify-session/:sessionId
 */
router.get('/verify-session/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.userId;

    console.log(`🔍 Verifying checkout session: ${sessionId} for user: ${userId}`);

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid' && session.client_reference_id === userId) {
      console.log(`✅ Session verified, updating user tier to ${session.metadata.tier}`);

      // Update user tier (same as webhook)
      const db = getFirestore();
      const userRef = db.collection('users').doc(userId);
      const userDoc = await userRef.get();
      const currentData = userDoc.data();

      // Cancel old subscription if exists
      if (currentData.subscriptionId && currentData.subscriptionId !== session.subscription) {
        try {
          await stripe.subscriptions.cancel(currentData.subscriptionId);
          console.log(`Canceled old subscription: ${currentData.subscriptionId}`);
        } catch (err) {
          console.error('Error canceling old subscription:', err);
        }
      }

      await userRef.update({
        tier: session.metadata.tier,
        stripeCustomerId: session.customer,
        subscriptionId: session.subscription,
        subscriptionStatus: 'active',
        updatedAt: new Date().toISOString()
      });

      res.json({
        success: true,
        tier: session.metadata.tier,
        message: 'Subscription activated successfully'
      });
    } else {
      res.json({
        success: false,
        error: 'Payment not completed or user mismatch'
      });
    }
  } catch (error) {
    console.error('Verify session error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Cancel Subscription
 * POST /api/payment/cancel-subscription
 *
 * Cancels the user's current subscription
 */
router.post('/cancel-subscription', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user data
    const db = getFirestore();
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const userData = userDoc.data();

    // Check if user has an active subscription
    if (!userData.subscriptionId) {
      return res.status(400).json({
        success: false,
        error: 'No active subscription found'
      });
    }

    // Cancel subscription in Stripe (at period end)
    await stripe.subscriptions.update(userData.subscriptionId, {
      cancel_at_period_end: true
    });

    // Update user data
    await userRef.update({
      subscriptionStatus: 'canceling',
      updatedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Subscription cancelled successfully. Downgraded to Starter tier.'
    });

  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to cancel subscription'
    });
  }
});

/**
 * Get Billing Portal URL
 * GET /api/payment/billing-portal
 *
 * Returns a URL to the Stripe billing portal where users can manage their subscription
 */
router.get('/billing-portal', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user data
    const db = getFirestore();
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const userData = userDoc.data();

    if (!userData.stripeCustomerId) {
      return res.status(400).json({
        success: false,
        error: 'No billing information found'
      });
    }

    // Create billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: userData.stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL}/dashboard`,
    });

    res.json({
      success: true,
      url: session.url
    });

  } catch (error) {
    console.error('Billing portal error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create billing portal session'
    });
  }
});

// ============================================
// Helper Functions (for webhook handling)
// ============================================

async function handleCheckoutComplete(session) {
  const userId = session.client_reference_id;
  const tier = session.metadata.tier;
  const previousTier = session.metadata.previousTier;

  try {
    console.log(`🔔 WEBHOOK: Checkout completed for user ${userId}, upgrading from ${previousTier} to ${tier}`);

    // Update user tier in Firestore
    const db = getFirestore();
    const userRef = db.collection('users').doc(userId);

    // Get current user data
    const userDoc = await userRef.get();
    const currentData = userDoc.data();

    // If user had a previous subscription, cancel it
    if (currentData.subscriptionId && currentData.subscriptionId !== session.subscription) {
      console.log(`Canceling old subscription: ${currentData.subscriptionId}`);
      try {
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        await stripe.subscriptions.cancel(currentData.subscriptionId);
      } catch (cancelError) {
        console.error('Error canceling old subscription:', cancelError);
      }
    }

    await userRef.update({
      tier: tier,
      stripeCustomerId: session.customer,
      subscriptionId: session.subscription,
      subscriptionStatus: 'active',
      updatedAt: new Date().toISOString()
    });

    console.log(`✅ User ${userId} successfully upgraded to ${tier} tier`);

  } catch (error) {
    console.error('❌ Error handling checkout complete:', error);
  }
}

async function handleInvoicePaid(invoice) {
  // Handle recurring payment
  console.log('Invoice paid:', invoice.id);

  try {
    const db = getFirestore();
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('stripeCustomerId', '==', invoice.customer).get();

    if (!snapshot.empty) {
      const batch = db.batch();
      snapshot.forEach(doc => {
        batch.update(doc.ref, {
          subscriptionStatus: 'active',
          updatedAt: new Date().toISOString()
        });
      });
      await batch.commit();
      console.log('Subscription status updated to active after payment');
    }
  } catch (error) {
    console.error('Error handling invoice paid:', error);
  }
}

async function handleSubscriptionUpdate(subscription) {
  // Handle subscription status changes
  try {
    const db = getFirestore();
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('subscriptionId', '==', subscription.id).get();

    if (snapshot.empty) {
      console.log('No user found for subscription:', subscription.id);
      return;
    }

    const batch = db.batch();
    snapshot.forEach(doc => {
      batch.update(doc.ref, {
        subscriptionStatus: subscription.status,
        updatedAt: new Date().toISOString()
      });
    });

    await batch.commit();
    console.log(`Subscription ${subscription.id} status updated to ${subscription.status}`);

  } catch (error) {
    console.error('Error handling subscription update:', error);
  }
}

async function handleSubscriptionCancelled(subscription) {
  // Get user by subscription ID
  try {
    const db = getFirestore();
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('subscriptionId', '==', subscription.id).get();

    if (snapshot.empty) {
      console.log('No user found for cancelled subscription:', subscription.id);
      return;
    }

    // Downgrade user to starter tier
    const batch = db.batch();
    snapshot.forEach(doc => {
      batch.update(doc.ref, {
        tier: 'starter',
        subscriptionId: null,
        updatedAt: new Date().toISOString()
      });
    });

    await batch.commit();
    console.log('User downgraded after subscription cancellation');

  } catch (error) {
    console.error('Error handling subscription cancellation:', error);
  }
}

/**
 * Get All Subscriptions (Admin/CRM)
 * GET /api/payment/subscriptions
 *
 * Returns all user subscriptions with payment details
 * Only shows CURRENT active subscription per user
 */
router.get('/subscriptions', authenticateToken, async (req, res) => {
  try {
    const db = getFirestore();
    const usersRef = db.collection('users');

    // Get all users with paid tiers AND active subscriptions
    const snapshot = await usersRef
      .where('tier', 'in', ['professional', 'agency', 'enterprise'])
      .get();

    const subscriptions = [];
    const userMap = new Map(); // Use map to ensure unique users

    snapshot.forEach(doc => {
      const userData = doc.data();
      const userId = doc.id;

      // Only include if user has an active subscription
      if (userData.subscriptionId && userData.subscriptionStatus !== 'canceled') {
        // If this user already exists, only keep the most recent
        const existing = userMap.get(userId);
        if (!existing || new Date(userData.updatedAt) > new Date(existing.updatedAt)) {
          userMap.set(userId, {
            userId: userId,
            email: userData.email,
            displayName: userData.displayName || 'N/A',
            tier: userData.tier,
            tierName: getTierName(userData.tier),
            subscriptionId: userData.subscriptionId,
            stripeCustomerId: userData.stripeCustomerId || 'N/A',
            subscriptionStatus: userData.subscriptionStatus || 'active',
            createdAt: userData.createdAt || 'N/A',
            updatedAt: userData.updatedAt || 'N/A',
            amount: getTierAmount(userData.tier)
          });
        }
      }
    });

    // Convert map to array
    const uniqueSubscriptions = Array.from(userMap.values());

    // Sort by most recent
    uniqueSubscriptions.sort((a, b) => {
      if (a.updatedAt === 'N/A') return 1;
      if (b.updatedAt === 'N/A') return -1;
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });

    // Calculate total revenue (monthly)
    const totalRevenue = uniqueSubscriptions.reduce((total, sub) => {
      const amount = parseFloat(sub.amount.replace(/[^0-9.]/g, '')) || 0;
      return total + amount;
    }, 0);

    console.log(`📊 Subscriptions query: ${uniqueSubscriptions.length} active subscriptions, $${totalRevenue.toFixed(2)}/month total revenue`);

    res.json({
      success: true,
      subscriptions: uniqueSubscriptions,
      total: uniqueSubscriptions.length,
      totalRevenue: totalRevenue.toFixed(2)
    });

  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch subscriptions'
    });
  }
});

/**
 * Debug: Get Current User Data
 * GET /api/payment/debug-user
 */
router.get('/debug-user', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const userData = userDoc.data();

    res.json({
      success: true,
      userId: userId,
      userData: {
        email: userData.email,
        displayName: userData.displayName,
        tier: userData.tier,
        subscriptionId: userData.subscriptionId,
        stripeCustomerId: userData.stripeCustomerId,
        subscriptionStatus: userData.subscriptionStatus,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt
      }
    });
  } catch (error) {
    console.error('Debug user error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get User Subscription Details
 * GET /api/payment/subscription/:userId
 */
router.get('/subscription/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const userData = userDoc.data();

    res.json({
      success: true,
      subscription: {
        userId: userDoc.id,
        email: userData.email,
        displayName: userData.displayName || 'N/A',
        tier: userData.tier,
        tierName: getTierName(userData.tier),
        subscriptionId: userData.subscriptionId || 'N/A',
        stripeCustomerId: userData.stripeCustomerId || 'N/A',
        subscriptionStatus: userData.subscriptionStatus || 'N/A',
        amount: getTierAmount(userData.tier),
        createdAt: userData.createdAt || 'N/A',
        updatedAt: userData.updatedAt || 'N/A'
      }
    });

  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch subscription'
    });
  }
});

// Helper functions
function getTierName(tier) {
  const tierNames = {
    starter: 'Starter (Free)',
    professional: 'Professional',
    agency: 'Agency',
    enterprise: 'Enterprise'
  };
  return tierNames[tier] || 'Unknown';
}

function getTierAmount(tier) {
  const tierAmounts = {
    starter: '$0/month',
    professional: '$39.99/month',
    agency: '$99.99/month',
    enterprise: '$499/month'
  };
  return tierAmounts[tier] || 'N/A';
}

module.exports = router;
