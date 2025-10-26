# 🚀 FlacronAI - Complete Deployment Guide

This guide provides step-by-step instructions for deploying FlacronAI to production.

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
4. [Backend Deployment (Railway/Render)](#backend-deployment-railway-or-render)
5. [Database & Firebase Configuration](#database--firebase-configuration)
6. [Stripe Payment Integration](#stripe-payment-integration)
7. [Domain Configuration](#domain-configuration)
8. [Post-Deployment Testing](#post-deployment-testing)
9. [Monitoring & Maintenance](#monitoring--maintenance)
10. [Troubleshooting](#troubleshooting)

---

## ✅ Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] **Firebase Project** created with Firestore database enabled
- [ ] **Stripe Account** with test and production API keys
- [ ] **Google Gemini API Key** (from Google AI Studio)
- [ ] **Domain name** (optional, but recommended)
- [ ] **GitHub repository** for version control
- [ ] All environment variables documented
- [ ] Tested application locally

---

## 🔧 Environment Setup

### Required Accounts

1. **Firebase** - https://console.firebase.google.com
   - Create a new project
   - Enable Firestore Database
   - Enable Authentication (Email/Password)
   - Generate service account credentials

2. **Stripe** - https://dashboard.stripe.com
   - Get API keys (test and production)
   - Create products and pricing
   - Set up webhook endpoint

3. **Google AI Studio** - https://makersuite.google.com/app/apikey
   - Generate Gemini API key

4. **Vercel** - https://vercel.com (Frontend hosting)
   - Connect GitHub repository

5. **Railway/Render** - https://railway.app or https://render.com (Backend hosting)
   - Connect GitHub repository

---

## 🎨 Frontend Deployment (Vercel)

### Step 1: Prepare Frontend

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Build the project locally to test:
```bash
npm install
npm run build
```

3. Create `.env.production` file:
```env
VITE_API_URL=https://your-backend-domain.com/api
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Step 2: Deploy to Vercel

#### Option A: Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
cd frontend
vercel --prod
```

#### Option B: Via Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Set **Root Directory** to `frontend`
4. Set **Framework Preset** to `Vite`
5. Add Environment Variables (from `.env.production`)
6. Click **Deploy**

### Step 3: Configure Build Settings

In Vercel dashboard:
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Framework**: Vite

---

## ⚙️ Backend Deployment (Railway or Render)

### Step 1: Prepare Backend

1. Navigate to backend directory:
```bash
cd backend
```

2. Ensure `package.json` has correct start script:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

### Step 2: Deploy to Railway

#### Via Railway Dashboard:

1. Go to https://railway.app/new
2. Select "Deploy from GitHub repo"
3. Choose your repository
4. Set **Root Directory** to `backend`
5. Add Environment Variables (see below)
6. Click **Deploy**

#### Environment Variables for Railway:

```env
# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key

# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id

# Server Configuration
PORT=3000
NODE_ENV=production

# Frontend URL (for CORS)
FRONTEND_URL=https://your-vercel-app.vercel.app

# Domain
DOMAIN=flacronai.com

# Stripe Configuration (PRODUCTION KEYS)
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Stripe Price IDs (Production)
STRIPE_PRICE_PROFESSIONAL=price_xxxxxxxxxxxxx
STRIPE_PRICE_AGENCY=price_xxxxxxxxxxxxx
STRIPE_PRICE_ENTERPRISE=price_xxxxxxxxxxxxx
```

### Step 3: Alternative - Deploy to Render

1. Go to https://render.com/new/web-service
2. Connect your GitHub repository
3. Configure:
   - **Name**: flacronai-backend
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add all environment variables
5. Click **Create Web Service**

---

## 🔥 Database & Firebase Configuration

### Step 1: Firebase Console Setup

1. Go to https://console.firebase.google.com
2. Select your project
3. Navigate to **Firestore Database**
4. Click **Create Database**
5. Choose **Production mode**
6. Select your region

### Step 2: Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Reports collection
    match /reports/{reportId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }

    // Clients collection (CRM)
    match /clients/{clientId} {
      allow read, write: if request.auth != null && resource.data.createdBy == request.auth.uid;
    }

    // Claims collection (CRM)
    match /claims/{claimId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }

    // Appointments collection
    match /appointments/{appointmentId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

### Step 3: Firebase Authentication Setup

1. Go to **Authentication** → **Sign-in method**
2. Enable **Email/Password**
3. (Optional) Enable **Google** sign-in
4. Save changes

### Step 4: Firebase Service Account

1. Go to **Project Settings** → **Service Accounts**
2. Click **Generate New Private Key**
3. Download the JSON file
4. Extract the values and add to backend `.env`:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `private_key_id` → `FIREBASE_PRIVATE_KEY_ID`
   - `private_key` → `FIREBASE_PRIVATE_KEY`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `client_id` → `FIREBASE_CLIENT_ID`

### Step 5: Frontend Firebase Config

1. Go to **Project Settings** → **General**
2. Scroll to **Your apps** → **Web app**
3. Copy Firebase config
4. Add to frontend `.env.production`:
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

---

## 💳 Stripe Payment Integration

### Step 1: Create Products in Stripe

1. Go to https://dashboard.stripe.com/products
2. Create three products:

**Product 1: Professional**
- Name: FlacronAI Professional
- Price: $39.99/month
- Recurring: Monthly
- Copy the **Price ID** (starts with `price_`)

**Product 2: Agency**
- Name: FlacronAI Agency
- Price: $99.99/month
- Recurring: Monthly
- Copy the **Price ID**

**Product 3: Enterprise**
- Name: FlacronAI Enterprise
- Price: $499/month
- Recurring: Monthly
- Copy the **Price ID**

### Step 2: Get Stripe API Keys

1. Go to https://dashboard.stripe.com/apikeys
2. Copy **Publishable key** (starts with `pk_live_`) → Frontend env
3. Copy **Secret key** (starts with `sk_live_`) → Backend env

### Step 3: Configure Webhook

1. Go to https://dashboard.stripe.com/webhooks
2. Click **Add endpoint**
3. Endpoint URL: `https://your-backend-domain.com/api/payment/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
5. Copy **Signing secret** (starts with `whsec_`) → `STRIPE_WEBHOOK_SECRET`

### Step 4: Update Environment Variables

Backend `.env`:
```env
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
STRIPE_PRICE_PROFESSIONAL=price_xxxxxxxxxxxxx
STRIPE_PRICE_AGENCY=price_xxxxxxxxxxxxx
STRIPE_PRICE_ENTERPRISE=price_xxxxxxxxxxxxx
```

---

## 🌐 Domain Configuration

### Step 1: Configure Custom Domain in Vercel

1. Go to Vercel Dashboard → Your project → **Settings** → **Domains**
2. Add your domain: `flacronai.com`
3. Add www subdomain: `www.flacronai.com`
4. Vercel will provide DNS records

### Step 2: Configure DNS

In your domain registrar (e.g., Namecheap, GoDaddy):

**For flacronai.com:**
- Type: A
- Name: @
- Value: 76.76.21.21 (Vercel IP)

**For www.flacronai.com:**
- Type: CNAME
- Name: www
- Value: cname.vercel-dns.com

**For backend (api.flacronai.com):**
- Type: CNAME
- Name: api
- Value: your-railway-app.up.railway.app

### Step 3: Configure Backend Custom Domain

#### For Railway:
1. Go to Railway Dashboard → Your service → **Settings**
2. Click **Generate Domain** or **Custom Domain**
3. Enter: `api.flacronai.com`
4. Follow DNS configuration instructions

#### For Render:
1. Go to Render Dashboard → Your service → **Settings**
2. Scroll to **Custom Domains**
3. Add `api.flacronai.com`
4. Configure CNAME record

### Step 4: Update Frontend Environment

Update `VITE_API_URL` in Vercel:
```env
VITE_API_URL=https://api.flacronai.com/api
```

Update `FRONTEND_URL` in Railway/Render:
```env
FRONTEND_URL=https://flacronai.com
```

---

## 🧪 Post-Deployment Testing

### Test Checklist

1. **Homepage**
   - [ ] Logo displays correctly
   - [ ] All sections load properly
   - [ ] Buttons navigate correctly
   - [ ] Responsive design works

2. **Authentication**
   - [ ] Sign up with email/password
   - [ ] Sign in with existing account
   - [ ] Password reset functionality
   - [ ] Logout works

3. **Dashboard**
   - [ ] Usage stats display correctly
   - [ ] Report generation works
   - [ ] Form validation works
   - [ ] Template selector functions

4. **Reports**
   - [ ] Generate AI report successfully
   - [ ] Export to PDF works
   - [ ] Export to DOCX works
   - [ ] Report content is formatted

5. **Payments**
   - [ ] Checkout page loads
   - [ ] Stripe checkout session creates
   - [ ] Payment completes successfully
   - [ ] Tier updates after payment
   - [ ] Webhook receives events

6. **CRM (if applicable)**
   - [ ] Client management works
   - [ ] Claims creation works
   - [ ] Dashboard analytics display

### Testing Commands

```bash
# Test backend health
curl https://api.flacronai.com/health

# Test API endpoint
curl https://api.flacronai.com/api

# Test frontend
curl https://flacronai.com
```

---

## 📊 Monitoring & Maintenance

### Set Up Monitoring

1. **Vercel Analytics** (Frontend)
   - Enable in Vercel Dashboard → Analytics
   - Monitor page views, performance

2. **Railway/Render Logs** (Backend)
   - Check deployment logs regularly
   - Monitor error rates
   - Set up log alerts

3. **Stripe Dashboard**
   - Monitor payments
   - Check webhook delivery status
   - Review failed payments

4. **Firebase Console**
   - Monitor Firestore usage
   - Check authentication logs
   - Review security rules

### Regular Maintenance Tasks

**Weekly:**
- [ ] Review error logs
- [ ] Check payment webhook status
- [ ] Monitor API response times

**Monthly:**
- [ ] Review Firestore usage and costs
- [ ] Update dependencies (`npm update`)
- [ ] Check SSL certificate status
- [ ] Review user feedback

**Quarterly:**
- [ ] Security audit
- [ ] Performance optimization
- [ ] Backup Firestore data
- [ ] Update documentation

---

## 🔧 Troubleshooting

### Common Issues

#### 1. CORS Errors

**Symptom:** Frontend can't connect to backend

**Solution:**
- Verify `FRONTEND_URL` in backend `.env` matches your Vercel domain
- Check Railway/Render CORS configuration
- Ensure protocol (https://) is correct

```javascript
// In backend/server.js, verify:
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

#### 2. Firebase Authentication Fails

**Symptom:** "Auth token expired" or authentication errors

**Solution:**
- Verify Firebase config in frontend `.env`
- Check Firebase Authentication is enabled
- Ensure domain is authorized in Firebase Console:
  - Go to Authentication → Settings → Authorized domains
  - Add your production domain

#### 3. Stripe Webhook Not Receiving Events

**Symptom:** Payments complete but tier doesn't update

**Solution:**
- Check webhook endpoint URL is correct
- Verify `STRIPE_WEBHOOK_SECRET` is set correctly
- Test webhook in Stripe Dashboard:
  - Go to Webhooks → Your endpoint → Send test event
- Check backend logs for webhook errors

#### 4. Firebase "Insufficient Permissions" Error

**Symptom:** Firestore queries fail with permission errors

**Solution:**
- Update Firestore Security Rules (see Firebase Configuration section)
- Ensure user is authenticated before querying
- Check userId matches in security rules

#### 5. Build Fails on Deployment

**Symptom:** Vercel/Railway build errors

**Solution:**
```bash
# Clear cache and rebuild locally first
rm -rf node_modules package-lock.json
npm install
npm run build

# If successful, commit and push
git add .
git commit -m "Fix build issues"
git push
```

#### 6. Environment Variables Not Loading

**Symptom:** App works locally but not in production

**Solution:**
- Verify all env vars are set in hosting dashboard
- Check for typos in variable names
- Restart the service after adding variables
- For Railway: Redeploy after env changes

---

## 📝 Environment Variables Checklist

### Frontend (.env.production)
```
✓ VITE_API_URL
✓ VITE_FIREBASE_API_KEY
✓ VITE_FIREBASE_AUTH_DOMAIN
✓ VITE_FIREBASE_PROJECT_ID
✓ VITE_FIREBASE_STORAGE_BUCKET
✓ VITE_FIREBASE_MESSAGING_SENDER_ID
✓ VITE_FIREBASE_APP_ID
```

### Backend (.env)
```
✓ GEMINI_API_KEY
✓ FIREBASE_PROJECT_ID
✓ FIREBASE_PRIVATE_KEY_ID
✓ FIREBASE_PRIVATE_KEY
✓ FIREBASE_CLIENT_EMAIL
✓ FIREBASE_CLIENT_ID
✓ PORT
✓ NODE_ENV
✓ FRONTEND_URL
✓ DOMAIN
✓ STRIPE_SECRET_KEY
✓ STRIPE_WEBHOOK_SECRET
✓ STRIPE_PRICE_PROFESSIONAL
✓ STRIPE_PRICE_AGENCY
✓ STRIPE_PRICE_ENTERPRISE
```

---

## 🎯 Quick Deployment Commands

### First Time Deployment

```bash
# 1. Clone repository
git clone https://github.com/yourusername/flacronai.git
cd flacronai

# 2. Install dependencies
cd frontend && npm install
cd ../backend && npm install

# 3. Set up environment variables
# Create .env files in both frontend and backend

# 4. Test locally
cd frontend && npm run dev
cd backend && npm start

# 5. Deploy frontend to Vercel
cd frontend
vercel --prod

# 6. Deploy backend to Railway
# Use Railway dashboard or CLI

# 7. Configure DNS and custom domains

# 8. Test production deployment
```

### Updating Deployment

```bash
# Make your changes
git add .
git commit -m "Your update message"
git push origin main

# Vercel and Railway will auto-deploy from main branch
```

---

## 📞 Support

For issues or questions:
- Email: support@flacronenterprises.com
- GitHub Issues: https://github.com/yourusername/flacronai/issues
- Documentation: https://docs.flacronai.com

---

## 🔒 Security Best Practices

1. **Never commit** `.env` files to Git
2. Use **environment variables** for all secrets
3. Enable **Firestore Security Rules**
4. Use **HTTPS** for all production domains
5. Regularly **update dependencies**
6. Set up **SSL certificates** (automatic with Vercel/Railway)
7. Enable **rate limiting** for API endpoints
8. Monitor **failed login attempts**
9. Regularly **backup Firestore** data
10. Review **Stripe webhook signatures**

---

## ✅ Deployment Complete!

Once everything is deployed and tested:

1. Monitor for 24-48 hours
2. Check error logs daily for the first week
3. Gather user feedback
4. Plan regular maintenance schedule

**Congratulations! FlacronAI is now live! 🚀**

---

*Last Updated: December 2024*
*Version: 1.0.0*
