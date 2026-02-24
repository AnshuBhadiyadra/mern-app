# Felicity Event Management System — Complete Testing Guide

> **Version**: 1.0  
> **Stack**: MongoDB Atlas · Express.js · React 19 + Vite · Node.js  
> **Ports**: Backend `5001` | Frontend `5173`

---

## Table of Contents

1. [Environment Setup](#1-environment-setup)
2. [Admin — Login & Dashboard](#2-admin--login--dashboard)
3. [Admin — Manage Organizers](#3-admin--manage-organizers)
4. [Admin — Password Reset Requests](#4-admin--password-reset-requests)
5. [Organizer — Login & Profile](#5-organizer--login--profile)
6. [Organizer — Create Event (Normal)](#6-organizer--create-event-normal)
7. [Organizer — Create Event (Merchandise)](#7-organizer--create-event-merchandise)
8. [Organizer — Publish & Manage Event](#8-organizer--publish--manage-event)
9. [Organizer — Participants & Payment Approval](#9-organizer--participants--payment-approval)
10. [Organizer — Attendance Tracking](#10-organizer--attendance-tracking)
11. [Organizer — Analytics & CSV Export](#11-organizer--analytics--csv-export)
12. [Participant — Registration](#12-participant--registration)
13. [Participant — Onboarding (Interests)](#13-participant--onboarding-interests)
14. [Participant — Browse & Filter Events](#14-participant--browse--filter-events)
15. [Participant — Register for Normal Event](#15-participant--register-for-normal-event)
16. [Participant — Purchase Merchandise](#16-participant--purchase-merchandise)
17. [Participant — Upload Payment Proof](#17-participant--upload-payment-proof)
18. [Participant — My Registrations / History](#18-participant--my-registrations--history)
19. [Participant — View Ticket & QR Code](#19-participant--view-ticket--qr-code)
20. [Participant — Clubs / Organizers Listing](#20-participant--clubs--organizers-listing)
21. [Participant — Follow / Unfollow Clubs](#21-participant--follow--unfollow-clubs)
22. [Participant — Organizer Detail Page](#22-participant--organizer-detail-page)
23. [Participant — Profile & Settings](#23-participant--profile--settings)
24. [Discussion Forum](#24-discussion-forum)
25. [Discord Webhook Notification](#25-discord-webhook-notification)
26. [Password Reset Workflow (Organizer → Admin)](#26-password-reset-workflow-organizer--admin)
27. [Edge Cases & Negative Tests](#27-edge-cases--negative-tests)
28. [Responsive / Mobile Testing](#28-responsive--mobile-testing)
29. [Visual / UI Effects](#29-visual--ui-effects)

---

## 1. Environment Setup

### 1.1 Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 18+ |
| npm | 9+ |
| Browser | Chrome / Firefox / Edge (latest) |
| Internet | Required (MongoDB Atlas cloud DB) |

### 1.2 Start the Backend

```bash
cd backend
npm install          # first time only
npm run dev          # starts on http://localhost:5001
```

**Expected output**: `Server running on port 5001` and `MongoDB Connected: ...`

If you see a MongoDB connection error, check your internet connection — the database is hosted on MongoDB Atlas.

### 1.3 Start the Frontend

Open a **separate terminal**:

```bash
cd frontend
npm install          # first time only
npm run dev          # starts on http://localhost:5173
```

**Expected output**: Vite dev server URL `http://localhost:5173/`

### 1.4 Quick Smoke Test

1. Open `http://localhost:5173` in your browser.
2. You should see the **Login page** with the Felicity branding, a glowing card effect, and a sparkle cursor trail.
3. The page should be fully styled — dark theme with purple/blue gradients.

---

## 2. Admin — Login & Dashboard

### 2.1 Login as Admin

| Field | Value |
|-------|-------|
| Email | `admin@felicity.com` |
| Password | `admin123456` |

**Steps**:
1. Go to `http://localhost:5173/login`.
2. Enter the admin credentials above.
3. Click **Login**.
4. You should be redirected to the **Admin Dashboard** (`/admin/dashboard`).

**Verify**:
- Top navbar shows: **Dashboard**, **Manage Organizers**, **Password Resets**, and a **Logout** button.
- Dashboard displays statistics cards (Total Events, Active Events, Total Registrations, Revenue).
- A table of **Recent Events** is shown below the stats.

### 2.2 Dashboard Stats

- **Total Events**: Count of all events in the system.
- **Active Events**: Events with status `PUBLISHED` or `ONGOING`.
- **Total Registrations**: Sum of all registrations across events.
- **Revenue**: Total revenue generated from registration fees.

Click on individual stats cards or event rows to verify they display correct numbers.

---

## 3. Admin — Manage Organizers

**Navigate**: Click **Manage Organizers** in the admin navbar (or go to `/admin/organizers`).

### 3.1 Create a New Organizer

1. Click the **"Create Organizer"** button (top-right area).
2. A form will expand with three fields:
   - **Email** (required) — Enter a valid email, e.g. `techclub@felicity.com`
   - **Organization Name** (required) — e.g. `Tech Club`
   - **Category** (dropdown) — Choose from: Technical, Cultural, Sports, Literary, Arts, Music, Dance, Drama, Gaming, Social, Management, Other
3. Click **Create**.
4. **Expected**:
   - A toast notification appears showing the **email and auto-generated password** (visible for ~15 seconds).
   - **COPY THE PASSWORD** — you will need it to log in as this organizer.
   - The new organizer appears in the table below.

### 3.2 Approve an Organizer

- New organizers are created with `isApproved: false`.
- In the organizers table, find the newly created organizer.
- Click the **Approve** (checkmark) button in the Actions column.
- The status should change to show a green checkmark under "Approved".

### 3.3 Deactivate an Organizer

- Click the **Deactivate** button (red) for any active organizer.
- A confirmation dialog appears — confirm it.
- The organizer's status changes to Inactive.
- **Verify**: Try logging in as that organizer — you should get a "Account is inactive" error.

### 3.4 Test Organizer Table

- Verify all columns are displayed: Organization, Email, Category, Status, Approved, Actions.
- Create at least 2 organizers with different categories to test the table.

---

## 4. Admin — Password Reset Requests

**Navigate**: Click **Password Resets** in the admin navbar (or go to `/admin/password-resets`).

### 4.1 Initial State

- If no organizers have requested a password reset, the page should show "No password reset requests" or an empty list.
- Four filter tabs should be visible: **PENDING**, **APPROVED**, **REJECTED**, **ALL**.

### 4.2 Test Password Reset Flow

> This test requires an **organizer account** already created. See [Section 5.4](#54-request-password-reset) for how an organizer submits a reset request.

1. After an organizer submits a reset request, come back to this page.
2. Switch to the **PENDING** tab — the request should appear.
3. Each request card shows: Organizer Name, Email, Status Badge, Reason, Requested Date.

### 4.3 Approve a Reset

1. Click **Approve** on a pending request.
2. **Expected**: Toast says "Password reset approved! New password sent to organizer."
3. The request moves to APPROVED status.
4. The organizer can now log in with the new auto-generated password.

### 4.4 Reject a Reset

1. Click **Reject** on a pending request.
2. A browser prompt asks for a rejection reason — type something like "Please contact admin directly".
3. **Expected**: Toast says "Request rejected". Status changes to REJECTED.
4. Admin comments appear on the card.

---

## 5. Organizer — Login & Profile

### 5.1 Login as Organizer

1. Go to `http://localhost:5173/login`.
2. Enter the organizer email and password (from [Section 3.1](#31-create-a-new-organizer)).
3. Click **Login**.
4. **Expected**: Redirected to **Organizer Dashboard** (`/organizer/dashboard`).

**If you get "Organizer account pending approval"**, go back to admin and approve the organizer first (Section 3.2).

### 5.2 Organizer Dashboard

- Navbar shows: **Dashboard**, **Create Event**, **Ongoing Events**, **Profile**, **Logout**.
- Dashboard shows the organizer's events (empty initially).
- Stats cards show counts for Total Events, Published, Ongoing, Completed.
- A **Create Your First Event** prompt may appear if no events exist.

### 5.3 Edit Organizer Profile

1. Click **Profile** in the navbar (or go to `/organizer/profile`).
2. **Editable fields**:
   - **Description** (textarea, max 1000 chars) — "Tell participants about your club..."
   - **Contact Email**
   - **Contact Number** (max 10 chars)
   - **Discord Webhook URL** — for Discord notifications when events are published
3. **Non-editable fields** (display only): Organization Name, Email, Category.
4. Edit the description and contact info, then click **Save**.
5. **Verify**: Refresh the page — changes should persist.

### 5.4 Request Password Reset

1. On the organizer profile page, find the **"Forgot your password?"** toggle at the bottom.
2. Click it to expand the reset request form.
3. Enter a reason (e.g., "Forgot my password").
4. Click **Request Reset**.
5. **Expected**: Toast notification confirming the request was submitted.
6. **Admin side**: The request now appears in the admin's Password Resets page (see Section 4).

### 5.5 Change Password (Organizer)

1. On the profile page, find the **Change Password** section.
2. Enter:
   - **Current Password**: your existing password
   - **New Password**: at least 6 characters
3. Click **Change Password**.
4. **Expected**: Success toast. Log out and log back in with the new password to verify.

---

## 6. Organizer — Create Event (Normal)

**Navigate**: Click **Create Event** in the organizer navbar.

### 6.1 Fill Out Basic Information

| Field | What to Enter | Required? |
|-------|---------------|-----------|
| Event Name | `Tech Workshop 2025` | Yes |
| Description | `A hands-on workshop on web development using MERN stack.` | Yes |
| Event Type | **Normal** (dropdown) | Yes |
| Eligibility | **All** / **IIIT Only** / **External Only** (dropdown) | No (defaults to All) |

### 6.2 Fill Out Schedule & Venue

| Field | What to Enter | Required? |
|-------|---------------|-----------|
| Start Date/Time | A future date, e.g. tomorrow at 10:00 AM | Yes |
| End Date/Time | Same day at 5:00 PM (must be AFTER start) | Yes |
| Registration Deadline | Before the start date/time | No |
| Venue | `Himalaya 102` | No |

### 6.3 Registration Settings

| Field | What to Enter | Required? |
|-------|---------------|-----------|
| Registration Limit | `50` (min 1) | No |
| Registration Fee (₹) | `0` for free, or `100` for paid | No |
| Tags | `tech, workshop, webdev` (comma-separated) | No |

### 6.4 Custom Form Fields (Optional)

1. Click **"Add Field"** button.
2. A new field row appears. Fill in:
   - **Field Name**: `tshirt_size`
   - **Field Type**: Dropdown (select from: Text, Number, Email, Text Area, Dropdown)
   - Check **Required** if needed.
3. Add a second field:
   - **Field Name**: `dietary_preference`
   - **Field Type**: Text
4. You can reorder fields using the order property and remove them with the remove button.

### 6.5 Submit

1. Click **Create Event**.
2. **Expected**: Redirected to the event management page (`/organizer/events/:id`).
3. The event starts in **DRAFT** status — it is NOT visible to participants yet.

**Negative Tests**:
- Try submitting without a name → validation error.
- Set end date before start date → error.
- Set registration deadline after start date → error.

---

## 7. Organizer — Create Event (Merchandise)

### 7.1 Same as Normal + Merchandise Section

1. Follow steps 6.1–6.4 but set **Event Type** to **Merchandise**.
2. A new **Merchandise Items** section appears at the bottom.

### 7.2 Add Merchandise Items

1. Set **Purchase Limit Per User**: e.g. `3`.
2. Click **"Add Item"** button.
3. Fill in for first item:
   - **Item Name**: `Event T-Shirt`
   - **Price (₹)**: `499`
   - **Stock**: `100`
4. Add a second item:
   - **Item Name**: `Event Mug`
   - **Price (₹)**: `199`
   - **Stock**: `50`
5. Click **Create Event**.
6. **Expected**: Event created in DRAFT with merchandise details saved.

---

## 8. Organizer — Publish & Manage Event

### 8.1 Publish an Event

1. Go to the event management page (click on a DRAFT event from the dashboard).
2. Click the **"Publish"** button in the header.
3. **Expected**:
   - Status changes from `DRAFT` to `PUBLISHED`.
   - The event is now visible to participants on the Browse Events page.
   - If the organizer has a Discord webhook configured, a Discord notification is sent.

### 8.2 Manage Event — Overview Tab

- Shows: Description, Venue, Eligibility, Registration Fee, Current Registrations, Registration Limit, Registration Deadline, and Tags.
- While in DRAFT, all fields are editable.
- While in PUBLISHED, only Description, Registration Deadline (can only extend), and Registration Limit (can only increase) are editable.

### 8.3 Close an Event

1. On a PUBLISHED or ONGOING event, click **"Close Event"**.
2. A confirmation dialog appears.
3. Confirm — the event status changes to `CLOSED` or `COMPLETED`.
4. **Verify**: The event is no longer accepting registrations on the participant side.

### 8.4 Auto Status Transitions

- Events automatically transition from `PUBLISHED` → `ONGOING` when `eventStartDate` is reached.
- Events automatically transition from `ONGOING` → `COMPLETED` when `eventEndDate` is reached.
- To test this, create events with start/end times very close to the current time.

---

## 9. Organizer — Participants & Payment Approval

### 9.1 View Participants

1. Go to a published event's management page.
2. Click the **Participants** tab.
3. **Expected**: A table listing all registered participants with columns: Name, Email, Status, Payment, Ticket ID, Attendance, Actions.
4. Use the **search bar** to filter by participant name or email (press Enter to search).

### 9.2 Approve Merchandise Payment

> Prerequisite: A participant must have registered for a merchandise event and uploaded payment proof.

1. In the Participants tab, find a participant with **Payment: PENDING** and a payment proof uploaded.
2. Click the **Approve** (checkmark) button.
3. **Expected**:
   - Payment status changes to `APPROVED`.
   - Registration status changes to `CONFIRMED`.
   - Merchandise stock is decremented.
   - A ticket and QR code are generated for the participant.
   - (If email configured) Ticket email is sent.

### 9.3 Reject Merchandise Payment

1. Find a participant with PENDING payment.
2. Click the **Reject** (X) button.
3. A prompt asks for a rejection reason — enter something like "Insufficient payment".
4. **Expected**:
   - Payment status changes to `REJECTED`.
   - Registration status changes to `REJECTED`.
   - Merchandise stock is NOT decremented (items returned to pool).

---

## 10. Organizer — Attendance Tracking

### 10.1 Mark Attendance by Ticket ID

1. Go to the **Attendance** tab on an event's management page.
2. Enter a valid ticket ID in the format `FEL-XXXXXX`.
3. Click **"Mark"** (or press Enter).
4. **Expected**:
   - Success message: "Attendance marked for [Participant Name]".
   - The participant's attendance column in the Participants tab shows a checkmark.

### 10.2 Test Invalid Ticket

- Enter a random/invalid ticket ID.
- **Expected**: Error message — "Ticket not found" or similar.

### 10.3 Test Duplicate Attendance

- Try marking the same ticket ID again.
- **Expected**: Error message — "Attendance already marked" with the previous timestamp.

---

## 11. Organizer — Analytics & CSV Export

### 11.1 View Analytics

1. Go to the **Analytics** tab on an event's management page.
2. **Expected**: Cards showing:
   - **Total Registrations**: number of all registrations
   - **Confirmed**: registrations with `CONFIRMED` status
   - **Pending**: registrations with `PENDING` status
   - **Attendance**: number of participants who attended
   - **Revenue (₹)**: total fees collected

### 11.2 Export Participants CSV

1. Go to the **Participants** tab.
2. Click the **"Export CSV"** button.
3. **Expected**: A `.csv` file downloads with columns: Ticket ID, First Name, Last Name, Email, Contact, College, Type, Status, Payment, Attendance, Reg Date.
4. Open the CSV and verify the data matches the participants table.

---

## 12. Participant — Registration

### 12.1 Register as IIIT Participant

1. Go to `http://localhost:5173/register`.
2. Select **Role**: Participant.
3. Fill in:
   - **First Name**: `John`
   - **Last Name**: `Doe`
   - **Email**: Must end with `@iiit.ac.in` or `@students.iiit.ac.in` (e.g., `john.doe@students.iiit.ac.in`)
   - **Password**: At least 6 characters
   - **Participant Type**: `IIIT`
   - **College Name**: `IIIT Hyderabad`
   - **Contact Number**: `9876543210`
4. Click **Register**.
5. **Expected**: Account created, redirected to onboarding.

### 12.2 Register as Non-IIIT (External) Participant

1. Same as above but:
   - **Email**: Any non-IIIT email (e.g., `john@gmail.com`)
   - **Participant Type**: `Non-IIIT`
   - **College Name**: `Some Other College`
2. Click **Register**.
3. **Expected**: Account created successfully.

### 12.3 Negative Tests

- **IIIT type with non-IIIT email**: Select `IIIT` but enter `john@gmail.com` → Should show error: email must end with `@iiit.ac.in` or `@students.iiit.ac.in`.
- **Duplicate email**: Try registering with an already-used email → Should show "User already exists" error.
- **Missing required fields**: Leave any required field empty → Validation error.
- **Short password**: Enter less than 6 characters → Error.

---

## 13. Participant — Onboarding (Interests)

### 13.1 Select Interests

1. After registration, you should be redirected to the Onboarding page.
2. A grid of interest topics is displayed: Technology, Music, Dance, Sports, Art, Literature, Gaming, Photography, Food, Travel, Science, Business, Health, Fashion, Cinema.
3. Click on interests to select them (they highlight when selected).
4. Click **Continue** / **Save**.
5. **Expected**: Interests are saved to your profile. You are redirected to the Participant Dashboard.

### 13.2 Skip Onboarding

- You can skip or continue with no selections — the dashboard should still load.

---

## 14. Participant — Browse & Filter Events

**Navigate**: Click **Browse Events** in the participant navbar (or go to `/participant/events`).

### 14.1 View All Published Events

- All events with status `PUBLISHED` or `ONGOING` should appear as cards in a grid.
- Each card shows: Event Name, Organizer Name, Date, Type badge, Fee.

### 14.2 Search Events

1. Type a keyword in the **search bar** (e.g., `tech`).
2. Press Enter or click the search icon.
3. **Expected**: Only events matching the search term appear.

### 14.3 Filter by Category

- Use the **category/type filter** dropdown (if available).
- Select a category and verify events are filtered accordingly.

### 14.4 Filter by Date Range

1. Click on date filter inputs labeled **From Date** and **To Date**.
2. Select a date range.
3. **Expected**: Only events within that date range are displayed.

### 14.5 Followed Clubs Toggle

1. Click the **"Followed Clubs"** toggle button in the toolbar.
2. When active (highlighted), only events from clubs you follow are shown.
3. When inactive, all events are shown.
4. **Prerequisite**: You must follow at least one club first (see [Section 21](#21-participant--follow--unfollow-clubs)).

### 14.6 Trending Events Section

1. Click the **"Trending"** toggle button.
2. A "Trending Events" section appears showing the top 5 events with the most registrations in the last 24 hours.
3. If no events have recent registrations, it falls back to events with the highest total registrations.

---

## 15. Participant — Register for Normal Event

### 15.1 Register for a Free Event

1. Click on a **Normal** event card to open the event detail page.
2. Click the **Register** tab.
3. If the event has custom form fields, fill them in.
4. Click **"Register Now"**.
5. **Expected**:
   - Success message.
   - Redirected to My Registrations page.
   - Registration status is `CONFIRMED`.
   - A ticket ID (format `FEL-XXXXXX`) is generated.
   - A QR code is generated.

### 15.2 Register for a Paid Event

1. Same as above, but the event has a registration fee.
2. After registering, the registration status is `CONFIRMED` but payment status is `PENDING`.
3. You need to upload payment proof (see [Section 17](#17-participant--upload-payment-proof)).

### 15.3 Custom Form Fields

- If the event has custom form fields (text, number, email, textarea, dropdown):
  - Fill in all **required** fields.
  - Try submitting without a required field → validation should prevent submission.
  - Dropdown fields show options configured by the organizer.

### 15.4 Negative Tests

- **Closed event**: Try registering for a CLOSED/COMPLETED event → "Registration closed" message.
- **Deadline passed**: Event with passed deadline → "Registration deadline has passed".
- **Limit reached**: Event at full capacity → "Registration limit reached".
- **Duplicate registration**: Try registering for the same event twice → "Already registered".
- **Eligibility mismatch**: IIIT-only event as Non-IIIT participant → Rejected. External-only event as IIIT participant → Rejected.

---

## 16. Participant — Purchase Merchandise

### 16.1 Browse and Select Merchandise

1. Open a **Merchandise** type event detail page.
2. Click the **Register** tab.
3. Merchandise items are displayed with: Name, Price, Available Stock.
4. Use the **quantity selectors** to choose how many of each item you want.
   - Maximum quantity per item is the lesser of: available stock OR `purchaseLimitPerUser`.
5. At least one item must have quantity > 0.

### 16.2 Place Order

1. Fill in any custom form fields (if present).
2. Click **"Place Order"**.
3. **Expected**:
   - Registration created with status `PENDING`.
   - Payment status is `PENDING`.
   - You are redirected to My Registrations.
   - No ticket is generated yet — it will be generated after payment approval.

### 16.3 Negative Tests

- **Zero quantity**: Submit without selecting any items → Error or validation.
- **Over stock**: Try selecting more than available stock → Input max prevents this.
- **Duplicate purchase**: Try purchasing from same event again → "Already registered".

---

## 17. Participant — Upload Payment Proof

### 17.1 Upload Proof

1. Go to **My Registrations** (`/participant/registrations`).
2. Find a registration with **Payment: PENDING**.
3. Click on it to expand or view details.
4. Click **"Upload Payment Proof"** button.
5. Select an image file (e.g., screenshot of UPI payment).
6. **Expected**:
   - File uploads successfully.
   - Payment proof indicator changes (e.g., "Proof Uploaded" badge).
   - The organizer can now see and approve/reject the payment.

### 17.2 Negative Tests

- Try uploading for a registration with `NOT_REQUIRED` payment → Should not be allowed.
- Try uploading a second time after already approved → Should not be allowed.

---

## 18. Participant — My Registrations / History

**Navigate**: Click **My Registrations** in the participant navbar.

### 18.1 Filter Tabs

The page has the following filter tabs:

| Tab | Shows |
|-----|-------|
| **All** | All registrations |
| **Normal** | Only registrations for Normal events |
| **Merchandise** | Only registrations for Merchandise events |
| **Completed** | Confirmed registrations where attendance was marked |
| **Cancelled / Rejected** | Registrations that were cancelled or had payment rejected |

1. Click each tab and verify the filtered results are correct.
2. Verify that registration cards show: Event Name, Organizer Name, Status Badge, Payment Status, Ticket ID (if generated), Registration Date.

### 18.2 View Registration Detail

1. Click on a registration card.
2. **Expected**: Shows full details including event info, custom form data, merchandise details (if applicable), ticket ID, QR code, and payment status.

---

## 19. Participant — View Ticket & QR Code

### 19.1 View Ticket

1. In My Registrations, click on a **CONFIRMED** registration.
2. The ticket should display:
   - **Ticket ID**: Format `FEL-XXXXXX`
   - **QR Code**: A scannable QR code image
   - Event details (name, date, venue)
   - Participant details

### 19.2 Verify QR Code

- The QR code encodes the ticket ID.
- Organizers can use this ticket ID in the Attendance tab to mark attendance.
- You can scan it with any QR reader to verify the encoded ticket ID.

---

## 20. Participant — Clubs / Organizers Listing

**Navigate**: Click **Clubs** in the participant navbar (or go to `/participant/organizers`).

### 20.1 View Organizers

- A grid of all approved organizers is displayed.
- Each card shows: Organization Name, Category Badge, Description snippet.
- Cards have a subtle glow effect on hover (Hyperplexed GlowingCards).

### 20.2 Click on an Organizer

- Click an organizer card.
- **Expected**: Navigates to the Organizer Detail page (`/participant/organizers/:id`).

---

## 21. Participant — Follow / Unfollow Clubs

### 21.1 Follow a Club

1. On the **Clubs** listing page or the **Organizer Detail page**, click the **Follow** button.
2. **Expected**: Button text changes to "Following" (or "Unfollow").
3. The club now appears when you use the "Followed Clubs" filter on Browse Events.

### 21.2 Unfollow a Club

1. Click the **Unfollow** / **Following** button again.
2. **Expected**: Button reverts to "Follow".
3. The club's events no longer appear under the "Followed Clubs" filter.

---

## 22. Participant — Organizer Detail Page

**Navigate**: Click on any organizer from the Clubs listing.

### 22.1 Verify Detail Page Content

- **Header**: Organization avatar (first letter), name, category badge.
- **Description**: Full text of the organizer's description.
- **Contact**: Contact email and phone number (if set).
- **Follow/Unfollow** button.

### 22.2 Event Tabs

- **Upcoming Events**: Shows events from this organizer that haven't ended yet.
- **Past Events**: Shows completed/closed events.
- Click on an event card → should navigate to the event detail page.

---

## 23. Participant — Profile & Settings

**Navigate**: Click **Profile** in the participant navbar.

### 23.1 View Profile Information

- Displays: First Name, Last Name, Email, College, Participant Type, Contact Number.
- **Editing**: Update any editable field and click Save.
- **Verify**: Refresh the page — changes should persist.

### 23.2 Edit Interests

1. On the profile page, find the **Interests** section.
2. A grid of interest chips is displayed (Technology, Music, Dance, Sports, Art, etc.).
3. Click chips to **toggle** them on/off (selected chips are highlighted).
4. Click **Save** to persist.
5. **Verify**: Refresh the page — your selected interests should remain.

### 23.3 Change Password

1. Find the **Change Password** section on the profile page (may need to expand it).
2. Enter:
   - **Current Password**: your current password
   - **New Password**: at least 6 characters
   - **Confirm New Password**: must match new password
3. Click **Change Password**.
4. **Expected**: Success toast notification.
5. **Verify**: Log out and log back in with the new password.

**Negative Tests**:
- Wrong current password → Error.
- New password less than 6 chars → Error.
- New password and confirm don't match → Error (client-side).

---

## 24. Discussion Forum

### 24.1 As a Participant

1. Go to any event's detail page.
2. Click the **Discussion** tab.
3. **View messages**: All messages for this event are listed with sender name, timestamp, and message text. Pinned messages have a special badge.
4. **Post a message**:
   - Type in the text input at the bottom.
   - Click **Send** (or press Enter).
   - Your message appears in the list.
5. **Verify**: Refresh the page — the message persists.

### 24.2 As an Organizer

1. Go to the event's management page.
2. The discussion/messages section should also be accessible.
3. Organizers can post messages and pin/unpin messages.

### 24.3 Real-time Updates

- If Socket.IO is working, messages from other users appear in real-time without refreshing.
- Open the same event discussion in two browser tabs/windows and send messages from each to test.

---

## 25. Discord Webhook Notification

### 25.1 Setup

1. Log in as an organizer.
2. Go to Profile.
3. Enter a valid **Discord Webhook URL** in the Discord Webhook field.
   - To create one: Go to your Discord server → Channel Settings → Integrations → Webhooks → New Webhook → Copy URL.
4. Save the profile.

### 25.2 Trigger Notification

1. Create a new event (or navigate to an existing DRAFT event).
2. Click **Publish**.
3. **Expected**: A Discord embed message is sent to the configured channel with:
   - Event name
   - Description snippet
   - Event type
   - Registration fee
   - Registration deadline

### 25.3 Verify in Discord

- Open the Discord channel where the webhook posts.
- Confirm the embed message appeared with correct event details.

---

## 26. Password Reset Workflow (Organizer → Admin)

This is a complete end-to-end flow spanning two roles.

### 26.1 Organizer Requests Reset

1. Log in as an organizer.
2. Go to Profile page.
3. Click **"Forgot your password?"** to expand the reset form.
4. Enter a reason: e.g., "I forgot my password after changing it".
5. Click **Request Reset**.
6. **Expected**: Success toast.

### 26.2 Admin Processes Request

1. Log in as admin.
2. Go to **Password Resets** page.
3. Find the request under the **PENDING** tab.
4. Verify the request shows: Organizer name, email, reason, and requested date.
5. Choose one:
   - **Approve**: Click Approve → New password auto-generated and "sent" to organizer. Toast confirms.
   - **Reject**: Click Reject → Enter rejection reason → Status changes to REJECTED.

### 26.3 Verify New Password (if approved)

1. Log out.
2. Log in as the organizer with the new password (check email or toast for new credentials).
3. **Expected**: Login succeeds.

---

## 27. Edge Cases & Negative Tests

### 27.1 Authentication

| Test | Expected |
|------|----------|
| Login with wrong password | Error: "Invalid credentials" |
| Login with non-existent email | Error: "Invalid credentials" |
| Login as deactivated account | Error: "Account is inactive" |
| Login as unapproved organizer | Error: "Organizer account pending approval" |
| Access participant pages without login | Redirected to login |
| Access admin pages as participant | Redirected / 403 |
| Access organizer pages as participant | Redirected / 403 |

### 27.2 Events

| Test | Expected |
|------|----------|
| Create event with past start date | May create but won't get registrations if deadline passed |
| End date before start date | Validation error |
| Registration deadline after start date | Validation error |
| Edit published event's name | Should be blocked (only description, deadline, limit editable) |
| Publish already published event | Error or button hidden |
| Negative registration limit | Validation error (min 1) |

### 27.3 Registrations

| Test | Expected |
|------|----------|
| Register twice for same event | "Already registered" error |
| Register for IIIT-only event as Non-IIIT | "Not eligible" error |
| Register for Non-IIIT-only event as IIIT | "Not eligible" error |
| Register after deadline | "Deadline passed" |
| Register when limit reached | "Limit reached" |
| Mark attendance for unconfirmed registration | Error |
| Mark attendance twice | Error with previous timestamp |

### 27.4 Authorization

| Test | Expected |
|------|----------|
| Organizer tries to manage another's event | Forbidden |
| Participant tries to approve payments | Forbidden |
| Non-admin tries to create organizer | Forbidden |
| Non-admin accesses admin dashboard | Redirected |

---

## 28. Responsive / Mobile Testing

### 28.1 Test Resolutions

Test the app at these viewport widths:

| Device | Width |
|--------|-------|
| Mobile (small) | 375px |
| Mobile (large) | 425px |
| Tablet | 768px |
| Laptop | 1024px |
| Desktop | 1440px |

### 28.2 What to Check

- **Navigation**: Hamburger menu appears on mobile, sidebar collapses.
- **Auth pages**: Registration form is readable and usable at 375px. Card shrinks and fields stack properly.
- **Event cards**: Cards stack in a single column on mobile, expand to grid on larger screens.
- **Tables**: Participant tables scroll horizontally on mobile.
- **Forms**: All form inputs are tappable and visible on mobile.
- **Modals/Dialogs**: Properly centered and scrollable on small screens.

### 28.3 How to Test

1. Open Chrome DevTools (F12 or Cmd+Option+I on Mac).
2. Click the device toggle toolbar (Cmd+Shift+M).
3. Select different device presets or enter custom widths.
4. Navigate through all pages and verify layout integrity.

---

## 29. Visual / UI Effects

### 29.1 Mouse Trailer (Sparkle Cursor)

- Move your mouse around the page.
- **Expected**: A trail of sparkle particles follows the cursor.
- The effect should be visible on all pages.

### 29.2 Glowing Cards

- Hover over event cards, organizer cards, and stat cards.
- **Expected**: A subtle gradient glow effect follows the mouse within the card container.

### 29.3 Text Scramble

- Check page headings and hero text for text scramble animations on load.
- Characters should scramble briefly before revealing the final text.

### 29.4 Dark Theme

- The entire app uses a dark theme with:
  - Dark background (near-black/dark gray)
  - Purple/blue gradient accents
  - Light text (white/gray)
  - Glowing borders and shadows

### 29.5 Fonts

- **Body text**: Inter font family
- **Headings**: Space Grotesk font family
- Verify fonts are loading (check Network tab in DevTools for font requests).

---

## Quick Reference — Test Accounts

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| Admin | `admin@felicity.com` | `admin123456` | Pre-seeded |
| Organizer | (created in Section 3) | (shown in toast) | Must be approved by admin |
| Participant (IIIT) | `test@students.iiit.ac.in` | (your choice, 6+ chars) | Register via /register |
| Participant (External) | `test@gmail.com` | (your choice, 6+ chars) | Register via /register |

---

## Complete End-to-End Test Scenario

Follow this sequence to test the entire application flow:

1. **Start servers** (Section 1)
2. **Login as admin** → Create 2 organizers (1 Technical, 1 Cultural) → Approve both (Sections 2–3)
3. **Login as Organizer 1** → Edit profile, add Discord webhook → Create 1 Normal event + 1 Merchandise event → Publish both (Sections 5–8)
4. **Login as Organizer 2** → Create and publish 1 Normal event (Sections 5–8)
5. **Register Participant 1** (IIIT) → Select interests → Follow Organizer 1 → Browse events with "Followed Clubs" filter → Register for Normal event → View ticket (Sections 12–15, 19–21)
6. **Register Participant 2** (Non-IIIT) → Browse events → Try to register for IIIT-only event (should fail) → Register for another event → Purchase merchandise → Upload payment proof (Sections 12, 14–17)
7. **Login as Organizer 1** → Go to Merchandise event → Approve Participant 2's payment → Mark Participant 1's attendance → View analytics → Export CSV (Sections 9–11)
8. **Login as Participant 2** → Check My Registrations → Verify ticket generated after approval → View QR code → Post in Discussion (Sections 18–19, 24)
9. **Login as Organizer 1** → Request password reset (Section 5.4)
10. **Login as Admin** → Approve password reset → Verify (Section 4, 26)
11. **Test edge cases** (Section 27)
12. **Test responsive design** (Section 28)

---

*End of Testing Guide*