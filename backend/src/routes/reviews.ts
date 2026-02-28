import { Router } from 'express';
import {
  createReviewHandler,
  updateReviewHandler,
  deleteReviewHandler,
  getMovieReviews,
} from '../controllers/reviewController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { createReviewSchema, updateReviewSchema } from '../validators/reviewValidator';

const router = Router();

router.get('/movie/:movieId', getMovieReviews);
router.post('/', authenticate, validate(createReviewSchema), createReviewHandler);
router.put('/:id', authenticate, validate(updateReviewSchema), updateReviewHandler);
router.delete('/:id', authenticate, deleteReviewHandler);

export default router;
