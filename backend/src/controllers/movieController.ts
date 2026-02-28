import { Request, Response } from 'express';
import {
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  searchMovies,
} from '../services/movieService';
import { CreateMovieInput, UpdateMovieInput, SearchMovieInput } from '../validators/movieValidator';
import { MovieCreationAttributes } from '../types/models';

export const getMovies = async (_req: Request, res: Response): Promise<void> => {
  try {
    const movies = await getAllMovies();
    res.status(200).json({
      success: true,
      data: movies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch movies',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getMovie = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const movie = await getMovieById(id);

    if (!movie) {
      res.status(404).json({
        success: false,
        message: 'Movie not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: movie,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch movie',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const createMovieHandler = async (
  req: Request<unknown, unknown, CreateMovieInput>,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const movieData: MovieCreationAttributes = {
      ...req.body,
      userId: req.user.id,
    };

    const movie = await createMovie(movieData);

    res.status(201).json({
      success: true,
      message: 'Movie created successfully',
      data: movie,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('already exists')) {
      res.status(409).json({
        success: false,
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create movie',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const updateMovieHandler = async (
  req: Request<{ id: string }, unknown, UpdateMovieInput>,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const { id } = req.params;
    const movie = await updateMovie(id, req.body, req.user.id);

    res.status(200).json({
      success: true,
      message: 'Movie updated successfully',
      data: movie,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }
      if (error.message.includes('Unauthorized')) {
        res.status(403).json({
          success: false,
          message: error.message,
        });
        return;
      }
      if (error.message.includes('already exists')) {
        res.status(409).json({
          success: false,
          message: error.message,
        });
        return;
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update movie',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const deleteMovieHandler = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const { id } = req.params;
    await deleteMovie(id, req.user.id);

    res.status(200).json({
      success: true,
      message: 'Movie deleted successfully',
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }
      if (error.message.includes('Unauthorized')) {
        res.status(403).json({
          success: false,
          message: error.message,
        });
        return;
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete movie',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const searchMoviesHandler = async (
  req: Request<unknown, unknown, unknown, SearchMovieInput>,
  res: Response
): Promise<void> => {
  try {
    const { q } = req.query;
    const movies = await searchMovies(q);

    res.status(200).json({
      success: true,
      data: movies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to search movies',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
