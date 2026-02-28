import { z } from 'zod';

export const createMovieSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(1, 'Title is required')
      .max(255, 'Title must be at most 255 characters'),
    releaseDate: z.coerce.date({
      required_error: 'Release date is required',
      invalid_type_error: 'Invalid date format',
    }),
    description: z
      .string()
      .min(1, 'Description is required')
      .max(5000, 'Description must be at most 5000 characters'),
    posterUrl: z.string().url('Invalid poster URL format'),
    trailerUrl: z.string().url('Invalid trailer URL format'),
  }),
});

export const updateMovieSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(1, 'Title is required')
      .max(255, 'Title must be at most 255 characters')
      .optional(),
    releaseDate: z.coerce.date({
      invalid_type_error: 'Invalid date format',
    }).optional(),
    description: z
      .string()
      .min(1, 'Description is required')
      .max(5000, 'Description must be at most 5000 characters')
      .optional(),
    posterUrl: z.string().url('Invalid poster URL format').optional(),
    trailerUrl: z.string().url('Invalid trailer URL format').optional(),
  }),
});

export const searchMovieSchema = z.object({
  query: z.object({
    q: z.string().min(1, 'Search query is required'),
  }),
});

export type CreateMovieInput = z.infer<typeof createMovieSchema>['body'];
export type UpdateMovieInput = z.infer<typeof updateMovieSchema>['body'];
export type SearchMovieInput = z.infer<typeof searchMovieSchema>['query'];
