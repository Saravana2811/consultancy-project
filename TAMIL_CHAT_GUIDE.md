# Tamil Language Chat Feature - Setup Guide

## Overview
A real-time chat system with Tamil language support for customer-admin communication.

## Features
✅ Tamil language interface (தமிழ் மொழி)
✅ Real-time messaging
✅ Quick response buttons in Tamil
✅ Unread message notifications
✅ Admin and User chat interfaces
✅ Auto-refresh every 3 seconds
✅ Bilingual support (Tamil + English)

## Files Created

### Backend
1. **Backend/src/models/Chat.js** - Chat database model
2. **Backend/src/routes/chat.js** - Chat API routes

### Frontend
1. **client/src/components/pages/TamilChat.jsx** - User-side chat component
2. **client/src/components/pages/TamilChat.css** - User chat styles
3. **client/src/components/pages/AdminChatView.jsx** - Admin chat interface
4. **client/src/components/pages/AdminChatView.css** - Admin chat styles

## Quick Start

### 1. Install Dependencies
No additional packages needed! Uses existing dependencies.

### 2. Start Backend Server
```bash
cd backend
npm start
```

### 3. Start Frontend
```bash
cd client
npm run dev
```

## How It Works

### For Users:
1. A floating chat button 💬 appears on the user dashboard (bottom right)
2. Click to open the Tamil chat interface
3. Type messages in Tamil or English
4. Use quick response buttons:
   - வணக்கம் (Hello)
   - நன்றி (Thank you)
   - உதவி வேண்டும் (Need help)
   - விலை என்ன? (What is the price?)
   - இது கிடைக்குமா? (Is this available?)
   - டெலிவரி எவ்வளவு நாள்? (How many days for delivery?)

### For Admins:
1. Go to Admin Dashboard
2. Click "உரையாடல் Chat" button
3. View all active chats in left sidebar
4. Click on a chat to view and respond
5. Use Tamil quick responses or type custom messages

## Tamil Quick Responses

### User Side (6 responses):
- வணக்கம் - Hello
- நன்றி - Thank you
- உதவி வேண்டும் - Need help
- விலை என்ன? - What is the price?
- இது கிடைக்குமா? - Is this available?
- டெலிவரி எவ்வளவு நாள்? - How many days for delivery?

### Admin Side (6 responses):
- வணக்கம்! உங்களுக்கு எவ்வாறு உதவலாம்? - Hello! How can I help you?
- தயவுசெய்து காத்திருங்கள் - Please wait
- உங்கள் ஆர்டர் செயல்முறையில் உள்ளது - Your order is being processed
- விரைவில் டெலிவரி செய்யப்படும் - Will be delivered soon
- மேலும் உதவி தேவையா? - Need more help?
- நன்றி! - Thank you!

## API Endpoints

### GET /api/chat/user/:userId
Get or create chat for a specific user
- Query params: userName (optional)
- Returns: Chat object with messages

### POST /api/chat/message
Send a new message
- Body: `{ userId, userName, text, sender: 'user'|'admin' }`
- Returns: Updated chat object

### GET /api/chat/all
Get all chats (admin only)
- Returns: Array of all chat objects

### PUT /api/chat/:chatId/read
Mark admin messages as read
- Returns: Updated chat object

## Features in Detail

### Real-time Updates
- Auto-refresh every 3 seconds
- Instant message visibility
- Unread count badges

### Bilingual Support
- All buttons show Tamil text
- Tooltips show English translations
- Supports typing in both languages

### Responsive Design
- Mobile-friendly
- Floating chat button
- Smooth animations
- Beautiful gradient design

### User Experience
- Scroll to latest message
- Message timestamps
- Read/unread indicators
- Loading states

## Customization

### Change Polling Interval
In both TamilChat.jsx and AdminChatView.jsx:
```javascript
const interval = setInterval(fetchChat, 3000); // Change 3000 to desired ms
```

### Add More Quick Responses
Edit the `quickResponses` array in either component:
```javascript
const quickResponses = [
  { tamil: 'உங்கள் தமிழ் உரை', english: 'Your English translation' },
  // Add more...
];
```

### Modify Colors
Edit the CSS files to change gradient colors, backgrounds, etc.

## Database Schema

```javascript
{
  userId: ObjectId (ref: User),
  userName: String,
  messages: [{
    sender: 'user' | 'admin',
    text: String,
    timestamp: Date,
    read: Boolean
  }],
  status: 'active' | 'closed',
  lastMessageAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Troubleshooting

### Chat not showing up?
- Check if backend server is running on port 5000
- Verify frontend can reach backend (CORS enabled)
- Check browser console for errors

### Messages not updating?
- Check network tab for API calls
- Verify MongoDB connection
- Check polling interval is working

### Tamil text not rendering?
- Ensure browser supports Tamil Unicode
- Check font support
- Try different browser if needed

## Next Steps

### Potential Enhancements:
1. WebSocket for real-time updates (instead of polling)
2. File/image sharing in chat
3. Chat history export
4. Admin notes on chats
5. Chat status management (active/closed)
6. Email notifications for new messages
7. Chat categorization
8. Auto-responses based on keywords

## Support

For issues or questions:
1. Check browser console for errors
2. Verify all files are created correctly
3. Ensure backend server is running
4. Check MongoDB connection

---

**Happy Chatting! 💬 வணக்கம்! 🎉**
