import { Response } from 'express';
import { dbStore } from '../db/store.ts';
import { AuthRequest } from '../middleware/auth.ts';
import { PriceService } from '../services/priceService.ts';
import { createBookingSchema, cancelBookingSchema } from '../validators/schemas.ts';

export class BookingController {
  public static async createBooking(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Please log in to submit a booking request.' });
        return;
      }

      const validated = createBookingSchema.parse(req.body);

      // Verify car existence and rate from database
      const car = await dbStore.findCarById(validated.carId);
      if (!car) {
        res.status(404).json({ success: false, message: 'Selected vehicle not found.' });
        return;
      }

      if (!car.isPublished || car.vehicleStatus === 'maintenance') {
        res.status(400).json({ success: false, message: 'This vehicle is currently unavailable for rental.' });
        return;
      }

      // Check dates
      const pickupTime = new Date(validated.pickupAt).getTime();
      const returnTime = new Date(validated.returnAt).getTime();

      if (pickupTime < Date.now() - 3600000) {
        res.status(400).json({ success: false, message: 'Pickup time cannot be in the past.' });
        return;
      }

      if (returnTime <= pickupTime) {
        res.status(400).json({ success: false, message: 'Return date must be strictly after pickup date.' });
        return;
      }

      // Atomic availability check
      const availability = await dbStore.checkCarAvailability(
        car._id,
        validated.pickupAt,
        validated.returnAt
      );

      if (!availability.available) {
        res.status(409).json({
          success: false,
          message: 'The selected car is already booked or reserved for these dates. Please choose another date range or vehicle.',
        });
        return;
      }

      // Server-side price calculation (trusted)
      const durationDays = PriceService.calculateDurationDays(validated.pickupAt, validated.returnAt);
      const isDelivery = validated.pickupLocation.toLowerCase() !== car.location.toLowerCase();
      const priceBreakdown = PriceService.calculatePrice(
        car.dailyRate,
        validated.pickupAt,
        validated.returnAt,
        { isDeliveryRequested: isDelivery }
      );

      const booking = await dbStore.createBooking({
        userId: req.user._id,
        carId: car._id,
        customerName: validated.customerName || req.user.name,
        customerEmail: validated.customerEmail || req.user.email,
        customerPhone: validated.customerPhone || req.user.phone,
        pickupLocation: validated.pickupLocation,
        returnLocation: validated.returnLocation,
        pickupAt: validated.pickupAt,
        returnAt: validated.returnAt,
        rentalDuration: durationDays,
        priceBreakdown,
        bookingStatus: 'pending',
        paymentStatus: 'pending',
        paymentMethod: validated.paymentMethod,
        customerNotes: validated.customerNotes,
      });

      res.status(201).json({
        success: true,
        message: 'Your booking request has been submitted successfully and is pending admin approval.',
        data: booking,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error creating booking';
      res.status(400).json({ success: false, message: msg });
    }
  }

  public static async getMyBookings(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      const { status, page, limit } = req.query;

      const result = await dbStore.findBookings({
        userId: req.user._id,
        status: status as string,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
      });

      res.json({
        success: true,
        data: result.items,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error retrieving bookings';
      res.status(500).json({ success: false, message: msg });
    }
  }

  public static async getBookingById(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      const { id } = req.params;
      const booking = await dbStore.findBookingById(id);

      if (!booking) {
        res.status(404).json({ success: false, message: 'Booking not found' });
        return;
      }

      // Check access permission (owner or admin)
      if (booking.userId !== req.user._id && req.user.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Access denied to this booking' });
        return;
      }

      res.json({
        success: true,
        data: booking,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error fetching booking';
      res.status(500).json({ success: false, message: msg });
    }
  }

  public static async cancelBooking(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      const { id } = req.params;
      const { reason } = cancelBookingSchema.parse(req.body);

      const updated = await dbStore.requestBookingCancellation(id, req.user._id, reason);

      res.json({
        success: true,
        message: 'Cancellation request submitted. Administrator will review.',
        data: updated,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Cancellation failed';
      res.status(400).json({ success: false, message: msg });
    }
  }
}
