require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Admin = require('../models/Admin');

const createAdminAccount = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@felicity.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';

    const existingUser = await User.findOne({ email: adminEmail });
    if (existingUser) {
      console.log('Admin account already exists');
      process.exit(0);
    }

    const user = await User.create({
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
    });

    await Admin.create({
      userId: user._id,
      name: 'System Administrator',
    });

    console.log('Admin account created successfully');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    console.log('Please change the password after first login');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdminAccount();
