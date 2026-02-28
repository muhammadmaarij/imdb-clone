import request from "supertest";
import { QueryTypes } from "sequelize";
import app from "../../server";
import sequelize from "../../config/database";
import { generateToken, hashPassword } from "../../services/authService";

describe("Movies API", () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    const hashedPassword = await hashPassword("TestPassword123");
    const insertQuery = `
      INSERT INTO users (id, username, email, password, "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), 'movietest', 'movie@example.com', :password, NOW(), NOW())
      ON CONFLICT (email) DO UPDATE SET username = EXCLUDED.username
      RETURNING id
    `;
    const result = await sequelize.query(insertQuery, {
      replacements: { password: hashedPassword },
      type: QueryTypes.SELECT,
    });
    const user = Array.isArray(result) && result.length > 0 ? result[0] : null;
    if (!user) {
      throw new Error("Failed to create test user");
    }
    userId = (user as { id: string }).id;
    authToken = generateToken(userId, "movie@example.com");
  });

  afterAll(async () => {
    // Clean up test data
    try {
      await sequelize.query('DELETE FROM movies WHERE "userId" = :userId', {
        replacements: { userId },
        type: QueryTypes.DELETE,
      });
      await sequelize.query("DELETE FROM users WHERE id = :userId", {
        replacements: { userId },
        type: QueryTypes.DELETE,
      });
    } catch (error) {
      console.error("Cleanup error:", error);
    }
    await sequelize.close();
  });

  describe("GET /api/movies", () => {
    it("should get all movies", async () => {
      const response = await request(app).get("/api/movies");
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe("POST /api/movies", () => {
    beforeEach(async () => {
      // Clean up test movies before each test
      try {
        await sequelize.query("DELETE FROM movies WHERE title = 'Test Movie'", {
          type: QueryTypes.DELETE,
        });
      } catch (error) {
        // Ignore cleanup errors
      }
    });

    it("should create a movie with authentication", async () => {
      const response = await request(app)
        .post("/api/movies")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Test Movie",
          releaseDate: "2024-01-01",
          description: "A test movie",
          posterUrl: "https://example.com/poster.jpg",
          trailerUrl: "https://youtube.com/watch?v=test",
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe("Test Movie");
    });

    it("should fail without authentication", async () => {
      const response = await request(app).post("/api/movies").send({
        title: "Test Movie 2",
        releaseDate: "2024-01-01",
        description: "A test movie",
        posterUrl: "https://example.com/poster.jpg",
        trailerUrl: "https://youtube.com/watch?v=test",
      });

      expect(response.status).toBe(401);
    });
  });
});
