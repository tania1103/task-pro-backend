const request = require('supertest');
const app = require('../src/app');
const path = require('path');
const User = require('../src/models/User');

// Mockează uploadul pe Cloudinary
jest.mock('../src/services/cloudinaryService', () => ({
  uploadImage: jest.fn(() =>
    Promise.resolve({
      secure_url: 'https://res.cloudinary.com/demo/image/upload/sample.png'
    })
  )
}));

describe('PATCH /api/users/profile-picture', () => {
  let token, userId;

  beforeAll(async () => {
    // Creezi un user și obții token
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'User Test',
        email: 'userupload@test.com',
        password: 'Parola123!'
      });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'userupload@test.com', password: 'Parola123!' });
    token = res.body.token;
    userId = res.body.user._id;
  });

  it('should upload and update profile picture', async () => {
    const res = await request(app)
      .patch('/api/users/profile-picture')
      .set('Authorization', `Bearer ${token}`)
      .attach('image', path.join(__dirname, 'test-image.jpg'))
      .expect(200);

    expect(res.body.data).toHaveProperty('profileImage');
    expect(res.body.data.profileImage).toMatch(/^https:\/\/res\.cloudinary\.com\//);

    // Verifică dacă s-a salvat și în DB
    const user = await User.findById(userId);
    expect(user.profileImage).toBe(res.body.data.profileImage);
  });

  it('should reject non-image files', async () => {
    const res = await request(app)
      .patch('/api/users/profile-picture')
      .set('Authorization', `Bearer ${token}`)
      .attach('image', path.join(__dirname, 'test-file.txt'))
      .expect(400);

    expect(res.body.message || res.body.error).toMatch(/image/i);
  });

  it('should reject requests without a file', async () => {
    const res = await request(app)
      .patch('/api/users/profile-picture')
      .set('Authorization', `Bearer ${token}`)
      .expect(400);

    expect(res.body.message).toMatch(/image/i);
  });

  it('should reject files over 5MB', async () => {
    // Creează un fișier temporar mare pentru test
    const fs = require('fs');
    const largePath = path.join(__dirname, 'large-image.jpg');
    fs.writeFileSync(largePath, Buffer.alloc(5 * 1024 * 1024 + 1));
    const res = await request(app)
      .patch('/api/users/profile-picture')
      .set('Authorization', `Bearer ${token}`)
      .attach('image', largePath)
      .expect(400);

    expect(res.body.message || res.body.error).toMatch(/file too large/i);
    fs.unlinkSync(largePath);
  });
});
