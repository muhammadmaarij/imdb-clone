import { Router } from 'express';
import {
  getMovies,
  getMovie,
  createMovieHandler,
  updateMovieHandler,
  deleteMovieHandler,
  searchMoviesHandler,
} from '../controllers/movieController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import {
  createMovieSchema,
  updateMovieSchema,
  searchMovieSchema,
} from '../validators/movieValidator';

const router = Router();

router.get('/', getMovies);
router.get('/search', validate(searchMovieSchema), searchMoviesHandler);
router.get('/:id', getMovie);
router.post('/', authenticate, validate(createMovieSchema), createMovieHandler);
router.put('/:id', authenticate, validate(updateMovieSchema), updateMovieHandler);
router.delete('/:id', authenticate, deleteMovieHandler);

export default router;
