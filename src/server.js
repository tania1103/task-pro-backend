const app = require('./app');
const connectDB = require('./config/db');
const setupWebSocket = require('./services/websocketService');

// Set port
const PORT = process.env.PORT || 5000;

// Connect to database then start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Start Express server
    const server = app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
    
    // Setup WebSocket
    setupWebSocket(server);
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error(`Error: ${err.message}`);
      // Close server & exit process
      server.close(() => process.exit(1));
    });
  } catch (error) {
    console.error(`Error starting server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
