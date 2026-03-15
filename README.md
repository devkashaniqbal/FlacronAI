# FlacronAI — AI-Powered Insurance Inspection Reports

> Generate professional CRU GROUP-standard insurance inspection reports in minutes using IBM WatsonX AI and GPT-4 Vision.

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## Overview

FlacronAI is a full-stack SaaS platform that automates insurance claim documentation. Adjusters upload damage photos, select claim metadata, and receive a fully formatted, carrier-compliant inspection report in under a minute. Built on IBM WatsonX AI (primary) with OpenAI GPT-4 Vision as fallback.

- **Website:** [flacronai.com](https://flacronai.com)
- **Parent Company:** [Flacron Enterprises LLC](https://flacronenterprises.com/)
- **Support:** support@flacronenterprises.com
- **Address:** 410 E 95th St, Brooklyn, NY 11212

---

## Architecture

```
FlacronAI-final/
├── backend/          # Node.js + Express REST API (port 3000)
└── frontend/         # React 18 + Vite web app (port 5173)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend Runtime | Node.js 18+ |
| Backend Framework | Express.js |
| Database | Firebase Firestore |
| Authentication | Firebase Admin SDK + JWT |
| AI (Primary) | IBM WatsonX AI — `ibm/granite-3-8b-instruct` |
| AI (Fallback) | OpenAI GPT-4 Turbo + GPT-4 Vision |
| Payments | Stripe (subscriptions + webhooks) |
| Email | Brevo REST API (transactional templates) |
| File Uploads | Multer (in-memory) |
| PDF Generation | PDFKit + pdf-lib (watermarking) |
| DOCX Generation | docx |
| Frontend | React 18, Vite, Tailwind CSS v3 |
| Animations | Framer Motion |
| 3D Graphics | Three.js / @react-three/fiber |
| Icons | Lucide React |
| Notifications | react-hot-toast |

---

## Features

- **AI Report Generation** — Upload 1–100 photos; get a structured damage report in 15–60 seconds
- **Claim Types** — Water Damage, Fire, Wind, Hail, Mold, Vandalism, Other
- **Report Types** — Initial, Supplemental, Final, Re-Inspection
- **Export Formats** — PDF, DOCX (Word), HTML
- **Watermark Control** — Starter plan watermarks; Professional+ removes them
- **White-Label Portal** — Enterprise: custom subdomain, branding, logo
- **Team Management** — Agency+: invite members, assign roles, per-member usage
- **CRM Integration** — Agency+: contact management, lead tracking
- **API Access** — Agency+: full REST API with rate limiting
- **Stripe Billing** — Monthly & annual plans with webhook-idempotent processing
- **Transactional Email** — Welcome, password reset, payment failure, team invite, sales lead

---

## Subscription Plans

| Plan | Reports/Month | Price | Key Features |
|---|---|---|---|
| Starter | 5 | Free | PDF only, watermark |
| Professional | 50 | $39.99/mo | No watermark, PDF+DOCX+HTML |
| Agency | 200 | $99.99/mo | API access, CRM, team management |
| Enterprise | Unlimited | $499/mo | White-label, custom domain, dedicated support |

Annual billing saves 20%.

---

## Getting Started

### Prerequisites

- Node.js 18+
- Firebase project (Firestore + Auth enabled)
- IBM WatsonX account with API key + project ID
- OpenAI API key (fallback)
- Stripe account (test or live keys)
- Brevo account with API key

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env   # fill in your credentials (see below)
node server.js
```

Backend runs at `http://localhost:3000`.

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env   # fill in your credentials (see below)
npm run dev
```

Frontend runs at `http://localhost:5173`.

---

## Environment Variables

### Backend (`backend/.env`)

```env
PORT=3000
NODE_ENV=development

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# JWT
JWT_SECRET=your-long-random-jwt-secret

# IBM WatsonX AI
WATSONX_API_KEY=your-watsonx-iam-api-key
WATSONX_PROJECT_ID=your-watsonx-project-id
WATSONX_URL=https://us-south.ml.cloud.ibm.com

# OpenAI (fallback)
OPENAI_API_KEY=sk-...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID=price_...
STRIPE_PROFESSIONAL_ANNUAL_PRICE_ID=price_...
STRIPE_AGENCY_MONTHLY_PRICE_ID=price_...
STRIPE_AGENCY_ANNUAL_PRICE_ID=price_...
STRIPE_ENTERPRISE_MONTHLY_PRICE_ID=price_...
STRIPE_ENTERPRISE_ANNUAL_PRICE_ID=price_...

# Brevo (transactional email)
BREVO_API_KEY=xkeysib-...
BREVO_FROM_EMAIL=marketing@flacronenterprises.com
BREVO_FROM_NAME=FlacronAI
ADMIN_EMAIL=marketing@flacronenterprises.com

# URLs
FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:3000
VITE_FIREBASE_API_KEY=your-firebase-web-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

---

## API Reference

Base URL: `https://your-api-domain.com` (or `http://localhost:3000`)

All protected routes require: `Authorization: Bearer <firebase_id_token>`

Agency+ plans also accept: `X-API-Key: flac_live_<32hex>`

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/users/profile` | Bearer | Get/create user profile |
| PUT | `/api/users/profile` | Bearer | Update profile |
| GET | `/api/reports/ai-status` | Public | Check AI service health |
| POST | `/api/reports/generate` | Bearer | Generate report (multipart/form-data) |
| GET | `/api/reports` | Bearer | List reports |
| GET | `/api/reports/:id` | Bearer | Get report |
| DELETE | `/api/reports/:id` | Bearer | Delete report |
| GET | `/api/reports/:id/export` | Bearer | Export (pdf/docx/html) |
| POST | `/api/payment/create-checkout` | Bearer | Create Stripe checkout |
| POST | `/api/payment/webhook` | Stripe sig | Stripe event handler |
| GET | `/api/payment/subscription` | Bearer | Get subscription status |
| POST | `/api/teams/invite` | Bearer (Agency+) | Invite team member |
| GET | `/api/teams/members` | Bearer (Agency+) | List members |
| DELETE | `/api/teams/members/:uid` | Bearer (Agency+) | Remove member |
| GET | `/api/crm/contacts` | Bearer (Agency+) | List CRM contacts |
| POST | `/api/crm/contacts` | Bearer (Agency+) | Create contact |
| GET | `/api/white-label/config` | Bearer (Enterprise) | Get white-label config |
| PUT | `/api/white-label/config` | Bearer (Enterprise) | Update white-label config |

---

## Project Structure

### Backend

```
backend/
├── server.js                     # Express app entry point
├── config/
│   ├── firebase.js               # Firebase Admin SDK init
│   └── tiers.js                  # Plan tier definitions
├── middleware/
│   └── auth.js                   # authenticateToken, requireTier, requireApiAccess
├── routes/
│   ├── auth.js                   # Password reset trigger
│   ├── users.js                  # Profile CRUD + usage tracking
│   ├── reports.js                # Report generation, listing, export
│   ├── payment.js                # Stripe checkout + idempotent webhooks
│   ├── teams.js                  # Team management
│   ├── crm.js                    # CRM contacts
│   └── whiteLabel.js             # White-label config (Enterprise)
├── services/
│   ├── aiService.js              # WatsonX primary + OpenAI fallback
│   ├── emailService.js           # Brevo transactional email
│   └── watermarkService.js       # PDF watermarking via pdf-lib
├── utils/
│   ├── properPdfGenerator.js     # PDFKit report PDF builder
│   └── documentGenerator.js      # DOCX report builder
└── scripts/
    ├── createBrevoTemplates.js   # One-time: create Brevo email templates
    ├── updateBrevoTemplates.js   # Update template content via API
    └── testEmails.js             # Test email delivery
```

### Frontend

```
frontend/src/
├── App.jsx                       # Routes + lazy loading + ErrorBoundary
├── context/
│   └── AuthContext.jsx           # Auth state, tier, canGenerate, reportsRemaining
├── services/
│   └── api.js                    # Axios instance + typed API methods
├── components/
│   ├── Navbar.jsx                # Responsive nav + cross-page hash scroll
│   ├── Footer.jsx                # Links, socials, copyright
│   └── ErrorBoundary.jsx         # React crash fallback
└── pages/
    ├── Home.jsx                  # Landing page (Three.js 3D sphere)
    ├── Auth.jsx                  # Login/signup (Firebase + Google OAuth)
    ├── Dashboard.jsx             # Report generation dashboard
    ├── EnterpriseDashboard.jsx   # Enterprise-only dashboard
    ├── ReportViewer.jsx          # View/export generated report
    ├── Pricing.jsx               # Plans + Stripe checkout
    ├── Profile.jsx               # User profile settings
    ├── APIDocumentation.jsx      # Interactive API docs
    ├── About.jsx                 # Company info, team, values
    ├── Contact.jsx               # Contact form
    ├── FAQs.jsx                  # Searchable FAQ accordion
    ├── PrivacyPolicy.jsx         # Privacy policy
    ├── TermsOfService.jsx        # Terms of service
    └── CookiesPolicy.jsx         # Cookie policy
```

---

## Email Templates (Brevo)

Stored server-side in Brevo (template IDs 10–14). Run the creation script once after initial setup:

```bash
cd backend
node scripts/createBrevoTemplates.js
```

| ID | Template | Trigger |
|---|---|---|
| 10 | Welcome | New user profile auto-created |
| 11 | Password Reset | User requests password reset |
| 12 | Payment Failed | Stripe `invoice.payment_failed` event |
| 13 | Team Invite | Owner invites a team member |
| 14 | Sales Lead | Enterprise inquiry via contact form |

---

## Firebase Setup

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Firestore Database** (production mode)
3. Enable **Authentication** — Email/Password + Google providers
4. Generate an **Admin SDK service account** → Project Settings → Service Accounts → Generate New Private Key
5. Copy values from the downloaded JSON into `backend/.env`
6. Deploy `firestore.rules`: `firebase deploy --only firestore:rules`

---

## Stripe Setup

1. Create products + prices for Professional, Agency, Enterprise (monthly + annual)
2. Copy price IDs into `backend/.env` (`STRIPE_*_PRICE_ID` vars)
3. Add a webhook endpoint pointing to `https://your-api/api/payment/webhook`
4. Subscribe to events: `checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_failed`
5. Copy the webhook signing secret → `STRIPE_WEBHOOK_SECRET`

---

## IBM WatsonX Setup

1. Create an [IBM Cloud account](https://cloud.ibm.com)
2. Provision a **WatsonX.ai** instance
3. Create a project and copy the **Project ID**
4. Generate an **API key** (IAM) → copy to `WATSONX_API_KEY`
5. Copy the service URL → `WATSONX_URL` (e.g. `https://us-south.ml.cloud.ibm.com`)

---

## Deployment

### Backend (Railway / Render / Fly.io)

1. Connect your GitHub repo
2. Set root directory to `backend/`
3. Build command: `npm install`
4. Start command: `node server.js`
5. Add all environment variables in the platform dashboard
6. Set `NODE_ENV=production` and update `FRONTEND_URL` to your production domain

### Frontend (Vercel / Netlify)

1. Connect your GitHub repo
2. Set root directory to `frontend/`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add all `VITE_*` environment variables
6. Configure SPA rewrite rule: `/* → /index.html` (status 200)

---

## Security Notes

- `.env` files are gitignored — never commit secrets
- All Firestore data is isolated per-user via security rules
- Stripe webhook signatures are verified on every request
- Webhook idempotency: processed event IDs stored in `processedWebhooks` Firestore collection
- File uploads are validated by MIME type (JPEG/PNG only) and capped at 10MB per file
- JWT tokens validated on every protected route; Firebase tokens verified against Firebase Admin SDK
- All data encrypted at rest (AES-256) and in transit (TLS 1.3) via Firebase + MongoDB Atlas infrastructure

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

*Built by [Flacron Enterprises LLC](https://flacronenterprises.com/) — Brooklyn, New York*
