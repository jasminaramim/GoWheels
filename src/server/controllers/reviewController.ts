import { Request, Response } from 'express';
import { dbStore } from '../db/store.ts';
import { AuthRequest } from '../middleware/auth.ts';
import { reviewSchema } from '../validators/schemas.ts';

export class ReviewController {
  public static async getCarReviews(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const reviews = await dbStore.findReviewsByCarId(id);
      res.json({ success: true, data: reviews });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error fetching reviews';
      res.status(500).json({ success: false, message: msg });
    }
  }

  public static async createReview(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Please log in to submit a review' });
        return;
      }

      const validated = reviewSchema.parse(req.body);

      const review = await dbStore.createReview({
        userId: req.user._id,
        userName: req.user.name,
        carId: validated.carId,
        bookingId: validated.bookingId,
        rating: validated.rating,
        comment: validated.comment,
        moderationStatus: 'approved', // auto-approve for trusted user reviews, admin can moderate
      });

      res.status(201).json({
        success: true,
        message: 'Review submitted successfully. Thank you for your feedback!',
        data: review,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error submitting review';
      res.status(400).json({ success: false, message: msg });
    }
  }

  public static async getAllReviewsAdmin(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const reviews = await dbStore.getAllReviews();
      res.json({ success: true, data: reviews });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error retrieving reviews';
      res.status(500).json({ success: false, message: msg });
    }
  }

  public static async moderateReview(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['approved', 'rejected'].includes(status)) {
        res.status(400).json({ success: false, message: 'Invalid moderation status' });
        return;
      }

      const updated = await dbStore.updateReviewStatus(id, status);
      if (!updated) {
        res.status(404).json({ success: false, message: 'Review not found' });
        return;
      }

      res.json({ success: true, message: `Review marked as ${status}`, data: updated });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error moderating review';
      res.status(500).json({ success: false, message: msg });
    }
  }
}
