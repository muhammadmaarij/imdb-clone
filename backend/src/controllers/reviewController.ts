import { Request, Response } from "express";
import {
  createReview,
  updateReview,
  deleteReview,
  getReviewsByMovieId,
} from "../services/reviewService";
import {
  CreateReviewInput,
  UpdateReviewInput,
} from "../validators/reviewValidator";
import { ReviewCreationAttributes } from "../types/models";
import { AppError } from "../utils/errors";

export const createReviewHandler = async (
  req: Request<unknown, unknown, CreateReviewInput>,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const reviewData: ReviewCreationAttributes = {
      ...req.body,
      userId: req.user.id,
    };

    const review = await createReview(reviewData);

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: review,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Failed to create review",
    });
  }
};

export const updateReviewHandler = async (
  req: Request<{ id: string }, unknown, UpdateReviewInput>,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const { id } = req.params;
    const review = await updateReview(id, req.body, req.user.id);

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: review,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Failed to update review",
    });
  }
};

export const deleteReviewHandler = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const { id } = req.params;
    await deleteReview(id, req.user.id);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Failed to delete review",
    });
  }
};

export const getMovieReviews = async (
  req: Request<{ movieId: string }>,
  res: Response
): Promise<void> => {
  try {
    const { movieId } = req.params;
    const reviews = await getReviewsByMovieId(movieId);

    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
    });
  }
};
