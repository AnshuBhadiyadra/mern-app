# Email Setup & Testing Guide

This guide explains how to configure and test the email functionality in the Felicity Event Management System.

---

## Overview

The system sends three types of emails:

1. **Ticket Emails** — Sent to participants after successful event registration, containing ticket ID, QR code, and event details.
2. **Organizer Credential Emails** — Sent when the admin creates a new organizer account, containing login email and password.
3. **Password Reset Emails** — Sent when the admin approves an organizer's password reset request, containing the new auto-generated password.

All emails are sent via **Gmail SMTP** using the `nodemailer` library.

---

## Step 1: Create a Gmail App Password

Gmail requires an **App Password** (not your regular password) for SMTP access. Your regular Gmail password will NOT work.

### Prerequisites
- A Gmail account (we use `abhishekbhadiyadra0@gmail.com`)
- **2-Step Verification** must be enabled on the Gmail account

### Instructions

1. **Enable 2-Step Verification** (if not already enabled):
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Scroll to "How you sign in to Google"
   - Click "2-Step Verification" and follow the setup wizard
   - You'll need a phone number for verification codes

2. **Generate an App Password**:
   - Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Or: Google Account → Security → 2-Step Verification → App Passwords (at the bottom)
   - In the "App name" field, type `Felicity` (or any name you want)
   - Click **Create**
   - Google will display a **16-character password** like: `abcd efgh ijkl mnop`
   - **Copy this password** (remove spaces) — you won't see it again!

3. **Update the `.env` file** in `backend/.env`:

   ```env
   GMAIL_USER=abhishekbhadiyadra0@gmail.com
   GMAIL_PASS=abcdefghijklmnop
   ```

   Replace `abcdefghijklmnop` with the actual 16-character App Password (no spaces).

4. **Restart the backend server** to pick up the new environment variables.

---

## Step 2: Verify Email Configuration

After updating `.env`, start the backend server:

```bash
cd backend
npm run dev
```

If the email is configured correctly, you will NOT see any `[EMAIL SKIP]` messages in the console when emails are triggered. If you see `[EMAIL SKIP] Gmail not configured`, double-check that:
- `GMAIL_USER` is set correctly
- `GMAIL_PASS` is set to the App Password (NOT your regular Gmail password)
- There are no extra spaces or quotes around the values

---

## Step 3: Test Email Scenarios

### Test 1: Ticket Email (Participant Registration)

1. Login as a **participant** (or register a new account)
2. Browse to a **published event**
3. Click **Register Now**
4. After successful registration, the system sends a ticket email to the participant's registered email
5. Check the participant's email inbox for the ticket with QR code

**What to expect in the email:**
- Subject: "Your Ticket for [Event Name] - Felicity"
- Body: Participant name, event name, ticket ID, event date
- Embedded QR code image
- Note about presenting QR at venue

### Test 2: Organizer Credential Email

1. Login as **admin** (`admin@felicity.com` / `admin123456`)
2. Go to **Manage Clubs/Organizers**
3. Click **Add New Club/Organizer**
4. Fill in the organizer details — use `abhishekbhadiyadra0@gmail.com` as the login email to receive the email yourself
5. Submit the form
6. The system sends credentials to the organizer's email

**What to expect in the email:**
- Subject: "Welcome to Felicity - Your Organizer Account"
- Body: Organizer name, login email, auto-generated password

### Test 3: Password Reset Email

1. Login as the **organizer** (using credentials from Test 2)
2. Go to **Profile** → Password section
3. Click "Request Admin Reset" and provide a reason
4. Login as **admin**
5. Go to **Password Reset Requests**
6. Approve the request
7. The system generates a new password and sends it via email

**What to expect in the email:**
- Subject: "Password Reset Approved - Felicity Organizer Account"
- Body: Organizer name, new auto-generated password

---

## Recommended Test Accounts

| Purpose | Email | Notes |
|---------|-------|-------|
| Gmail SMTP Sender | `abhishekbhadiyadra0@gmail.com` | Set in `GMAIL_USER` env var |
| Participant testing | `abhishekbhadiyadra0@gmail.com` | Register with this email to receive ticket emails |
| Organizer testing | `abhishekbhadiyadra0@gmail.com` | Create organizer with this email to receive credentials |
| Admin | `admin@felicity.com` | Seeded account, emails are sent FROM the GMAIL_USER address |

> **Tip:** Since you have one spare email, use it for both SMTP sending AND receiving. Register as a participant with `abhishekbhadiyadra0@gmail.com` and all ticket emails will arrive in the same inbox.

---

## Troubleshooting

### "Email not configured" / `[EMAIL SKIP]` in Console

- The `GMAIL_USER` or `GMAIL_PASS` environment variable is empty or not set
- Solution: Update `backend/.env` and restart the server

### "Invalid login" / Authentication Error

- Your `GMAIL_PASS` is set to your regular Gmail password instead of an App Password
- Solution: Generate an App Password (see Step 1)

### "Less secure app access" Error

- Google blocked the login attempt
- Solution: Make sure 2-Step Verification is enabled and you're using an App Password

### Emails Going to Spam

- Gmail may flag emails from new senders as spam
- Solution: Check the spam folder; mark as "Not spam" to whitelist

### SMTP Connection Timeout

- Firewall or network is blocking outbound SMTP connections
- Solution: Try a different network, or check if port 465/587 is open

---

## How the Email System Works (Technical)

The email service is in `backend/utils/emailService.js`:

- **`createTransporter()`** — Creates a Nodemailer transport using Gmail SMTP
- **`isEmailConfigured()`** — Returns `true` only if both `GMAIL_USER` and `GMAIL_PASS` are set
- **Graceful degradation** — If email is not configured, the system logs ticket/credential details to the console instead of crashing. Registration and account creation still work; only the email delivery is skipped.

### Email Templates

All emails use inline HTML/CSS styling for maximum email client compatibility:
- Purple gradient headers matching the Felicity branding
- Ticket details in a bordered card layout
- QR code embedded as a base64 `<img>` tag
- Warning/important sections with yellow background

### Non-Blocking Architecture

Email sending is **non-blocking** — the registration/creation API responds immediately, and the email is sent asynchronously:

```javascript
sendTicketEmail(user.email, ticketData).catch(err => console.error('Email failed:', err));
```

This means even if the email fails (e.g., invalid recipient, network issue), the registration itself succeeds and the user can still see their ticket in the My Registrations page.
