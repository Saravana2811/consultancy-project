# Admin & User Dashboard Setup Guide

## Overview
This project now includes:
- **Admin Dashboard**: For uploading and managing materials
- **User Dashboard**: For browsing available materials

## Backend Changes

### 1. New Material Model
Created `backend/src/models/Material.js` with fields:
- title, description, category
- imageUrl, price, quantity
- uploadedBy (reference to User)
- isAdmin flag

### 2. User Model Update
Added `isAdmin` field to User model for role-based access control.

### 3. Materials API Routes
Created `backend/src/routes/materials.js` with endpoints:
- `GET /api/materials` - Get all materials (public)
- `GET /api/materials/:id` - Get single material
- `POST /api/materials` - Create material (admin only)
- `PUT /api/materials/:id` - Update material (admin only)
- `DELETE /api/materials/:id` - Delete material (admin only)

### 4. Auth Enhancement
Added `GET /api/auth/me` endpoint to get current user info including isAdmin status.

## Frontend Changes

### 1. Admin Dashboard
- Location: `client/src/components/pages/AdminDashboard.jsx`
- Features:
  - Upload new materials
  - Edit existing materials
  - Delete materials
  - View all materials with images
  - Form validation

### 2. User Dashboard
- Location: `client/src/components/pages/UserDashboard.jsx`
- Features:
  - Browse all materials
  - Filter by category
  - Search functionality
  - View material details
  - Check stock availability

### 3. New Routes
Added to `App.jsx`:
- `/admin` - Admin Dashboard
- `/dashboard` - User Dashboard

## How to Use

### Creating an Admin User

**Option 1: Using MongoDB Compass or Shell**
```javascript
// Update an existing user to be admin
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { isAdmin: true } }
)
```

**Option 2: Directly during signup**
Modify the signup request in your database or use a database tool to set `isAdmin: true` for specific users.

### Accessing the Dashboards

1. **Admin Dashboard**: 
   - Navigate to `http://localhost:5173/admin`
   - Must be logged in with an admin account
   - Can upload, edit, and delete materials

2. **User Dashboard**:
   - Navigate to `http://localhost:5173/dashboard`
   - Available to all users (no login required for viewing)
   - Shows all active materials

### Testing the Features

1. **Start the Backend**:
   ```bash
   cd backend
   npm start
   ```

2. **Start the Frontend**:
   ```bash
   cd client
   npm run dev
   ```

3. **Create Admin User**:
   - Sign up normally
   - Use MongoDB tool to set `isAdmin: true` for that user
   - Or manually insert an admin user

4. **Upload Materials**:
   - Login as admin
   - Go to `/admin`
   - Fill out the form and upload materials

5. **View as User**:
   - Go to `/dashboard`
   - Browse and search materials

## API Testing with Postman/Thunder Client

### Upload Material (Admin)
```http
POST http://localhost:5000/api/materials
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "Premium Cotton",
  "description": "High-quality cotton fabric",
  "category": "Cotton",
  "imageUrl": "https://example.com/cotton.jpg",
  "price": 25.99,
  "quantity": 100
}
```

### Get All Materials
```http
GET http://localhost:5000/api/materials
```

## Database Schema

### Material Document
```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String,
  category: String,
  imageUrl: String,
  price: Number (default: 0),
  quantity: Number (default: 0),
  uploadedBy: ObjectId (ref: User),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### User Document (Updated)
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (required, unique),
  passwordHash: String (required),
  isAdmin: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

## Security Notes

- Admin routes are protected with JWT authentication
- Only users with `isAdmin: true` can create/update/delete materials
- Regular users can only view materials
- All material image URLs should be validated
- Consider adding rate limiting for API endpoints

## Future Enhancements

1. **File Upload**: Integrate with cloud storage (AWS S3, Cloudinary) for actual image uploads
2. **Order System**: Add cart and ordering functionality
3. **Analytics**: Admin dashboard with sales statistics
4. **Email Notifications**: Notify admins when stock is low
5. **User Roles**: Add more granular permissions (editor, viewer, etc.)

## Troubleshooting

### "Admin access required" error
- Verify the user has `isAdmin: true` in the database
- Check that JWT token is being sent correctly
- Ensure token is not expired

### Materials not showing
- Check backend is running on port 5000
- Verify MongoDB connection
- Check browser console for CORS errors

### Images not displaying
- Verify imageUrl is valid and accessible
- Check CORS settings if images are from external sources
- Try using direct image URLs (not redirects)
