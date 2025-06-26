const request = require('supertest');
const app = require('../src/app');
const nodemailer = require('nodemailer');

jest.mock('nodemailer');

describe('POST /api/need-help', () => {
  beforeEach(() => {
    // Resetăm mockul Nodemailer la fiecare test
    nodemailer.createTransport.mockReturnValue({
      sendMail: jest.fn().mockResolvedValue({ messageId: 'fake-message-id' })
    });
  });

  it('should send need-help email successfully', async () => {
    const res = await request(app)
      .post('/api/need-help')
      .send({ email: 'test@email.com', comment: 'Please help me with TaskPro!' })
      .expect(200);

    expect(res.body.message).toMatch(/succes|success/i);
  });

  it('should return 400 if email is missing', async () => {
    const res = await request(app)
      .post('/api/need-help')
      .send({ comment: 'Only comment' })
      .expect(400);

    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'email' })
      ])
    );
  });

  it('should return 400 if comment is missing', async () => {
    const res = await request(app)
      .post('/api/need-help')
      .send({ email: 'test@email.com' })
      .expect(400);

    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'comment' })
      ])
    );
  });

  it('should return 400 if email is invalid', async () => {
    const res = await request(app)
      .post('/api/need-help')
      .send({ email: 'invalid', comment: 'Valid comment!' })
      .expect(400);

    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'email' })
      ])
    );
  });

  it('should return 400 if comment is too short', async () => {
    const res = await request(app)
      .post('/api/need-help')
      .send({ email: 'test@email.com', comment: '' })
      .expect(400);

    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'comment' })
      ])
    );
  });

  it('should return 500 if sending fails', async () => {
    nodemailer.createTransport.mockReturnValue({
      sendMail: jest.fn().mockRejectedValue(new Error('fail!'))
    });

    const res = await request(app)
      .post('/api/need-help')
      .send({ email: 'test@email.com', comment: 'Testing error!' })
      .expect(500);

    // Eroarea e generică pentru user, dar ar trebui să apară "fail" undeva în message
    expect(res.body.message).toMatch(/fail|error|send/i);
  });
});
