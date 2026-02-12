# Quick Start Guide

## 🚀 Running the Application

### Backend
```bash
cd backend
npm start
```

### Frontend
```bash
cd client
npm run dev
```

## 👤 Create Admin User

```bash
cd backend
node createAdmin.js admin@example.com yourpassword "Admin Name"
```

## 🌱 Seed Sample Materials (Optional)

```bash
cd backend
# Seed materials (keeps existing ones)
node seedMaterials.js

# Clear and seed fresh materials
node seedMaterials.js --clear
```

## 🔗 Access URLs

- **Landing Page**: http://localhost:5173/
- **User Dashboard**: http://localhost:5173/dashboard
- **Admin Dashboard**: http://localhost:5173/admin
- **Login**: http://localhost:5173/login
- **Sign Up**: http://localhost:5173/signin

## 📋 Quick Test Flow

1. **Create an admin user** (run createAdmin.js)
2. **Login** at /login with admin credentials
3. **Go to /admin** to upload materials
4. **Go to /dashboard** to view materials as a user

## 🎨 Features

### Admin Dashboard (/admin)
- ✅ Upload materials with title, description, category, price, quantity
- ✅ Add image URLs for materials
- ✅ Edit existing materials
- ✅ Delete materials
- ✅ View all uploaded materials

### User Dashboard (/dashboard)
- ✅ Browse all available materials
- ✅ Filter by category
- ✅ Search materials by title/description
- ✅ View material details (price, quantity, etc.)
- ✅ See stock availability

## 🔑 Important Notes

- Admin routes require authentication (JWT token)
- Token is stored in localStorage after login
- Materials are visible to all users (no auth required)
- Only admins can create/edit/delete materials
