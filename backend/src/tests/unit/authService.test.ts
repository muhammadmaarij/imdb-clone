import { hashPassword, comparePassword, generateToken, verifyToken } from '../../services/authService';

describe('AuthService', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'TestPassword123';
      const hashed = await hashPassword(password);
      expect(hashed).not.toBe(password);
      expect(hashed.length).toBeGreaterThan(0);
    });

    it('should produce different hashes for the same password', async () => {
      const password = 'TestPassword123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('comparePassword', () => {
    it('should return true for correct password', async () => {
      const password = 'TestPassword123';
      const hashed = await hashPassword(password);
      const result = await comparePassword(password, hashed);
      expect(result).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const password = 'TestPassword123';
      const wrongPassword = 'WrongPassword123';
      const hashed = await hashPassword(password);
      const result = await comparePassword(wrongPassword, hashed);
      expect(result).toBe(false);
    });
  });

  describe('generateToken', () => {
    it('should generate a token', () => {
      const userId = 'test-user-id';
      const email = 'test@example.com';
      const token = generateToken(userId, email);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const userId = 'test-user-id';
      const email = 'test@example.com';
      const token = generateToken(userId, email);
      const decoded = verifyToken(token);
      expect(decoded.userId).toBe(userId);
      expect(decoded.email).toBe(email);
    });

    it('should throw error for invalid token', () => {
      expect(() => {
        verifyToken('invalid-token');
      }).toThrow();
    });
  });
});
