const Event = require('../models/Event');
const Organizer = require('../models/Organizer');
const Participant = require('../models/Participant');
const Registration = require('../models/Registration');
const axios = require('axios');
const Fuse = require('fuse.js');

// @desc    Create event (starts as DRAFT)
// @route   POST /api/events
const createEvent = async (req, res) => {
  try {
    const organizer = await Organizer.findOne({ userId: req.user._id });
    if (!organizer) {
      return res.status(404).json({ success: false, error: 'Organizer profile not found' });
    }

    const event = await Event.create({
      ...req.body,
      organizer: organizer._id,
      status: 'DRAFT',
    });

    res.status(201).json({ success: true, data: event });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get all events with filters
// @route   GET /api/events
const getEvents = async (req, res) => {
  try {
    const { search, type, eligibility, startDate, endDate, tags, followedOnly, status } = req.query;

    let query = {};

    if (!status) {
      query.status = { $in: ['PUBLISHED', 'ONGOING'] };
    } else {
      query.status = status;
    }

    // Don't apply text search in query when fuzzy — we'll filter after
    if (type && ['NORMAL', 'MERCHANDISE'].includes(type)) {
      query.eventType = type;
    }

    if (eligibility && ['All', 'IIIT Only', 'Non-IIIT Only'].includes(eligibility)) {
      query.eligibility = eligibility;
    }

    if (startDate || endDate) {
      query.eventStartDate = {};
      if (startDate) query.eventStartDate.$gte = new Date(startDate);
      if (endDate) query.eventStartDate.$lte = new Date(endDate);
    }

    if (tags) {
      const tagArray = tags.split(',').map(t => t.trim());
      query.eventTags = { $in: tagArray };
    }

    let participantInterests = [];
    if (req.user && req.user.role === 'participant') {
      const participant = await Participant.findOne({ userId: req.user._id });
      if (participant) {
        participantInterests = participant.interests || [];
        if (followedOnly === 'true' && participant.followedClubs.length > 0) {
          query.organizer = { $in: participant.followedClubs };
        }
      }
    }

    let events = await Event.find(query)
      .populate('organizer', 'organizerName category description')
      .sort({ createdAt: -1 });

    // Auto-update status based on current time
    await Event.autoUpdateStatus(events);

    // Apply fuzzy search on event name, description, and organizer name
    if (search && search.trim()) {
      const eventsForFuse = events.map(e => ({
        ...e.toObject(),
        _organizerName: e.organizer?.organizerName || '',
      }));

      const fuse = new Fuse(eventsForFuse, {
        keys: [
          { name: 'eventName', weight: 0.4 },
          { name: '_organizerName', weight: 0.3 },
          { name: 'description', weight: 0.2 },
          { name: 'eventTags', weight: 0.1 },
        ],
        threshold: 0.4,
        includeScore: true,
        ignoreLocation: true,
        minMatchCharLength: 2,
      });

      const results = fuse.search(search.trim());
      // Map back original mongoose documents preserving fuse order
      const idScoreMap = new Map();
      results.forEach(r => idScoreMap.set(r.item._id.toString(), r.score));
      events = events.filter(e => idScoreMap.has(e._id.toString()));
      events.sort((a, b) => idScoreMap.get(a._id.toString()) - idScoreMap.get(b._id.toString()));
    } else {
      // No search: boost events matching participant interests
      if (participantInterests.length > 0) {
        const interestsLower = participantInterests.map(i => i.toLowerCase());
        events.sort((a, b) => {
          const aMatch = (a.eventTags || []).some(t => interestsLower.includes(t.toLowerCase())) ? 0 : 1;
          const bMatch = (b.eventTags || []).some(t => interestsLower.includes(t.toLowerCase())) ? 0 : 1;
          if (aMatch !== bMatch) return aMatch - bMatch;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
      }
    }

    res.status(200).json({ success: true, count: events.length, data: events });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get event by ID
// @route   GET /api/events/:id
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'organizerName category description contactEmail');

    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    // Auto-update status based on current time
    const oldStatus = event.status;
    event.computeStatus();
    if (event.status !== oldStatus) await event.save();

    res.status(200).json({ success: true, data: event });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get trending events (top 5 by registrations in 24h)
// @route   GET /api/events/trending
const getTrendingEvents = async (req, res) => {
  try {
    const Registration = require('../models/Registration');
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Aggregate registrations from last 24 hours grouped by event
    const recentRegs = await Registration.aggregate([
      { $match: { createdAt: { $gte: twentyFourHoursAgo } } },
      { $group: { _id: '$event', recentCount: { $sum: 1 } } },
      { $sort: { recentCount: -1 } },
      { $limit: 5 },
    ]);

    const eventIds = recentRegs.map((r) => r._id);

    let events;
    if (eventIds.length > 0) {
      // Fetch events in order of trending popularity
      events = await Event.find({
        _id: { $in: eventIds },
        status: { $in: ['PUBLISHED', 'ONGOING'] },
      }).populate('organizer', 'organizerName category');

      // Sort based on aggregation order
      const orderMap = {};
      recentRegs.forEach((r, i) => { orderMap[r._id.toString()] = i; });
      events.sort((a, b) => (orderMap[a._id.toString()] ?? 99) - (orderMap[b._id.toString()] ?? 99));
    } else {
      // Fallback: top 5 by total registrations
      events = await Event.find({ status: { $in: ['PUBLISHED', 'ONGOING'] } })
        .populate('organizer', 'organizerName category')
        .sort({ currentRegistrations: -1 })
        .limit(5);
    }

    // Auto-update status based on current time
    await Event.autoUpdateStatus(events);

    res.status(200).json({ success: true, count: events.length, data: events });
  } catch (error) {
    console.error('Get trending error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    const organizer = await Organizer.findOne({ userId: req.user._id });

    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    if (event.organizer.toString() !== organizer._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized to update this event' });
    }

    if (event.status === 'DRAFT') {
      Object.assign(event, req.body);
    } else if (event.status === 'PUBLISHED') {
      const allowedFields = ['description', 'registrationDeadline', 'registrationLimit'];
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          if (field === 'registrationDeadline') {
            const newDeadline = new Date(req.body[field]);
            if (newDeadline < event.registrationDeadline) {
              return res.status(400).json({ success: false, error: 'Cannot decrease registration deadline' });
            }
          }
          if (field === 'registrationLimit' && req.body[field] < event.registrationLimit) {
            return res.status(400).json({ success: false, error: 'Cannot decrease registration limit' });
          }
          event[field] = req.body[field];
        }
      }
    } else {
      return res.status(400).json({ success: false, error: `Cannot edit event in ${event.status} status` });
    }

    await event.save();
    res.status(200).json({ success: true, data: event });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Publish event
// @route   POST /api/events/:id/publish
const publishEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    const organizer = await Organizer.findOne({ userId: req.user._id });

    if (!event) return res.status(404).json({ success: false, error: 'Event not found' });

    if (event.status !== 'DRAFT') {
      return res.status(400).json({ success: false, error: `Event is already ${event.status.toLowerCase()}` });
    }

    if (event.organizer.toString() !== organizer._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    event.status = 'PUBLISHED';
    await event.save();

    // Discord webhook notification
    if (organizer.discordWebhook) {
      try {
        await axios.post(organizer.discordWebhook, {
          embeds: [{
            title: `New Event: ${event.eventName}`,
            description: event.description.substring(0, 200),
            color: 6750207,
            fields: [
              { name: 'Type', value: event.eventType, inline: true },
              { name: 'Fee', value: `₹${event.registrationFee}`, inline: true },
              { name: 'Deadline', value: new Date(event.registrationDeadline).toLocaleDateString(), inline: true },
            ],
            footer: { text: `By ${organizer.organizerName}` },
            timestamp: new Date().toISOString(),
          }],
        });
      } catch (discordError) {
        console.error('Discord webhook error:', discordError.message);
      }
    }

    res.status(200).json({ success: true, data: event, message: 'Event published successfully' });
  } catch (error) {
    console.error('Publish event error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Close or Complete event
// @route   POST /api/events/:id/close
const closeEvent = async (req, res) => {
  try {
    const { newStatus } = req.body;
    if (!['CLOSED', 'COMPLETED'].includes(newStatus)) {
      return res.status(400).json({ success: false, error: 'Invalid status. Use CLOSED or COMPLETED' });
    }

    const event = await Event.findById(req.params.id);
    const organizer = await Organizer.findOne({ userId: req.user._id });

    if (!event) return res.status(404).json({ success: false, error: 'Event not found' });

    if (event.organizer.toString() !== organizer._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    event.status = newStatus;
    await event.save();

    res.status(200).json({ success: true, data: event, message: `Event ${newStatus.toLowerCase()} successfully` });
  } catch (error) {
    console.error('Close event error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get organizer's events
// @route   GET /api/events/organizer/my-events
const getOrganizerEvents = async (req, res) => {
  try {
    const organizer = await Organizer.findOne({ userId: req.user._id });
    if (!organizer) {
      return res.status(404).json({ success: false, error: 'Organizer profile not found' });
    }

    const events = await Event.find({ organizer: organizer._id }).sort({ createdAt: -1 });

    // Auto-update status based on current time
    await Event.autoUpdateStatus(events);

    const eventsWithStats = await Promise.all(
      events.map(async (event) => {
        const registrationCount = await Registration.countDocuments({ event: event._id, status: 'CONFIRMED' });
        const attendanceCount = await Registration.countDocuments({ event: event._id, 'attendance.marked': true });
        const revenue = await Registration.aggregate([
          { $match: { event: event._id, status: 'CONFIRMED' } },
          { $group: { _id: null, total: { $sum: '$merchandiseDetails.totalPrice' } } },
        ]);

        return {
          ...event.toObject(),
          stats: {
            registrations: registrationCount,
            attendance: attendanceCount,
            revenue: revenue.length > 0 ? revenue[0].total : 0,
          },
        };
      })
    );

    res.status(200).json({ success: true, count: eventsWithStats.length, data: eventsWithStats });
  } catch (error) {
    console.error('Get organizer events error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get event analytics for organizer
// @route   GET /api/events/:id/analytics
const getEventAnalytics = async (req, res) => {
  try {
    const organizer = await Organizer.findOne({ userId: req.user._id });
    const event = await Event.findById(req.params.id);

    if (!event) return res.status(404).json({ success: false, error: 'Event not found' });
    if (event.organizer.toString() !== organizer._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    const totalRegistrations = await Registration.countDocuments({ event: event._id, status: 'CONFIRMED' });
    const totalAttendance = await Registration.countDocuments({ event: event._id, 'attendance.marked': true });
    const pendingPayments = await Registration.countDocuments({ event: event._id, paymentStatus: 'PENDING' });
    const revenueResult = await Registration.aggregate([
      { $match: { event: event._id, status: 'CONFIRMED' } },
      { $group: { _id: null, total: { $sum: '$merchandiseDetails.totalPrice' } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalRegistrations,
        totalAttendance,
        pendingPayments,
        revenue: revenueResult.length > 0 ? revenueResult[0].total : 0,
        registrationLimit: event.registrationLimit,
        attendanceRate: totalRegistrations > 0 ? ((totalAttendance / totalRegistrations) * 100).toFixed(1) : 0,
      },
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  getTrendingEvents,
  updateEvent,
  publishEvent,
  closeEvent,
  getOrganizerEvents,
  getEventAnalytics,
};
