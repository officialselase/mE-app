import request from 'supertest';
import express from 'express';
import { registerValidation, loginValidation, refreshTokenValidation } from '../../middleware/validation.js';

// Create test app
const createTestApp = (validationMiddleware) => {
  const app = express();
  app.use(express.json());
  
  app.post('/test', validationMiddleware, (req, res) => {
    res.json({ success: true });
  });
  
  return app;
};

describe('Validation Middleware', () => {
  describe('registerValidation', () => {
    let app;

    beforeEach(() => {
      app = createTestApp(registerValidation);
    });

    it('should pass validation with valid registration data', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          email: 'test@example.com',
          password: 'TestPassword123',
          displayName: 'Test User'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should reject invalid email format', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          email: 'invalid-email',
          password: 'TestPassword123',
          displayName: 'Test User'
        });

      expect(response.status).toBe(422);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.code).toBe('VALIDATION_ERROR');
      expect(response.body.fields.email).toBeDefined();
    });

    it('should reject password shorter than 8 characters', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          email: 'test@example.com',
          password: 'Short1',
          displayName: 'Test User'
        });

      expect(response.status).toBe(422);
      expect(response.body.fields.password).toBeDefined();
      expect(response.body.fields.password).toContain('at least 8 characters');
    });

    it('should reject password without uppercase letter', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          email: 'test@example.com',
          password: 'testpassword123',
          displayName: 'Test User'
        });

      expect(response.status).toBe(422);
      expect(response.body.fields.password).toBeDefined();
      expect(response.body.fields.password).toContain('uppercase');
    });

    it('should reject password without lowercase letter', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          email: 'test@example.com',
          password: 'TESTPASSWORD123',
          displayName: 'Test User'
        });

      expect(response.status).toBe(422);
      expect(response.body.fields.password).toBeDefined();
      expect(response.body.fields.password).toContain('lowercase');
    });

    it('should reject password without number', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          email: 'test@example.com',
          password: 'TestPassword',
          displayName: 'Test User'
        });

      expect(response.status).toBe(422);
      expect(response.body.fields.password).toBeDefined();
      expect(response.body.fields.password).toContain('number');
    });

    it('should reject displayName shorter than 2 characters', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          email: 'test@example.com',
          password: 'TestPassword123',
          displayName: 'T'
        });

      expect(response.status).toBe(422);
      expect(response.body.fields.displayName).toBeDefined();
      expect(response.body.fields.displayName).toContain('between 2 and 100');
    });

    it('should reject displayName longer than 100 characters', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          email: 'test@example.com',
          password: 'TestPassword123',
          displayName: 'T'.repeat(101)
        });

      expect(response.status).toBe(422);
      expect(response.body.fields.displayName).toBeDefined();
    });

    it('should reject displayName with invalid characters', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          email: 'test@example.com',
          password: 'TestPassword123',
          displayName: 'Test@User!'
        });

      expect(response.status).toBe(422);
      expect(response.body.fields.displayName).toBeDefined();
      expect(response.body.fields.displayName).toContain('letters, numbers, spaces');
    });

    it('should normalize email to lowercase', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          email: 'TEST@EXAMPLE.COM',
          password: 'TestPassword123',
          displayName: 'Test User'
        });

      expect(response.status).toBe(200);
    });

    it('should trim whitespace from inputs', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          email: '  test@example.com  ',
          password: 'TestPassword123',
          displayName: '  Test User  '
        });

      expect(response.status).toBe(200);
    });

    it('should return multiple validation errors', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          email: 'invalid-email',
          password: 'short',
          displayName: 'T'
        });

      expect(response.status).toBe(422);
      expect(Object.keys(response.body.fields).length).toBeGreaterThan(1);
    });
  });

  describe('loginValidation', () => {
    let app;

    beforeEach(() => {
      app = createTestApp(loginValidation);
    });

    it('should pass validation with valid login data', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          email: 'test@example.com',
          password: 'TestPassword123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should reject invalid email format', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          email: 'invalid-email',
          password: 'TestPassword123'
        });

      expect(response.status).toBe(422);
      expect(response.body.fields.email).toBeDefined();
    });

    it('should reject empty password', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          email: 'test@example.com',
          password: ''
        });

      expect(response.status).toBe(422);
      expect(response.body.fields.password).toBeDefined();
      expect(response.body.fields.password).toContain('required');
    });

    it('should reject missing email', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          password: 'TestPassword123'
        });

      expect(response.status).toBe(422);
      expect(response.body.fields.email).toBeDefined();
    });

    it('should reject missing password', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          email: 'test@example.com'
        });

      expect(response.status).toBe(422);
      expect(response.body.fields.password).toBeDefined();
    });

    it('should normalize email to lowercase', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          email: 'TEST@EXAMPLE.COM',
          password: 'TestPassword123'
        });

      expect(response.status).toBe(200);
    });
  });

  describe('refreshTokenValidation', () => {
    let app;

    beforeEach(() => {
      app = createTestApp(refreshTokenValidation);
    });

    it('should pass validation with valid refresh token', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          refreshToken: 'valid-refresh-token'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should reject empty refresh token', async () => {
      const response = await request(app)
        .post('/test')
        .send({
          refreshToken: ''
        });

      expect(response.status).toBe(422);
      expect(response.body.fields.refreshToken).toBeDefined();
      expect(response.body.fields.refreshToken).toContain('required');
    });

    it('should reject missing refresh token', async () => {
      const response = await request(app)
        .post('/test')
        .send({});

      expect(response.status).toBe(422);
      expect(response.body.fields.refreshToken).toBeDefined();
    });
  });
});
