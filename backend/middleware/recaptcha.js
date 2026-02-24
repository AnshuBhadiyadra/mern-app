const rateLimit = require('express-rate-limit');
const axios = require('axios');

// Rate limiter for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per IP
  message: {
    success: false,
    error: 'Too many login attempts, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for registration
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 registrations per IP per hour
  message: {
    success: false,
    error: 'Too many accounts created from this IP, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Verify reCAPTCHA token
const verifyRecaptcha = async (req, res, next) => {
  // Skip in development if no secret key configured
  if (!process.env.RECAPTCHA_SECRET_KEY || process.env.NODE_ENV === 'development') {
    return next();
  }

  const { recaptchaToken } = req.body;

  if (!recaptchaToken) {
    return res.status(400).json({
      success: false,
      error: 'reCAPTCHA verification is required',
    });
  }

  try {
    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: recaptchaToken,
        },
      }
    );

    if (!response.data.success) {
      return res.status(400).json({
        success: false,
        error: 'reCAPTCHA verification failed. Please try again.',
      });
    }

    next();
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return res.status(500).json({
      success: false,
      error: 'reCAPTCHA verification service error',
    });
  }
};

module.exports = { loginLimiter, registerLimiter, verifyRecaptcha };
