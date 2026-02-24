const Discussion = require('../models/Discussion');
const Participant = require('../models/Participant');
const Organizer = require('../models/Organizer');

const setupDiscussionSocket = (io) => {
  const discussionNamespace = io.of('/discussions');

  discussionNamespace.on('connection', (socket) => {
    console.log('User connected to discussions:', socket.id);

    // Join event discussion room
    socket.on('joinEvent', (eventId) => {
      socket.join(eventId);
      console.log(`Socket ${socket.id} joined event ${eventId}`);
    });

    // Leave event discussion room
    socket.on('leaveEvent', (eventId) => {
      socket.leave(eventId);
      console.log(`Socket ${socket.id} left event ${eventId}`);
    });

    // New message
    socket.on('sendMessage', async (data) => {
      try {
        const { eventId, message, userId, role } = data;

        let msgData = { event: eventId, message: message.trim() };

        if (role === 'participant') {
          const participant = await Participant.findOne({ userId });
          if (participant) msgData.participant = participant._id;
        } else if (role === 'organizer') {
          const organizer = await Organizer.findOne({ userId });
          if (organizer) msgData.organizer = organizer._id;
        }

        const newMsg = await Discussion.create(msgData);
        const populated = await Discussion.findById(newMsg._id)
          .populate('participant', 'firstName lastName')
          .populate('organizer', 'organizerName');

        // Broadcast to all in room
        discussionNamespace.to(eventId).emit('newMessage', populated);
      } catch (error) {
        console.error('Socket message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing', (data) => {
      const { eventId, userName } = data;
      socket.to(eventId).emit('userTyping', { userName });
    });

    // Stop typing
    socket.on('stopTyping', (data) => {
      const { eventId } = data;
      socket.to(eventId).emit('userStoppedTyping');
    });

    socket.on('disconnect', () => {
      console.log('User disconnected from discussions:', socket.id);
    });
  });
};

module.exports = setupDiscussionSocket;
