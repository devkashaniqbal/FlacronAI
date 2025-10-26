# FlacronCV - Quick Start Guide

## Project Successfully Cleaned Up & Ready for Stripe!

---

## What Was Done

### 1. Project Cleanup
- Removed all old HTML/JS/CSS files from `public/` folder
- Deleted old scripts and documentation files
- Removed duplicate backend folders from root
- Organized all backend code into `backend/` folder
- Updated `server.js` to reference correct paths

### 2. Stripe Integration
- Fully implemented Stripe payment processing
- Added webhook handlers for subscription events
- Created environment variable templates
- Frontend already configured and ready

---

## Quick Start (3 Steps)

### Step 1: Get Your Stripe Keys

1. Go to https://dashboard.stripe.com/
2. Sign up or log in
3. Go to **Developers > API Keys**
4. Copy your **Secret key** (starts with `sk_test_`)

### Step 2: Create Products in Stripe

1. In Stripe Dashboard, go to **Products**
2. Click **+ Add Product** and create these 3 products:

   **Professional Plan**
   - Name: FlacronAI Professional
   - Price: $39.99 USD
   - Billing: Recurring monthly
   - Save and copy the **Price ID** (starts with `price_`)

   **Agency Plan**
   - Name: FlacronAI Agency
   - Price: $99.99 USD
   - Billing: Recurring monthly
   - Save and copy the **Price ID**

   **Enterprise Plan**
   - Name: FlacronAI Enterprise
   - Price: $499 USD
   - Billing: Recurring monthly
   - Save and copy the **Price ID**

### Step 3: Update Your .env File

Open `backend/.env` and replace these values:

```env
# Replace these with your actual Stripe keys
STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET

# Replace with your actual Price IDs from Step 2
STRIPE_PRICE_PROFESSIONAL=price_YOUR_PROFESSIONAL_ID
STRIPE_PRICE_AGENCY=price_YOUR_AGENCY_ID
STRIPE_PRICE_ENTERPRISE=price_YOUR_ENTERPRISE_ID
```

---

## Running the Application

### Start Backend Server

```bash
npm start
```

### Start Frontend (in a new terminal)

```bash
cd frontend
npm run dev
```

### Access the App

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api

---

## Testing Stripe Payments

### Use Stripe Test Cards

When testing checkout, use these test card numbers:

- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Requires Auth**: 4000 0025 0000 3155

**Any future expiry date and any 3-digit CVC will work.**

### Test the Flow

1. Sign up for an account (Starter tier by default)
2. Go to Checkout page
3. Click "Upgrade to Professional" (or any paid tier)
4. You'll be redirected to Stripe checkout
5. Enter test card details
6. Complete payment
7. You'll be redirected back to your app
8. Check your dashboard - your tier should be upgraded!

---

## Setting Up Webhooks (For Production)

### For Local Development

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Forward webhooks: `stripe listen --forward-to localhost:3000/api/payment/webhook`
4. Copy the webhook signing secret and add to `.env`

### For Production

1. In Stripe Dashboard, go to **Developers > Webhooks**
2. Click **+ Add endpoint**
3. Enter your URL: `https://yourdomain.com/api/payment/webhook`
4. Select these events:
   - checkout.session.completed
   - invoice.paid
   - customer.subscription.updated
   - customer.subscription.deleted
5. Copy the **Signing secret** and add to production `.env`

---

## Project Structure

```
FlacronCV/
├── backend/               # All backend code
│   ├── routes/
│   │   └── payment.js    # ✅ Stripe integration
│   ├── config/
│   ├── middleware/
│   ├── services/
│   ├── .env              # ⚠️ Add your Stripe keys here
│   └── .env.example      # Template
├── frontend/              # React app
│   └── src/
│       └── pages/
│           └── Checkout.jsx  # ✅ Ready for Stripe
├── public/
│   └── uploads/          # User files only
├── server.js             # Backend entry point
└── package.json
```

---

## Important Files

### Backend Configuration
- `backend/.env` - **Update this with your Stripe keys**
- `backend/routes/payment.js` - Stripe integration (ready to use)
- `server.js` - Main server file

### Frontend
- `frontend/src/pages/Checkout.jsx` - Checkout page (ready)
- `frontend/.env` - Frontend configuration

---

## Troubleshooting

### "Stripe is not defined"
→ Add `STRIPE_SECRET_KEY` to `backend/.env`

### "Invalid price ID"
→ Verify price IDs in `.env` match those in Stripe Dashboard

### "Webhook signature verification failed"
→ Use Stripe CLI for local testing or set up webhook endpoint for production

### Payment works but user tier not upgraded
→ Check backend console for webhook errors
→ Ensure webhook is properly configured

---

## Common Commands

```bash
# Start backend
npm start

# Start frontend
cd frontend && npm run dev

# Install dependencies (if needed)
npm install
cd frontend && npm install

# Test Stripe webhooks locally
stripe listen --forward-to localhost:3000/api/payment/webhook

# Check Stripe logs
# Go to: https://dashboard.stripe.com/logs
```

---

## Support Resources

- **Stripe Docs**: https://stripe.com/docs
- **Stripe Testing**: https://stripe.com/docs/testing
- **Firebase Docs**: https://firebase.google.com/docs
- **Full Documentation**: See `PROJECT_CLEANUP_AND_STRIPE_SETUP.md`

---

## Next Steps After Setup

1. ✅ Add your Stripe keys to `.env`
2. ✅ Test checkout flow with test cards
3. ✅ Set up webhook for production
4. 📧 Add email notifications (optional)
5. 🚀 Deploy to production

---

## Status: READY FOR PRODUCTION

Once you complete the 3 steps above, your payment system is fully functional!

**Need Help?** Check the full documentation in `PROJECT_CLEANUP_AND_STRIPE_SETUP.md`
