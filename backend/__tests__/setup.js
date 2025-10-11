// Test setup file
// This file runs before all tests

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_key';
process.env.JWT_REFRESH_SECRET = 'test_jwt_refresh_secret_key';
process.env.JWT_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
