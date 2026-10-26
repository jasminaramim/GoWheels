import { Request, Response } from 'express';
import { dbStore } from '../db/store.ts';
import { PriceService } from '../services/priceService.ts';

export class CarController {
  public static async listCars(req: Request, res: Response): Promise<void> {
    try {
      const {
        search,
        category,
        fuelType,
        transmission,
        seats,
        minPrice,
        maxPrice,
        location,
        sort,
        page,
        limit,
      } = req.query;

      const result = await dbStore.findCars({
        search: search as string,
        category: category as string,
        fuelType: fuelType as string,
        transmission: transmission as string,
        seats: seats ? Number(seats) : undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        location: location as string,
        sort: sort as string,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 12,
        onlyPublished: true,
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
      const msg = err instanceof Error ? err.message : 'Error fetching cars';
      res.status(500).json({ success: false, message: msg });
    }
  }

  public static async getCarById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      let car = await dbStore.findCarById(id);

      // If not found by ID, try slug
      if (!car) {
        car = await dbStore.findCarBySlug(id);
      }

      if (!car) {
        res.status(404).json({ success: false, message: 'Vehicle not found' });
        return;
      }

      const reviews = await dbStore.findReviewsByCarId(car._id);

      res.json({
        success: true,
        data: {
          ...car,
          reviews,
        },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error retrieving car';
      res.status(500).json({ success: false, message: msg });
    }
  }

  public static async checkAvailability(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { pickupAt, returnAt } = req.query;

      if (!pickupAt || !returnAt) {
        res.status(400).json({ success: false, message: 'Both pickupAt and returnAt dates are required' });
        return;
      }

      const car = await dbStore.findCarById(id);
      if (!car) {
        res.status(404).json({ success: false, message: 'Vehicle not found' });
        return;
      }

      const result = await dbStore.checkCarAvailability(
        car._id,
        pickupAt as string,
        returnAt as string
      );

      res.json({
        success: true,
        available: result.available,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error checking availability';
      res.status(400).json({ success: false, message: msg });
    }
  }

  public static async calculateQuote(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { pickupAt, returnAt, isDeliveryRequested, promoCode } = req.body;

      if (!pickupAt || !returnAt) {
        res.status(400).json({ success: false, message: 'pickupAt and returnAt are required' });
        return;
      }

      const car = await dbStore.findCarById(id);
      if (!car) {
        res.status(404).json({ success: false, message: 'Vehicle not found' });
        return;
      }

      const priceBreakdown = PriceService.calculatePrice(
        car.dailyRate,
        pickupAt,
        returnAt,
        {
          isDeliveryRequested: Boolean(isDeliveryRequested),
          promoCode: promoCode as string,
        }
      );

      res.json({
        success: true,
        priceBreakdown,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error calculating price';
      res.status(400).json({ success: false, message: msg });
    }
  }
}
