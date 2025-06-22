/**
 * @file swagger.js
 * @description Swagger configuration for API documentation
 */

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Pro API Documentation',
      version: '1.0.0',
      description: 'API documentation for the Task Pro application',
      contact: {
        name: 'Task Pro Team'
      },
      servers: [
        {
          url: 'http://localhost:5000',
          description: 'Development server'
        }
        // {
        //   url: 'https://task-pro-api.herokuapp.com',
        //   description: 'Production server'
        // }
      ]
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/models/*.js']
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

/**
 * Setup Swagger documentation middleware for Express
 * @param {Object} app - Express app instance
 */
const setupSwagger = (app) => {
  // Serve Swagger docs at /api-docs endpoint
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Task Pro API Documentation'
  }));
  
  // Serve Swagger JSON at /api-docs.json endpoint
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerDocs);
  });
};

module.exports = setupSwagger;
