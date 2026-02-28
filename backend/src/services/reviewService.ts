import { QueryTypes } from "sequelize";
import sequelize from "../config/database";
import { ReviewAttributes, ReviewCreationAttributes } from "../types/models";

export const createReview = async (
  reviewData: ReviewCreationAttributes
): Promise<ReviewAttributes> => {
  const existingReviewQuery = `
    SELECT id FROM reviews 
    WHERE "movieId" = :movieId AND "userId" = :userId 
    LIMIT 1
  `;
  const existingReviews = await sequelize.query(existingReviewQuery, {
    replacements: {
      movieId: reviewData.movieId,
      userId: reviewData.userId,
    },
    type: QueryTypes.SELECT,
  });

  if (Array.isArray(existingReviews) && existingReviews.length > 0) {
    throw new Error("You have already reviewed this movie");
  }

  const insertQuery = `
    INSERT INTO reviews (id, "movieId", "userId", rating, comment, "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), :movieId, :userId, :rating, :comment, NOW(), NOW())
    RETURNING id, "movieId", "userId", rating, comment, "createdAt", "updatedAt"
  `;
  const [review] = (await sequelize.query(insertQuery, {
    replacements: {
      movieId: reviewData.movieId,
      userId: reviewData.userId,
      rating: reviewData.rating,
      comment: reviewData.comment || null,
    },
    type: QueryTypes.SELECT,
  })) as ReviewAttributes[];

  return review;
};

export const updateReview = async (
  id: string,
  reviewData: Partial<Pick<ReviewCreationAttributes, "rating" | "comment">>,
  userId: string
): Promise<ReviewAttributes> => {
  const reviewQuery = `
    SELECT id, "userId" FROM reviews WHERE id = :id LIMIT 1
  `;
  const reviews = (await sequelize.query(reviewQuery, {
    replacements: { id },
    type: QueryTypes.SELECT,
  })) as ReviewAttributes[];

  if (!Array.isArray(reviews) || reviews.length === 0) {
    throw new Error("Review not found");
  }

  const review = reviews[0];

  if (review.userId !== userId) {
    throw new Error("Unauthorized: You can only update your own reviews");
  }

  const updateFields: string[] = [];
  const replacements: Record<string, unknown> = { id };

  if (reviewData.rating !== undefined) {
    updateFields.push("rating = :rating");
    replacements.rating = reviewData.rating;
  }
  if (reviewData.comment !== undefined) {
    updateFields.push("comment = :comment");
    replacements.comment = reviewData.comment || null;
  }

  if (updateFields.length === 0) {
    // No fields to update, return existing review
    const fullReviewQuery = `
      SELECT id, "movieId", "userId", rating, comment, "createdAt", "updatedAt"
      FROM reviews
      WHERE id = :id
      LIMIT 1
    `;
    const [fullReview] = (await sequelize.query(fullReviewQuery, {
      replacements: { id },
      type: QueryTypes.SELECT,
    })) as ReviewAttributes[];
    return fullReview;
  }

  updateFields.push('"updatedAt" = NOW()');

  const updateQuery = `
    UPDATE reviews
    SET ${updateFields.join(", ")}
    WHERE id = :id
    RETURNING id, "movieId", "userId", rating, comment, "createdAt", "updatedAt"
  `;
  const [updatedReview] = (await sequelize.query(updateQuery, {
    replacements,
    type: QueryTypes.SELECT,
  })) as ReviewAttributes[];

  return updatedReview;
};

export const deleteReview = async (
  id: string,
  userId: string
): Promise<void> => {
  const reviewQuery = `
    SELECT id, "userId" FROM reviews WHERE id = :id LIMIT 1
  `;
  const reviews = (await sequelize.query(reviewQuery, {
    replacements: { id },
    type: QueryTypes.SELECT,
  })) as ReviewAttributes[];

  if (!Array.isArray(reviews) || reviews.length === 0) {
    throw new Error("Review not found");
  }

  const review = reviews[0];

  if (review.userId !== userId) {
    throw new Error("Unauthorized: You can only delete your own reviews");
  }

  const deleteQuery = `DELETE FROM reviews WHERE id = :id`;
  await sequelize.query(deleteQuery, {
    replacements: { id },
    type: QueryTypes.DELETE,
  });
};

export const getReviewsByMovieId = async (
  movieId: string
): Promise<
  Array<
    ReviewAttributes & { user: { id: string; username: string; email: string } }
  >
> => {
  const query = `
    SELECT 
      r.id,
      r."movieId",
      r."userId",
      r.rating,
      r.comment,
      r."createdAt",
      r."updatedAt",
      json_build_object(
        'id', u.id,
        'username', u.username,
        'email', u.email
      ) AS user
    FROM reviews r
    INNER JOIN users u ON u.id = r."userId"
    WHERE r."movieId" = :movieId
    ORDER BY r."createdAt" DESC
  `;

  const results = (await sequelize.query(query, {
    replacements: { movieId },
    type: QueryTypes.SELECT,
  })) as Array<
    ReviewAttributes & { user: { id: string; username: string; email: string } }
  >;

  return results;
};
