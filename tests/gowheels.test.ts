import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import { PriceService } from '../src/server/services/priceService.ts';
import { dbStore } from '../src/server/db/store.ts';
import mongoose from 'mongoose';

test('PriceService: calculates correct duration days', () => {
  const pickup = '2026-11-01T09:00:00Z';
  const returnAt = '2026-11-03T09:00:00Z';
  const days = PriceService.calculateDurationDays(pickup, returnAt);
  assert.equal(days, 2);
});

test('PriceService: enforces return date strictly after pickup', () => {
  assert.throws(() => {
    PriceService.calculateDurationDays('2026-11-03T09:00:00Z', '2026-11-01T09:00:00Z');
  }, /Return date must be strictly after pickup date/);
});

test('PriceService: calculates server price with service fee and 5% tax', () => {
  const dailyRate = 4500;
  const pickup = '2026-11-01T09:00:00Z';
  const returnAt = '2026-11-03T09:00:00Z'; // 2 days
  const quote = PriceService.calculatePrice(dailyRate, pickup, returnAt);

  assert.equal(quote.days, 2);
  assert.equal(quote.baseTotal, 9000);
  assert.equal(quote.serviceFee, 300);
  assert.equal(quote.discount, 0);
  // Taxable: 9000 + 300 = 9300. 5% tax = 465
  assert.equal(quote.tax, 465);
  // Total: 9000 + 0 + 300 - 0 + 465 = 9765
  assert.equal(quote.totalAmount, 9765);
  assert.equal(quote.currency, 'BDT');
});

test('PriceService: applies 10% discount for extended 7+ day rentals', () => {
  const dailyRate = 5000;
  const pickup = '2026-11-01T09:00:00Z';
  const returnAt = '2026-11-08T09:00:00Z'; // 7 days
  const quote = PriceService.calculatePrice(dailyRate, pickup, returnAt);

  assert.equal(quote.days, 7);
  assert.equal(quote.baseTotal, 35000);
  assert.equal(quote.discount, 3500); // 10% of 35000
});

test('DatabaseStore: finds seeded jasmin admin and customer accounts', async () => {
  const jasmin = await dbStore.findUserByEmail('jasmin');
  assert.ok(jasmin);
  assert.equal(jasmin.role, 'admin');

  // Verify bcrypt password check for jasmin1142005
  const validJasmin = await bcrypt.compare('jasmin1142005', jasmin.passwordHash);
  assert.equal(validJasmin, true);

  const customer = await dbStore.findUserByEmail('customer@gowheels.com');
  assert.ok(customer);
  assert.equal(customer.role, 'customer');
});

test('DatabaseStore: rejects duplicate user email registration', async () => {
  await assert.rejects(
    async () => {
      await dbStore.createUser({
        name: 'Duplicate Admin',
        email: 'admin@gowheels.com',
        passwordHash: 'hash',
        phone: '12345678',
        role: 'customer',
        accountStatus: 'active',
      });
    },
    /already exists/
  );
});

test('DatabaseStore & Overlap Rules: prevents conflicting overlapping reservations', async () => {
  const carId = 'car_toyota_corolla';
  const pick = '2026-12-10T09:00:00Z';
  const ret = '2026-12-15T09:00:00Z';

  // 1. Initial check - should be available
  const availBefore = await dbStore.checkCarAvailability(carId, pick, ret);
  assert.equal(availBefore.available, true);

  // 2. Create and approve booking
  const price = PriceService.calculatePrice(4500, pick, ret);
  const booking = await dbStore.createBooking({
    userId: 'usr_customer_01',
    carId,
    pickupLocation: 'Gulshan 2, Dhaka',
    returnLocation: 'Gulshan 2, Dhaka',
    pickupAt: pick,
    returnAt: ret,
    rentalDuration: 5,
    priceBreakdown: price,
    bookingStatus: 'approved',
    paymentStatus: 'pending',
  });

  assert.ok(booking.bookingNumber.startsWith('GW-2026-'));

  // 3. Attempting to book overlapping dates for the same car must fail
  // Overlap: 2026-12-12 to 2026-12-18
  const overlapAvail = await dbStore.checkCarAvailability(
    carId,
    '2026-12-12T09:00:00Z',
    '2026-12-18T09:00:00Z'
  );
  assert.equal(overlapAvail.available, false);
  assert.ok(overlapAvail.conflictingBooking);

  // 4. Non-overlapping dates must succeed
  const nonOverlap = await dbStore.checkCarAvailability(
    carId,
    '2026-12-20T09:00:00Z',
    '2026-12-25T09:00:00Z'
  );
  assert.equal(nonOverlap.available, true);
});

test('DatabaseStore: booking cancellation and admin approval flow', async () => {
  const carId = 'car_honda_crv';
  const pick = '2026-12-01T09:00:00Z';
  const ret = '2026-12-03T09:00:00Z';
  const price = PriceService.calculatePrice(7500, pick, ret);

  const b = await dbStore.createBooking({
    userId: 'usr_customer_01',
    carId,
    pickupLocation: 'Banani, Dhaka',
    returnLocation: 'Banani, Dhaka',
    pickupAt: pick,
    returnAt: ret,
    rentalDuration: 2,
    priceBreakdown: price,
    bookingStatus: 'pending',
    paymentStatus: 'pending',
  });

  // Customer requests cancellation
  const cancelledReq = await dbStore.requestBookingCancellation(
    b._id,
    'usr_customer_01',
    'Trip postponed due to client schedule'
  );
  assert.equal(cancelledReq.bookingStatus, 'cancellation_requested');
  assert.equal(cancelledReq.cancellationDetails?.reason, 'Trip postponed due to client schedule');

  // Admin approves cancellation
  const adminProcessed = await dbStore.updateBookingStatus(b._id, 'cancelled', 'usr_admin_01', 'Approved cancellation');
  assert.equal(adminProcessed?.bookingStatus, 'cancelled');
});

test.after(async () => {
  await mongoose.disconnect();
});
