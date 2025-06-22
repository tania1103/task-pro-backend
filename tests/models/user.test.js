const mongoose = require('mongoose');
const User = require('../../src/models/User');
const bcrypt = require('bcryptjs');

// Use in-memory MongoDB for testing
beforeAll(async () => {
  await mongoose.connect(global.__MONGO_URI__, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Curăță colecția după fiecare test pentru a evita duplicate
afterEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('User Model Test', () => {
  it('should create a new user successfully', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };
    
    const user = new User(userData);
    const savedUser = await user.save();
    
    // Verify that user is saved
    expect(savedUser._id).toBeDefined();
    expect(savedUser.name).toBe(userData.name);
    expect(savedUser.email).toBe(userData.email);
    
    // Verify that password is hashed
    const isMatch = await bcrypt.compare(userData.password, savedUser.password);
    expect(isMatch).toBe(true);
  });
  
  it('should fail validation if required fields are missing', async () => {
    const user = new User({});
    
    let error;
    try {
      await user.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.name).toBeDefined();
    expect(error.errors.email).toBeDefined();
    expect(error.errors.password).toBeDefined();
  });
  
  it('should fail validation if email format is invalid', async () => {
    const user = new User({
      name: 'Test User',
      email: 'invalid-email',
      password: 'password123'
    });
    
    let error;
    try {
      await user.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.email).toBeDefined();
  });
  
  it('should match password correctly', async () => {
    // Folosim un email diferit pentru acest test pentru a evita conflicte
    const user = new User({
      name: 'Test User',
      email: 'test-password@example.com',
      password: 'password123'
    });
    
    await user.save();
    
    // Password should match
    const isMatch = await user.matchPassword('password123');
    expect(isMatch).toBe(true);
    
    // Password should not match
    const isNotMatch = await user.matchPassword('wrongpassword');
    expect(isNotMatch).toBe(false);
  });
});