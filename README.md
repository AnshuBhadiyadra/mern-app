# Felicity - Event Management System

A full-stack event management platform built for the IIIT Hyderabad college fest **Felicity**. The system enables clubs/councils to create and manage events, participants to browse and register for events, and administrators to oversee the entire platform — replacing the chaos of Google Forms, spreadsheets, and WhatsApp groups with a centralized, organized solution.

Built with the **MERN stack** (MongoDB, Express.js, React, Node.js).

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [User Roles & Workflows](#user-roles--workflows)
- [Real-Time Features](#real-time-features)
- [Advanced Features](#advanced-features)
- [Areas for Enhancement](#areas-for-enhancement)

---

## Features

### Participant Features
- **Registration & Onboarding** — Multi-step onboarding with interest selection and club following
- **Browse Events** — Search, filter (by type, eligibility), and sort events
- **Event Registration** — Register for normal events or purchase merchandise with payment proof upload
- **Custom Form Fields** — Dynamic registration forms defined by organizers
- **My Registrations** — View all registrations with status tracking, QR codes, and ticket IDs
- **Real-Time Discussion** — Socket.IO-powered live discussions on event pages
- **Follow Clubs** — Follow organizers/clubs to stay updated
- **Profile Management** — Update personal information, contact details

### Organizer Features
- **Event Management** — Full CRUD for events with draft → publish → ongoing → completed lifecycle
- **Custom Form Builder** — Add custom fields (text, number, select, checkbox, file) to registration forms
- **Merchandise Events** — Create merchandise events with items, pricing, stock management
- **Participant Management** — View registered participants, approve/reject merchandise payments
- **Attendance Tracking** — Mark attendance using ticket IDs
- **CSV Export** — Export participant lists as CSV files
- **Discord Webhooks** — Auto-post new events to Discord channels
- **Profile & Password** — Update organizer profile, change password, request admin password reset

### Admin Features
- **Organizer Management** — Create organizer accounts, approve/deactivate organizers
- **Password Reset Handling** — Review and approve/reject organizer password reset requests
- **Platform Overview** — Dashboard with statistics (total organizers, pending approvals, reset requests)

### Security Features
- **JWT Authentication** — Token-based auth with 30-day expiry
- **Role-Based Access Control** — Middleware-enforced role checks on every protected route
- **Rate Limiting** — Login (10 attempts/15min) and registration (5/hour) rate limiters
- **reCAPTCHA Support** — Optional Google reCAPTCHA verification on auth endpoints
- **Password Hashing** — bcrypt with salt rounds

---

## Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | 18+ | Runtime environment |
| Express.js | 4.18.2 | REST API framework |
| MongoDB + Mongoose | 8.1.0 | Database & ODM |
| Socket.IO | 4.8.3 | Real-time communication |
| JSON Web Token | 9.0.3 | Authentication |
| bcryptjs | 3.0.3 | Password hashing |
| Multer | 2.0.2 | File uploads |
| Nodemailer | 8.0.1 | Email service |
| QRCode | 1.5.4 | QR code generation |
| express-validator | 7.3.1 | Input validation |
| express-rate-limit | 8.2.1 | Rate limiting |
| json2csv | 6.0.0 | CSV export |
| Axios | 1.13.5 | HTTP client (Discord webhooks, reCAPTCHA) |
| Nodemon | 3.0.3 | Dev auto-restart |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19.2.0 | UI library |
| Vite | 7.3.1 | Build tool & dev server |
| React Router DOM | 7.13.0 | Client-side routing |
| Axios | 1.13.5 | HTTP client |
| Socket.IO Client | 4.8.3 | Real-time communication |
| React Toastify | 11.0.5 | Toast notifications |
| React Icons | 5.5.0 | Icon library (Feather icons) |
| date-fns | 4.1.0 | Date formatting utilities |

---

## Project Structure

```
mern-app/
├── backend/
│   ├── config/
│   │   └── db.js                   # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js       # Login, register, verify
│   │   ├── eventController.js      # Event CRUD, publish, status
│   │   ├── registrationController.js  # Register, payment, attendance
│   │   ├── adminController.js      # Organizer & reset management
│   │   ├── participantController.js   # Onboarding, follow, profile
│   │   ├── organizerController.js  # Organizer profile, password
│   │   └── discussionController.js # Discussion CRUD, pin, react
│   ├── middleware/
│   │   ├── auth.js                 # JWT protection middleware
│   │   ├── roleCheck.js            # Role-based access control
│   │   └── recaptcha.js            # Rate limiting & reCAPTCHA
│   ├── models/
│   │   ├── User.js                 # Base user (email, password, role)
│   │   ├── Participant.js          # Participant profile
│   │   ├── Organizer.js            # Organizer profile
│   │   ├── Admin.js                # Admin profile
│   │   ├── Event.js                # Event schema (normal + merchandise)
│   │   ├── Registration.js         # Registration + payment + QR
│   │   ├── Discussion.js           # Discussion messages
│   │   └── PasswordResetRequest.js # Organizer password reset requests
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── eventRoutes.js
│   │   ├── registrationRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── participantRoutes.js
│   │   ├── organizerRoutes.js
│   │   └── discussionRoutes.js
│   ├── sockets/
│   │   └── discussionSocket.js     # Socket.IO event handlers
│   ├── utils/
│   │   ├── generateToken.js        # JWT token generation
│   │   ├── emailService.js         # Nodemailer email templates
│   │   ├── qrGenerator.js          # QR code generation
│   │   └── fileUpload.js           # Multer file upload config
│   ├── scripts/
│   │   └── createAdmin.js          # Admin account seeding script
│   ├── server.js                   # Express + Socket.IO entry point
│   ├── .env                        # Environment variables
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Navbar.jsx      # Role-based navigation bar
│   │   │   │   ├── Navbar.css
│   │   │   │   ├── EventCard.jsx   # Reusable event display card
│   │   │   │   ├── EventCard.css
│   │   │   │   ├── LoadingSpinner.jsx
│   │   │   │   └── LoadingSpinner.css
│   │   │   └── ProtectedRoute.jsx  # Route guard with role checks
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # Auth state & token management
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Register.jsx
│   │   │   │   ├── Onboarding.jsx  # 3-step participant onboarding
│   │   │   │   └── Auth.css
│   │   │   ├── participant/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── BrowseEvents.jsx
│   │   │   │   ├── EventDetail.jsx # Event info + registration + discussion
│   │   │   │   ├── MyRegistrations.jsx
│   │   │   │   ├── Profile.jsx
│   │   │   │   ├── OrganizersListing.jsx
│   │   │   │   └── Participant.css
│   │   │   ├── organizer/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── CreateEvent.jsx # Event creation with form builder
│   │   │   │   ├── ManageEvent.jsx # Participants, attendance, analytics
│   │   │   │   ├── Profile.jsx
│   │   │   │   └── Organizer.css
│   │   │   └── admin/
│   │   │       ├── Dashboard.jsx
│   │   │       ├── ManageOrganizers.jsx
│   │   │       ├── PasswordResets.jsx
│   │   │       └── Admin.css
│   │   ├── services/
│   │   │   └── api.js              # Axios API service layer
│   │   ├── App.jsx                 # Root component with routing
│   │   ├── App.css                 # Global styles
│   │   ├── main.jsx                # React entry point
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── Assignment_1.md                 # Assignment specification
├── implementation.md               # Implementation guide
└── README.md                       # This file
```

---

## Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- **MongoDB Atlas** account (or local MongoDB instance)
- **Git**

---

## Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# MongoDB Connection
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority

# Server
PORT=5001

# JWT
JWT_SECRET=your_jwt_secret_key_here

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Email Service (Gmail SMTP)
GMAIL_USER=your_gmail@gmail.com
GMAIL_PASS=your_gmail_app_password

# Google reCAPTCHA (optional - skipped in dev if empty)
RECAPTCHA_SECRET_KEY=

# Admin Account (used by seed script)
ADMIN_EMAIL=admin@felicity.com
ADMIN_PASSWORD=admin123456
```

> **Gmail App Password**: Go to Google Account → Security → 2-Step Verification → App Passwords → Generate a password for "Mail".

---

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd mern-app
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 4. Configure Environment Variables

```bash
cd ../backend
cp .env.example .env   # or create .env manually as shown above
# Edit .env with your MongoDB URI, JWT secret, and email credentials
```

### 5. Seed the Admin Account

```bash
cd backend
node scripts/createAdmin.js
```

This creates the initial admin user with the credentials from your `.env` file.

### 6. Create Upload Directories

```bash
mkdir -p backend/uploads/payments backend/uploads/registrations
```

---

## Running the Application

### Development Mode

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```
The backend server starts on `http://localhost:5001`.

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```
The frontend dev server starts on `http://localhost:5173`.

### Production Build

```bash
cd frontend
npm run build
```

The production bundle is output to `frontend/dist/`.

---

## API Documentation

### Authentication (`/api/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register a new participant |
| POST | `/api/auth/login` | No | Login (returns JWT token) |
| GET | `/api/auth/verify` | Yes | Verify token & get user data |

### Events (`/api/events`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/events` | Optional | Any | List published events (with search, filters) |
| GET | `/api/events/trending` | No | Any | Get trending events |
| GET | `/api/events/:id` | Optional | Any | Get event details |
| POST | `/api/events` | Yes | Organizer | Create a new event |
| PUT | `/api/events/:id` | Yes | Organizer | Update own event |
| DELETE | `/api/events/:id` | Yes | Organizer | Delete own event |
| PATCH | `/api/events/:id/publish` | Yes | Organizer | Publish a draft event |
| PATCH | `/api/events/:id/status` | Yes | Organizer | Update event status |
| GET | `/api/events/organizer/my-events` | Yes | Organizer | List own events |

### Registrations (`/api/registrations`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/registrations/events/:eventId/register` | Yes | Participant | Register for an event |
| GET | `/api/registrations/my-registrations` | Yes | Participant | Get own registrations |
| GET | `/api/registrations/events/:eventId/participants` | Yes | Organizer | Get event participants |
| PATCH | `/api/registrations/:id/payment` | Yes | Organizer | Approve/reject payment |
| POST | `/api/registrations/:id/payment-proof` | Yes | Participant | Upload payment proof |
| POST | `/api/registrations/mark-attendance` | Yes | Organizer | Mark attendance by ticket ID |
| GET | `/api/registrations/events/:eventId/export-csv` | Yes | Organizer | Export participants as CSV |

### Admin (`/api/admin`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/admin/organizers` | Yes | Admin | Create organizer account |
| GET | `/api/admin/organizers` | Yes | Admin | List all organizers |
| PATCH | `/api/admin/organizers/:id/approve` | Yes | Admin | Approve an organizer |
| PATCH | `/api/admin/organizers/:id/deactivate` | Yes | Admin | Deactivate an organizer |
| GET | `/api/admin/password-resets` | Yes | Admin | List password reset requests |
| PATCH | `/api/admin/password-resets/:id` | Yes | Admin | Handle password reset request |
| GET | `/api/admin/stats` | Yes | Admin | Get platform statistics |

### Participants (`/api/participants`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/participants/onboarding` | Yes | Participant | Complete onboarding |
| GET | `/api/participants/profile` | Yes | Participant | Get participant profile |
| PUT | `/api/participants/profile` | Yes | Participant | Update participant profile |
| POST | `/api/participants/follow/:organizerId` | Yes | Participant | Follow/unfollow a club |
| GET | `/api/participants/clubs` | Yes | Participant | List all approved clubs |
| GET | `/api/participants/dashboard` | Yes | Participant | Get dashboard data |

### Organizers (`/api/organizers`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/organizers/profile` | Yes | Organizer | Get organizer profile |
| PUT | `/api/organizers/profile` | Yes | Organizer | Update organizer profile |
| POST | `/api/organizers/change-password` | Yes | Organizer | Change password |
| POST | `/api/organizers/request-password-reset` | Yes | Organizer | Request admin password reset |

### Discussions (`/api/discussions`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/discussions/events/:eventId` | Yes | Auth'd | Get event discussion messages |
| POST | `/api/discussions/events/:eventId` | Yes | Auth'd | Post a discussion message |
| PATCH | `/api/discussions/:id/pin` | Yes | Organizer | Pin/unpin a message |
| POST | `/api/discussions/:id/react` | Yes | Auth'd | React to a message (emoji) |
| DELETE | `/api/discussions/:id` | Yes | Auth'd | Delete own message |

---

## User Roles & Workflows

### Participant Flow
1. **Register** → Create account with email and password
2. **Onboarding** → Select participant type (IIIT/non-IIIT), interests, follow clubs
3. **Browse** → Search and filter published events
4. **Register for Event** → Fill custom form, select merchandise (if applicable), upload payment proof
5. **Track** → View registrations, download QR codes, check payment status
6. **Discuss** → Join real-time discussions on event pages
7. **Attend** → Show QR code / ticket ID at event for attendance marking

### Organizer Flow
1. **Account Created by Admin** → Receives credentials via email
2. **Create Events** → Draft events with custom form fields, merchandise items
3. **Publish** → Make events visible to participants
4. **Manage** → View registrations, approve payments, mark attendance
5. **Export** → Download participant data as CSV
6. **Analyze** → View registration statistics per event

### Admin Flow
1. **Login** → Using seeded admin credentials
2. **Create Organizers** → Register club/council accounts with auto-generated or custom passwords
3. **Approve Organizers** → Review and approve new organizer accounts
4. **Handle Resets** → Approve/reject organizer password reset requests

---

## Real-Time Features

### Socket.IO Discussion Forum

The application uses Socket.IO for real-time event discussions:

- **Namespace**: `/discussions`
- **Events**:
  - `joinEvent` — Join an event's discussion room
  - `leaveEvent` — Leave a discussion room
  - `sendMessage` — Send a message (broadcast to room)
  - `newMessage` — Receive a new message
  - `typing` / `userTyping` — Typing indicators

**Connection Flow:**
1. Client connects to `http://localhost:5001/discussions`
2. Client emits `joinEvent` with `eventId`
3. Messages are broadcast to all users in the same event room
4. Real-time updates without page refresh

---

## Advanced Features (Part 2 — Tier Selection)

### Tier Selection Summary

| Tier | Feature | Marks |
|------|---------|-------|
| **Tier A** | Merchandise Payment Approval Workflow | 8 |
| **Tier A** | QR Scanner & Attendance Tracking | 8 |
| **Tier B** | Real-Time Discussion Forum | 6 |
| **Tier B** | Organizer Password Reset Workflow | 6 |
| **Tier C** | Bot Protection (reCAPTCHA + Rate Limiting) | 2 |
| **Total** | | **30** |

---

### Tier A Features (2 selected — 16 marks)

#### 1. Merchandise Payment Approval Workflow [8 Marks]

**Justification:** Felicity sells merchandise (T-shirts, hoodies, kits) and requires a verified payment workflow to avoid fraud. This feature ensures seamless purchase verification by organizers before fulfillment.

**Implementation:**
- Participants place merchandise orders which enter a `PENDING` approval state
- Participants upload payment proof (image) via the My Registrations page
- Organizers see a dedicated Participants tab with payment status (Pending/Approved/Rejected) and action buttons
- On approval: order status becomes `CONFIRMED`, stock is decremented, unique ticket with QR code is generated, and a confirmation email is sent via Nodemailer
- On rejection: organizer provides a reason, participant sees rejection notice
- No QR code is generated while the order is in pending or rejected state
- **Files:** `registrationController.js` (approvePayment, rejectPayment, uploadPaymentProof), `MyRegistrations.jsx` (upload UI), `ManageEvent.jsx` (approve/reject UI)

#### 2. QR Scanner & Attendance Tracking [8 Marks]

**Justification:** Physical events need fast check-in. A camera-based QR scanner eliminates manual ticket ID entry and enables live attendance tracking.

**Implementation:**
- Built-in QR code scanner using `html5-qrcode` library for scanning via device camera
- Manual ticket ID entry as fallback for exceptional cases
- Attendance marked with timestamp and recorded against operator (audit logging via `markedBy` field)
- Duplicate scan rejection (returns error if attendance already marked)
- Participants tab shows live scanned vs. not-yet-scanned status
- CSV export of attendance reports with attendance column
- **Files:** `QrScanner.jsx` (camera component), `ManageEvent.jsx` (attendance tab), `registrationController.js` (markAttendance), `Registration.js` (attendance schema)

---

### Tier B Features (2 selected — 12 marks)

#### 1. Real-Time Discussion Forum [6 Marks]

**Justification:** Event pages need a communication channel between organizers and registered participants for Q&A, announcements, and community building.

**Implementation:**
- Real-time messaging via Socket.IO on the Event Details page
- Only registered (confirmed) participants can post messages
- Organizers can moderate: pin/unpin messages and delete messages (with UI buttons visible only to organizers)
- Message threading: participants can reply to specific messages with visual reply-reference indicators
- Reaction system: 6 emoji reactions (thumbs up, heart, smile, fire, party, thinking) with toggle support
- Organizer messages are visually distinguished with a purple left-border and "Organizer" badge
- **Files:** `discussionController.js`, `Discussion.js` (with replyTo field), `discussionRoutes.js`, `EventDetail.jsx` (discussion tab), `discussionSocket.js`

#### 2. Organizer Password Reset Workflow [6 Marks]

**Justification:** Organizer accounts are provisioned by the admin, so self-service password reset isn't appropriate. This admin-mediated reset workflow maintains security while providing a clear audit trail.

**Implementation:**
- Organizers request password reset with a reason from their Profile page
- Admin sees all pending requests in a dedicated Password Reset Requests page with organizer name, date, and reason
- Admin can approve (auto-generates new password, sends via email) or reject with comments
- Request status tracking: Pending, Approved, Rejected with full history
- Password reset history visible to organizers on their profile
- **Files:** `adminController.js` (approvePasswordReset, rejectPasswordReset), `organizerController.js` (requestPasswordReset), `PasswordResetRequest.js`, `PasswordResets.jsx` (admin UI), `Profile.jsx` (organizer)

---

### Tier C Feature (1 selected — 2 marks)

#### Bot Protection [2 Marks]

**Justification:** Public-facing registration and login pages are vulnerable to automated bot attacks. Rate limiting and CAPTCHA provide essential protection.

**Implementation:**
- Google reCAPTCHA v2/v3 support on login and registration endpoints (configurable via `RECAPTCHA_SECRET_KEY` env var)
- Rate limiting: login (10 attempts per 15 minutes), registration (5 per hour) using `express-rate-limit`
- Graceful degradation: reCAPTCHA is optional in development (skipped if `RECAPTCHA_SECRET_KEY` is empty)
- **Files:** `recaptcha.js` (middleware), `authRoutes.js` (rate limiters applied)

---

### Additional Core Features

#### QR Code Generation
- Unique QR codes generated for each registration using the `qrcode` library
- QR contains encoded ticket ID, event ID, and participant ID
- Displayed as base64 data URLs in registration cards

#### Discord Webhook Integration
- Organizers can configure a Discord webhook URL in their profile
- When an event is published, it auto-posts to the configured Discord channel
- Posts include event name, description, type, fee, deadline, and organizer name

#### Fuzzy Search
- Fuse.js-powered fuzzy search across event names, organizer names, descriptions, and tags
- Weighted scoring: event name (40%), organizer name (30%), description (20%), tags (10%)
- Configurable threshold for match sensitivity

#### Interest-Based Event Ordering
- Participant interests (set during onboarding) influence event ordering on Browse Events page
- Events matching participant's interest tags are boosted to the top of search results

#### CSV Export
- Organizers can export participant lists as CSV files
- Includes participant name, email, college, ticket ID, registration status, payment status, attendance

#### Email Notifications
- **Ticket Emails** — Sent after successful registration with QR code and event details
- **Credential Emails** — Sent to new organizers with their login credentials
- **Password Reset Emails** — Sent when admin approves a password reset request

#### Dynamic Custom Form Fields
- Organizers can define custom registration fields per event
- Supported field types: text, number, select (dropdown), checkbox, file, textarea, email, tel
- Forms are locked after the first registration is received

#### Merchandise System
- Events can be typed as MERCHANDISE for selling items
- Each item has: name, price, stock count, size/color variants
- Purchase limit per participant is configurable
- Stock automatically decrements on payment approval

---

## Default Credentials

After running the admin seed script:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@felicity.com | admin123456 |

> **Note:** Change these in production by updating the `.env` file before running the seed script.

---

## License

ISC

---

*Built for the Felicity Event Management System assignment — DASS (Design & Analysis of Software Systems), IIIT Hyderabad.*
