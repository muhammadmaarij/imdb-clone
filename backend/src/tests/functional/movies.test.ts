import request from "supertest";
import { QueryTypes } from "sequelize";
import app from "../../server";
import sequelize from "../../config/database";
import { generateToken, hashPassword } from "../../services/authService";

describe("Movies API", () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    // Run migrations or ensure tables exist
    const hashedPassword = await hashPassword("TestPassword123");
    const insertQuery = `
      INSERT INTO users (id, username, email, password, "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), 'movietest', 'movie@example.com', :password, NOW(), NOW())
      RETURNING id
    `;
    const [user] = (await sequelize.query(insertQuery, {
      replacements: { password: hashedPassword },
      type: QueryTypes.SELECT,
    })) as Array<{ id: string }>;
    userId = user.id;
    authToken = generateToken(user.id, "movie@example.com");
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /api/movies', () => {
    it('should get all movies', async () => {
      const response = await request(app).get('/api/movies');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('POST /api/movies', () => {
    it('should create a movie with authentication', async () => {
      const response = await request(app)
        .post('/api/movies')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Movie',
          releaseDate: '2024-01-01',
          description: 'A test movie',
          posterUrl: 'https://example.com/poster.jpg',
          trailerUrl: 'https://youtube.com/watch?v=test',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Test Movie');
    });

    it('should fail without authentication', async () => {
      const response = await request(app).post('/api/movies').send({
        title: 'Test Movie 2',
        releaseDate: '2024-01-01',
        description: 'A test movie',
        posterUrl: 'https://example.com/poster.jpg',
        trailerUrl: 'https://youtube.com/watch?v=test',
      });

      expect(response.status).toBe(401);
    });
  });
});
