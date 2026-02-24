require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Ensure DB is connected before any API route
app.use('/api', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ success: false, error: 'Database connection failed' });
  }
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/registrations', require('./routes/registrationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/participants', require('./routes/participantRoutes'));
app.use('/api/organizers', require('./routes/organizerRoutes'));
app.use('/api/discussions', require('./routes/discussionRoutes'));

// API root
app.get('/', (req, res) => {
  res.json({
    message: 'Felicity Event Management System API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      events: '/api/events',
      registrations: '/api/registrations',
      admin: '/api/admin',
      participants: '/api/participants',
      organizers: '/api/organizers',
      discussions: '/api/discussions',
    },
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Server Error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Only listen locally — Vercel handles this in production
if (process.env.NODE_ENV !== 'production') {
  const http = require('http');
  const { Server } = require('socket.io');
  const setupDiscussionSocket = require('./sockets/discussionSocket');

  // Connect eagerly for local dev
  connectDB();

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  });
  setupDiscussionSocket(io);

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

// Export for Vercel serverless
module.exports = app;

