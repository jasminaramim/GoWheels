import mongoose from 'mongoose';
import dotenv from 'dotenv';
import {
  UserSchema,
  CarSchema,
  BookingSchema,
  ReviewSchema,
  NotificationSchema,
} from './models/mongooseSchemas.ts';
import {
  SEED_USERS,
  SEED_CARS,
  SEED_BOOKINGS,
  SEED_REVIEWS,
  SEED_NOTIFICATIONS,
} from './db/seedData.ts';

dotenv.config();

async function runSeed() {
  let uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('[Seed] Notice: MONGODB_URI is not set. GoWheels runs with an embedded document engine initialized with complete seed data automatically.');
    process.exit(0);
  }

  uri = uri.replace(/<([^>]+)>/g, '$1').trim();
  if (uri.endsWith('/')) {
    uri += 'gowheels?retryWrites=true&w=majority';
  } else if (!uri.includes('?') && !uri.split('://')[1]?.includes('/')) {
    uri += '/gowheels?retryWrites=true&w=majority';
  }

  console.log('[Seed] Connecting to MongoDB Atlas / cluster...');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  console.log('[Seed] Connected.');

  const User = mongoose.model('User', UserSchema);
  const Car = mongoose.model('Car', CarSchema);
  const Booking = mongoose.model('Booking', BookingSchema);
  const Review = mongoose.model('Review', ReviewSchema);
  const Notification = mongoose.model('Notification', NotificationSchema);

  console.log('[Seed] Populating collections...');
  for (const u of SEED_USERS) {
    await User.updateOne({ email: u.email }, { $set: u }, { upsert: true });
  }
  for (const c of SEED_CARS) {
    await Car.updateOne({ slug: c.slug }, { $set: c }, { upsert: true });
  }
  for (const b of SEED_BOOKINGS) {
    await Booking.updateOne({ bookingNumber: b.bookingNumber }, { $set: b }, { upsert: true });
  }
  for (const r of SEED_REVIEWS) {
    await Review.updateOne({ _id: r._id }, { $set: r }, { upsert: true });
  }
  for (const n of SEED_NOTIFICATIONS) {
    await Notification.updateOne({ _id: n._id }, { $set: n }, { upsert: true });
  }

  console.log('[Seed] Database seeded successfully with initial fleet, admin, and demo users.');
  await mongoose.disconnect();
}

runSeed().catch(err => {
  console.error('[Seed] Error during database seed:', err);
  process.exit(1);
});
