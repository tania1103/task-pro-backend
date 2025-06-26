const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');

let mongoServer;
const testUser = {
  name: 'Theme Tester',
  email: 'theme@test.com',
  password: 'Password123!',
};

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('User theme endpoints', () => {
  let token;

  beforeEach(async () => {
    await request(app)
      .post('/api/auth/register')
      .send(testUser)
      .expect(201);

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password })
      .expect(200);

    token = loginRes.body.token;
  });

  it('should get default theme for new user', async () => {
    const res = await request(app)
      .get('/api/users/theme')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.theme).toBe('light');
  });

  it('should update theme to dark', async () => {
    const patchRes = await request(app)
      .patch('/api/users/theme')
      .set('Authorization', `Bearer ${token}`)
      .send({ theme: 'dark' })
      .expect(200);

    expect(patchRes.body.data.theme).toBe('dark');

    // Verifică și GET
    const getRes = await request(app)
      .get('/api/users/theme')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(getRes.body.theme).toBe('dark');
  });

  it('should reject invalid theme', async () => {
    const patchRes = await request(app)
      .patch('/api/users/theme')
      .set('Authorization', `Bearer ${token}`)
      .send({ theme: 'pink' })
      .expect(400);

    expect(patchRes.body.errors[0].field).toBe('theme');
    expect(patchRes.body.errors[0].message).toMatch(/one of/i);
  });
});
