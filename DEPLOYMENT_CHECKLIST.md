# FlacronAI Deployment Checklist

## Pre-Deployment Checklist

### 1. Environment Variables
- [ ] Update `backend/.env.production` with production credentials
  - [ ] Set production Gemini API key
  - [ ] Set production Firebase credentials
  - [ ] Set production Stripe secret key (sk_live_...)
  - [ ] Set production Stripe webhook secret
  - [ ] Create production Stripe price IDs and update
  - [ ] Update `FRONTEND_URL` to your production domain

- [ ] Update `frontend/.env.production`
  - [ ] Set `VITE_API_URL` to your production backend URL

### 2. Code & Dependencies
- [ ] All dependencies are up to date (`npm audit fix`)
- [ ] Frontend build completes successfully (`npm run build`)
- [ ] No critical security vulnerabilities
- [ ] All tests pass (if applicable)

### 3. Stripe Setup
- [ ] Switch Stripe Dashboard to Live Mode
- [ ] Create production products and pricing:
  - [ ] Professional: $49/month
  - [ ] Agency: $149/month
  - [ ] Enterprise: Custom pricing
- [ ] Set up production webhook endpoint
- [ ] Configure webhook events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- [ ] Copy production webhook secret to `.env.production`

### 4. Firebase Setup
- [ ] Verify Firebase project is in production mode
- [ ] Set up production authentication providers
- [ ] Configure production Firestore security rules
- [ ] Set up Firebase hosting (optional)

### 5. Domain & DNS
- [ ] Domain purchased and configured (flacronai.com)
- [ ] DNS records configured:
  - [ ] A record for main domain
  - [ ] A record for www subdomain
  - [ ] A record for API subdomain (api.flacronai.com)
- [ ] SSL certificate obtained and configured

---

## Deployment Options

### Option 1: Vercel (Recommended for Frontend + Backend)

#### Deploy Frontend:
```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend directory
cd frontend

# Deploy to Vercel
vercel --prod

# Follow prompts to link project
# Set environment variables in Vercel Dashboard
```

#### Deploy Backend:
```bash
# Navigate to backend directory
cd backend

# Deploy to Vercel
vercel --prod

# Set environment variables in Vercel Dashboard
```

**Vercel Environment Variables:**
- Add all variables from `.env.production` in Vercel Dashboard
- Go to Project Settings > Environment Variables
- Add each variable individually

### Option 2: Netlify (Frontend) + Render/Railway (Backend)

#### Deploy Frontend to Netlify:
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Navigate to frontend directory
cd frontend

# Build the project
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=dist

# Set environment variables in Netlify Dashboard
```

#### Deploy Backend to Render:
1. Go to https://render.com
2. Create New > Web Service
3. Connect GitHub repository
4. Set build command: `npm install`
5. Set start command: `npm start`
6. Add environment variables from `.env.production`
7. Deploy

### Option 3: AWS EC2 / DigitalOcean

#### Server Setup:
```bash
# SSH into your server
ssh user@your-server-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Clone your repository
git clone https://github.com/yourusername/FlacronAI.git
cd FlacronAI

# Install dependencies
cd backend && npm install
cd ../frontend && npm install && npm run build

# Set up environment variables
cd ../backend
nano .env.production
# Paste your production environment variables

# Start backend with PM2
pm2 start server.js --name flacronai-backend
pm2 save
pm2 startup

# Serve frontend with Nginx
sudo apt-get install nginx
sudo nano /etc/nginx/sites-available/flacronai
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name flacronai.com www.flacronai.com;

    root /home/user/FlacronAI/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site and restart Nginx
sudo ln -s /etc/nginx/sites-available/flacronai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Install Certbot for SSL
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d flacronai.com -d www.flacronai.com
```

---

## Post-Deployment Checklist

### 1. Testing
- [ ] Test user registration and login
- [ ] Generate a test report
- [ ] Test report export (PDF, DOCX, HTML)
- [ ] Test payment flow with test credit card
- [ ] Verify subscription upgrade works
- [ ] Check "My Reports" displays correctly
- [ ] Verify "Usage & Billing" shows correct data
- [ ] Test pricing modal popup
- [ ] Test on mobile devices
- [ ] Test on different browsers (Chrome, Firefox, Safari, Edge)

### 2. Stripe Testing
- [ ] Create test subscription in Stripe Dashboard
- [ ] Verify webhook events are received
- [ ] Test subscription cancellation
- [ ] Test subscription upgrade/downgrade

### 3. Monitoring
- [ ] Set up error tracking (Sentry, LogRocket, etc.)
- [ ] Configure uptime monitoring (UptimeRobot, Pingdom)
- [ ] Set up analytics (Google Analytics, Mixpanel)
- [ ] Monitor server logs
- [ ] Set up alerts for errors

### 4. Performance
- [ ] Run Lighthouse audit (aim for 90+ score)
- [ ] Optimize images
- [ ] Enable CDN (Cloudflare recommended)
- [ ] Enable Gzip/Brotli compression
- [ ] Configure caching headers

### 5. Security
- [ ] HTTPS enabled and enforced
- [ ] Security headers configured (CSP, HSTS, etc.)
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] API keys secured and not exposed
- [ ] Firebase security rules tested
- [ ] Regular security audits scheduled

### 6. Backup
- [ ] Database backup strategy in place
- [ ] Code repository backed up
- [ ] Environment variables documented securely
- [ ] Recovery plan documented

---

## Quick Deployment Commands

### Production Build Test (Local):
```bash
# Build frontend
cd frontend
npm run build

# Test production build locally
npx vite preview

# Start backend in production mode
cd ../backend
NODE_ENV=production npm start
```

### Vercel Deployment (One Command):
```bash
# From project root
cd frontend && vercel --prod && cd ../backend && vercel --prod
```

### Check Deployment Status:
```bash
# Vercel
vercel ls

# Netlify
netlify status

# PM2 (if using EC2/DigitalOcean)
pm2 status
pm2 logs flacronai-backend
```

---

## Troubleshooting

### Build Fails:
- Check Node.js version (should be 18+)
- Clear `node_modules` and `package-lock.json`, reinstall
- Check for TypeScript errors
- Verify all environment variables are set

### Stripe Webhooks Not Working:
- Verify webhook URL is correct
- Check webhook secret matches `.env.production`
- Test webhook with Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhook/stripe`

### CORS Errors:
- Verify `FRONTEND_URL` in backend `.env.production` matches frontend domain
- Check backend CORS configuration in `server.js`

### Firebase Authentication Issues:
- Verify Firebase API keys are correct
- Check Firebase Console > Authentication > Sign-in methods
- Ensure authorized domains include your production domain

---

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Netlify Docs**: https://docs.netlify.com
- **Stripe Docs**: https://stripe.com/docs
- **Firebase Docs**: https://firebase.google.com/docs
- **Nginx Docs**: https://nginx.org/en/docs/

---

## Final Notes

1. **Never commit `.env` files to version control**
2. **Always use environment variables for secrets**
3. **Test thoroughly before going live**
4. **Monitor your application after deployment**
5. **Keep dependencies updated regularly**
6. **Have a rollback plan ready**

**Good luck with your deployment! 🚀**
