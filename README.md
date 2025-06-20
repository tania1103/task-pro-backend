# Backend - Task Pro API

## Directory Structure

```plaintext
src/
├── config/               # Configuration files
│   ├── db.js             # Database connection
│   ├── cloudinary.js     # Cloudinary setup
│   └── email.js          # Email service setup
├── controllers/          # Request handlers
│   ├── authController.js
│   ├── boardController.js
│   ├── cardController.js
│   ├── columnController.js
│   └── userController.js
├── middlewares/          # Middleware functions
│   ├── authMiddleware.js
│   ├── errorMiddleware.js
│   └── validationMiddleware.js
├── models/               # Mongoose models
│   ├── User.js
│   ├── Board.js
│   ├── Column.js
│   ├── Card.js
│   └── Session.js
├── routes/               # API routes
│   ├── authRoutes.js
│   ├── boardRoutes.js
│   ├── cardRoutes.js
│   ├── columnRoutes.js
│   └── userRoutes.js
├── services/             # External services
│   ├── cloudinaryService.js
│   ├── emailService.js
│   └── websocketService.js
├── utils/                # Utility functions
│   ├── validators.js
│   ├── helpers.js
│   └── logger.js
└── app.js                # Express application setup
```

## Getting Started

### Installation

```bash
npm install
```

### Configuration

Create a `.env` file in the root directory based on `.env.example`.

### Development

```bash
npm run dev
```

### Testing

```bash
npm test
```

### Production

```bash
npm start
```

## API Documentation

API documentation is available at `/api/docs` when the server is running.

## Authentication

The API uses JWT token-based authentication. Include the token in the `Authorization` header:

```
Authorization: Bearer [your-token]
```

## Environment Variables

- `PORT`: Server port (default: 5000)
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for JWT signing
- `JWT_EXPIRES_IN`: JWT expiration time
- `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Cloudinary API key
- `CLOUDINARY_API_SECRET`: Cloudinary API secret
- `EMAIL_HOST`: SMTP host for email service
- `EMAIL_PORT`: SMTP port
- `EMAIL_USER`: SMTP username
- `EMAIL_PASS`: SMTP password
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
