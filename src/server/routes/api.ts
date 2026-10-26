import { Router } from 'express';
import { AuthController } from '../controllers/authController.ts';
import { CarController } from '../controllers/carController.ts';
import { BookingController } from '../controllers/bookingController.ts';
import { UserController } from '../controllers/userController.ts';
import { AdminController } from '../controllers/adminController.ts';
import { ReviewController } from '../controllers/reviewController.ts';
import {
  authenticate,
  requireAdmin,
  authRateLimiter,
} from '../middleware/auth.ts';
import { dbStore } from '../db/store.ts';

export const apiRouter = Router();

// --- Health Check ---
apiRouter.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'GoWheels API v1',
    database: dbStore.getStatus(),
  });
});

// --- Authentication ---
apiRouter.post('/auth/register', authRateLimiter, AuthController.register);
apiRouter.post('/auth/login', authRateLimiter, AuthController.login);
apiRouter.post('/auth/logout', AuthController.logout);
apiRouter.get('/auth/me', authenticate, AuthController.getMe);
apiRouter.post('/auth/forgot-password', authRateLimiter, AuthController.forgotPassword);
apiRouter.post('/auth/reset-password', authRateLimiter, AuthController.resetPassword);

// --- Cars ---
apiRouter.get('/cars', CarController.listCars);
apiRouter.get('/cars/:id', CarController.getCarById);
apiRouter.get('/cars/:id/availability', CarController.checkAvailability);
apiRouter.post('/cars/:id/quote', CarController.calculateQuote);
apiRouter.get('/cars/:id/reviews', ReviewController.getCarReviews);

// --- Bookings ---
apiRouter.post('/bookings', authenticate, BookingController.createBooking);
apiRouter.get('/bookings/my', authenticate, BookingController.getMyBookings);
apiRouter.get('/bookings/:id', authenticate, BookingController.getBookingById);
apiRouter.patch('/bookings/:id/cancel', authenticate, BookingController.cancelBooking);

// --- Customer / User Account ---
apiRouter.get('/users/me', authenticate, UserController.getProfile);
apiRouter.patch('/users/me', authenticate, UserController.updateProfile);
apiRouter.patch('/users/me/password', authenticate, UserController.changePassword);
apiRouter.get('/notifications', authenticate, UserController.getNotifications);
apiRouter.patch('/notifications/:id/read', authenticate, UserController.markNotificationRead);

// --- Reviews ---
apiRouter.post('/reviews', authenticate, ReviewController.createReview);

// --- Admin Endpoints (Protected by authenticate + requireAdmin) ---
apiRouter.get('/admin/analytics', authenticate, requireAdmin, AdminController.getAnalytics);
apiRouter.get('/admin/cars', authenticate, requireAdmin, AdminController.getCars);
apiRouter.post('/admin/cars', authenticate, requireAdmin, AdminController.createCar);
apiRouter.patch('/admin/cars/:id', authenticate, requireAdmin, AdminController.updateCar);
apiRouter.delete('/admin/cars/:id', authenticate, requireAdmin, AdminController.deleteCar);
apiRouter.get('/admin/bookings', authenticate, requireAdmin, AdminController.getBookings);
apiRouter.patch('/admin/bookings/:id/status', authenticate, requireAdmin, AdminController.updateBookingStatus);
apiRouter.get('/admin/customers', authenticate, requireAdmin, AdminController.getCustomers);
apiRouter.patch('/admin/customers/:id/status', authenticate, requireAdmin, AdminController.updateCustomerStatus);
apiRouter.get('/admin/payments', authenticate, requireAdmin, AdminController.getPayments);
apiRouter.get('/admin/reports', authenticate, requireAdmin, AdminController.getReports);
apiRouter.get('/admin/reviews', authenticate, requireAdmin, ReviewController.getAllReviewsAdmin);
apiRouter.patch('/admin/reviews/:id/moderate', authenticate, requireAdmin, ReviewController.moderateReview);
