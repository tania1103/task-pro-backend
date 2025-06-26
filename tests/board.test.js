const request = require('supertest');
const app = require('../src/app');
const path = require('path');
const Board = require('../src/models/Board');

// Mockează uploadul pe Cloudinary
jest.mock('../src/services/cloudinaryService', () => ({
  uploadImage: jest.fn(() =>
    Promise.resolve({
      secure_url: 'https://res.cloudinary.com/demo/image/upload/sample-board.png'
    })
  )
}));

describe('PATCH /api/boards/:id/background', () => {
  let token, userId, boardId, otherToken;

  beforeAll(async () => {
    // User 1
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Board User',
        email: 'boarduser@test.com',
        password: 'Parola123!'
      });
    let res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'boarduser@test.com', password: 'Parola123!' });
    token = res.body.token;
    userId = res.body.user._id;

    // Creezi board
    res = await request(app)
      .post('/api/boards')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test Board' });
    boardId = res.body.data._id;

    // User 2 (alt token, pentru test permisiuni)
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Other User',
        email: 'otheruser@test.com',
        password: 'Parola123!'
      });
    res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'otheruser@test.com', password: 'Parola123!' });
    otherToken = res.body.token;
  });

  it('should upload and update board background image', async () => {
    const res = await request(app)
      .patch(`/api/boards/${boardId}/background`)
      .set('Authorization', `Bearer ${token}`)
      .attach('image', path.join(__dirname, 'test-image.png'))
      .expect(200);

    expect(res.body.data).toHaveProperty('background');
    expect(res.body.data.background).toMatch(/^https:\/\/res\.cloudinary\.com\//);

    // Verifică dacă s-a salvat și în DB
    const board = await Board.findById(boardId);
    expect(board.background).toBe(res.body.data.background);
  });

  it('should reject non-image files', async () => {
    const res = await request(app)
      .patch(`/api/boards/${boardId}/background`)
      .set('Authorization', `Bearer ${token}`)
      .attach('image', path.join(__dirname, 'test-file.txt'))
      .expect(400);

    expect(res.body.message || res.body.error).toMatch(/image/i);
  });

  it('should reject requests without a file', async () => {
    const res = await request(app)
      .patch(`/api/boards/${boardId}/background`)
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
      .patch(`/api/boards/${boardId}/background`)
      .set('Authorization', `Bearer ${token}`)
      .attach('image', largePath)
      .expect(400);

    expect(res.body.message || res.body.error).toMatch(/file too large/i);
    fs.unlinkSync(largePath);
  });

  it('should reject if not owner', async () => {
    const res = await request(app)
      .patch(`/api/boards/${boardId}/background`)
      .set('Authorization', `Bearer ${otherToken}`)
      .attach('image', path.join(__dirname, 'test-image.png'))
      .expect(403);

    expect(res.body.message).toMatch(/not authorized/i);
  });
});
