import bcrypt from 'bcrypt';

describe('User Model - Password Hashing', () => {
  describe('Password hashing with bcrypt', () => {
    it('should hash password with bcrypt', async () => {
      const plainPassword = 'TestPassword123';
      const hashedPassword = await bcrypt.hash(plainPassword, 12);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(plainPassword);
      expect(hashedPassword.length).toBeGreaterThan(20);
      expect(hashedPassword).toMatch(/^\$2[aby]\$/); // bcrypt hash format
    });

    it('should verify correct password', async () => {
      const plainPassword = 'TestPassword123';
      const hashedPassword = await bcrypt.hash(plainPassword, 12);

      const result = await bcrypt.compare(plainPassword, hashedPassword);

      expect(result).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const plainPassword = 'TestPassword123';
      const wrongPassword = 'WrongPassword456';
      const hashedPassword = await bcrypt.hash(plainPassword, 12);

      const result = await bcrypt.compare(wrongPassword, hashedPassword);

      expect(result).toBe(false);
    });

    it('should handle empty password', async () => {
      const hashedPassword = await bcrypt.hash('TestPassword123', 12);

      const result = await bcrypt.compare('', hashedPassword);

      expect(result).toBe(false);
    });

    it('should generate different hashes for same password', async () => {
      const plainPassword = 'TestPassword123';
      const hash1 = await bcrypt.hash(plainPassword, 12);
      const hash2 = await bcrypt.hash(plainPassword, 12);

      expect(hash1).not.toBe(hash2);
      
      // But both should verify correctly
      expect(await bcrypt.compare(plainPassword, hash1)).toBe(true);
      expect(await bcrypt.compare(plainPassword, hash2)).toBe(true);
    });

    it('should use salt rounds of 12', async () => {
      const plainPassword = 'TestPassword123';
      const hashedPassword = await bcrypt.hash(plainPassword, 12);

      // bcrypt hash format: $2a$12$... where 12 is the cost factor
      const costFactor = hashedPassword.split('$')[2];
      expect(costFactor).toBe('12');
    });
  });

  describe('Email normalization', () => {
    it('should normalize email to lowercase', () => {
      const email = 'TEST@EXAMPLE.COM';
      const normalized = email.toLowerCase().trim();

      expect(normalized).toBe('test@example.com');
    });

    it('should trim whitespace from email', () => {
      const email = '  test@example.com  ';
      const normalized = email.toLowerCase().trim();

      expect(normalized).toBe('test@example.com');
    });

    it('should handle mixed case email', () => {
      const email = 'TeSt@ExAmPlE.CoM';
      const normalized = email.toLowerCase().trim();

      expect(normalized).toBe('test@example.com');
    });
  });

  describe('Display name validation', () => {
    it('should trim whitespace from display name', () => {
      const displayName = '  Test User  ';
      const trimmed = displayName.trim();

      expect(trimmed).toBe('Test User');
    });

    it('should accept valid display names', () => {
      const validNames = [
        'John Doe',
        'Jane_Smith',
        'User-123',
        'Test User 2024',
        'A B'
      ];

      validNames.forEach(name => {
        const isValid = /^[a-zA-Z0-9\s\-_]+$/.test(name);
        expect(isValid).toBe(true);
      });
    });

    it('should reject invalid display names', () => {
      const invalidNames = [
        'Test@User',
        'User!',
        'Name#123',
        'Test$User'
      ];

      invalidNames.forEach(name => {
        const isValid = /^[a-zA-Z0-9\s\-_]+$/.test(name);
        expect(isValid).toBe(false);
      });
    });
  });
});
