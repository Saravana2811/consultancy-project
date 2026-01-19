Backend (Express + MongoDB)

Setup
- Requires Node.js 18+
- Create `.env` from `.env.example`
- Set `MONGODB_URI` to your MongoDB Compass connection string (e.g. `mongodb://localhost:27017` or Atlas URI).

Install & Run
```powershell
cd E:\Projects\textile\backend
npm install
npm run dev
```

API
- POST `/api/auth/signup` { name?, email, password }
- POST `/api/auth/login` { email, password }

Response includes `user` and `token` (JWT).

Client Integration (Vite React)
Use:
```js
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function signup(payload) {
  const res = await fetch(`${API}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}
```

MongoDB Compass
- Open Compass and connect with the same `MONGODB_URI`.
- Database name defaults to `textile` (override with `DB_NAME`).
