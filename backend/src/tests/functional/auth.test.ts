import request from "supertest";
import { QueryTypes } from "sequelize";
import app from "../../server";
import sequelize from "../../config/database";
import { hashPassword } from "../../services/authService";

describe("Auth API", () => {
  beforeAll(async () => {
    // Run migrations or ensure tables exist
    // For tests, you might want to use a test database setup
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'TestPassword123',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe('test@example.com');
    });

    it('should fail with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser2',
          email: 'invalid-email',
          password: 'TestPassword123',
        });

      expect(response.status).toBe(400);
    });

    it('should fail with weak password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser3',
          email: 'test3@example.com',
          password: 'weak',
        });

      expect(response.status).toBe(400);
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      const hashedPassword = await hashPassword("TestPassword123");
      const insertQuery = `
        INSERT INTO users (id, username, email, password, "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), 'logintest', 'login@example.com', :password, NOW(), NOW())
        ON CONFLICT (email) DO NOTHING
      `;
      await sequelize.query(insertQuery, {
        replacements: { password: hashedPassword },
        type: QueryTypes.INSERT,
      });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'TestPassword123',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
    });

    it('should fail with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'WrongPassword',
        });

      expect(response.status).toBe(401);
    });
  });
});
