/**
 * seed.js — Populate the database with demo data for quick testing.
 *
 * Usage:
 *   node seed.js          — seeds the DB (drops existing data first)
 *   node seed.js --reset  — only drops all data, no seeding
 *
 * Creates:
 *   1 Admin       — admin@felicity.com / admin123456
 *   2 Organizers  — with known passwords (see output)
 *   3 Participants — with known passwords (see output)
 *   4 Events      — 2 Normal (1 published, 1 IIIT-only) + 1 Merchandise + 1 Draft
 *   Registrations — participants registered for events with tickets + QR
 *   Discussions   — sample messages with reactions and a reply
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Admin = require('./models/Admin');
const Participant = require('./models/Participant');
const Organizer = require('./models/Organizer');
const Event = require('./models/Event');
const Registration = require('./models/Registration');
const Discussion = require('./models/Discussion');
const PasswordResetRequest = require('./models/PasswordResetRequest');
const Task = require('./models/Task');
const { generateQR } = require('./utils/qrGenerator');

/* ─── Helpers ─────────────────────────────────────────── */

const genTicketId = () => {
  const ts = Date.now();
  const rand = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `FEL-${ts}-${rand}`;
};

const future = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
};

const past = (days) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
};

/* ─── Main ────────────────────────────────────────────── */

const seed = async () => {
  await connectDB();

  // ── 1. Drop all collections ──────────────────────────
  console.log('\n🗑  Dropping all collections...');
  const models = [User, Admin, Participant, Organizer, Event, Registration, Discussion, PasswordResetRequest, Task];
  for (const M of models) {
    await M.deleteMany({});
  }
  console.log('   Done.\n');

  if (process.argv.includes('--reset')) {
    console.log('✅ Database reset complete (--reset flag). No data seeded.');
    return process.exit(0);
  }

  // ── 2. Admin ─────────────────────────────────────────
  console.log('👤 Creating Admin...');
  const adminUser = await User.create({ email: 'admin@felicity.com', password: 'admin123456', role: 'admin' });
  await Admin.create({ userId: adminUser._id, name: 'System Admin' });

  // ── 3. Organizers ────────────────────────────────────
  console.log('🏢 Creating Organizers...');

  const org1User = await User.create({ email: 'techclub@clubs.iiit.ac.in', password: 'techclub123', role: 'organizer' });
  const org1 = await Organizer.create({
    userId: org1User._id,
    organizerName: 'Tech Club IIITH',
    category: 'Technical',
    description: 'The premier technical club of IIIT Hyderabad. We organize hackathons, workshops, and coding competitions.',
    contactEmail: 'techclub@clubs.iiit.ac.in',
    contactNumber: '9000000001',
    isApproved: true,
  });

  const org2User = await User.create({ email: 'dramasoc@clubs.iiit.ac.in', password: 'dramasoc123', role: 'organizer' });
  const org2 = await Organizer.create({
    userId: org2User._id,
    organizerName: 'Drama Society',
    category: 'Drama',
    description: 'Drama Society brings theatre and performing arts to IIIT-H campus. Join us for plays, improv nights, and more.',
    contactEmail: 'dramasoc@clubs.iiit.ac.in',
    contactNumber: '9000000002',
    isApproved: true,
  });

  // ── 4. Participants ──────────────────────────────────
  console.log('🙋 Creating Participants...');

  const p1User = await User.create({ email: 'rahul.sharma@students.iiit.ac.in', password: 'password123', role: 'participant' });
  const p1 = await Participant.create({
    userId: p1User._id,
    firstName: 'Rahul',
    lastName: 'Sharma',
    participantType: 'IIIT',
    collegeName: 'IIIT Hyderabad',
    contactNumber: '9876543210',
    interests: ['Coding', 'Gaming', 'Music'],
    followedClubs: [org1._id],
    onboardingComplete: true,
  });

  const p2User = await User.create({ email: 'priya.patel@gmail.com', password: 'password123', role: 'participant' });
  const p2 = await Participant.create({
    userId: p2User._id,
    firstName: 'Priya',
    lastName: 'Patel',
    participantType: 'NON_IIIT',
    collegeName: 'NIT Warangal',
    contactNumber: '8765432109',
    interests: ['Dance', 'Drama', 'Music'],
    followedClubs: [org2._id],
    onboardingComplete: true,
  });

  const p3User = await User.create({ email: 'amit.kumar@students.iiit.ac.in', password: 'password123', role: 'participant' });
  const p3 = await Participant.create({
    userId: p3User._id,
    firstName: 'Amit',
    lastName: 'Kumar',
    participantType: 'IIIT',
    collegeName: 'IIIT Hyderabad',
    contactNumber: '7654321098',
    interests: ['Coding', 'Robotics'],
    followedClubs: [org1._id],
    onboardingComplete: true,
  });

  // ── 5. Events ────────────────────────────────────────
  console.log('📅 Creating Events...');

  // Event 1 — Published Normal event (open to all)
  const event1 = await Event.create({
    eventName: 'Hackathon 2026',
    description: 'A 24-hour coding hackathon open to all students. Build innovative solutions to real-world problems. Prizes worth INR 50,000!',
    eventType: 'NORMAL',
    organizer: org1._id,
    venue: 'Himalaya Block, IIIT-H',
    eligibility: 'All',
    registrationDeadline: future(18),
    eventStartDate: future(20),
    eventEndDate: future(21),
    registrationLimit: 100,
    registrationFee: 0,
    status: 'PUBLISHED',
    eventTags: ['coding', 'hackathon', 'tech', 'competition'],
    customFormFields: [
      { fieldName: 'teamName', fieldLabel: 'Team Name', fieldType: 'text', required: true, order: 1 },
      { fieldName: 'experienceLevel', fieldLabel: 'Experience Level', fieldType: 'text', required: true, order: 2 },
    ],
  });

  // Event 2 — Published Normal event (IIIT Only)
  const event2 = await Event.create({
    eventName: 'IIIT Internal Meetup',
    description: 'An exclusive meetup for IIIT-H students to discuss campus tech projects, research opportunities, and upcoming competitions.',
    eventType: 'NORMAL',
    organizer: org1._id,
    venue: 'T-Hub, Vindhya Block',
    eligibility: 'IIIT Only',
    registrationDeadline: future(13),
    eventStartDate: future(15),
    eventEndDate: future(16),
    registrationLimit: 50,
    registrationFee: 0,
    status: 'PUBLISHED',
    eventTags: ['meetup', 'networking', 'iiit'],
    customFormFields: [
      { fieldName: 'topic', fieldLabel: 'Topic of Interest', fieldType: 'text', required: false, order: 1 },
    ],
  });

  // Event 3 — Published Merchandise event
  const event3 = await Event.create({
    eventName: 'Tech Club Merch Store',
    description: 'Official Tech Club merchandise — hoodies, t-shirts, and sticker packs. Limited stock!',
    eventType: 'MERCHANDISE',
    organizer: org1._id,
    eligibility: 'All',
    registrationDeadline: future(30),
    eventStartDate: future(35),
    eventEndDate: future(60),
    registrationFee: 0,
    status: 'PUBLISHED',
    eventTags: ['merchandise', 'tech', 'clothing'],
    merchandiseDetails: {
      items: [
        { name: 'Club Hoodie', price: 800, stock: 50 },
        { name: 'Club T-Shirt', price: 400, stock: 100 },
        { name: 'Sticker Pack', price: 50, stock: 200 },
      ],
      purchaseLimitPerUser: 3,
    },
  });

  // Event 4 — Draft event (by Drama Society)
  const event4 = await Event.create({
    eventName: 'Shakespeare Night',
    description: 'An evening of Shakespearean plays performed by Drama Society members. Open to all theatre enthusiasts.',
    eventType: 'NORMAL',
    organizer: org2._id,
    venue: 'Open Air Theatre, IIIT-H',
    eligibility: 'All',
    registrationDeadline: future(25),
    eventStartDate: future(28),
    eventEndDate: future(28),
    registrationLimit: 200,
    registrationFee: 50,
    status: 'DRAFT',
    eventTags: ['drama', 'theatre', 'shakespeare', 'cultural'],
    customFormFields: [
      { fieldName: 'preference', fieldLabel: 'Preferred Play', fieldType: 'text', required: false, order: 1 },
    ],
  });

  // ── 6. Registrations ────────────────────────────────
  console.log('🎫 Creating Registrations with Tickets & QR...');

  // Rahul → Hackathon (confirmed, with ticket + QR)
  const ticket1 = genTicketId();
  const qr1 = await generateQR(ticket1, event1._id.toString(), p1._id.toString());
  const reg1 = await Registration.create({
    participant: p1._id,
    event: event1._id,
    registrationType: 'NORMAL',
    ticketId: ticket1,
    qrCode: qr1,
    status: 'CONFIRMED',
    paymentStatus: 'NOT_REQUIRED',
    customFormData: { teamName: 'ByteForce', experienceLevel: 'Intermediate' },
  });
  event1.currentRegistrations += 1;

  // Amit → Hackathon (confirmed)
  const ticket2 = genTicketId();
  const qr2 = await generateQR(ticket2, event1._id.toString(), p3._id.toString());
  await Registration.create({
    participant: p3._id,
    event: event1._id,
    registrationType: 'NORMAL',
    ticketId: ticket2,
    qrCode: qr2,
    status: 'CONFIRMED',
    paymentStatus: 'NOT_REQUIRED',
    customFormData: { teamName: 'CodeCrafters', experienceLevel: 'Beginner' },
  });
  event1.currentRegistrations += 1;
  await event1.save();

  // Priya → Hackathon (confirmed — eligibility is "All")
  const ticket3 = genTicketId();
  const qr3 = await generateQR(ticket3, event1._id.toString(), p2._id.toString());
  await Registration.create({
    participant: p2._id,
    event: event1._id,
    registrationType: 'NORMAL',
    ticketId: ticket3,
    qrCode: qr3,
    status: 'CONFIRMED',
    paymentStatus: 'NOT_REQUIRED',
    customFormData: { teamName: 'PixelPioneers', experienceLevel: 'Advanced' },
  });
  event1.currentRegistrations += 1;
  await event1.save();

  // Rahul → IIIT Internal Meetup (confirmed)
  const ticket4 = genTicketId();
  const qr4 = await generateQR(ticket4, event2._id.toString(), p1._id.toString());
  await Registration.create({
    participant: p1._id,
    event: event2._id,
    registrationType: 'NORMAL',
    ticketId: ticket4,
    qrCode: qr4,
    status: 'CONFIRMED',
    paymentStatus: 'NOT_REQUIRED',
    customFormData: { topic: 'AI Research' },
  });
  event2.currentRegistrations += 1;
  await event2.save();

  // Rahul → Merch Store (pending payment)
  await Registration.create({
    participant: p1._id,
    event: event3._id,
    registrationType: 'MERCHANDISE',
    status: 'PENDING',
    paymentStatus: 'PENDING',
    merchandiseDetails: {
      itemName: 'Club Hoodie',
      quantity: 1,
      totalPrice: 800,
    },
  });
  event3.currentRegistrations += 1;
  await event3.save();

  // ── 7. Discussion Messages ──────────────────────────
  console.log('💬 Creating Discussion messages...');

  const msg1 = await Discussion.create({
    event: event1._id,
    participant: p1._id,
    message: 'Hey everyone! Excited for the hackathon. Anyone looking for teammates?',
    reactions: [
      { userId: p2User._id, emoji: '👍' },
      { userId: p3User._id, emoji: '🎉' },
    ],
  });

  const msg2 = await Discussion.create({
    event: event1._id,
    participant: p2._id,
    message: 'Hi Rahul! We could team up. I have experience with React and Node.',
    replyTo: msg1._id,
    reactions: [
      { userId: p1User._id, emoji: '❤️' },
    ],
  });

  await Discussion.create({
    event: event1._id,
    organizer: org1._id,
    message: 'Welcome everyone! The problem statements will be released 1 hour before the event starts. Make sure your teams are ready!',
    isPinned: true,
  });

  await Discussion.create({
    event: event1._id,
    participant: p3._id,
    message: 'Can we use any programming language or is it restricted to JavaScript?',
  });

  // ── 8. Password Reset Request (pending) ─────────────
  console.log('🔑 Creating a pending password reset request...');
  await PasswordResetRequest.create({
    organizer: org2._id,
    reason: 'Forgot my auto-generated password, need a new one.',
    status: 'PENDING',
  });

  // ── Done ────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  ✅  DATABASE SEEDED SUCCESSFULLY');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
  console.log('  🔑  LOGIN CREDENTIALS');
  console.log('  ─────────────────────────────────────────────');
  console.log('  ADMIN');
  console.log('    Email:    admin@felicity.com');
  console.log('    Password: admin123456');
  console.log('');
  console.log('  ORGANIZER 1 — Tech Club IIITH (Technical)');
  console.log('    Email:    techclub@clubs.iiit.ac.in');
  console.log('    Password: techclub123');
  console.log('');
  console.log('  ORGANIZER 2 — Drama Society (Drama)');
  console.log('    Email:    dramasoc@clubs.iiit.ac.in');
  console.log('    Password: dramasoc123');
  console.log('');
  console.log('  PARTICIPANT 1 — Rahul Sharma (IIIT)');
  console.log('    Email:    rahul.sharma@students.iiit.ac.in');
  console.log('    Password: password123');
  console.log('');
  console.log('  PARTICIPANT 2 — Priya Patel (NON_IIIT, NIT Warangal)');
  console.log('    Email:    priya.patel@gmail.com');
  console.log('    Password: password123');
  console.log('');
  console.log('  PARTICIPANT 3 — Amit Kumar (IIIT)');
  console.log('    Email:    amit.kumar@students.iiit.ac.in');
  console.log('    Password: password123');
  console.log('');
  console.log('  📅  EVENTS');
  console.log('  ─────────────────────────────────────────────');
  console.log('  1. Hackathon 2026         — PUBLISHED, Normal, All');
  console.log('     Registrations: Rahul ✓  Priya ✓  Amit ✓');
  console.log('  2. IIIT Internal Meetup   — PUBLISHED, Normal, IIIT Only');
  console.log('     Registrations: Rahul ✓');
  console.log('  3. Tech Club Merch Store  — PUBLISHED, Merchandise, All');
  console.log('     Registrations: Rahul (PENDING payment)');
  console.log('  4. Shakespeare Night      — DRAFT (Drama Society)');
  console.log('');
  console.log('  💬  DISCUSSIONS (Hackathon 2026)');
  console.log('  ─────────────────────────────────────────────');
  console.log('  - Rahul: Looking for teammates (2 reactions)');
  console.log('  - Priya: Reply to Rahul (1 reaction)');
  console.log('  - Organizer: Pinned announcement');
  console.log('  - Amit: Question about languages');
  console.log('');
  console.log('  🔑  PASSWORD RESET');
  console.log('  ─────────────────────────────────────────────');
  console.log('  - Drama Society has a PENDING reset request');
  console.log('');
  console.log('═══════════════════════════════════════════════════════\n');

  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
