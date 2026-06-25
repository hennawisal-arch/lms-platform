const jwt = require('jsonwebtoken');

/**
 * Lightweight WebRTC signaling layer for live classroom sessions.
 * This server never touches actual audio/video data — it only relays the
 * SDP offers/answers and ICE candidates that let two browsers negotiate a
 * direct peer-to-peer connection. Each course can host one "room" per
 * live session (roomId is typically the courseId or a generated session id).
 */
function registerWebrtcSignaling(io) {
  // Track participants per room: { [roomId]: Map(socketId -> { userId, name, role }) }
  const rooms = new Map();

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication token required'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('join-room', ({ roomId, name, role }) => {
      socket.join(roomId);
      socket.roomId = roomId;

      if (!rooms.has(roomId)) rooms.set(roomId, new Map());
      const participants = rooms.get(roomId);

      // Tell the new joiner about everyone already in the room
      const existing = Array.from(participants.entries()).map(([id, info]) => ({ socketId: id, ...info }));
      socket.emit('existing-participants', existing);

      participants.set(socket.id, { userId: socket.userId, name, role });

      // Tell everyone else a new peer joined
      socket.to(roomId).emit('participant-joined', { socketId: socket.id, userId: socket.userId, name, role });
    });

    socket.on('signal', ({ to, signal }) => {
      // Relay an SDP offer/answer or ICE candidate to a specific peer
      io.to(to).emit('signal', { from: socket.id, signal });
    });

    socket.on('chat-message', ({ roomId, message, name }) => {
      io.to(roomId).emit('chat-message', { socketId: socket.id, name, message, at: Date.now() });
    });

    socket.on('leave-room', () => handleLeave(socket));
    socket.on('disconnect', () => handleLeave(socket));

    function handleLeave(s) {
      if (!s.roomId) return;
      const participants = rooms.get(s.roomId);
      if (participants) {
        participants.delete(s.id);
        if (participants.size === 0) rooms.delete(s.roomId);
      }
      s.to(s.roomId).emit('participant-left', { socketId: s.id });
      s.leave(s.roomId);
    }
  });
}

module.exports = registerWebrtcSignaling;
