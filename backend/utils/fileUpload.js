const multer = require('multer');
const path = require('path');
const fs = require('fs');

// On Vercel (production), use /tmp since filesystem is read-only
const baseUploadDir = process.env.NODE_ENV === 'production' ? '/tmp' : path.join(__dirname, '..');

// Ensure upload directories exist
const uploadDirs = ['uploads/payments', 'uploads/registrations'];
uploadDirs.forEach(dir => {
  const fullPath = path.join(baseUploadDir, dir);
  try {
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  } catch (e) {
    // Ignore filesystem errors on read-only systems
  }
});

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'paymentProof') {
      cb(null, path.join(baseUploadDir, 'uploads/payments/'));
    } else if (file.fieldname === 'registrationFile') {
      cb(null, path.join(baseUploadDir, 'uploads/registrations/'));
    } else {
      cb(null, path.join(baseUploadDir, 'uploads/'));
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    cb(null, `${basename}-${uniqueSuffix}${ext}`);
  },
});

// File filter - only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, gif) are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});

module.exports = upload;
