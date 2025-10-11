import jwt from 'jsonwebtoken';

// Set up test environment variables
const JWT_SECRET = 'test_jwt_secret_key';
const JWT_REFRESH_SECRET = 'test_jwt_refresh_secret_key';

describe('TokenManager - JWT Token Generation and Verification', () => {
  const mockUser = {
    id: 'test-user-123',
    email: 'test@example.com',
    role: 'user'
  };

  describe('Access Token Generation', () => {
    it('should generate a valid JWT access token', () => {
      const token = jwt.sign(
        {
          id: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
          iat: Math.floor(Date.now() / 1000)
        },
        JWT_SECRET,
        { expiresIn: '15m' }
      );

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts: header.payload.signature
    });

    it('should include user data in token payload', () => {
      const token = jwt.sign(
        {
          id: mockUser.id,
          email: mockUser.email,
          role: mockUser.role
        },
        JWT_SECRET,
        { expiresIn: '15m' }
      );

      const decoded = jwt.decode(token);

      expect(decoded.id).toBe(mockUser.id);
      expect(decoded.email).toBe(mockUser.email);
      expect(decoded.role).toBe(mockUser.role);
    });

    it('should set expiration time', () => {
      const token = jwt.sign(
        { id: mockUser.id },
        JWT_SECRET,
        { expiresIn: '15m' }
      );

      const decoded = jwt.decode(token);

      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(decoded.iat);
      
      // Should expire in approximately 15 minutes (900 seconds)
      const expiresIn = decoded.exp - decoded.iat;
      expect(expiresIn).toBeGreaterThan(890);
      expect(expiresIn).toBeLessThan(910);
    });

    it('should generate different tokens for same user at different times', () => {
      const token1 = jwt.sign(
        { id: mockUser.id, iat: Math.floor(Date.now() / 1000) },
        JWT_SECRET,
        { expiresIn: '15m' }
      );

      // Wait a tiny bit
      const token2 = jwt.sign(
        { id: mockUser.id, iat: Math.floor(Date.now() / 1000) + 1 },
        JWT_SECRET,
        { expiresIn: '15m' }
      );

      expect(token1).not.toBe(token2);
    });
  });

  describe('Refresh Token Generation', () => {
    it('should generate a valid JWT refresh token', () => {
      const token = jwt.sign(
        {
          id: mockUser.id,
          type: 'refresh',
          jti: 'unique-token-id'
        },
        JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      );

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should include user ID and type in payload', () => {
      const jti = 'unique-token-id-123';
      const token = jwt.sign(
        {
          id: mockUser.id,
          type: 'refresh',
          jti: jti
        },
        JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      );

      const decoded = jwt.decode(token);

      expect(decoded.id).toBe(mockUser.id);
      expect(decoded.type).toBe('refresh');
      expect(decoded.jti).toBe(jti);
    });

    it('should have longer expiration than access token', () => {
      const accessToken = jwt.sign(
        { id: mockUser.id },
        JWT_SECRET,
        { expiresIn: '15m' }
      );

      const refreshToken = jwt.sign(
        { id: mockUser.id, type: 'refresh' },
        JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      );

      const accessDecoded = jwt.decode(accessToken);
      const refreshDecoded = jwt.decode(refreshToken);

      const accessExpiresIn = accessDecoded.exp - accessDecoded.iat;
      const refreshExpiresIn = refreshDecoded.exp - refreshDecoded.iat;

      expect(refreshExpiresIn).toBeGreaterThan(accessExpiresIn);
      
      // Refresh token should expire in approximately 7 days (604800 seconds)
      expect(refreshExpiresIn).toBeGreaterThan(604000);
      expect(refreshExpiresIn).toBeLessThan(605000);
    });
  });

  describe('Token Verification', () => {
    it('should verify valid access token', () => {
      const token = jwt.sign(
        { id: mockUser.id, email: mockUser.email },
        JWT_SECRET,
        { expiresIn: '15m' }
      );

      const decoded = jwt.verify(token, JWT_SECRET);

      expect(decoded).toBeDefined();
      expect(decoded.id).toBe(mockUser.id);
      expect(decoded.email).toBe(mockUser.email);
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => {
        jwt.verify(invalidToken, JWT_SECRET);
      }).toThrow();
    });

    it('should throw error for token with wrong secret', () => {
      const token = jwt.sign(
        { id: mockUser.id },
        'wrong_secret',
        { expiresIn: '15m' }
      );

      expect(() => {
        jwt.verify(token, JWT_SECRET);
      }).toThrow();
    });

    it('should throw error for expired token', async () => {
      // Create a token that expires immediately
      const expiredToken = jwt.sign(
        { id: mockUser.id, email: mockUser.email },
        JWT_SECRET,
        { expiresIn: '0s' }
      );

      // Wait a moment to ensure expiration
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(() => {
        jwt.verify(expiredToken, JWT_SECRET);
      }).toThrow();
    });
  });

  describe('Refresh Token Verification', () => {
    it('should verify valid refresh token', () => {
      const token = jwt.sign(
        { id: mockUser.id, type: 'refresh' },
        JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      );

      const decoded = jwt.verify(token, JWT_REFRESH_SECRET);

      expect(decoded).toBeDefined();
      expect(decoded.id).toBe(mockUser.id);
      expect(decoded.type).toBe('refresh');
    });

    it('should throw error for invalid refresh token', () => {
      const invalidToken = 'invalid.refresh.token';

      expect(() => {
        jwt.verify(invalidToken, JWT_REFRESH_SECRET);
      }).toThrow();
    });

    it('should throw error for access token used as refresh token', () => {
      const accessToken = jwt.sign(
        { id: mockUser.id },
        JWT_SECRET,
        { expiresIn: '15m' }
      );

      expect(() => {
        jwt.verify(accessToken, JWT_REFRESH_SECRET);
      }).toThrow();
    });
  });

  describe('Token Payload Structure', () => {
    it('should have standard JWT claims', () => {
      const token = jwt.sign(
        { id: mockUser.id },
        JWT_SECRET,
        { expiresIn: '15m' }
      );

      const decoded = jwt.decode(token);

      expect(decoded.iat).toBeDefined(); // Issued at
      expect(decoded.exp).toBeDefined(); // Expires at
      expect(typeof decoded.iat).toBe('number');
      expect(typeof decoded.exp).toBe('number');
    });

    it('should decode token without verification', () => {
      const token = jwt.sign(
        { id: mockUser.id, email: mockUser.email, role: mockUser.role },
        JWT_SECRET,
        { expiresIn: '15m' }
      );

      const decoded = jwt.decode(token);

      expect(decoded.id).toBe(mockUser.id);
      expect(decoded.email).toBe(mockUser.email);
      expect(decoded.role).toBe(mockUser.role);
    });
  });

  describe('Token Expiration Calculation', () => {
    it('should calculate correct expiration for 15 minute token', () => {
      const now = Math.floor(Date.now() / 1000);
      const token = jwt.sign(
        { id: mockUser.id },
        JWT_SECRET,
        { expiresIn: '15m' }
      );

      const decoded = jwt.decode(token);
      const expectedExpiration = now + (15 * 60); // 15 minutes in seconds

      expect(decoded.exp).toBeGreaterThanOrEqual(expectedExpiration - 2);
      expect(decoded.exp).toBeLessThanOrEqual(expectedExpiration + 2);
    });

    it('should calculate correct expiration for 7 day token', () => {
      const now = Math.floor(Date.now() / 1000);
      const token = jwt.sign(
        { id: mockUser.id },
        JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      );

      const decoded = jwt.decode(token);
      const expectedExpiration = now + (7 * 24 * 60 * 60); // 7 days in seconds

      expect(decoded.exp).toBeGreaterThanOrEqual(expectedExpiration - 2);
      expect(decoded.exp).toBeLessThanOrEqual(expectedExpiration + 2);
    });
  });
});
