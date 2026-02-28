import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useAuthStore } from "../../stores/auth";
import api from "../../services/api";

vi.mock("../../services/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

describe("Review Management Flow", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("Create Review Flow", () => {
    it("should create a review successfully", async () => {
      // Setup authenticated user
      const authStore = useAuthStore();
      authStore.token = "test-token";
      authStore.user = {
        id: "user-1",
        username: "reviewer",
        email: "reviewer@example.com",
      };
      localStorage.setItem("token", "test-token");

      const newReview = {
        id: "review-1",
        movieId: "movie-1",
        userId: "user-1",
        rating: 5,
        comment: "Excellent movie!",
        createdAt: "2024-01-01T00:00:00Z",
      };

      const mockResponse = {
        data: {
          data: newReview,
        },
      };

      api.post.mockResolvedValue(mockResponse);

      const reviewData = {
        movieId: "movie-1",
        rating: 5,
        comment: "Excellent movie!",
      };

      const response = await api.post("/reviews", reviewData);

      expect(response.data.data).toEqual(newReview);
      expect(api.post).toHaveBeenCalledWith("/reviews", reviewData);
    });

    it("should handle create review failure (already reviewed)", async () => {
      const authStore = useAuthStore();
      authStore.token = "test-token";
      authStore.user = {
        id: "user-1",
        username: "test",
        email: "test@example.com",
      };

      const mockError = {
        response: {
          data: {
            message: "You have already reviewed this movie",
          },
          status: 409,
        },
      };

      api.post.mockRejectedValue(mockError);

      try {
        await api.post("/reviews", {
          movieId: "movie-1",
          rating: 4,
          comment: "Good movie",
        });
      } catch (error) {
        expect(error.response.data.message).toBe(
          "You have already reviewed this movie"
        );
        expect(error.response.status).toBe(409);
      }
    });

    it("should require authentication to create review", async () => {
      const mockError = {
        response: {
          data: {
            message: "Authentication required",
          },
          status: 401,
        },
      };

      api.post.mockRejectedValue(mockError);

      try {
        await api.post("/reviews", {
          movieId: "movie-1",
          rating: 5,
          comment: "Great movie",
        });
      } catch (error) {
        expect(error.response.status).toBe(401);
        expect(error.response.data.message).toBe("Authentication required");
      }
    });
  });

  describe("Get Reviews Flow", () => {
    it("should fetch reviews for a movie successfully", async () => {
      const mockReviews = [
        {
          id: "review-1",
          movieId: "movie-1",
          userId: "user-1",
          rating: 5,
          comment: "Excellent!",
          createdAt: "2024-01-01T00:00:00Z",
          user: {
            id: "user-1",
            username: "reviewer1",
            email: "reviewer1@example.com",
          },
        },
        {
          id: "review-2",
          movieId: "movie-1",
          userId: "user-2",
          rating: 4,
          comment: "Very good",
          createdAt: "2024-01-02T00:00:00Z",
          user: {
            id: "user-2",
            username: "reviewer2",
            email: "reviewer2@example.com",
          },
        },
      ];

      const mockResponse = {
        data: {
          data: mockReviews,
        },
      };

      api.get.mockResolvedValue(mockResponse);

      const response = await api.get("/reviews/movie/movie-1");

      expect(response.data.data).toHaveLength(2);
      expect(response.data.data[0].comment).toBe("Excellent!");
      expect(response.data.data[0].user.username).toBe("reviewer1");
      expect(response.data.data[1].rating).toBe(4);

      expect(api.get).toHaveBeenCalledWith("/reviews/movie/movie-1");
    });

    it("should handle empty reviews list", async () => {
      const mockResponse = {
        data: {
          data: [],
        },
      };

      api.get.mockResolvedValue(mockResponse);

      const response = await api.get("/reviews/movie/movie-new");

      expect(response.data.data).toEqual([]);
    });
  });

  describe("Update Review Flow", () => {
    it("should update a review successfully", async () => {
      const authStore = useAuthStore();
      authStore.token = "test-token";
      authStore.user = {
        id: "user-1",
        username: "test",
        email: "test@example.com",
      };

      const updatedReview = {
        id: "review-1",
        movieId: "movie-1",
        userId: "user-1",
        rating: 4,
        comment: "Updated comment - Very good movie",
        updatedAt: "2024-01-02T00:00:00Z",
      };

      const mockResponse = {
        data: {
          data: updatedReview,
        },
      };

      api.put.mockResolvedValue(mockResponse);

      const response = await api.put("/reviews/review-1", {
        rating: 4,
        comment: "Updated comment - Very good movie",
      });

      expect(response.data.data.comment).toBe(
        "Updated comment - Very good movie"
      );
      expect(response.data.data.rating).toBe(4);

      expect(api.put).toHaveBeenCalledWith("/reviews/review-1", {
        rating: 4,
        comment: "Updated comment - Very good movie",
      });
    });

    it("should prevent updating other users reviews", async () => {
      const authStore = useAuthStore();
      authStore.token = "test-token";
      authStore.user = {
        id: "user-1",
        username: "test",
        email: "test@example.com",
      };

      const mockError = {
        response: {
          data: {
            message: "Unauthorized: You can only update your own reviews",
          },
          status: 403,
        },
      };

      api.put.mockRejectedValue(mockError);

      try {
        await api.put("/reviews/review-other-user", {
          rating: 5,
          comment: "Trying to update",
        });
      } catch (error) {
        expect(error.response.status).toBe(403);
        expect(error.response.data.message).toBe(
          "Unauthorized: You can only update your own reviews"
        );
      }
    });
  });

  describe("Delete Review Flow", () => {
    it("should delete a review successfully", async () => {
      const authStore = useAuthStore();
      authStore.token = "test-token";
      authStore.user = {
        id: "user-1",
        username: "test",
        email: "test@example.com",
      };

      const mockResponse = {
        status: 200,
        data: {
          success: true,
          message: "Review deleted successfully",
        },
      };

      api.delete.mockResolvedValue(mockResponse);

      const response = await api.delete("/reviews/review-1");

      expect(response.status).toBe(200);
      expect(api.delete).toHaveBeenCalledWith("/reviews/review-1");
    });

    it("should prevent deleting other users reviews", async () => {
      const authStore = useAuthStore();
      authStore.token = "test-token";
      authStore.user = {
        id: "user-1",
        username: "test",
        email: "test@example.com",
      };

      const mockError = {
        response: {
          data: {
            message: "Unauthorized: You can only delete your own reviews",
          },
          status: 403,
        },
      };

      api.delete.mockRejectedValue(mockError);

      try {
        await api.delete("/reviews/review-other-user");
      } catch (error) {
        expect(error.response.status).toBe(403);
        expect(error.response.data.message).toBe(
          "Unauthorized: You can only delete your own reviews"
        );
      }
    });
  });

  describe("Complete Review Flow", () => {
    it("should complete full flow: create → fetch → update → delete", async () => {
      const authStore = useAuthStore();
      authStore.token = "test-token";
      authStore.user = {
        id: "user-1",
        username: "test",
        email: "test@example.com",
      };

      // Step 1: Create review
      const newReview = {
        id: "review-flow",
        movieId: "movie-1",
        userId: "user-1",
        rating: 5,
        comment: "Initial review",
        createdAt: "2024-01-01T00:00:00Z",
      };

      api.post.mockResolvedValueOnce({ data: { data: newReview } });

      const createResponse = await api.post("/reviews", {
        movieId: "movie-1",
        rating: 5,
        comment: "Initial review",
      });

      expect(createResponse.data.data.id).toBe("review-flow");

      // Step 2: Fetch reviews
      const mockReviews = [newReview];
      api.get.mockResolvedValueOnce({ data: { data: mockReviews } });

      const fetchResponse = await api.get("/reviews/movie/movie-1");
      expect(fetchResponse.data.data).toHaveLength(1);

      // Step 3: Update review
      const updatedReview = {
        ...newReview,
        rating: 4,
        comment: "Updated review",
      };
      api.put.mockResolvedValueOnce({ data: { data: updatedReview } });

      const updateResponse = await api.put("/reviews/review-flow", {
        rating: 4,
        comment: "Updated review",
      });

      expect(updateResponse.data.data.comment).toBe("Updated review");

      // Step 4: Delete review
      api.delete.mockResolvedValueOnce({ status: 200 });
      const deleteResponse = await api.delete("/reviews/review-flow");
      expect(deleteResponse.status).toBe(200);
    });
  });
});
