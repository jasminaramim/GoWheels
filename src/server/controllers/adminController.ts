import { Response } from 'express';
import { dbStore } from '../db/store.ts';
import { AuthRequest } from '../middleware/auth.ts';
import { carSchema, updateBookingStatusSchema } from '../validators/schemas.ts';

export class AdminController {
  public static async getAnalytics(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const data = await dbStore.getAdminAnalytics();
      res.json({ success: true, data });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error fetching analytics';
      res.status(500).json({ success: false, message: msg });
    }
  }

  public static async getCars(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { search, category, status, page, limit } = req.query;

      const result = await dbStore.findCars({
        search: search as string,
        category: category as string,
        onlyPublished: false, // Admin views published & unpublished
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
      });

      let items = result.items;
      if (status && status !== 'all') {
        items = items.filter(c => c.vehicleStatus === status);
      }

      res.json({
        success: true,
        data: items,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error retrieving cars';
      res.status(500).json({ success: false, message: msg });
    }
  }

  public static async createCar(req: AuthRequest, res: Response): Promise<void> {
    try {
      const validated = carSchema.parse(req.body);

      // Auto-generate slug from brand + model
      const baseSlug = `${validated.brand}-${validated.model}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

      const newCar = await dbStore.createCar({
        slug: uniqueSlug,
        ...validated,
      });

      res.status(201).json({
        success: true,
        message: 'Car added to fleet successfully',
        data: newCar,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error creating car';
      res.status(400).json({ success: false, message: msg });
    }
  }

  public static async updateCar(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updated = await dbStore.updateCar(id, req.body);

      if (!updated) {
        res.status(404).json({ success: false, message: 'Vehicle not found' });
        return;
      }

      res.json({
        success: true,
        message: 'Car details updated successfully',
        data: updated,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating car';
      res.status(400).json({ success: false, message: msg });
    }
  }

  public static async deleteCar(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const archived = await dbStore.deleteCar(id);

      if (!archived) {
        res.status(404).json({ success: false, message: 'Vehicle not found' });
        return;
      }

      res.json({
        success: true,
        message: 'Vehicle archived safely without breaking historical bookings.',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error archiving car';
      res.status(500).json({ success: false, message: msg });
    }
  }

  public static async getBookings(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { status, search, carId, page, limit } = req.query;

      const result = await dbStore.findBookings({
        status: status as string,
        search: search as string,
        carId: carId as string,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
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

  public static async updateBookingStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, adminNotes } = updateBookingStatusSchema.parse(req.body);

      const updated = await dbStore.updateBookingStatus(
        id,
        status,
        req.user?._id,
        adminNotes
      );

      if (!updated) {
        res.status(404).json({ success: false, message: 'Booking not found' });
        return;
      }

      res.json({
        success: true,
        message: `Booking has been updated to ${status.toUpperCase().replace('_', ' ')}`,
        data: updated,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update booking status';
      res.status(400).json({ success: false, message: msg });
    }
  }

  public static async getCustomers(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const users = await dbStore.getAllUsers();
      const customers = users
        .filter(u => u.role === 'customer')
        .map(({ passwordHash: _, ...rest }) => rest);

      res.json({
        success: true,
        data: customers,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error retrieving customers';
      res.status(500).json({ success: false, message: msg });
    }
  }

  public static async updateCustomerStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { accountStatus } = req.body;

      if (!['active', 'suspended'].includes(accountStatus)) {
        res.status(400).json({ success: false, message: 'Invalid accountStatus' });
        return;
      }

      const updated = await dbStore.updateUser(id, { accountStatus });
      if (!updated) {
        res.status(404).json({ success: false, message: 'Customer not found' });
        return;
      }

      const { passwordHash: _, ...safeCustomer } = updated;
      res.json({
        success: true,
        message: `Customer account marked as ${accountStatus}`,
        data: safeCustomer,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating customer';
      res.status(500).json({ success: false, message: msg });
    }
  }

  public static async getPayments(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const payments = await dbStore.getPayments();
      res.json({ success: true, data: payments });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error retrieving payments';
      res.status(500).json({ success: false, message: msg });
    }
  }

  public static async getReports(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const analytics = await dbStore.getAdminAnalytics();
      const allBookings = (await dbStore.findBookings({ limit: 100 })).items;

      res.json({
        success: true,
        data: {
          summary: analytics.financials,
          overview: analytics.overview,
          statusDistribution: analytics.statusDistribution,
          bookings: allBookings,
        },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error generating reports';
      res.status(500).json({ success: false, message: msg });
    }
  }
}
