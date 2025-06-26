const app = require('./app');
const connectDB = require('./config/db');
const setupWebSocket = require('./services/websocketService');
const os = require('os');

// Set port
const PORT = process.env.PORT || 5000;

// Connect to database then start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start Express server
    const server = app.listen(PORT, () => {
      // Culori pentru terminal
      const yellow = '\x1b[33m%s\x1b[0m';
      const green = '\x1b[32m%s\x1b[0m';
      const cyan = '\x1b[36m%s\x1b[0m';

      const divider = '='.repeat(60);

      console.log(divider);
      console.log(yellow, `🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      console.log(yellow, '📚 API Documentation:');
      console.log(green, `   Local:           http://localhost:${PORT}/api-docs`);

      // Obține IP-ul pentru testare în rețea
      const networkInterfaces = os.networkInterfaces();
      const ipAddress = Object.values(networkInterfaces)
        .flat()
        .filter(details => details.family === 'IPv4' && !details.internal)
        .map(details => details.address)[0];

      if (ipAddress) {
        console.log(green, `   Network:         http://${ipAddress}:${PORT}/api-docs`);
      }

      console.log(cyan, '🧪 Testează API-ul cu Swagger UI sau importă colecția în Postman');
      console.log(divider);
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
