# FlacronAI - AI-Powered Insurance Report Generator

<div align="center">
  <img src="logo.png" alt="FlacronAI Logo" width="200"/>

  <p><strong>Transform hours of work into minutes with AI-powered insurance reports</strong></p>

  [![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
  [![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
  [![React](https://img.shields.io/badge/react-18.3.1-blue)](https://reactjs.org)
</div>

---

## 🌟 Features

- **AI Document Generator** - Generate CRU-style or custom templates instantly using Google Gemini AI
- **Structured Input Forms** - Capture claim numbers, property data, damages, and contacts efficiently
- **Multiple Export Formats** - Export reports in DOCX, PDF, and HTML formats
- **Photo Integration** - Upload site photos and get AI-powered damage analysis
- **Map & GPS** - Automatically includes inspection site maps in reports
- **Quality Checker** - AI ensures reports have no missing key fields
- **Multi-User Access** - Role-based access control for teams and agencies
- **Multi-Language** - Generate reports in English, French, and Spanish
- **CRM Integration** - Manage clients, claims, and appointments
- **Subscription Tiers** - Flexible pricing from free to enterprise

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- Firebase account
- Stripe account (for payments)
- Google Gemini API key

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/flacronai.git
cd flacronai

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### Environment Setup

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

#### Backend (.env)
```env
GEMINI_API_KEY=your_gemini_api_key
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
STRIPE_PRICE_PROFESSIONAL=price_xxxxxxxxxxxxx
STRIPE_PRICE_AGENCY=price_xxxxxxxxxxxxx
STRIPE_PRICE_ENTERPRISE=price_xxxxxxxxxxxxx
```

### Running Locally

```bash
# Start backend server
cd backend
npm start

# In a new terminal, start frontend
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- API Health: http://localhost:3000/health

---

## 📁 Project Structure

```
FlacronAI/
├── frontend/                 # React + Vite frontend
│   ├── public/              # Static assets
│   │   ├── logo.png        # FlacronAI logo
│   │   └── favicon.svg     # Favicon
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   │   ├── Home.jsx    # Landing page
│   │   │   ├── Auth.jsx    # Login/Register
│   │   │   ├── Dashboard.jsx  # Main dashboard
│   │   │   ├── CRM.jsx     # CRM features
│   │   │   └── Checkout.jsx   # Payment page
│   │   ├── context/        # React context (Auth)
│   │   ├── styles/         # CSS files
│   │   ├── utils/          # Utility functions
│   │   ├── config/         # Configuration files
│   │   └── App.jsx         # Main app component
│   └── package.json
│
├── backend/                 # Node.js + Express backend
│   ├── config/             # Configuration
│   │   ├── firebase.js     # Firebase setup
│   │   ├── gemini.js       # Gemini AI setup
│   │   └── tiers.js        # Subscription tiers
│   ├── routes/             # API routes
│   │   ├── auth.js         # Authentication
│   │   ├── users.js        # User management
│   │   ├── reports.js      # Report generation
│   │   ├── payment.js      # Stripe integration
│   │   └── crm.js          # CRM features
│   ├── services/           # Business logic
│   │   ├── geminiService.js   # AI report generation
│   │   ├── reportService.js   # Report management
│   │   ├── crmService.js      # CRM logic
│   │   └── storageService.js  # File storage
│   ├── middleware/         # Express middleware
│   │   └── auth.js         # JWT authentication
│   ├── utils/              # Utility functions
│   │   └── documentGenerator.js  # PDF/DOCX generation
│   ├── uploads/            # Generated files storage
│   ├── server.js           # Main server file
│   └── package.json
│
├── logo.png                # Project logo
├── DEPLOYMENT_GUIDE.md     # Complete deployment guide
└── README.md               # This file
```

---

## 🏗️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **React Router** - Navigation
- **Firebase Auth** - Authentication
- **Stripe.js** - Payment processing

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **Firebase Admin** - Database & auth
- **Google Gemini AI** - Report generation
- **Stripe** - Payment processing
- **PDFKit** - PDF generation
- **Docx** - DOCX generation

### Database & Services
- **Firestore** - NoSQL database
- **Firebase Authentication** - User auth
- **Stripe** - Subscription management
- **Google Gemini 1.5** - AI text generation

---

## 💳 Subscription Tiers

| Tier | Price | Reports/Month | Features |
|------|-------|---------------|----------|
| **Starter** | Free | 1 | Basic reports, PDF export |
| **Professional** | $39.99/mo | 20 | All report types, PDF & DOCX, No watermark, Custom logo |
| **Agency** | $99.99/mo | 100 | 5 users, Agency dashboard, Custom branding, Priority support |
| **Enterprise** | $499/mo | Unlimited | Unlimited users, API access, White-label, Dedicated support |

---

## 📖 API Documentation

### Health Check
```
GET /health
```
Returns server health status

### Authentication
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/verify
POST /api/auth/logout
```

### Reports
```
POST /api/reports/generate      # Generate AI report
GET /api/reports                # Get all user reports
GET /api/reports/:id            # Get specific report
POST /api/reports/:id/export    # Export report (PDF/DOCX/HTML)
DELETE /api/reports/:id         # Delete report
```

### Users
```
GET /api/users/profile          # Get user profile
PUT /api/users/profile          # Update profile
GET /api/users/usage            # Get usage statistics
GET /api/users/tiers            # Get available tiers
POST /api/users/upgrade         # Upgrade tier
```

### Payments
```
POST /api/payment/create-checkout-session    # Create Stripe checkout
GET /api/payment/subscriptions               # Get all subscriptions
POST /api/payment/webhook                    # Stripe webhook endpoint
```

### CRM
```
POST /api/crm/clients                    # Create client
GET /api/crm/clients                     # Get all clients
GET /api/crm/clients/:id                 # Get specific client
PUT /api/crm/clients/:id                 # Update client
DELETE /api/crm/clients/:id              # Delete client

POST /api/crm/claims                     # Create claim
GET /api/crm/claims                      # Get all claims
PUT /api/crm/claims/:id/status           # Update claim status

GET /api/crm/analytics/dashboard         # Get dashboard analytics
```

---

## 🚀 Deployment

For detailed deployment instructions, see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

### Quick Deploy

#### Frontend (Vercel)
```bash
cd frontend
vercel --prod
```

#### Backend (Railway)
```bash
# Use Railway dashboard or:
railway up
```

---

## 🧪 Testing

### Run Frontend Tests
```bash
cd frontend
npm test
```

### Run Backend Tests
```bash
cd backend
npm test
```

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Report generation
- [ ] PDF/DOCX export
- [ ] Stripe checkout
- [ ] Webhook handling
- [ ] CRM features

---

## 🔒 Security

- All sensitive data stored in environment variables
- Firebase Security Rules enforced
- JWT token-based authentication
- Stripe webhook signature verification
- HTTPS enforced in production
- Rate limiting on API endpoints
- CORS properly configured

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

**Flacron Enterprises**
- Website: https://flacronenterprises.com
- Email: support@flacronenterprises.com

---

## 🙏 Acknowledgments

- Google Gemini AI for powerful text generation
- Firebase for authentication and database
- Stripe for payment processing
- Vercel for seamless deployment

---

## 📞 Support

- **Email**: support@flacronenterprises.com
- **Website**: https://flacronai.com
- **Documentation**: See DEPLOYMENT_GUIDE.md
- **Issues**: GitHub Issues

---

**Built with ❤️ by Flacron Enterprises**

*Powered by Google Gemini AI*
