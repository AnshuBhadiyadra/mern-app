# Detailed Vercel Hosting Guide — Felicity Event Management System

This guide explains how to deploy both the **backend (Express API)** and the **frontend (React + Vite)** to **Vercel** step by step.

---

## Prerequisites

1. A **GitHub account** with your code pushed to a repository.
2. A **Vercel account** — sign up free at [vercel.com](https://vercel.com) using your GitHub account.
3. A **MongoDB Atlas** cluster already set up — you already have one at:
   ```
   mongodb+srv://...@cluster0.fkzfzao.mongodb.net/felicity-events
   ```

---

## Part 1 — Deploy the Backend (Express API)

### Step 1: Prepare the Backend

The backend folder already contains a `vercel.json` file that tells Vercel how to build and route the Express server:

```json
{
  "version": 2,
  "builds": [
    { "src": "server.js", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/uploads/(.*)", "dest": "server.js" },
    { "src": "/api/(.*)", "dest": "server.js" },
    { "src": "/(.*)", "dest": "server.js" }
  ]
}
```

### Step 2: Push to GitHub

If you haven't yet, push your code to GitHub:

```bash
cd /path/to/mern-app

# Initialize git (if not done)
git init

# Create a .gitignore in root
echo "node_modules/\n.env\n.DS_Store\nbackend/uploads/" > .gitignore

# Add and commit
git add .
git commit -m "Initial commit - Felicity Event Management System"

# Create a GitHub repo and push
git remote add origin https://github.com/YOUR_USERNAME/felicity-events.git
git branch -M main
git push -u origin main
```

### Step 3: Import Backend on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select your GitHub repository
4. **IMPORTANT**: Set the **Root Directory** to `backend`
   - Click "Edit" next to Root Directory
   - Type `backend`
5. Vercel auto-detects the framework as "Other"
6. Leave the default build settings (no build command needed for Node.js)
7. Click **"Deploy"**

### Step 4: Set Backend Environment Variables

1. After deployment, go to your project on Vercel Dashboard
2. Click **Settings** → **Environment Variables**
3. Add the following variables:

| Variable              | Value                                                         |
|-----------------------|---------------------------------------------------------------|
| `MONGODB_URI`         | `mongodb+srv://anshu21142_db_user:fK6alW11186a9XXo@cluster0.fkzfzao.mongodb.net/felicity-events` |
| `JWT_SECRET`          | Generate one: run `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` in terminal |
| `FRONTEND_URL`        | `https://your-frontend-app.vercel.app` (set this AFTER deploying frontend) |
| `NODE_ENV`            | `production` |
| `GMAIL_USER`          | *(optional)* Your Gmail address |
| `GMAIL_PASS`          | *(optional)* Gmail App Password |
| `RECAPTCHA_SECRET_KEY`| *(optional)* Google reCAPTCHA secret |

4. Click **"Save"** after adding each variable
5. Go to **Deployments** tab and click **"Redeploy"** to pick up the new env variables

### Step 5: Verify Backend

Visit your backend URL: `https://your-backend-app.vercel.app/`

You should see:
```json
{
  "message": "Felicity Event Management System API",
  "version": "1.0.0",
  "endpoints": { ... }
}
```

### Step 6: Seed the Admin Account

After the backend is deployed, create the admin user by running this locally (pointing at your Atlas DB):

```bash
cd backend
node scripts/createAdmin.js
```

This creates admin@felicity.com / admin123456 in the database.

---

## Part 2 — Deploy the Frontend (React + Vite)

### Step 1: Import Frontend on Vercel

1. Go to [vercel.com/new](https://vercel.com/new) again
2. Import the **same** GitHub repository
3. **IMPORTANT**: Set the **Root Directory** to `frontend`
4. Vercel auto-detects it as a **Vite** project
5. The build settings should auto-fill:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 2: Set Frontend Environment Variables

Before deploying, add the environment variable:

| Variable       | Value                                          |
|----------------|------------------------------------------------|
| `VITE_API_URL` | `https://your-backend-app.vercel.app/api`      |

> **Important**: Vite env variables MUST start with `VITE_` to be available in the browser.

### Step 3: Deploy

Click **"Deploy"** — Vercel will run `npm install` and `npm run build` automatically.

### Step 4: Handle Client-Side Routing

Create a `vercel.json` in the `frontend/` folder to handle React Router:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

> This file already exists in your project. It ensures that all routes (like `/login`, `/dashboard`) are served by `index.html` instead of returning 404.

### Step 5: Update Backend CORS

After the frontend is deployed, go back to your **backend** project on Vercel:

1. Go to **Settings** → **Environment Variables**
2. Update `FRONTEND_URL` to your frontend's URL: `https://your-frontend-app.vercel.app`
3. Click **Redeploy** on the Deployments tab

---

## Part 3 — MongoDB Atlas Network Access

Make sure your MongoDB Atlas cluster allows connections from Vercel:

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Click **Network Access** in the left sidebar
3. Click **"Add IP Address"**
4. Click **"Allow Access from Anywhere"** (sets `0.0.0.0/0`)
   - This is required because Vercel uses dynamic IPs
5. Click **Confirm**

> **Note**: For a production app you'd want to restrict access. For a university project, "Allow Access from Anywhere" is fine.

---

## Part 4 — Troubleshooting

### Common Issues

| Problem                        | Solution                                                   |
|--------------------------------|-----------------------------------------------------------|
| CORS error in browser console  | Check that `FRONTEND_URL` in backend env vars matches your frontend URL exactly (no trailing slash) |
| 404 on page refresh           | Make sure `vercel.json` rewrites exist in the frontend     |
| "Cannot connect to database"  | Check `MONGODB_URI` env var, ensure Atlas allows `0.0.0.0/0` |
| API calls failing             | Verify `VITE_API_URL` points to the correct backend URL with `/api` suffix |
| Blank page after deploy       | Check browser console for errors; rebuild after setting env vars |
| Socket.IO not connecting      | Vercel serverless functions don't support persistent WebSocket connections. For the discussion feature, you may need to use a service like Railway or Render for the backend instead |

### WebSocket Limitation

> **Important**: Vercel uses **serverless functions** which do NOT support persistent WebSocket connections (Socket.IO). The real-time discussion feature will **not work** on Vercel.
>
> **Workaround options**:
> 1. Deploy the backend on **Render** (free tier, supports WebSockets) instead of Vercel
> 2. Use **Vercel for frontend only** and Render/Railway for backend
> 3. The rest of the app (auth, events, registrations, admin) will work perfectly on Vercel

### Alternative: Deploy Backend on Render (Recommended for Full Functionality)

If you want Socket.IO (real-time discussions) to work:

1. Go to [render.com](https://render.com) and sign up with GitHub
2. Click **"New Web Service"**
3. Connect your repository
4. Set:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Add the same environment variables listed in Part 1, Step 4
6. Click **Deploy**
7. Use the Render URL as your `VITE_API_URL` for the frontend on Vercel

---

## Part 5 — Quick Summary Checklist

- [ ] Code is on GitHub
- [ ] Backend deployed to Vercel (or Render)
- [ ] Backend env variables set (`MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL`, `NODE_ENV`)
- [ ] Frontend deployed to Vercel
- [ ] Frontend env variable set (`VITE_API_URL`)
- [ ] MongoDB Atlas allows access from `0.0.0.0/0`
- [ ] Backend `FRONTEND_URL` updated to match the deployed frontend URL
- [ ] Admin account created via `createAdmin.js`
- [ ] Both apps tested and working

---

## Custom Domain (Optional)

1. In Vercel project settings, go to **Domains**
2. Click **"Add Domain"**
3. Enter your domain name
4. Follow the DNS configuration instructions
5. Vercel provides free SSL certificates automatically

---

## Deployed URLs Template

After deployment, your URLs will look like:

- **Frontend**: `https://felicity-events.vercel.app`
- **Backend API**: `https://felicity-events-api.vercel.app`
- **API Health Check**: `https://felicity-events-api.vercel.app/`

Keep these URLs and credentials in a safe place for your assignment submission.
