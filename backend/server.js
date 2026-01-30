// FlacronAI - Main Server
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Initialize Firebase and AI providers
const { initializeFirebase } = require('./config/firebase');
const { initializeOpenAI } = require('./config/openai');
const { initializeWatsonX } = require('./config/watsonx');

// Import routes
const reportsRouter = require('./routes/reports');
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const paymentRouter = require('./routes/payment');
const crmRouter = require('./routes/crm');
const salesRouter = require('./routes/sales');
const whiteLabelRouter = require('./routes/whitelabel');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware - Configure helmet to allow Firebase CDN and external resources
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "https://www.gstatic.com",
        "https://www.googletagmanager.com",
        "https://cdn.jsdelivr.net",
        "https://cdnjs.cloudflare.com"
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
        "https://cdnjs.cloudflare.com"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "https://cdnjs.cloudflare.com"
      ],
      imgSrc: ["'self'", "data:", "https:", "https://ui-avatars.com"],
      connectSrc: [
        "'self'",
        "https://www.gstatic.com",
        "https://*.googleapis.com",
        "https://*.firebaseio.com",
        "https://*.cloudfunctions.net"
      ],
      frameAncestors: ["'self'", "http://localhost:5173", "http://localhost:3000"]
    }
  },
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false
}));

// CORS configuration - Allow all origins for development (mobile app needs this)
app.use(cors({
  origin: true, // Allow all origins
  credentials: true
}));

// Body parser (MUST BE BEFORE logging to see req.body)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware - LOG EVERYTHING
app.use((req, res, next) => {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('📥 INCOMING REQUEST:');
  console.log('   Method:', req.method);
  console.log('   URL:', req.url);
  console.log('   Origin:', req.headers.origin || 'No origin header');
  console.log('   Content-Type:', req.headers['content-type'] || 'None');
  console.log('   Authorization:', req.headers.authorization ? 'Present (Bearer ...)' : 'MISSING');
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('   Body:', JSON.stringify(req.body, null, 2));
  }
  console.log('═══════════════════════════════════════════════════════\n');
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);

// Serve uploaded files (reports, images) - Only uploads, no static frontend files
app.use('/uploads', express.static('uploads'));

// Root endpoint - Respond to Render health checks
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'FlacronAI Backend API is running',
    version: '1.0.0',
    documentation: '/api'
  });
});

// Also handle HEAD requests for health checks
app.head('/', (req, res) => {
  res.status(200).end();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'FlacronAI',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Info endpoint
app.get('/api', (req, res) => {
  res.json({
    service: 'FlacronAI API',
    version: '1.0.0',
    description: 'AI-powered Insurance Inspection Report Generator',
    powered_by: 'IBM WatsonX AI & OpenAI',
    authentication: {
      methods: ['Bearer Token', 'API Key'],
      bearerToken: 'Authorization: Bearer <firebase_token>',
      apiKey: 'X-API-Key: flac_live_xxxxxxxxxxxxx'
    },
    endpoints: {
      reports: {
        generate: 'POST /api/reports/generate',
        list: 'GET /api/reports',
        get: 'GET /api/reports/:id',
        update: 'PUT /api/reports/:id',
        delete: 'DELETE /api/reports/:id',
        export: 'POST /api/reports/:id/export',
        uploadImages: 'POST /api/reports/:id/images',
        analyzeImages: 'POST /api/reports/analyze-images'
      },
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        verify: 'POST /api/auth/verify',
        logout: 'POST /api/auth/logout'
      },
      users: {
        profile: 'GET /api/users/profile',
        updateProfile: 'PUT /api/users/profile',
        usage: 'GET /api/users/usage',
        upgrade: 'POST /api/users/upgrade',
        changeName: 'PUT /api/users/update-name',
        changePassword: 'PUT /api/users/change-password',
        apiAccess: 'GET /api/users/api-access'
      },
      apiKeys: {
        create: 'POST /api/users/api-keys',
        list: 'GET /api/users/api-keys',
        revoke: 'DELETE /api/users/api-keys/:keyId',
        usage: 'GET /api/users/api-keys/:keyId/usage',
        analytics: 'GET /api/users/api-usage'
      }
    },
    rateLimits: {
      starter: '0 API calls (no API access)',
      professional: '100 calls/hour, 1,000 calls/month',
      agency: '500 calls/hour, 5,000 calls/month',
      enterprise: '10,000 calls/hour, unlimited/month'
    },
    documentation: 'https://flacronai.com/docs/api'
  });
});

// API Routes
app.use('/api/reports', reportsRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/crm', crmRouter);
app.use('/api/sales', salesRouter);
app.use('/api/white-label', whiteLabelRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);

  if (err.message === 'Only image files are allowed') {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  console.log('❌ 404 - Unmatched route:', req.method, req.url);
  console.log('   Headers:', req.headers);
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Initialize services and start server
async function startServer() {
  try {
    console.log('🚀 Starting FlacronAI Server...');

    // Initialize Firebase
    initializeFirebase();

    // Initialize AI providers
    console.log('\n📡 Initializing AI Providers...');

    try {
      initializeOpenAI();
      console.log('   🟢 OpenAI: Ready for general features');
    } catch (error) {
      console.warn('   ⚠️ OpenAI: Not configured -', error.message);
    }

    try {
      initializeWatsonX();
      console.log('   🔵 WatsonX AI: Ready for enterprise reports');
    } catch (error) {
      console.warn('   ⚠️ WatsonX AI: Not configured -', error.message);
    }

    // Start Express server
    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║               🔥 FLACRONAI SERVER 🔥                  ║
║                                                       ║
║  AI-powered Insurance Report Generator               ║
║  Dual-AI: OpenAI + IBM WatsonX                       ║
║                                                       ║
╠═══════════════════════════════════════════════════════╣
║                                                       ║
║  Server:    http://localhost:${PORT}                     ║
║  API:       http://localhost:${PORT}/api                 ║
║  Health:    http://localhost:${PORT}/health              ║
║  Domain:    https://flacronai.com                     ║
║                                                       ║
║  AI:        OpenAI (General) + WatsonX (Reports)     ║
║  Status:    ✅ Running                                ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;
