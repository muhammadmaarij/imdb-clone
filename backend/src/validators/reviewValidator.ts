import { z } from 'zod';

export const createReviewSchema = z.object({
  body: z.object({
    movieId: z.string().uuid('Invalid movie ID format'),
    rating: z
      .number()
      .int('Rating must be an integer')
      .min(1, 'Rating must be at least 1')
      .max(5, 'Rating must be at most 5'),
    comment: z
      .string()
      .min(1, 'Comment is required')
      .max(1000, 'Comment must be at most 1000 characters'),
  }),
});

export const updateReviewSchema = z.object({
  body: z.object({
    rating: z
      .number()
      .int('Rating must be an integer')
      .min(1, 'Rating must be at least 1')
      .max(5, 'Rating must be at most 5')
      .optional(),
    comment: z
      .string()
      .min(1, 'Comment is required')
      .max(1000, 'Comment must be at most 1000 characters')
      .optional(),
  }),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>['body'];
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>['body'];
