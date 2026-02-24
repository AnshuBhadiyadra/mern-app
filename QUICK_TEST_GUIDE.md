# Felicity — Complete Testing Guide (Step-by-Step with Exact Inputs)

> **Backend:** `http://localhost:5001` &nbsp;|&nbsp; **Frontend:** `http://localhost:5173`
> **SMTP Email:** `abhishekbhadiyadra0@gmail.com` (check Sent folder for all outgoing emails)

---

## 0. Start the App

Open **two** terminal windows:

```bash
# Terminal 1 — Backend
cd backend && npm run dev
# Should print: "Server running on port 5001" + "MongoDB Connected"

# Terminal 2 — Frontend
cd frontend && npm run dev
# Should print: "Local: http://localhost:5173/"
```

Open `http://localhost:5173` in your browser.

---

## 1. ADMIN — Create & Manage Organizers

### 1.1 Login as Admin

1. Go to `http://localhost:5173/login`
2. Enter:
   - **Email:** `admin@felicity.com`
   - **Password:** `admin123456`
3. Click **Login**
4. **Expected:** Redirected to `/admin/dashboard`. You see stat cards (Total Organizers, Active, Pending Resets, Total Events, Total Participants).

### 1.2 View Dashboard Stats

1. You're already on `/admin/dashboard`
2. **Expected:** All stat numbers visible (may be 0 initially). Quick links to "Manage Organizers" and "Password Resets".

### 1.3 Create Organizer #1 (Technical Club)

1. Click **Manage Organizers** (or go to `/admin/organizers`)
2. In the "Create New Organizer" form, enter:
   - **Email:** `techclub@test.com`
   - **Organizer Name:** `Tech Club IIITH`
   - **Category:** Select `Technical` from dropdown
3. Click **Create Organizer**
4. **Expected:**
   - Success toast appears
   - Organizer appears in the table below with status **Approved** (auto-approved)
   - A generated password is shown in the response/toast — **copy it** (you'll need it to log in as this organizer)
   - An email is sent to `techclub@test.com` with login credentials
   - The auto-generated club email will be `techclubiiith@clubs.iiit.ac.in`

> **Note:** Organizers are auto-approved on creation. No separate approval step needed.

### 1.4 Create Organizer #2 (Cultural Club)

1. Still on `/admin/organizers`, fill form:
   - **Email:** `culturalclub@test.com`
   - **Organizer Name:** `Drama Society`
   - **Category:** Select `Drama` from dropdown
2. Click **Create Organizer**
3. **Expected:** Second organizer appears in table, also auto-approved. **Copy the generated password.**

### 1.5 Verify Organizers Table

1. Scroll down to the organizers table
2. **Expected:** Both organizers listed with:
   - Name, Category, Email, Status (Approved), Created date
   - **Deactivate** and **Delete** buttons visible

### 1.6 (Optional) Delete an Organizer

1. On any organizer row, click **Delete** (with permanent option)
2. **Expected:** Organizer removed from table. All their events, registrations, discussions cascade-deleted.

> **Don't delete the ones you just created** — you need them for the organizer flow below.

**Now log out** (click profile → Logout, or clear localStorage).

---

## 2. ORGANIZER — Create & Manage Events

### 2.1 Login as Organizer

1. Go to `/login`
2. Enter:
   - **Email:** `techclub@test.com`
   - **Password:** *(the generated password you copied in step 1.3)*
3. Click **Login**
4. **Expected:** Redirected to `/organizer/dashboard`. Stats cards show 0 events, 0 registrations. Event carousel is empty.

### 2.2 Create a Normal Event (Draft)

1. Click **Create Event** (or go to `/organizer/events/create`)
2. Fill in:
   - **Event Name:** `Hackathon 2026`
   - **Description:** `A 24-hour coding hackathon open to all students. Build innovative solutions.`
   - **Event Type:** Select `Normal` (should be default)
   - **Eligibility:** Select `All`
   - **Event Start Date:** Pick `2026-03-15T10:00` (March 15, 2026, 10:00 AM)
   - **Event End Date:** Pick `2026-03-16T10:00` (March 16, 2026, 10:00 AM)
   - **Registration Deadline:** Pick `2026-03-14T23:59` (March 14, 2026, 11:59 PM)
   - **Venue:** `Himalaya Block, IIIT-H`
   - **Registration Limit:** `100`
   - **Registration Fee:** `0`
   - **Event Tags:** `coding, hackathon, tech`
3. **Add Custom Form Fields:**
   - Click **Add Field**
   - Field 1: **Field Name:** `Team Name`, **Field Type:** `text`, check **Required**
   - Click **Add Field** again
   - Field 2: **Field Name:** `Experience Level`, **Field Type:** `text`, check **Required**
4. Click **Save as Draft**
5. **Expected:** Redirected to dashboard. Event card shows "Hackathon 2026" with DRAFT badge.

### 2.3 Publish the Event

1. On the dashboard, find the "Hackathon 2026" card
2. Click **Publish**
3. **Expected:** Status changes to PUBLISHED. Event is now visible to participants.

### 2.4 Create a Merchandise Event

1. Go to `/organizer/events/create` again
2. Fill in:
   - **Event Name:** `Tech Club Merch Store`
   - **Description:** `Official Tech Club merchandise — hoodies, t-shirts, and stickers.`
   - **Event Type:** Select `Merchandise`
   - **Eligibility:** `All`
   - **Event Start Date:** `2026-03-10T09:00`
   - **Event End Date:** `2026-04-10T23:59`
   - **Registration Deadline:** `2026-04-09T23:59`
   - **Registration Fee:** `0`
   - **Purchase Limit Per User:** `3`
3. **Add Merchandise Items:**
   - Item 1: **Name:** `Club Hoodie`, **Price:** `800`, **Stock:** `50`
   - Item 2: **Name:** `Club T-Shirt`, **Price:** `400`, **Stock:** `100`
   - Item 3: **Name:** `Sticker Pack`, **Price:** `50`, **Stock:** `200`
4. Click **Save as Draft**, then **Publish** from dashboard
5. **Expected:** Merchandise event published. Shows in participant browse.

### 2.5 Create an IIIT-Only Event

1. Create one more event:
   - **Event Name:** `IIIT Internal Meetup`
   - **Description:** `Exclusive meetup for IIIT-H students only.`
   - **Event Type:** `Normal`
   - **Eligibility:** Select `IIIT Only`
   - **Event Start Date:** `2026-03-20T14:00`
   - **Event End Date:** `2026-03-20T17:00`
   - **Registration Deadline:** `2026-03-19T23:59`
   - **Registration Limit:** `50`
   - **Registration Fee:** `0`
2. Save as Draft → Publish
3. **Expected:** Published with "IIIT Only" eligibility badge.

**Keep this organizer session open (or remember credentials). Log out for now.**

---

## 3. PARTICIPANT — Register, Browse, Interact

### 3.1 Register Participant #1 (IIIT Student)

1. Go to `/register`
2. Fill in:
   - **First Name:** `Rahul`
   - **Last Name:** `Sharma`
   - **Email:** `rahul.sharma@students.iiit.ac.in`
   - **Participant Type:** Select `IIIT`
   - **Contact Number:** `9876543210`
   - **Password:** `password123`
   - **Confirm Password:** `password123`
3. Click **Register**
4. **Expected:** Account created → redirected to `/participant/onboarding`

### 3.2 Complete Onboarding

1. **Step 1 (Basic Info):** Fields may be pre-filled. Click **Next**.
2. **Step 2 (Interests):** Click these interest chips to select them: **Coding**, **Gaming**, **Music**
3. Click **Next**
4. **Step 3 (Follow Clubs):** You should see "Tech Club IIITH" and "Drama Society" cards. Click **Tech Club IIITH** to follow it.
5. Click **Complete**
6. **Expected:** Redirected to `/participant/dashboard`. Dashboard loads with trending events carousel.

### 3.3 Browse Events

1. Go to `/participant/events`
2. **Expected:** You see all 3 published events: "Hackathon 2026", "Tech Club Merch Store", "IIIT Internal Meetup"
3. Events matching your interests (Coding, Gaming) should appear near the top (interest-based ordering).

### 3.4 Test Fuzzy Search

1. In the search bar, type: `Hackathn` (deliberate typo — missing 'o')
2. **Expected:** "Hackathon 2026" still appears in results (Fuse.js fuzzy matching)
3. Clear the search. Type: `merch`
4. **Expected:** "Tech Club Merch Store" appears.

### 3.5 Test Filters

1. Clear search. Set **Event Type** dropdown to `Merchandise`
2. **Expected:** Only "Tech Club Merch Store" shows
3. Change to `Normal`
4. **Expected:** Only "Hackathon 2026" and "IIIT Internal Meetup" show
5. Set **Eligibility** to `IIIT Only`
6. **Expected:** Only "IIIT Internal Meetup" shows
7. Reset all filters back to defaults.

### 3.6 Test "Followed Only" Filter

1. Toggle the **Followed Only** button ON
2. **Expected:** Only events from "Tech Club IIITH" show (the club you followed in onboarding). "Drama Society" events won't appear.
3. Toggle it OFF again.

### 3.7 Register for the Hackathon (Normal Event)

1. Click on **"Hackathon 2026"** event card
2. You're on the event detail page. Click the **Register** tab/section.
3. Fill the custom form:
   - **Team Name:** `ByteForce`
   - **Experience Level:** `Intermediate`
4. Click **Register**
5. **Expected:**
   - Success message with your **Ticket ID** (format: `FEL-XXXXX-XXXX`)
   - QR code displayed
   - Email sent to `rahul.sharma@students.iiit.ac.in` with ticket details
   - Check `abhishekbhadiyadra0@gmail.com` **Sent** folder to verify

### 3.8 Purchase Merchandise

1. Go back to events → click **"Tech Club Merch Store"**
2. In the registration/purchase section:
   - Set **Club Hoodie** quantity to `1`
   - Set **Sticker Pack** quantity to `2`
   - Leave **Club T-Shirt** at `0`
3. Click **Purchase** / **Register**
4. **Expected:**
   - Order created with status **Pending** (needs payment approval)
   - Redirected to or message to check "My Registrations"

### 3.9 Upload Payment Proof (Merchandise)

1. Go to `/participant/registrations`
2. Find the "Tech Club Merch Store" order (should show **Pending** badge)
3. Click **Upload Payment Proof**
4. Select any image file from your computer (a screenshot, any .jpg/.png)
5. **Expected:** Image uploaded successfully. Status remains Pending (waiting for organizer approval).

### 3.10 View Ticket & QR Code

1. Still on `/participant/registrations`
2. Find the "Hackathon 2026" registration
3. Click on the **Ticket ID** (e.g., `FEL-1740...`)
4. **Expected:** Ticket card expands showing full ticket details + QR code image.

### 3.11 Post in Discussion

1. Go to the **"Hackathon 2026"** event detail page
2. Switch to the **Discussion** tab
3. In the message input, type: `Hey everyone! Excited for the hackathon. Anyone looking for teammates?`
4. Click **Send**
5. **Expected:** Your message appears instantly in the discussion feed with your name and timestamp.

### 3.12 React to a Message

1. On your own message (or any message), hover/look for the reaction picker
2. Click the 👍 emoji
3. **Expected:** A "👍 1" reaction badge appears under the message
4. Click ❤️ emoji too
5. **Expected:** "❤️ 1" badge added alongside
6. Click 👍 again to **un-react**
7. **Expected:** 👍 badge disappears (toggle behavior)

### 3.13 Follow/Unfollow an Organizer

1. Go to `/participant/organizers`
2. Click on **"Drama Society"** card
3. On the organizer detail page, click **Follow**
4. **Expected:** Button changes to "Following" or "Unfollow"
5. Go back to `/participant/events` → toggle **Followed Only** ON
6. **Expected:** Now events from BOTH "Tech Club IIITH" and "Drama Society" appear
7. Go back and click **Unfollow** on Drama Society

### 3.14 Edit Profile

1. Go to your profile page (`/participant/profile`)
2. Change **Contact Number** to `9876543211` (changed last digit)
3. Click **Save** / **Update**
4. **Expected:** Success toast. Number updated.

### 3.15 Change Password

1. Still on profile page, find the "Change Password" section
2. Enter:
   - **Current Password:** `password123`
   - **New Password:** `newpass456`
   - **Confirm New Password:** `newpass456`
3. Click **Change Password**
4. **Expected:** Success message. Next login must use `newpass456`.

---

## 4. PARTICIPANT #2 — Test Eligibility & Real-Time Discussion

### 4.1 Register Participant #2 (Non-IIIT)

1. **Log out** of Participant #1
2. Go to `/register`
3. Fill in:
   - **First Name:** `Priya`
   - **Last Name:** `Patel`
   - **Email:** `priya.patel@gmail.com`
   - **Participant Type:** Select `NON_IIIT`
   - **College Name:** `NIT Warangal` (this field appears when NON_IIIT is selected)
   - **Contact Number:** `8765432109`
   - **Password:** `password123`
   - **Confirm Password:** `password123`
4. Click **Register**
5. On onboarding: click **Skip for now**
6. **Expected:** Dashboard loads without interests set.

### 4.2 Test IIIT-Only Eligibility Block

1. Go to `/participant/events`
2. Find **"IIIT Internal Meetup"** and click on it
3. Try to register
4. **Expected:** Error — eligibility check fails because you're a NON_IIIT participant. Registration blocked.

### 4.3 Register for Hackathon (as Participant #2)

1. Go to **"Hackathon 2026"** event detail (eligibility is "All" so this works)
2. Fill custom form:
   - **Team Name:** `CodeCrafters`
   - **Experience Level:** `Beginner`
3. Click **Register**
4. **Expected:** Ticket generated. Email sent.

### 4.4 Real-Time Discussion Test

> You need **two browser windows** open simultaneously for this.

1. **Window 1:** Log in as `rahul.sharma@students.iiit.ac.in` / `newpass456` → go to Hackathon 2026 → Discussion tab
2. **Window 2:** Log in as `priya.patel@gmail.com` / `password123` → go to Hackathon 2026 → Discussion tab
3. **In Window 2**, type: `Hi Rahul! I saw your message. We could team up!`
4. Click Send
5. **Expected in Window 1:** Priya's message appears in real-time WITHOUT refreshing the page (Socket.IO)
6. **In Window 1**, start typing a message (don't send yet)
7. **Expected in Window 2:** Shows "Rahul is typing…" indicator
8. **In Window 1**, send: `Sounds great! Let's connect.`
9. **In Window 2**, click **Reply** on Rahul's message, type: `Perfect, see you there!`
10. **Expected:** Reply appears as a threaded message (indented or with "replying to" indicator)

### 4.5 Try Duplicate Registration

1. In Window 2 (Priya), go back to Hackathon 2026 → try to register again
2. **Expected:** Error: "Already registered" — duplicate registration blocked.

---

## 5. ORGANIZER — Manage Participants, Payments, Attendance

### 5.1 Login as Organizer Again

1. Go to `/login`
2. Enter:
   - **Email:** `techclub@test.com`
   - **Password:** *(the generated password from step 1.3)*
3. **Expected:** Organizer dashboard. Stats now show events + registrations.

### 5.2 View Hackathon Participants

1. Click on **"Hackathon 2026"** event card → go to **Participants** tab
2. **Expected:** Table shows 2 registrations:
   - Rahul Sharma — `rahul.sharma@students.iiit.ac.in` — Confirmed — Attendance: —
   - Priya Patel — `priya.patel@gmail.com` — Confirmed — Attendance: —

### 5.3 Mark Attendance Manually

1. In the attendance input field, type Rahul's **Ticket ID** (visible in the table, format `FEL-XXXX-XXXX`)
2. Click **Mark Attendance**
3. **Expected:** Rahul's attendance column updates to show a green checkmark. Toast: "Attendance marked".

### 5.4 Test Duplicate Attendance

1. Enter the same Ticket ID again and try to mark
2. **Expected:** Error: "Attendance already marked"

### 5.5 QR Scanner Attendance

1. Click the **QR Scanner** button/tab
2. Allow camera access when prompted
3. Point your camera at Priya's QR code (from her ticket in My Registrations — she can open it on her phone or another screen)
4. **Expected:** QR scanned → attendance marked automatically for Priya. Success toast.

> **Tip:** If you can't scan a real QR, use the manual ticket ID input for Priya instead.

### 5.6 Approve Merchandise Payment

1. Go to **"Tech Club Merch Store"** event → **Participants** tab
2. Find Rahul's merchandise order (Status: Pending, Payment: Pending)
3. Click **Approve** on his row
4. **Expected:**
   - Payment status changes to Approved
   - Ticket ID generated + QR code created
   - Email sent to Rahul with merchandise ticket details
   - Check `abhishekbhadiyadra0@gmail.com` Sent folder

### 5.7 Discussion Moderation

1. Go to **"Hackathon 2026"** → **Discussion** tab (as organizer)
2. You should see all messages from Rahul and Priya
3. Find any message → click **Pin**
4. **Expected:** Message gets a "Pinned" badge and moves to the top of the discussion
5. Find another message → click **Delete**
6. **Expected:** Message is hidden/removed from the discussion feed

### 5.8 View Analytics

1. Switch to the **Analytics** tab
2. **Expected:** Stats showing:
   - Total Registrations: 2
   - Total Attendance: 2 (after marking both)
   - Attendance Rate: 100%
   - Revenue: ₹0 (free event)

### 5.9 Export CSV

1. Click **Export CSV**
2. **Expected:** A `.csv` file downloads containing columns: Ticket ID, Name, Email, Contact, College, Type, Status, Payment, Attendance, Date.

### 5.10 Close Event

1. Switch to the **Overview** tab
2. Click **Close Event** (or select status = Closed)
3. **Expected:** Event status changes to CLOSED. No new registrations possible.

### 5.11 Edit Organizer Profile

1. Go to `/organizer/profile`
2. Update **Description** to: `The premier technical club of IIIT Hyderabad, organizing hackathons and workshops.`
3. (Optional) Paste a Discord webhook URL if you have one: `https://discord.com/api/webhooks/YOUR_WEBHOOK`
4. Click **Save**
5. **Expected:** Profile updated. If webhook is set, future event publishes will send a Discord notification.

### 5.12 Request Password Reset

1. Still on profile page, find **Request Password Reset**
2. Enter **Reason:** `Forgot my auto-generated password and need a new one.`
3. Click **Submit Request**
4. **Expected:** Success toast. Request is now pending for admin approval.

---

## 6. ADMIN — Handle Password Reset

### 6.1 Login as Admin Again

1. Go to `/login` → `admin@felicity.com` / `admin123456`
2. Go to `/admin/password-resets`
3. **Expected:** You see the pending reset request from "Tech Club IIITH" with reason displayed

### 6.2 Approve Password Reset

1. Click **Approve** on the request
2. **Expected:**
   - New password auto-generated
   - Email sent to `techclub@test.com` with the new password
   - Request status changes to "Approved"
   - Check `abhishekbhadiyadra0@gmail.com` Sent folder for the email

### 6.3 (Optional) Test Reject

1. If the organizer submits another request, click **Reject** and enter admin comment: `Please use the password we just sent.`
2. **Expected:** Status changes to Rejected with comment shown.

---

## 7. EMAIL VERIFICATION CHECKLIST

> Check the **Sent** folder of `abhishekbhadiyadra0@gmail.com` in Gmail.

| # | When It Fires | Recipient | Email Contains |
|---|---------------|-----------|----------------|
| 1 | Admin creates organizer (Step 1.3) | `techclub@test.com` | Club email, generated password, login URL |
| 2 | Participant registers for normal event (Step 3.7) | `rahul.sharma@students.iiit.ac.in` | Event name, Ticket ID, QR code |
| 3 | Organizer approves merch payment (Step 5.6) | `rahul.sharma@students.iiit.ac.in` | Merch details, Ticket ID, QR code |
| 4 | Admin approves password reset (Step 6.2) | `techclub@test.com` | New generated password |

> **Note:** Emails are sent FROM `abhishekbhadiyadra0@gmail.com`. They arrive at the TO address. If the TO address doesn't exist (like `techclub@test.com`), you'll see it in the Sent folder but it will bounce. For real testing, use real email addresses you can check.

---

## 8. EDGE CASES TO VERIFY

| # | Test | How to Trigger | Expected Result |
|---|------|----------------|-----------------|
| 1 | Duplicate registration | Log in as Rahul → try registering for Hackathon again | Error: "Already registered" |
| 2 | IIIT-only block | Log in as Priya (NON_IIIT) → try registering for "IIIT Internal Meetup" | Error: eligibility failed |
| 3 | Double attendance | Organizer: enter Rahul's ticket ID for attendance again | Error: "already marked" |
| 4 | Closed event registration | Try registering for the event you closed in Step 5.10 | Registration button disabled/hidden |
| 5 | Merch stock limit | Purchase 3x of same item (purchaseLimitPerUser = 3), then try buying more | Error: limit exceeded |
| 6 | Empty form validation | Try submitting registration with custom fields empty (marked required) | Form validation error — fields highlighted |
| 7 | Short password | Register new account with password `abc` (< 6 chars) | Error: password too short |
| 8 | Password mismatch | Register with `password123` / `password456` in confirm | Error: passwords don't match |
| 9 | Invalid phone | Register with phone `12345` (not 10 digits) | Error: invalid contact number |

---

## 9. ALL TEST ACCOUNTS SUMMARY

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| **Admin** | `admin@felicity.com` | `admin123456` | Pre-seeded admin account |
| **Organizer 1** | `techclub@test.com` | *(auto-generated, check email/toast)* | Tech Club IIITH, Technical category |
| **Organizer 2** | `culturalclub@test.com` | *(auto-generated, check email/toast)* | Drama Society, Drama category |
| **Participant 1** | `rahul.sharma@students.iiit.ac.in` | `newpass456` (changed from `password123`) | IIIT student, interests: Coding/Gaming/Music |
| **Participant 2** | `priya.patel@gmail.com` | `password123` | NON_IIIT, NIT Warangal, skipped onboarding |

---

## 10. COMPLETE TEST FLOW ORDER

Follow this exact order for a clean run:

```
1. Start backend + frontend
2. Login as admin → create 2 organizers → log out
3. Login as organizer 1 → create 3 events → publish all → log out
4. Register participant 1 (IIIT) → onboarding → browse → search → filter
5. Register for hackathon → purchase merch → upload payment proof → view ticket
6. Post in discussion → react to messages
7. Register participant 2 (NON_IIIT) → skip onboarding
8. Test IIIT-only block → register for hackathon → post in discussion
9. Open 2 windows: test real-time discussion (both participants)
10. Login as organizer → check participants → mark attendance → approve payment
11. QR scan attendance → moderate discussion → view analytics → export CSV
12. Close event → edit profile → request password reset
13. Login as admin → approve password reset
14. Check all emails in Gmail Sent folder
15. Test edge cases (duplicates, eligibility, limits, validation)
```
