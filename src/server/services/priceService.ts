import { IPriceBreakdown } from '../models/types.ts';

export class PriceService {
  /**
   * Calculates rental duration in full or fractional days (minimum 1 day).
   */
  public static calculateDurationDays(pickupAt: string, returnAt: string): number {
    const start = new Date(pickupAt).getTime();
    const end = new Date(returnAt).getTime();

    if (isNaN(start) || isNaN(end) || end <= start) {
      throw new Error('Return date must be strictly after pickup date.');
    }

    const diffHours = (end - start) / (1000 * 60 * 60);
    // Standard car rental policy: 24h increments rounded up, minimum 1 full day
    const days = Math.max(1, Math.ceil(diffHours / 24));
    return days;
  }

  /**
   * Recalculates full price breakdown on the server from verified vehicle rate.
   */
  public static calculatePrice(
    dailyRate: number,
    pickupAt: string,
    returnAt: string,
    options: {
      isDeliveryRequested?: boolean;
      promoCode?: string;
    } = {}
  ): IPriceBreakdown {
    const days = this.calculateDurationDays(pickupAt, returnAt);
    const baseTotal = dailyRate * days;

    // Delivery fee: 500 BDT if doorstep delivery requested
    const deliveryFee = options.isDeliveryRequested ? 500 : 0;

    // Fixed platform service fee (inspection, sanitized vehicle, roadside assist)
    const serviceFee = 300;

    // Automatic multi-day discount: 10% off for 7+ days
    let discount = 0;
    if (days >= 7) {
      discount = Math.round(baseTotal * 0.1);
    } else if (options.promoCode?.toUpperCase() === 'GOWHEELS10') {
      discount = Math.round(baseTotal * 0.1);
    }

    // 5% VAT on base minus discount + service
    const taxableAmount = Math.max(0, baseTotal - discount + serviceFee);
    const tax = Math.round(taxableAmount * 0.05);

    const totalAmount = baseTotal + deliveryFee + serviceFee - discount + tax;

    return {
      dailyRate,
      days,
      baseTotal,
      deliveryFee,
      serviceFee,
      discount,
      tax,
      totalAmount,
      currency: 'BDT',
    };
  }
}
