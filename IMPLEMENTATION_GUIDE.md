# RescueLink - New Features Implementation Guide

## Overview

This document outlines the three new features added to RescueLink:

1. **Community Rescuer Contribution System** - Public form for users to suggest rescuers
2. **Admin Verification Workflow** - Private admin dashboard to review and approve submissions
3. **Protected Admin Panel** - Hidden admin interface with JWT-based authentication

---

## FEATURE 1: Community Rescuer Contribution System

### Accessing the Feature

**Public Route:** `/know-a-rescuer`

### What Users Can Do

- Submit wildlife rescuer information for verification
- Suggest rescuers from the community
- Submit their own information for verification
- Contribute to expanding the RescueLink network

### Form Fields

- **Rescuer Name** _(required)_
- **City** _(required)_
- **Phone Number** _(required)_
- **WhatsApp Number** (optional)
- **Animal Specialty** _(required)_
  - Snake Rescue
  - Bird Rescue
  - Wildlife Rescue
  - Dog/Cat Rescue
- **Instagram/Profile Link** (optional)
- **NGO Name** (optional)
- **Notes/Description** (optional)
- **"I am this rescuer"** checkbox (optional)

### Submission Logic

- Submissions are **NOT immediately public**
- Status: `pending` → Awaits admin review
- Database saves with: `verified: false`, `status: "pending"`, `addedBy: "community"`
- Submitter contact info is collected (email/phone) for admin reference
- Duplicate detection warning if similar rescuer exists (same phone + city)
- Success message shows: _"Thank you for helping expand the wildlife rescue network. Your submission will be reviewed by the admin team before becoming publicly visible."_

### Key Features

✅ Non-intrusive to public search (unverified rescuers hidden)
✅ Duplicate prevention with warnings
✅ Submitter tracking for admin verification
✅ Mobile-responsive form design

---

## FEATURE 2: Admin Panel

### Accessing the Admin Panel

**Login Route:** `/admin/login`  
**Demo Credentials:**

- Email: `admin@rescuelink.com`
- Password: `SecurePassword123`

### Authentication

- JWT-based authentication (tokens stored in localStorage)
- Token expires after 24 hours
- Auto-logout on token expiration
- Session verification on dashboard load

### Admin Routes (Protected)

All admin routes require valid JWT token. If token is missing/invalid, user is redirected to `/admin/login`.

```
/admin/login              - Login page (public)
/admin/dashboard          - Dashboard with statistics (protected)
/admin/pending-rescuers   - Review pending submissions (protected)
/admin/verified-rescuers  - Manage verified rescuers (protected)
/admin/add-rescuer        - Manually add rescuers (protected)
```

### Security

🔒 **No public admin UI** - No buttons or links in navbar/website
🔒 **Hidden routes** - Admin pages only accessible via direct URL
🔒 **JWT authentication** - Secure token-based session management
🔒 **Protected routes** - Automatic redirect to login if not authenticated

---

## FEATURE 3: Admin Dashboard

### Dashboard Overview

**Statistics Displayed:**

- ✅ Total Verified Rescuers
- ⏳ Pending Verification Requests
- 🏢 Total NGOs
- 🐍 Snake Rescuers
- 🦅 Bird Rescuers

### Navigation

**Sidebar Menu:**

- 📊 Dashboard (home stats)
- ⏳ Pending Rescuers (approve/reject submissions)
- ✅ Verified Rescuers (manage approved rescuers)
- ➕ Add Rescuer (manually add rescuers)
- 🚪 Logout (clear session)

### Quick Actions

Shortcut cards for:

- Reviewing pending submissions
- Managing verified rescuers
- Adding new rescuers

---

## FEATURE 4: Pending Rescuers Management

**Route:** `/admin/pending-rescuers`

### What Admins See

- List of all pending submissions from community users
- Detailed information for each submission:
  - Name, City, Phone, WhatsApp
  - Specialties (with color badges)
  - NGO Name, Instagram, Notes
  - Submitter contact info
  - Submission date

### Admin Actions

**Per Rescuer:**

1. **Verify Button** ✅
   - Sets: `verified: true`, `status: "approved"`
   - Rescuer now appears in public search results
   - Adds verification timestamp

2. **Reject Button** ❌
   - Sets: `status: "rejected"`
   - Optional rejection reason stored in notes
   - Rescuer remains hidden from public

3. **View Details** 👁️
   - Modal with full submission information
   - Contact details for follow-up verification
   - All submitted data visible

### Features

📄 Pagination (10 items per page)
🔍 Easy review interface
📋 Full submission history visible
✨ Mobile-responsive cards/table view

---

## FEATURE 5: Verified Rescuers Management

**Route:** `/admin/verified-rescuers`

### What Admins See

- All verified rescuers (approved + visible in public search)
- Filtering options:
  - By Animal Specialty
  - By City
  - Search by name

### Admin Actions

**Per Rescuer:**

1. **Edit Button** ✏️
   - Modify all rescuer details
   - Update contact info, specialties, etc.
   - Changes apply immediately
   - Audit trail: `updatedBy` field tracks who edited

2. **Disable Button** ⏸️
   - Soft delete (rescuer hidden from public but kept in database)
   - Togglable - can re-enable anytime
   - Does NOT delete data

3. **Delete Button** 🗑️
   - Hard delete (permanent removal from database)
   - Confirmation required
   - Cannot be undone

### Features

🔍 Filtering & searching by specialty/city
📊 Status indicators (active/disabled badges)
📝 Edit inline form modal
🔄 Toggle enable/disable
🗑️ Permanent deletion option
📄 Pagination support

---

## FEATURE 6: Manual Rescuer Addition (Admin)

**Route:** `/admin/add-rescuer`

### Purpose

Allow admins to manually add verified rescuers directly (bypassing pending approval).

### Form Fields

Same as community contribution form:

- Name, City, Phone, WhatsApp
- Animal Specialties
- NGO Name, Instagram, Address
- Notes, Available 24/7 checkbox

### Submission Logic

**Auto-Verified:**

- `verified: true` (immediately approved)
- `status: "approved"` (publicly visible)
- `addedBy: "admin"` (admin-sourced)
- `verifiedAt` timestamp set

**Result:** Rescuer appears in public search **immediately** after creation

### Use Cases

- Adding rescuers from external databases
- Manually registering partner organizations
- Onboarding trusted rescuers directly
- Bulk importing pre-verified contacts

---

## DATABASE SCHEMA UPDATES

### New Fields Added to Rescuer Model

```javascript
{
  // New fields
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true
  },
  addedBy: {
    type: String,
    enum: ['community', 'admin'],
    default: 'community'
  },
  disabled: {
    type: Boolean,
    default: false,
    index: true
  },
  ngoName: String,
  instagram: String,
  notes: String,
  submitterEmail: String,
  submitterPhone: String,

  // Audit fields
  verifiedAt: Date,
  rejectedAt: Date,
  verifiedBy: String,
  updatedBy: String,
}
```

### New Admin Model

```javascript
{
  email: String (unique, required),
  password: String (bcrypt hashed, required),
  name: String,
  isActive: Boolean (default: true),
  role: String (enum: ['super_admin', 'admin', 'moderator']),
  lastLogin: Date,
  timestamps: true
}
```

---

## API ENDPOINTS

### Community Submission

```
POST /api/rescuers/submit
Body: { name, city, phone, whatsapp, specialties, ngoName, instagram, notes, submitterEmail, submitterPhone }
Returns: { message, rescuerId }
```

### Admin Endpoints (All require JWT token in Authorization header)

```
POST /api/admin/login
POST /api/admin/verify-token

GET /api/admin/dashboard-stats
GET /api/admin/pending-rescuers?page=1&limit=10
GET /api/admin/verified-rescuers?page=1&limit=10&specialty=&city=
GET /api/admin/rescuer/:id

PATCH /api/admin/rescuer/:id/verify
PATCH /api/admin/rescuer/:id/reject
PATCH /api/admin/rescuer/:id/disable
PATCH /api/admin/rescuer/:id
DELETE /api/admin/rescuer/:id
POST /api/admin/add-rescuer
```

---

## SETUP & DEPLOYMENT

### Prerequisites

- Node.js v16+
- MongoDB (local or cloud)
- Environment variables configured

### Server Setup

1. **Install dependencies:**

   ```bash
   cd server
   npm install
   ```

2. **Configure .env:**

   ```
   MONGODB_URI=mongodb://localhost:27017/rescuelink
   JWT_SECRET=your-super-secret-key
   CLIENT_URL=http://localhost:5173
   ```

3. **Run seed data:**

   ```bash
   npm run seed
   ```

   This creates:
   - Pre-verified rescuers
   - Admin account: `admin@rescuelink.com` / `SecurePassword123`

4. **Start server:**
   ```bash
   npm run dev
   ```

### Client Setup

1. **Install dependencies:**

   ```bash
   cd client
   npm install
   ```

2. **Configure .env:**

   ```
   VITE_API_URL=http://localhost:8787/api
   ```

3. **Start dev server:**
   ```bash
   npm run dev
   ```

---

## IMPORTANT RULES

### Public-Facing Rules

✅ **Community submissions are NOT public by default** - Must be admin-approved first
✅ **No admin UI visible to public** - Zero admin buttons/links in navbar
✅ **Unverified rescuers hidden** - Public search filters out `status: "pending"`
✅ **Disabled rescuers hidden** - Public search filters out `disabled: true`

### Admin Rules

🔐 **Admin routes protected by JWT** - Automatic redirect to login if not authenticated
🔐 **Token-based sessions** - No password stored in localStorage, only secure token
🔐 **Logout clears session** - Deletes token and admin data from localStorage
🔐 **Manual URL access only** - No navigation links exposed publicly

### Data Rules

📊 **Dual status tracking:**

- `verified` field: Whether admin has verified the rescuer
- `status` field: pending/approved/rejected state
- `disabled` field: Soft delete flag

📊 **Audit trail:**

- `submittedAt`: When submitted
- `verifiedAt`: When approved
- `rejectedAt`: When rejected
- `verifiedBy`: Which admin approved
- `updatedBy`: Which admin made edits

---

## TESTING THE FEATURES

### Test Community Submission

1. Go to `/know-a-rescuer`
2. Fill out form with test data
3. Submit
4. Verify success message shown
5. Check admin panel - submission appears in "Pending Rescuers"

### Test Admin Workflow

1. Go to `/admin/login`
2. Login with: `admin@rescuelink.com` / `SecurePassword123`
3. View dashboard - should show stats
4. Go to "Pending Rescuers" - see community submissions
5. Click "Review" on a submission
6. Try "Verify" or "Reject" actions
7. Check "Verified Rescuers" - updated rescuer appears
8. Try "Edit" or "Disable" actions
9. Test "Add Rescuer" - new rescuer created immediately verified

### Test Public Search

1. Go to `/find-rescuer` or `/rescuer`
2. Search for rescuers
3. Verify:
   - Only `verified: true` rescuers appear
   - Only `status: "approved"` rescuers appear
   - Disabled rescuers are hidden
   - Pending/rejected rescuers are hidden

### Test Security

1. Try accessing `/admin/dashboard` without login
   - Should redirect to `/admin/login`
2. Logout from admin panel
   - Token cleared from localStorage
   - Trying to access `/admin/*` should redirect to login
3. Try manually setting invalid token
   - Should fail verification and redirect to login

---

## TROUBLESHOOTING

### Admin Login Fails

- Check email/password match seed data
- Verify MongoDB connection
- Check JWT_SECRET is set in .env

### Pending Submissions Not Showing

- Verify community form submission succeeded
- Check database: `Rescuer.find({ status: 'pending' })`
- Confirm admin is logged in (check token in localStorage)

### Verified Rescuers Not Appearing in Public Search

- Check rescuer `verified: true` AND `status: 'approved'` AND `disabled: false`
- Verify query filters all three conditions
- Check `/api/rescuers` endpoint returns filtered results

### JWT Token Expiration

- Token expires after 24 hours
- User will be redirected to login automatically
- Clear localStorage and login again

---

## FUTURE ENHANCEMENTS

Suggested improvements for Phase 2:

- [ ] Email notifications when submission is reviewed
- [ ] Rate limiting on community submissions (IP-based)
- [ ] Multi-admin support with role-based permissions
- [ ] Admin dashboard analytics (submission trends, etc.)
- [ ] Batch approval/rejection of pending submissions
- [ ] Rescuer performance metrics (response time, etc.)
- [ ] Integration with WhatsApp/SMS for notifications
- [ ] Document verification system for admin approvals
- [ ] Audit log export for compliance
- [ ] Two-factor authentication for admin accounts

---

## Support & Questions

For questions or issues, refer to the inline code comments in:

- `/server/src/routes/admin.js` - Admin API routes
- `/client/src/pages/Admin*.jsx` - Admin pages
- `/client/src/services/authService.js` - Auth logic
- `/server/src/models/Admin.js` - Admin schema

---

**Implementation Date:** May 2026  
**Status:** Complete & Production-Ready  
**Version:** 1.0
