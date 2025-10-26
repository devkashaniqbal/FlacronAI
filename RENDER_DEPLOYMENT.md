# FlacronAI Deployment Guide for Render

## Understanding Report Storage

### Current Setup
Your application saves exported reports (PDF, DOCX) in two ways:

1. **Development (Local)**: Files are saved to `backend/uploads/` folder on your computer
2. **Production (Cloud)**: Files are automatically saved to **Firebase Storage** (cloud)

### Why This Matters for Deployment

**❌ Problem with Render (and most cloud platforms):**
- Cloud servers have **ephemeral filesystems**
- Files saved to disk are **deleted when the server restarts**
- Each deployment **wipes out** all saved files
- Storage is **limited and temporary**

**✅ Solution (Already Implemented):**
- Your app **automatically switches to Firebase Storage** in production
- Files are stored in Google's cloud (persistent and scalable)
- Users download reports from Firebase, not from your server
- No files are saved to the Render server disk

### How It Works

```
User clicks "Export PDF"
    ↓
Backend generates PDF in memory
    ↓
Backend uploads to Firebase Storage (CLOUD)
    ↓
Backend returns download URL to frontend
    ↓
Frontend triggers browser download from Firebase URL
    ↓
User gets the file downloaded to their computer
```

**Result**: Reports are downloaded to the user's computer AND stored safely in Firebase cloud storage.

---

## Firebase Storage Setup (Required for Production)

### Step 1: Enable Firebase Storage

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **flacronai-c8dab**
3. Click **Storage** in the left sidebar
4. Click **Get Started**
5. Choose **Start in production mode**
6. Select a location (choose closest to your users)
7. Click **Done**

### Step 2: Configure Storage Rules

1. In Firebase Console > Storage > Rules
2. Replace the rules with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow public read access to all files
    match /{allPaths=**} {
      allow read: if true;

      // Only authenticated users can write
      allow write: if request.auth != null;
    }
  }
}
```

3. Click **Publish**

### Step 3: No Additional Configuration Needed!

Your Firebase Admin SDK credentials (already in `.env`) automatically give you full access to Firebase Storage. No extra setup required!

---

## Render Deployment Guide

### Prerequisites

- [ ] Render account: https://render.com (free tier available)
- [ ] GitHub account with your code pushed
- [ ] Firebase Storage enabled (see above)
- [ ] Stripe account in Live mode

---

### Part 1: Deploy Backend to Render

#### 1. Create New Web Service

1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `flacronai-backend`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free` (or paid for better performance)

#### 2. Add Environment Variables

Click **Advanced** → **Add Environment Variable** and add each of these:

```bash
NODE_ENV=production
PORT=3000

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Admin SDK
FIREBASE_PROJECT_ID=flacronai-c8dab
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
your_complete_private_key_here
-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@flacronai-c8dab.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id

# Frontend URL (update after deploying frontend)
FRONTEND_URL=https://flacronai.com

# Domain
DOMAIN=flacronai.com

# Stripe Live Keys (get from Stripe Dashboard)
STRIPE_SECRET_KEY=sk_live_your_production_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret

# Stripe Price IDs (create in Stripe Dashboard)
STRIPE_PRICE_PROFESSIONAL=price_your_professional_id
STRIPE_PRICE_AGENCY=price_your_agency_id
STRIPE_PRICE_ENTERPRISE=price_your_enterprise_id
```

**Important Notes:**
- For `FIREBASE_PRIVATE_KEY`: Copy the ENTIRE key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- Use double quotes around the private key
- Keep the `\n` characters in the key

#### 3. Deploy

1. Click **Create Web Service**
2. Wait for deployment to complete (3-5 minutes)
3. Copy your backend URL: `https://flacronai-backend.onrender.com`

---

### Part 2: Deploy Frontend to Render

#### 1. Update Frontend Environment

Before deploying, update `frontend/.env.production`:

```bash
# Replace with your Render backend URL
VITE_API_URL=https://flacronai-backend.onrender.com/api

# Firebase config (keep same as development)
VITE_FIREBASE_API_KEY=AIzaSyAEtWQZaTf8czc8tLdMatYSnAUhIOyCOis
VITE_FIREBASE_AUTH_DOMAIN=flacronai-c8dab.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=flacronai-c8dab
VITE_FIREBASE_STORAGE_BUCKET=flacronai-c8dab.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=773892679617
VITE_FIREBASE_APP_ID=1:773892679617:web:daa3f6b5e3774501957140
VITE_FIREBASE_MEASUREMENT_ID=G-NB7SZYH1KS
```

#### 2. Create Static Site

1. In Render Dashboard, click **New +** → **Static Site**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `flacronai`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

#### 3. Add Environment Variables

Add all variables from `frontend/.env.production`:

```bash
VITE_API_URL=https://flacronai-backend.onrender.com/api
VITE_FIREBASE_API_KEY=AIzaSyAEtWQZaTf8czc8tLdMatYSnAUhIOyCOis
# ... (add all other VITE_ variables)
```

#### 4. Deploy

1. Click **Create Static Site**
2. Wait for deployment (2-3 minutes)
3. Your frontend URL: `https://flacronai.onrender.com`

#### 5. Update Backend CORS

Go back to backend environment variables and update:
```bash
FRONTEND_URL=https://flacronai.onrender.com
```

Then **Manual Deploy** → **Deploy latest commit** to apply changes.

---

### Part 3: Custom Domain (Optional)

#### 1. Add Custom Domain in Render

1. Go to your frontend static site
2. Click **Settings** → **Custom Domains**
3. Click **Add Custom Domain**
4. Enter: `flacronai.com`
5. Render will provide DNS records

#### 2. Configure DNS

In your domain registrar (Namecheap, GoDaddy, etc.):

```
Type    Name    Value
A       @       Render's IP address
CNAME   www     flacronai.onrender.com
```

#### 3. Update Environment Variables

Update both frontend and backend:
```bash
# Frontend: Update VITE_API_URL if using custom domain for backend
# Backend: Update FRONTEND_URL
FRONTEND_URL=https://flacronai.com
```

---

## Stripe Setup for Production

### Do You Need Stripe CLI on Render?

**❌ NO!** The Stripe CLI is ONLY for local development testing.

In production, Stripe communicates directly with your Render server via webhooks.

### Step 1: Switch to Live Mode

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Toggle to **Live Mode** (top right)

### Step 2: Create Products and Prices

1. Go to **Products** → **Add product**
2. Create three products:

**Professional Plan:**
- Name: Professional
- Price: $49/month (recurring)
- Copy the **Price ID** (starts with `price_`)

**Agency Plan:**
- Name: Agency
- Price: $149/month (recurring)
- Copy the **Price ID**

**Enterprise Plan:**
- Name: Enterprise
- Custom pricing or highest tier
- Copy the **Price ID**

### Step 3: Get API Keys

1. Go to **Developers** → **API keys**
2. Copy **Secret key** (starts with `sk_live_...`)
3. Add to Render backend environment variables

### Step 4: Set Up Webhook

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: `https://flacronai-backend.onrender.com/api/webhook/stripe`
4. Events to send:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. Copy **Signing secret** (starts with `whsec_...`)
7. Add to Render backend environment variables as `STRIPE_WEBHOOK_SECRET`

---

## Testing After Deployment

### 1. Test Authentication
- Visit your frontend URL
- Create a new account
- Verify email works
- Log in successfully

### 2. Test Report Generation
- Click **Generate Report**
- Fill in the form
- Generate a report
- Verify report displays correctly

### 3. Test Export Functionality
- Click **Export as PDF**
- Verify file downloads to your computer
- Check Firebase Storage console - file should be there!
- Try DOCX export
- Try HTML export

### 4. Test My Reports
- Navigate to **My Reports**
- Verify all reports are listed
- Test View, Export, Delete buttons

### 5. Test Payment Flow
- Click **Upgrade Plan** or **Pricing Modal**
- Click **Select Professional**
- Complete payment with test card: `4242 4242 4242 4242`
- Verify subscription is created
- Check Stripe Dashboard for payment

### 6. Test Webhook
- Make a test payment
- Check Render logs: `Dashboard → Logs`
- Look for webhook event logs
- Verify user tier was upgraded

---

## Monitoring and Logs

### View Logs in Render

1. Go to your service (backend or frontend)
2. Click **Logs** tab
3. Use filters to find errors

### Common Log Messages

**✅ Good signs:**
```
📦 Using Firebase Storage (Cloud)
✅ Document uploaded to Firebase Storage
✅ Firebase initialized successfully
✅ Gemini AI initialized successfully
🚀 Starting FlacronAI Server...
```

**❌ Issues to watch:**
```
Error: Failed to upload to Firebase Storage
Error: Invalid Firebase credentials
Error: Stripe webhook signature verification failed
```

---

## Cost Breakdown

### Render (Backend + Frontend)
- **Free Tier**: $0/month
  - Backend: 750 hours/month
  - Frontend: Free static hosting
  - Downside: Spins down after 15 min inactivity (slow first request)

- **Starter**: $7/month
  - Backend always running
  - No spin-down delays

### Firebase Storage
- **Free Tier**: 5GB storage, 1GB/day download
- **Paid**: $0.026/GB storage, $0.12/GB download
- Typical cost: $1-5/month for small apps

### Stripe
- **Free** to use
- 2.9% + $0.30 per transaction

**Total estimated cost for starting out**: $0-12/month

---

## Troubleshooting

### Issue: Reports not downloading

**Solution:**
1. Check Render logs for Firebase errors
2. Verify Firebase Storage is enabled
3. Verify Firebase credentials in environment variables
4. Check storage rules allow public read

### Issue: CORS errors

**Solution:**
1. Verify `FRONTEND_URL` in backend matches your actual frontend URL
2. Check `VITE_API_URL` in frontend points to backend
3. Redeploy backend after changing `FRONTEND_URL`

### Issue: Stripe webhooks not working

**Solution:**
1. Verify webhook URL is correct in Stripe Dashboard
2. Check webhook secret matches environment variable
3. Check Render logs for webhook events
4. Test webhook manually in Stripe Dashboard

### Issue: "File not found" errors

**Solution:**
1. You're likely in development mode - switch to production
2. Check `NODE_ENV=production` in Render
3. Verify Firebase Storage service is active

---

## Rollback Plan

If something goes wrong:

1. **Render**: Go to **Manual Deploy** → Choose previous deployment
2. **Database**: Firebase Firestore auto-backups (restore via Firebase Console)
3. **Code**: Revert git commit and push

---

## Final Checklist

- [ ] Firebase Storage enabled and configured
- [ ] Backend deployed to Render with all environment variables
- [ ] Frontend deployed to Render with correct API URL
- [ ] Stripe switched to Live Mode
- [ ] Stripe products and prices created
- [ ] Stripe webhook configured
- [ ] Custom domain configured (optional)
- [ ] All features tested (auth, reports, exports, payments)
- [ ] Monitoring set up (check logs regularly)

---

## Support Resources

- **Render Docs**: https://render.com/docs
- **Firebase Storage Docs**: https://firebase.google.com/docs/storage
- **Stripe Webhooks**: https://stripe.com/docs/webhooks
- **Render Community**: https://community.render.com

---

**🎉 Congratulations! Your app is now live!**

Remember:
- Reports are stored safely in Firebase Cloud Storage
- No files are saved to Render's disk
- Users download reports directly from Firebase
- Everything persists through deployments and restarts
