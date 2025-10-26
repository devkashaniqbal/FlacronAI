# 🎯 How to Get Stripe Price IDs

## You Already Have Price IDs!

When you created products in Stripe, **Price IDs were automatically created**. You just need to find them.

---

## Step-by-Step Guide

### 1. Go to Stripe Products
Open: https://dashboard.stripe.com/test/products

You'll see your 3 products:
- FlacronAI Professional
- FlacronAI Agency
- FlacronAI Enterprise

### 2. Click on FIRST Product (Professional)

You'll see a page like this:

```
┌─────────────────────────────────────────────┐
│ FlacronAI Professional                      │
│                                             │
│ Product ID: prod_TIPM7tUATtOCRI            │
│                                             │
│ Pricing ↓                                   │
│   ┌──────────────────────────────────────┐ │
│   │ $39.99 USD / month                   │ │
│   │ Recurring                            │ │
│   │                                      │ │
│   │ Price ID: price_xxxxxxxxxxxxx  ← COPY THIS! │
│   │                                      │ │
│   └──────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

**COPY** the **Price ID** (it starts with `price_`)

### 3. Repeat for Other Products

Do the same for:
- Agency product → Get its Price ID
- Enterprise product → Get its Price ID

### 4. Update Your .env File

Open: `C:\Users\pc\Desktop\FlacronCV\backend\.env`

Replace these lines:

```env
# Replace this:
STRIPE_PRICE_PROFESSIONAL=price_your_professional_price_id

# With your actual Price ID (example):
STRIPE_PRICE_PROFESSIONAL=price_1ABC123xyz456def789

# Do the same for Agency and Enterprise
STRIPE_PRICE_AGENCY=price_YOUR_ACTUAL_AGENCY_PRICE_ID
STRIPE_PRICE_ENTERPRISE=price_YOUR_ACTUAL_ENTERPRISE_PRICE_ID
```

### 5. Also Add Secret Key

While you're in `.env`, also add your Stripe Secret Key:

```env
STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_SECRET_KEY
```

Get it from: https://dashboard.stripe.com/test/apikeys

---

## Quick Checklist ✅

- [ ] Go to https://dashboard.stripe.com/test/products
- [ ] Click on Professional product
- [ ] Scroll down to "Pricing" section
- [ ] Copy the Price ID (starts with `price_`)
- [ ] Repeat for Agency
- [ ] Repeat for Enterprise
- [ ] Paste all 3 Price IDs into `backend/.env`
- [ ] Also add your Secret Key to `backend/.env`
- [ ] Restart backend: `npm start`
- [ ] Test checkout at http://localhost:5173/checkout

---

## Example .env File

Your `backend/.env` should look like this after updating:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_51ABC123XYZ...your_actual_key
STRIPE_WEBHOOK_SECRET=whsec_leave_this_for_now

# Stripe Price IDs
STRIPE_PRICE_PROFESSIONAL=price_1ABC123XYZ...
STRIPE_PRICE_AGENCY=price_1DEF456ABC...
STRIPE_PRICE_ENTERPRISE=price_1GHI789DEF...
```

---

## ✨ That's It!

Once you update these values and restart your backend, payment processing will work!

**Test with card:** 4242 4242 4242 4242 (any future date, any CVC)
