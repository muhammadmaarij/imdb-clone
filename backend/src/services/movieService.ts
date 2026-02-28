import { QueryTypes } from "sequelize";
import sequelize from "../config/database";
import {
  MovieAttributes,
  MovieCreationAttributes,
  MovieWithRanking,
} from "../types/models";

export const getAllMovies = async (): Promise<MovieWithRanking[]> => {
  const query = `
    SELECT 
      m.id,
      m.title,
      m."releaseDate",
      m.description,
      m."posterUrl",
      m."trailerUrl",
      m."userId",
      m."createdAt",
      m."updatedAt",
      COUNT(r.id)::integer AS "reviewCount",
      RANK() OVER (ORDER BY COUNT(r.id) DESC)::integer AS rank
    FROM movies m
    LEFT JOIN reviews r ON r."movieId" = m.id
    GROUP BY 
      m.id,
      m.title,
      m."releaseDate",
      m.description,
      m."posterUrl",
      m."trailerUrl",
      m."userId",
      m."createdAt",
      m."updatedAt"
    ORDER BY COUNT(r.id) DESC
  `;

  const results = await sequelize.query(query, {
    type: QueryTypes.SELECT,
  });

  return results as MovieWithRanking[];
};

export const getMovieById = async (
  id: string
): Promise<MovieWithRanking | null> => {
  const movieQuery = `
    SELECT 
      m.id,
      m.title,
      m."releaseDate",
      m.description,
      m."posterUrl",
      m."trailerUrl",
      m."userId",
      m."createdAt",
      m."updatedAt"
    FROM movies m
    WHERE m.id = :id
    LIMIT 1
  `;
  const movies = (await sequelize.query(movieQuery, {
    replacements: { id },
    type: QueryTypes.SELECT,
  })) as MovieAttributes[];

  if (!Array.isArray(movies) || movies.length === 0) {
    return null;
  }

  const movie = movies[0];

  const reviewCountQuery = `
    SELECT COUNT(*)::integer AS count
    FROM reviews
    WHERE "movieId" = :id
  `;
  const [reviewCountResult] = (await sequelize.query(reviewCountQuery, {
    replacements: { id },
    type: QueryTypes.SELECT,
  })) as [{ count: number }];
  const reviewCount = reviewCountResult?.count || 0;

  const moviesWithRanking = await getAllMovies();
  const movieRank = moviesWithRanking.findIndex((m) => m.id === id) + 1;

  return {
    ...movie,
    reviewCount,
    rank: movieRank > 0 ? movieRank : undefined,
  };
};

export const searchMovies = async (
  searchQuery: string
): Promise<MovieWithRanking[]> => {
  const query = `
    SELECT 
      m.id,
      m.title,
      m."releaseDate",
      m.description,
      m."posterUrl",
      m."trailerUrl",
      m."userId",
      m."createdAt",
      m."updatedAt",
      COUNT(r.id)::integer AS "reviewCount",
      RANK() OVER (ORDER BY COUNT(r.id) DESC)::integer AS rank
    FROM movies m
    LEFT JOIN reviews r ON r."movieId" = m.id
    WHERE m.title ILIKE :searchQuery
    GROUP BY 
      m.id,
      m.title,
      m."releaseDate",
      m.description,
      m."posterUrl",
      m."trailerUrl",
      m."userId",
      m."createdAt",
      m."updatedAt"
    ORDER BY COUNT(r.id) DESC
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
    throw new Error("Movie with this title already exists");
  }

  const insertQuery = `
    INSERT INTO movies (id, title, "releaseDate", description, "posterUrl", "trailerUrl", "userId", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), :title, :releaseDate, :description, :posterUrl, :trailerUrl, :userId, NOW(), NOW())
    RETURNING id, title, "releaseDate", description, "posterUrl", "trailerUrl", "userId", "createdAt", "updatedAt"
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
    throw new Error("Movie not found");
  }

  const movie = movies[0];

  if (movie.userId !== userId) {
    throw new Error("Unauthorized: You can only update your own movies");
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
      throw new Error("Movie with this title already exists");
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
    // No fields to update, return existing movie
    const fullMovieQuery = `
      SELECT id, title, "releaseDate", description, "posterUrl", "trailerUrl", "userId", "createdAt", "updatedAt"
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
    RETURNING id, title, "releaseDate", description, "posterUrl", "trailerUrl", "userId", "createdAt", "updatedAt"
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
    throw new Error("Movie not found");
  }

  const movie = movies[0];

  if (movie.userId !== userId) {
    throw new Error("Unauthorized: You can only delete your own movies");
  }

  const deleteQuery = `DELETE FROM movies WHERE id = :id`;
  await sequelize.query(deleteQuery, {
    replacements: { id },
    type: QueryTypes.DELETE,
  });
};
