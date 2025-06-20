const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Session = require('../models/Session');

/**
 * Set up WebSocket server with Socket.IO
 * @param {Object} httpServer - HTTP server instance
 */
const setupWebSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  /**
   * Authenticate WebSocket connection using JWT
   */
  io.use(async (socket, next) => {
    try {
      // Get token from handshake auth
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: Token not provided'));
      }
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if token is in active sessions
      const session = await Session.findOne({ 
        userId: decoded.id, 
        token,
        expires: { $gt: new Date() }
      });
      
      if (!session) {
        return next(new Error('Authentication error: Invalid session'));
      }
      
      // Get user
      const user = await User.findById(decoded.id);
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }
      
      // Attach user to socket
      socket.user = {
        _id: user._id.toString(),
        name: user.name,
      };
      
      next();
    } catch (error) {
      return next(new Error('Authentication error: ' + error.message));
    }
  });

  // Handle connections
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.name}`);
    
    // Join user to a personal room
    socket.join(socket.user._id);
    
    // Join board room when requested
    socket.on('join-board', (boardId) => {
      socket.join(`board:${boardId}`);
      console.log(`User ${socket.user.name} joined board: ${boardId}`);
    });
    
    // Leave board room
    socket.on('leave-board', (boardId) => {
      socket.leave(`board:${boardId}`);
      console.log(`User ${socket.user.name} left board: ${boardId}`);
    });
    
    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.name}`);
    });
  });

  return io;
};

module.exports = setupWebSocket;
