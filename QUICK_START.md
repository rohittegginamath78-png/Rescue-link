# RescueLink - Quick Start Guide

## Installation & Setup (5 minutes)

### 1. Server Setup

```bash
cd server
npm install

# Configure environment variables
# Copy and edit .env file with MongoDB URI
cp .env.example .env

# Seed database with initial data and admin account
npm run seed

# Start server
npm run dev
# Server runs on http://localhost:8787
```

### 2. Client Setup

```bash
cd client
npm install

# Configure environment variables (if not using default)
# cp .env.example .env

# Start dev server
npm run dev
# Client runs on http://localhost:5173
```

---

## Testing the New Features

### Test 1: Community Submission (Public)

```
1. Open: http://localhost:5173/know-a-rescuer
2. Fill form with test rescuer info
3. Submit
4. See success message
```

### Test 2: Admin Login

```
1. Open: http://localhost:5173/admin/login
2. Email: admin@rescuelink.com
3. Password: SecurePassword123
4. Click Login → Redirects to dashboard
```

### Test 3: Approve Community Submission

```
1. In admin dashboard, click "Pending Rescuers"
2. See the rescuer you submitted
3. Click "Review"
4. Click "✅ Verify & Approve"
5. Rescuer moves to "Verified Rescuers"
```

### Test 4: Add Manual Rescuer

```
1. In admin dashboard, click "Add Rescuer"
2. Fill form
3. Submit → Rescuer immediately appears in public search
```

### Test 5: Verify Public Search

```
1. Go to: http://localhost:5173/find-rescuer
2. Search for approved rescuers
3. Pending/rejected rescuers should NOT appear
```

### Test 6: Security Check

```
1. Logout from admin panel
2. Try accessing: http://localhost:5173/admin/dashboard
3. Should redirect to login page
```

---

## Key Files Created

### Backend Files

```
server/
├── src/
│   ├── models/
│   │   ├── Admin.js                    # Admin schema with bcrypt
│   │   └── Rescuer.js                  # Updated with new fields
│   ├── routes/
│   │   ├── admin.js                    # All admin endpoints
│   │   └── rescuers.js                 # Updated with community submit
│   ├── middleware/
│   │   └── auth.js                     # JWT verification
│   ├── utils/
│   │   └── jwt.js                      # JWT sign/verify utilities
│   └── index.js                        # Updated with admin routes
└── data/
    └── seed.js                         # Creates admin account

```

### Frontend Files

```
client/
├── src/
│   ├── services/
│   │   └── authService.js              # JWT auth handling
│   ├── components/
│   │   ├── ProtectedAdminRoute.jsx     # Route protection
│   │   └── admin/
│   │       └── AdminSidebar.jsx        # Admin nav sidebar
│   ├── pages/
│   │   ├── KnowARescuer.jsx            # Community form
│   │   ├── AdminLogin.jsx              # Login page
│   │   ├── AdminDashboard.jsx          # Dashboard stats
│   │   ├── AdminPendingRescuers.jsx    # Approve/reject
│   │   ├── AdminVerifiedRescuers.jsx   # Manage rescuers
│   │   └── AdminAddRescuer.jsx         # Manual add
│   └── App.jsx                         # Updated routes
```

---

## Environment Variables

### Server (.env)

```
MONGODB_URI=mongodb://localhost:27017/rescuelink
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:5173
```

### Client (.env)

```
VITE_API_URL=http://localhost:8787/api
```

---

## API Endpoints Reference

### Public Endpoints

```
POST /api/rescuers/submit - Community submission
GET /api/rescuers?city=X  - Get verified rescuers (auto-filtered)
```

### Admin Endpoints (Require JWT Token)

```
POST /api/admin/login
GET /api/admin/dashboard-stats
GET /api/admin/pending-rescuers
PATCH /api/admin/rescuer/:id/verify
PATCH /api/admin/rescuer/:id/reject
POST /api/admin/add-rescuer
```

---

## Common Tasks

### Add Another Admin User

```bash
# Use MongoDB CLI or Compass
db.admins.insertOne({
  email: "newadmin@rescuelink.com",
  password: "hashed_password_via_bcrypt",
  name: "New Admin",
  isActive: true,
  role: "admin"
})
```

### Clear Pending Submissions

```bash
# MongoDB
db.rescuers.deleteMany({ status: "pending" })
```

### Export Admin Stats

```javascript
// Use /api/admin/dashboard-stats endpoint
// Returns: { totalVerified, totalPending, totalNGOs, snakeRescuers, birdRescuers }
```

---

## Troubleshooting

| Issue                                  | Solution                                       |
| -------------------------------------- | ---------------------------------------------- |
| "Cannot connect to MongoDB"            | Check MONGODB_URI in .env                      |
| "Admin login fails"                    | Run `npm run seed` to create admin account     |
| "CORS error from client"               | Check CLIENT_URL matches vite dev server       |
| "Pending submissions not showing"      | Verify JWT token is valid & admin is logged in |
| "Public search shows pending rescuers" | Check filters in `/api/rescuers` endpoint      |

---

## Production Deployment

Before deploying to production:

1. **Change JWT_SECRET** to a strong random string
2. **Update MONGODB_URI** to production MongoDB
3. **Change admin password** from default
4. **Set secure CORS origins** for production domain
5. **Enable HTTPS** for all connections
6. **Set NODE_ENV=production** on server

---

## Feature Summary

| Feature         | Route                      | Access            | Purpose             |
| --------------- | -------------------------- | ----------------- | ------------------- |
| Community Form  | `/know-a-rescuer`          | Public            | Submit rescuers     |
| Admin Login     | `/admin/login`             | Public (URL-only) | Authenticate        |
| Dashboard       | `/admin/dashboard`         | Protected         | View statistics     |
| Pending Reviews | `/admin/pending-rescuers`  | Protected         | Approve submissions |
| Manage Rescuers | `/admin/verified-rescuers` | Protected         | Edit/delete/disable |
| Add Rescuer     | `/admin/add-rescuer`       | Protected         | Manual entry        |

---

**Happy testing! 🚀**
