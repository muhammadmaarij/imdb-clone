import { QueryTypes } from "sequelize";
import sequelize from "../config/database";
import config from "../config/env";
import {
  MovieAttributes,
  MovieCreationAttributes,
  MovieWithRanking,
  PaginatedMovies,
} from "../types/models";
import { NotFoundError, ForbiddenError, ConflictError } from "../utils/errors";

export const getAllMovies = async (
  page: number = config.DEFAULT_PAGE,
  limit: number = config.DEFAULT_LIMIT
): Promise<PaginatedMovies> => {
  const safeLimit = Math.min(Math.max(1, limit), config.MAX_LIMIT);
  const safePage = Math.max(1, page);
  const offset = (safePage - 1) * safeLimit;

  const [countResult] = (await sequelize.query(
    `SELECT COUNT(*)::integer AS total FROM movies`,
    { type: QueryTypes.SELECT }
  )) as [{ total: number }];
  const total = countResult?.total || 0;

  // rank is derived at read time — RANK() OVER the indexed reviewCount column
  const query = `
    SELECT 
      id, title, "releaseDate", description, "posterUrl", "trailerUrl",
      "userId", "reviewCount", "createdAt", "updatedAt",
      RANK() OVER (ORDER BY "reviewCount" DESC)::integer AS rank
    FROM movies
    ORDER BY "reviewCount" DESC
    LIMIT :limit OFFSET :offset
  `;

  const results = await sequelize.query(query, {
    replacements: { limit: safeLimit, offset },
    type: QueryTypes.SELECT,
  });

  return {
    movies: results as MovieWithRanking[],
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit),
    },
  };
};

export const getMovieById = async (
  id: string
): Promise<MovieWithRanking | null> => {
  const query = `
    SELECT 
      m.id, m.title, m."releaseDate", m.description, m."posterUrl", m."trailerUrl",
      m."userId", m."reviewCount", m."createdAt", m."updatedAt",
      (SELECT COUNT(*)::integer + 1 FROM movies WHERE "reviewCount" > m."reviewCount") AS rank
    FROM movies m
    WHERE m.id = :id
    LIMIT 1
  `;

  const results = (await sequelize.query(query, {
    replacements: { id },
    type: QueryTypes.SELECT,
  })) as MovieWithRanking[];

  if (!Array.isArray(results) || results.length === 0) {
    return null;
  }

  return results[0];
};

export const searchMovies = async (
  searchQuery: string
): Promise<MovieWithRanking[]> => {
  const query = `
    SELECT 
      m.id, m.title, m."releaseDate", m.description, m."posterUrl", m."trailerUrl",
      m."userId", m."reviewCount", m."createdAt", m."updatedAt",
      (SELECT COUNT(*)::integer + 1 FROM movies WHERE "reviewCount" > m."reviewCount") AS rank
    FROM movies m
    WHERE m.title ILIKE :searchQuery
    ORDER BY m."reviewCount" DESC
  `;

  const results = await sequelize.query(query, {
    replacements: { searchQuery: `%${searchQuery}%` },
    type: QueryTypes.SELECT,
  });

  return results as MovieWithRanking[];
};

export const createMovie = async (
  movieData: MovieCreationAttributes
): Promise<MovieAttributes> => {
  const existingMovieQuery = `
    SELECT id FROM movies WHERE title = :title LIMIT 1
  `;
  const existingMovies = await sequelize.query(existingMovieQuery, {
    replacements: { title: movieData.title },
    type: QueryTypes.SELECT,
  });

  if (Array.isArray(existingMovies) && existingMovies.length > 0) {
    throw new ConflictError("Movie with this title already exists");
  }

  const insertQuery = `
    INSERT INTO movies (id, title, "releaseDate", description, "posterUrl", "trailerUrl", "userId", "reviewCount", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), :title, :releaseDate, :description, :posterUrl, :trailerUrl, :userId, 0, NOW(), NOW())
    RETURNING id, title, "releaseDate", description, "posterUrl", "trailerUrl", "userId", "reviewCount", "createdAt", "updatedAt"
  `;
  const [movie] = (await sequelize.query(insertQuery, {
    replacements: {
      title: movieData.title,
      releaseDate: movieData.releaseDate,
      description: movieData.description,
      posterUrl: movieData.posterUrl,
      trailerUrl: movieData.trailerUrl,
      userId: movieData.userId,
    },
    type: QueryTypes.SELECT,
  })) as MovieAttributes[];

  return movie;
};

export const updateMovie = async (
  id: string,
  movieData: Partial<MovieCreationAttributes>,
  userId: string
): Promise<MovieAttributes> => {
  const movieQuery = `
    SELECT id, title, "userId" FROM movies WHERE id = :id LIMIT 1
  `;
  const movies = (await sequelize.query(movieQuery, {
    replacements: { id },
    type: QueryTypes.SELECT,
  })) as MovieAttributes[];

  if (!Array.isArray(movies) || movies.length === 0) {
    throw new NotFoundError("Movie not found");
  }

  const movie = movies[0];

  if (movie.userId !== userId) {
    throw new ForbiddenError("You can only update your own movies");
  }

  if (movieData.title && movieData.title !== movie.title) {
    const existingMovieQuery = `
      SELECT id FROM movies WHERE title = :title LIMIT 1
    `;
    const existingMovies = await sequelize.query(existingMovieQuery, {
      replacements: { title: movieData.title },
      type: QueryTypes.SELECT,
    });

    if (Array.isArray(existingMovies) && existingMovies.length > 0) {
      throw new ConflictError("Movie with this title already exists");
    }
  }

  const updateFields: string[] = [];
  const replacements: Record<string, unknown> = { id };

  if (movieData.title !== undefined) {
    updateFields.push("title = :title");
    replacements.title = movieData.title;
  }
  if (movieData.releaseDate !== undefined) {
    updateFields.push('"releaseDate" = :releaseDate');
    replacements.releaseDate = movieData.releaseDate;
  }
  if (movieData.description !== undefined) {
    updateFields.push("description = :description");
    replacements.description = movieData.description;
  }
  if (movieData.posterUrl !== undefined) {
    updateFields.push('"posterUrl" = :posterUrl');
    replacements.posterUrl = movieData.posterUrl;
  }
  if (movieData.trailerUrl !== undefined) {
    updateFields.push('"trailerUrl" = :trailerUrl');
    replacements.trailerUrl = movieData.trailerUrl;
  }

  if (updateFields.length === 0) {
    const fullMovieQuery = `
      SELECT id, title, "releaseDate", description, "posterUrl", "trailerUrl",
             "userId", "reviewCount", "createdAt", "updatedAt"
      FROM movies
      WHERE id = :id
      LIMIT 1
    `;
    const [fullMovie] = (await sequelize.query(fullMovieQuery, {
      replacements: { id },
      type: QueryTypes.SELECT,
    })) as MovieAttributes[];
    return fullMovie;
  }

  updateFields.push('"updatedAt" = NOW()');

  const updateQuery = `
    UPDATE movies
    SET ${updateFields.join(", ")}
    WHERE id = :id
    RETURNING id, title, "releaseDate", description, "posterUrl", "trailerUrl",
              "userId", "reviewCount", "createdAt", "updatedAt"
  `;
  const [updatedMovie] = (await sequelize.query(updateQuery, {
    replacements,
    type: QueryTypes.SELECT,
  })) as MovieAttributes[];

  return updatedMovie;
};

export const deleteMovie = async (
  id: string,
  userId: string
): Promise<void> => {
  const movieQuery = `
    SELECT id, "userId" FROM movies WHERE id = :id LIMIT 1
  `;
  const movies = (await sequelize.query(movieQuery, {
    replacements: { id },
    type: QueryTypes.SELECT,
  })) as MovieAttributes[];

  if (!Array.isArray(movies) || movies.length === 0) {
    throw new NotFoundError("Movie not found");
  }

  const movie = movies[0];

  if (movie.userId !== userId) {
    throw new ForbiddenError("You can only delete your own movies");
  }

  const deleteQuery = `DELETE FROM movies WHERE id = :id`;
  await sequelize.query(deleteQuery, {
    replacements: { id },
    type: QueryTypes.DELETE,
  });
};
