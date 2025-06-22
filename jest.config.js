module.exports = {
  testEnvironment: 'node',
  verbose: true,
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/test/'
  ],
  setupFilesAfterEnv: ['./tests/setup.js'],
  // Adaugă aceste opțiuni pentru a ajuta la rezolvarea problemelor EPERM
  forceExit: true,
  detectOpenHandles: true,
  // Rulează testele în serie, nu paralel
  maxWorkers: 1,
  // Timeout global mărit
  testTimeout: 30000
};