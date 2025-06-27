
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Validate application configuration
const { validateAppConfig } = require("./utils/validateConfig");

// Validate all required configurations
try {
  validateAppConfig();
} catch (error) {
  console.error(`Application startup failed: ${error.message}`);
  process.exit(1);
}

// Import error handling middleware
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");

// Import routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const boardRoutes = require("./routes/boardRoutes");
const columnRoutes = require("./routes/columnRoutes");
const cardRoutes = require("./routes/cardRoutes");
const needHelpRoutes = require('./routes/needHelpRoutes'); // Import need help routes

// Import API documentation setup
const setupSwagger = require("./docs/swagger");

// Create Express app
const app = express();
setupSwagger(app);

const passport = require('./config/passport');
app.use(passport.initialize());

// Security headers
app.use(helmet());

// CORS setup - improved configuration for multiple origins
app.use(
  cors({
    origin: function (origin, callback) {
      // Define allowed origins
      const allowedOrigins = [
        process.env.FRONTEND_URL,            // Main frontend
        "http://localhost:3000",
        "https://task-pro-backend-5kph.onrender.com",             // Local development frontend
        process.env.SERVER_URL,              // Server URL for API testing
        "https://task-pro-backend-5kph.onrender.com", // Explicit hosting URL
        "https://tania1103.github.io/Task_Pro/"       // GitHub Pages URL
      ].filter(Boolean);  // Remove null/undefined values

      // Allow requests without origin (like calls from Postman or direct navigation)
      if (!origin) return callback(null, true);

      // Check if the request origin is in the list of allowed origins
      if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS policy`));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
    maxAge: 86400  // Extend preflight cache for 24 hours (in seconds)
  })
);
// Request logging in development
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Parse JSON request bodies -- BODY PARSER TREBUIE SĂ FIE ÎNAINTEA RUTELOR!
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// API routes - TOATE rutele după body parser!
app.use('/api/need-help', needHelpRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/boards", boardRoutes);
app.use("/api/columns", columnRoutes);
app.use("/api/cards", cardRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Task Pro API",
    version: "1.0.0",
    documentation: "/api/docs",
  });
});

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

module.exports = app;
