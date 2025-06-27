/**
 * @file swagger.js
 * @description Swagger configuration for API documentation
 */

const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Task Pro API Documentation",
      version: "1.0.0",
      description: "API documentation for the Task Pro application",
      contact: {
        name: "Task Pro Team",
      },
      servers: [
        {
          url: "http://localhost:5000",
          description: "Development server",
        },
        {
          url: "https://task-pro-backend-5kph.onrender.com",
          description: "Production server",
        },
      ],
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Board: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "6857d817ec6b57abab04deb0",
            },
            title: {
              type: "string",
              example: "Board Test",
            },
            icon: {
              type: "string",
              example: "📌",
            },
            background: {
              type: "string",
              example: "bg-1",
            },
            owner: {
              type: "string",
              example: "685721906af6a7e5cc0fc177",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2025-06-22T10:16:55.714Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2025-06-22T10:16:55.714Z",
            },
          },
        },
        Column: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "60f1b5c5fc13ae001e000001",
            },
            title: {
              type: "string",
              example: "To Do",
            },
            board: {
              type: "string",
              example: "60f1b5c5fc13ae001e000002",
            },
            order: {
              type: "number",
              example: 0,
            },
            owner: {
              type: "string",
              example: "685721906af6a7e5cc0fc177",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2025-06-22T10:16:55.714Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2025-06-22T10:16:55.714Z",
            },
          },
        },
        Card: {
          type: "object",
          properties: {
            _id: { type: "string", example: "60f6e8d8b54764421c7b9a90" },
            title: { type: "string", example: "Create Swagger Docs" },
            description: {
              type: "string",
              example: "Add Swagger docs for all routes",
            },
            column: { type: "string", example: "60f6e8d8b54764421c7b9a40" },
            order: { type: "number", example: 1 },
            dueDate: { type: "string", format: "date", example: "2025-07-01" },
            priority: { type: "string", example: "high" },
            labels: {
              type: "array",
              items: { type: "string" },
              example: ["backend", "documentation"],
            },
            owner: { type: "string", example: "685721906af6a7e5cc0fc177" },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2025-06-22T10:16:55.714Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2025-06-22T10:16:55.714Z",
            },
          },
        },
      },
    },

    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.js", "./src/models/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

/**
 * Setup Swagger documentation middleware for Express
 * @param {Object} app - Express app instance
 */
const setupSwagger = (app) => {
  // Serve Swagger docs at /api-docs endpoint
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocs, {
      explorer: true,
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "Task Pro API Documentation",
    })
  );

  // Serve Swagger JSON at /api-docs.json endpoint
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerDocs);
  });
};

module.exports = setupSwagger;
