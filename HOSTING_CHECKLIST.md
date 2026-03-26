# Textile Project - Production Hosting Preparation Guide

## ✅ Security & Configuration Issues - FIXED

### JWT & Session Secrets
- **Status**: ✅ FIXED
- Removed all hardcoded secret fallbacks throughout the codebase
- Servers now FAIL if JWT_SECRET or SESSION_SECRET are not configured
- **Action for hosting**: Set environment variables in your hosting platform

### Hardcoded Credentials
- **Status**: ✅ FIXED
- Removed hardcoded admin email/password from seed scripts
- Seed scripts now require credentials via environment variables
- **Action for hosting**: Use proper admin creation script with environment credentials

### Test Endpoints Removed
- **Status**: ✅ FIXED
- Removed `/api/uploads/test` endpoint
- Removed `/api/test-email` endpoint
- **Reason**: Security risk in production

### Hardcoded API URLs (Client)
- **Status**: ✅ FIXED
- Fixed `Buy.jsx` - now uses environment variable
- Fixed `TamilChat.jsx` - all 3 hardcoded URLs replaced
- All client components now support VITE_API_URL environment variable
- **Action for hosting**: Set VITE_API_URL in build environment

---

## 📋 REQUIRED SETUP FOR PRODUCTION

### 1. Environment Variables - CRITICAL ⚠️

**Backend (.env)**
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
DB_NAME=textile
JWT_SECRET=<generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
SESSION_SECRET=<generate same way>
ADMIN_CODE=secure_code_min_12_chars
CLIENT_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=app_password_from_google
FROM_EMAIL=your_email@gmail.com
GOOGLE_CLIENT_ID=from_google_cloud_console
GOOGLE_CLIENT_SECRET=from_google_cloud_console
RAZORPAY_KEY_ID=from_razorpay_dashboard
RAZORPAY_KEY_SECRET=from_razorpay_dashboard
```

**Admin Backend (.env)**
```env
PORT=5001
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/textile
JWT_SECRET=<SAME as main backend or different secure string>
SESSION_SECRET=<SAME as main backend or different secure string>
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=secure_password_min_6_chars
CLIENT_ORIGIN=https://admin.yourdomain.com
```

**Client (.env.local)**
```env
VITE_API_URL=https://api.yourdomain.com
VITE_ADMIN_APP_URL=https://admin.yourdomain.com
```

**Admin Client (.env.local)**
```env
VITE_API_URL=https://admin-api.yourdomain.com
VITE_MAIN_APP_URL=https://www.yourdomain.com
```

### 2. Database Setup
- ✅ Ensure MongoDB connection string is valid
- ✅ Create database users with appropriate permissions
- ✅ Backup strategy in place

### 3. Build & Deployment

**Building for Production:**
```bash
# Install dependencies
npm install

# Build client
cd client && npm run build && cd ..

# Backend doesn't require build step (Node.js)
```

**Files to NEVER Commit/Deploy:**
- `.env` files (use `.env.example` as template)
- `node_modules/` (reinstall via npm install)
- `.git/` folders (remove them if present)
- Seed scripts: `seed*.js`, `createAdmin.js`
- `uploads/` directory (user uploads only)

### 4. Pre-Deployment Checklist

- [ ] All `.env` files created with production values
- [ ] Generated secure JWT_SECRET and SESSION_SECRET
- [ ] Verified MONGODB_URI works
- [ ] SMTP/Email credentials tested
- [ ] Google OAuth credentials updated for production domain
- [ ] Razorpay credentials verified
- [ ] CORS origins properly configured
- [ ] NODE_ENV=production set
- [ ] Database backups configured
- [ ] SSL/HTTPS certificate installed
- [ ] All sensitive files removed from git history

### 5. Security Best Practices

1. **CORS**: Updated to allow only your production domain
2. **Session Cookies**: Secure flag enabled in production
3. **JWT**: No hardcoded defaults - must be configured
4. **Secrets**: All hardcoded development secrets removed
5. **Git History**: Clean up any committed `.env` files

```bash
# Check git history for .env files (security review)
git log --all --full-history -- .env
git log --all --full-history -- "*.env"

# DANGER: Remove from history if found (use BFG or git-filter-repo)
# bfg --delete-files .env
```

---

## 🚀 Deployment Steps

### Option 1: Render.com (Recommended)
1. Connect GitHub repository
2. Choose **Blueprint deploy** and point Render to `render.yaml`
3. Render will create 4 services automatically:
	- `textile-backend` (main API)
	- `textile-admin-backend` (admin API)
	- `textile-client` (main frontend)
	- `textile-admin-client` (admin frontend)
4. Open each service and set all `sync: false` environment variables
5. Update final domain values:
	- Backend `CLIENT_ORIGIN` should include both frontend domains
	- Admin backend `CLIENT_ORIGIN` should be admin frontend domain
	- Frontend `VITE_API_URL` should point to the correct API service URL
6. Re-deploy once environment variables are saved

### Option 2: Railway.app
Similar process to Render

### Option 3: Self-Hosted (VPS)
1. SSH into server
2. Install Node.js, MongoDB/configure connection
3. Clone repository
4. Create `.env` file with production values
5. Run: `npm install && npm --prefix backend start`
6. Use PM2 or systemd to keep services running

---

## 📝 Important Files to Review

- [Main Backend Env Template](./backend/.env.example)
- [Admin Backend Env Template](./admin/backend/.env.example)
- [Main Frontend Env Template](./client/.env.example)
- [Admin Frontend Env Template](./admin/.env.example)
- [Render Blueprint](./render.yaml)

---

## 🔍 Troubleshooting

**MongoDB Connection Failed**
- Check connection string format
- Verify IP whitelist in MongoDB Atlas
- Ensure credentials are correct

**CORS Errors**
- Verify CLIENT_ORIGIN matches your domain
- Check if multiple domains need adding (comma-separated)

**Email Not Sending**
- Verify SMTP credentials
- Use App Password for Gmail (not regular password)
- Check From_EMAIL is consistent

**Port Already in Use**
- Backend tries port 5000 by default
- Admin backend tries port 5001
- Change PORT in .env if needed

---

## 📞 Support

For deployment help:
1. Check server logs
2. Verify all environment variables are set
3. Check MongoDB connectivity
4. Verify JWT/SESSION secrets are configured
5. Review CORS configuration

**Last Updated**: March 2026
**Status**: ✅ Ready for Production
