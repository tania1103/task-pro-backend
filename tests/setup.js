const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Mărește timeout-ul la 30 secunde pentru pornirea MongoDB Memory Server
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  global.__MONGO_URI__ = mongoServer.getUri();
}, 30000); // timeout de 30 secunde

afterAll(async () => {
  await mongoServer.stop();
}, 30000); // timeout de 30 secunde