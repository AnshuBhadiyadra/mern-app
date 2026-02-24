/**
 * Reset Database Script
 * Usage: node scripts/resetDatabase.js [--keep-admin]
 *
 * --keep-admin : Keeps the admin account, removes everything else
 * (no flag)    : Drops ALL collections (full wipe)
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

const run = async () => {
  const keepAdmin = process.argv.includes('--keep-admin');

  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected!\n');

  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();

  if (keepAdmin) {
    console.log('Mode: Reset all data EXCEPT admin account\n');
    for (const col of collections) {
      const name = col.name;
      if (name === 'admins') {
        console.log(`  [SKIP] ${name}`);
        continue;
      }
      if (name === 'users') {
        // Delete non-admin users only
        const result = await db.collection('users').deleteMany({ role: { $ne: 'admin' } });
        console.log(`  [CLEAN] ${name} — removed ${result.deletedCount} non-admin users`);
        continue;
      }
      const result = await db.collection(name).deleteMany({});
      console.log(`  [CLEAR] ${name} — removed ${result.deletedCount} documents`);
    }
  } else {
    console.log('Mode: FULL RESET — dropping all collections\n');
    for (const col of collections) {
      await db.collection(col.name).drop();
      console.log(`  [DROP] ${col.name}`);
    }
  }

  console.log('\nDatabase reset complete!');
  if (!keepAdmin) {
    console.log('Run "node scripts/createAdmin.js" to recreate the admin account.');
  }

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('Reset failed:', err.message);
  process.exit(1);
});
