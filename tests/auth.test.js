const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Session = require('../src/models/Session'); // Pentru manipulare sesiuni

let mongoServer;

// Setup in-memory MongoDB server before all tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

// Clear database between tests
beforeEach(async () => {
  await User.deleteMany({});
  await Session.deleteMany({});
});

// Close database connection after all tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Test data
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
};

/**
 * Auth Controller Tests
 */
describe('Auth Controller', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body.user).toHaveProperty('_id');
      expect(res.body.user.name).toBe(testUser.name);
      expect(res.body.user.email).toBe(testUser.email);
      expect(res.body.user).not.toHaveProperty('password');
    });

    it('should not register a user with duplicate email', async () => {
      await User.create(testUser);

      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(400);

      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toMatch(/already exists/i);
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'invalid@test.com' }) // Missing name and password
        .expect(400);

      expect(res.body).toHaveProperty('errors');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);
    });

    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body.user).toHaveProperty('_id');
      expect(res.body.user.email).toBe(testUser.email);
    });

    it('should not login with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        })
        .expect(401);

      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toMatch(/invalid/i);
    });
  });

  describe('Refresh & Logout flow', () => {
    let token, refreshToken;

    beforeEach(async () => {
      // Creează userul înainte de login
      await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      // Loghează userul
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(200);

      token = res.body.token;
      refreshToken = res.body.refreshToken;
    });

    it('should refresh token using a valid refresh token', async () => {
      const refreshRes = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${token}`)
        .send({ refreshToken })
        .expect(200);

      expect(refreshRes.body).toHaveProperty('token');
      expect(refreshRes.body).toHaveProperty('refreshToken');
      expect(refreshRes.body.user.email).toBe(testUser.email);
    });

    it('should NOT refresh token with invalid refresh token', async () => {
      const refreshRes = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${token}`)
        .send({ refreshToken: 'invalidtoken' })
        .expect(401);

      expect(refreshRes.body).toHaveProperty('message');
      expect(refreshRes.body.message).toMatch(/invalid/i);
    });

    it('should logout user and invalidate the refresh token', async () => {
      const logoutRes = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .send({ refreshToken })
        .expect(200);

      expect(logoutRes.body).toHaveProperty('message');
      expect(logoutRes.body.message).toMatch(/logged out/i);

      // Încearcă refresh cu refresh token deja invalidat
      const refreshRes = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${token}`)
        .send({ refreshToken })
        .expect(401);

      expect(refreshRes.body).toHaveProperty('message');
      expect(refreshRes.body.message).toMatch(/invalid/i);
    });

    it('should NOT refresh token if session is expired', async () => {
      // Expirează sesiunea manual
      await Session.updateOne(
        { refreshToken },
        { expiresAt: new Date(Date.now() - 10000) }
      );

      const refreshRes = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${token}`)
        .send({ refreshToken })
        .expect(401);

      expect(refreshRes.body).toHaveProperty('message');
      expect(refreshRes.body.message).toMatch(/invalid|expired/i);
    });
  });
});
