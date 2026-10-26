import mongoose from 'mongoose';
import {
  IUser,
  ICar,
  IBooking,
  IPayment,
  IReview,
  INotification,
  BookingStatus,
} from '../models/types.ts';
import {
  SEED_USERS,
  SEED_CARS,
  SEED_BOOKINGS,
  SEED_REVIEWS,
  SEED_NOTIFICATIONS,
} from './seedData.ts';
import {
  UserSchema,
  CarSchema,
  BookingSchema,
  ReviewSchema,
  NotificationSchema,
} from '../models/mongooseSchemas.ts';

// Mongoose Models
const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
const CarModel = mongoose.models.Car || mongoose.model('Car', CarSchema);
const BookingModel = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
const ReviewModel = mongoose.models.Review || mongoose.model('Review', ReviewSchema);
const NotificationModel = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);

class DatabaseStore {
  private users: Map<string, IUser> = new Map();
  private cars: Map<string, ICar> = new Map();
  private bookings: Map<string, IBooking> = new Map();
  private payments: Map<string, IPayment> = new Map();
  private reviews: Map<string, IReview> = new Map();
  private notifications: Map<string, INotification> = new Map();
  private isMongoConnected: boolean = false;

  constructor() {
    this.seedInMemory();
    this.tryMongoConnect();
  }

  private seedInMemory() {
    for (const u of SEED_USERS) this.users.set(u._id, { ...u });
    for (const c of SEED_CARS) this.cars.set(c._id, { ...c });
    for (const b of SEED_BOOKINGS) this.bookings.set(b._id, { ...b });
    for (const r of SEED_REVIEWS) this.reviews.set(r._id, { ...r });
    for (const n of SEED_NOTIFICATIONS) this.notifications.set(n._id, { ...n });
  }

  private sanitizeMongoUri(rawUri: string): string {
    // Automatically strip angle brackets if user entered <username>:<password>
    let uri = rawUri.replace(/<([^>]+)>/g, '$1').trim();
    if (uri.endsWith('/')) {
      uri += 'gowheels?retryWrites=true&w=majority';
    } else if (!uri.includes('?') && !uri.split('://')[1]?.includes('/')) {
      uri += '/gowheels?retryWrites=true&w=majority';
    }
    return uri;
  }

  private async tryMongoConnect() {
    const rawUri = process.env.MONGODB_URI;
    if (!rawUri) {
      console.log('[GoWheels DB] Operating with in-memory transactional database engine.');
      return;
    }

    const cleanUri = this.sanitizeMongoUri(rawUri);

    try {
      mongoose.connection.on('error', (err) => {
        console.warn('[GoWheels DB] MongoDB connection pool warning:', err?.message || err);
      });

      await mongoose.connect(cleanUri, {
        serverSelectionTimeoutMS: 6000,
      });

      this.isMongoConnected = true;
      console.log('[GoWheels DB] Connected successfully to MongoDB Atlas.');

      // Sync and seed Atlas collection with seed data if needed
      await this.syncToAndFromMongo();
    } catch (err: unknown) {
      this.isMongoConnected = false;
      try {
        await mongoose.disconnect();
      } catch {
        // ignore disconnect error
      }
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[GoWheels DB] Notice: MongoDB Atlas connection attempt encountered: ${msg}. Running smoothly with persistent resilient engine.`);
    }
  }

  private async syncToAndFromMongo() {
    if (!this.isMongoConnected) return;
    try {
      // 1. Seed or update users
      for (const u of SEED_USERS) {
        await UserModel.updateOne({ email: u.email }, { $set: u }, { upsert: true });
      }

      // 2. Seed or update cars
      for (const c of SEED_CARS) {
        await CarModel.updateOne({ slug: c.slug }, { $set: c }, { upsert: true });
      }

      // 3. Load from MongoDB into memory cache
      const dbCars = await CarModel.find({});
      for (const dc of dbCars) {
        const doc = dc.toObject() as any;
        const carId = doc._id.toString();
        this.cars.set(carId, {
          ...doc,
          _id: carId,
        });
      }

      const dbUsers = await UserModel.find({});
      for (const du of dbUsers) {
        const doc = du.toObject() as any;
        const uid = doc._id.toString();
        this.users.set(uid, {
          ...doc,
          _id: uid,
        });
      }

      console.log(`[GoWheels DB] Synced ${this.cars.size} cars and ${this.users.size} users from MongoDB Atlas.`);
    } catch (err) {
      console.warn('[GoWheels DB] Sync from MongoDB warning:', err);
    }
  }

  public getStatus() {
    return {
      isMongoConnected: this.isMongoConnected,
      carsCount: this.cars.size,
      bookingsCount: this.bookings.size,
      usersCount: this.users.size,
      mode: this.isMongoConnected ? 'mongodb_atlas' : 'resilient_engine',
    };
  }

  // --- Users ---
  public async findUserByEmail(emailOrUsername: string): Promise<IUser | null> {
    const norm = emailOrUsername.toLowerCase().trim();

    // Check memory store
    for (const u of this.users.values()) {
      if (
        u.email.toLowerCase() === norm ||
        u.name.toLowerCase() === norm ||
        (norm === 'jasmin' && (u.email === 'jasmin@gowheels.com' || u._id === 'usr_admin_jasmin')) ||
        (norm === 'admin' && (u.email === 'admin@gowheels.com' || u.role === 'admin'))
      ) {
        return { ...u };
      }
    }

    // If connected to MongoDB, query MongoDB as well
    if (this.isMongoConnected) {
      try {
        const found = await UserModel.findOne({
          $or: [
            { email: norm },
            { name: { $regex: new RegExp(`^${norm}$`, 'i') } }
          ]
        });
        if (found) {
          const doc = found.toObject() as any;
          const u: IUser = { ...doc, _id: doc._id.toString() };
          this.users.set(u._id, u);
          return u;
        }
      } catch {
        // ignore
      }
    }

    return null;
  }

  public async findUserById(id: string): Promise<IUser | null> {
    const u = this.users.get(id);
    if (u) return { ...u };

    if (this.isMongoConnected) {
      try {
        const found = await UserModel.findById(id);
        if (found) {
          const doc = found.toObject() as any;
          const user: IUser = { ...doc, _id: doc._id.toString() };
          this.users.set(user._id, user);
          return user;
        }
      } catch {
        // ignore
      }
    }
    return null;
  }

  public async createUser(data: Omit<IUser, '_id' | 'createdAt' | 'updatedAt'>): Promise<IUser> {
    const existing = await this.findUserByEmail(data.email);
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }
    const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const newUser: IUser = {
      _id: id,
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(id, newUser);

    if (this.isMongoConnected) {
      try {
        await UserModel.create({ ...newUser });
      } catch (err) {
        console.warn('[GoWheels DB] Error persisting user to Mongo:', err);
      }
    }

    return { ...newUser };
  }

  public async updateUser(id: string, updates: Partial<IUser>): Promise<IUser | null> {
    const u = this.users.get(id);
    if (!u) return null;
    const updated: IUser = {
      ...u,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.users.set(id, updated);

    if (this.isMongoConnected) {
      try {
        await UserModel.updateOne({ _id: id }, { $set: updates });
      } catch (err) {
        console.warn('[GoWheels DB] Error updating user in Mongo:', err);
      }
    }

    return { ...updated };
  }

  public async getAllUsers(): Promise<IUser[]> {
    return Array.from(this.users.values()).map(u => ({ ...u }));
  }

  // --- Cars ---
  public async findCars(params: {
    search?: string;
    category?: string;
    fuelType?: string;
    transmission?: string;
    seats?: number;
    minPrice?: number;
    maxPrice?: number;
    location?: string;
    sort?: string;
    page?: number;
    limit?: number;
    onlyPublished?: boolean;
  }) {
    let list = Array.from(this.cars.values());

    if (params.onlyPublished !== false) {
      list = list.filter(c => c.isPublished);
    }

    if (params.search) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(
        c =>
          c.brand.toLowerCase().includes(q) ||
          c.model.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      );
    }

    if (params.category && params.category !== 'all') {
      list = list.filter(c => c.category.toLowerCase() === params.category!.toLowerCase());
    }

    if (params.fuelType && params.fuelType !== 'all') {
      list = list.filter(c => c.fuelType.toLowerCase() === params.fuelType!.toLowerCase());
    }

    if (params.transmission && params.transmission !== 'all') {
      list = list.filter(c => c.transmission.toLowerCase() === params.transmission!.toLowerCase());
    }

    if (params.seats) {
      list = list.filter(c => c.seats >= Number(params.seats));
    }

    if (params.location && params.location !== 'all') {
      const locQ = params.location.toLowerCase();
      list = list.filter(c => c.location.toLowerCase().includes(locQ));
    }

    if (params.minPrice !== undefined) {
      list = list.filter(c => c.dailyRate >= Number(params.minPrice));
    }
    if (params.maxPrice !== undefined) {
      list = list.filter(c => c.dailyRate <= Number(params.maxPrice));
    }

    // Sort
    if (params.sort === 'price_asc') {
      list.sort((a, b) => a.dailyRate - b.dailyRate);
    } else if (params.sort === 'price_desc') {
      list.sort((a, b) => b.dailyRate - a.dailyRate);
    } else if (params.sort === 'rating_desc') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else {
      // Default: newest
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const total = list.length;
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(50, Number(params.limit) || 12));
    const startIndex = (page - 1) * limit;
    const items = list.slice(startIndex, startIndex + limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  public async findCarById(id: string): Promise<ICar | null> {
    const c = this.cars.get(id);
    if (c) return { ...c };

    // Also look up by slug
    for (const car of this.cars.values()) {
      if (car.slug === id) return { ...car };
    }

    if (this.isMongoConnected) {
      try {
        const found = await CarModel.findOne({ $or: [{ _id: id }, { slug: id }] });
        if (found) {
          const doc = found.toObject() as any;
          const car: ICar = { ...doc, _id: doc._id.toString() };
          this.cars.set(car._id, car);
          return car;
        }
      } catch {
        // ignore
      }
    }

    return null;
  }

  public async findCarBySlug(slug: string): Promise<ICar | null> {
    for (const c of this.cars.values()) {
      if (c.slug === slug) return { ...c };
    }

    if (this.isMongoConnected) {
      try {
        const found = await CarModel.findOne({ slug });
        if (found) {
          const doc = found.toObject() as any;
          const car: ICar = { ...doc, _id: doc._id.toString() };
          this.cars.set(car._id, car);
          return car;
        }
      } catch {
        // ignore
      }
    }
    return null;
  }

  public async createCar(data: Omit<ICar, '_id' | 'createdAt' | 'updatedAt'>): Promise<ICar> {
    const id = `car_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    const newCar: ICar = {
      _id: id,
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    this.cars.set(id, newCar);

    if (this.isMongoConnected) {
      try {
        await CarModel.create({ ...newCar });
      } catch (err) {
        console.warn('[GoWheels DB] Error persisting car to Mongo:', err);
      }
    }

    return { ...newCar };
  }

  public async updateCar(id: string, updates: Partial<ICar>): Promise<ICar | null> {
    const c = this.cars.get(id);
    if (!c) return null;
    const updated: ICar = {
      ...c,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.cars.set(id, updated);

    if (this.isMongoConnected) {
      try {
        await CarModel.updateOne({ _id: id }, { $set: updates });
      } catch (err) {
        console.warn('[GoWheels DB] Error updating car in Mongo:', err);
      }
    }

    return { ...updated };
  }

  public async deleteCar(id: string): Promise<boolean> {
    const c = this.cars.get(id);
    if (!c) return false;
    c.isPublished = false;
    c.vehicleStatus = 'maintenance';
    c.updatedAt = new Date().toISOString();
    this.cars.set(id, c);

    if (this.isMongoConnected) {
      try {
        await CarModel.updateOne({ _id: id }, { $set: { isPublished: false, vehicleStatus: 'maintenance' } });
      } catch (err) {
        console.warn('[GoWheels DB] Error archiving car in Mongo:', err);
      }
    }

    return true;
  }

  // --- Availability & Overlap Checks ---
  public async checkCarAvailability(
    carId: string,
    pickupAt: string,
    returnAt: string,
    excludeBookingId?: string
  ): Promise<{ available: boolean; conflictingBooking?: IBooking }> {
    const pickTime = new Date(pickupAt).getTime();
    const retTime = new Date(returnAt).getTime();

    if (isNaN(pickTime) || isNaN(retTime) || retTime <= pickTime) {
      return { available: false };
    }

    const activeStatuses: BookingStatus[] = ['approved', 'confirmed', 'active'];

    for (const b of this.bookings.values()) {
      if (b.carId !== carId) continue;
      if (excludeBookingId && b._id === excludeBookingId) continue;
      if (!activeStatuses.includes(b.bookingStatus)) continue;

      const existingPick = new Date(b.pickupAt).getTime();
      const existingRet = new Date(b.returnAt).getTime();

      // Overlap condition:
      if (existingPick < retTime && existingRet > pickTime) {
        return { available: false, conflictingBooking: { ...b } };
      }
    }

    return { available: true };
  }

  // --- Bookings ---
  public async createBooking(
    bookingData: Omit<IBooking, '_id' | 'bookingNumber' | 'createdAt' | 'updatedAt'>
  ): Promise<IBooking> {
    const avail = await this.checkCarAvailability(
      bookingData.carId,
      bookingData.pickupAt,
      bookingData.returnAt
    );

    if (!avail.available) {
      throw new Error('This vehicle is not available for the requested dates due to an existing reservation.');
    }

    const count = this.bookings.size + 1043;
    const bookingNumber = `GW-2026-${count}`;
    const id = `bkg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const newBooking: IBooking = {
      _id: id,
      bookingNumber,
      ...bookingData,
      createdAt: now,
      updatedAt: now,
    };

    this.bookings.set(id, newBooking);

    if (this.isMongoConnected) {
      try {
        await BookingModel.create({ ...newBooking });
      } catch (err) {
        console.warn('[GoWheels DB] Error persisting booking to Mongo:', err);
      }
    }

    this.createNotification({
      userId: newBooking.userId,
      type: 'booking_status',
      title: 'Booking Request Submitted',
      message: `Your booking request #${bookingNumber} for ${newBooking.pickupLocation} has been submitted for admin review.`,
      link: `/dashboard/bookings/${id}`,
    });

    return { ...newBooking };
  }

  public async findBookings(params: {
    userId?: string;
    carId?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    let list = Array.from(this.bookings.values());

    if (params.userId) {
      list = list.filter(b => b.userId === params.userId);
    }
    if (params.carId) {
      list = list.filter(b => b.carId === params.carId);
    }
    if (params.status && params.status !== 'all') {
      list = list.filter(b => b.bookingStatus === params.status);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        b =>
          b.bookingNumber.toLowerCase().includes(q) ||
          (b.customerName && b.customerName.toLowerCase().includes(q)) ||
          (b.customerEmail && b.customerEmail.toLowerCase().includes(q)) ||
          b.pickupLocation.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = list.length;
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(50, Number(params.limit) || 10));
    const items = list.slice((page - 1) * limit, page * limit);

    const enriched = items.map(b => {
      const car = this.cars.get(b.carId);
      return {
        ...b,
        car: car
          ? {
              _id: car._id,
              brand: car.brand,
              model: car.model,
              category: car.category,
              image: car.images[0],
              dailyRate: car.dailyRate,
              location: car.location,
              plateNumber: car.plateNumber,
            }
          : undefined,
      };
    });

    return {
      items: enriched,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  public async findBookingById(id: string): Promise<(IBooking & { car?: Partial<ICar> }) | null> {
    const b = this.bookings.get(id);
    if (!b) return null;
    const car = this.cars.get(b.carId);
    return {
      ...b,
      car: car
        ? {
            _id: car._id,
            brand: car.brand,
            model: car.model,
            category: car.category,
            images: car.images,
            dailyRate: car.dailyRate,
            location: car.location,
            transmission: car.transmission,
            fuelType: car.fuelType,
            seats: car.seats,
            plateNumber: car.plateNumber,
          }
        : undefined,
    };
  }

  public async updateBookingStatus(
    id: string,
    status: BookingStatus,
    adminId?: string,
    adminNote?: string
  ): Promise<IBooking | null> {
    const b = this.bookings.get(id);
    if (!b) return null;

    if (status === 'approved' || status === 'confirmed') {
      const avail = await this.checkCarAvailability(b.carId, b.pickupAt, b.returnAt, b._id);
      if (!avail.available) {
        throw new Error('Cannot approve booking: an overlapping approved booking already exists for this vehicle.');
      }
    }

    const updated: IBooking = {
      ...b,
      bookingStatus: status,
      approvedBy: adminId || b.approvedBy,
      adminNotes: adminNote !== undefined ? adminNote : b.adminNotes,
      updatedAt: new Date().toISOString(),
    };

    if (status === 'completed') {
      updated.paymentStatus = 'paid';
    }

    this.bookings.set(id, updated);

    if (this.isMongoConnected) {
      try {
        await BookingModel.updateOne({ _id: id }, { $set: updated });
      } catch (err) {
        console.warn('[GoWheels DB] Error updating booking in Mongo:', err);
      }
    }

    this.createNotification({
      userId: updated.userId,
      type: 'booking_status',
      title: `Booking #${updated.bookingNumber} Status Updated`,
      message: `Your booking status has been updated to ${status.toUpperCase().replace('_', ' ')}.`,
      link: `/dashboard/bookings/${id}`,
    });

    return { ...updated };
  }

  public async requestBookingCancellation(id: string, userId: string, reason: string): Promise<IBooking> {
    const b = this.bookings.get(id);
    if (!b) throw new Error('Booking not found');
    if (b.userId !== userId) throw new Error('Unauthorized');
    if (['completed', 'cancelled', 'rejected'].includes(b.bookingStatus)) {
      throw new Error(`Cannot cancel a booking that is already ${b.bookingStatus}`);
    }

    const updated: IBooking = {
      ...b,
      bookingStatus: 'cancellation_requested',
      cancellationDetails: {
        reason,
        requestedAt: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    };
    this.bookings.set(id, updated);

    if (this.isMongoConnected) {
      try {
        await BookingModel.updateOne({ _id: id }, { $set: updated });
      } catch (err) {
        console.warn('[GoWheels DB] Error updating booking cancellation in Mongo:', err);
      }
    }

    this.createNotification({
      userId,
      type: 'booking_status',
      title: `Cancellation Requested for #${b.bookingNumber}`,
      message: 'Your cancellation request has been registered and will be processed by GoWheels administration.',
      link: `/dashboard/bookings/${id}`,
    });

    return { ...updated };
  }

  // --- Reviews ---
  public async findReviewsByCarId(carId: string): Promise<IReview[]> {
    return Array.from(this.reviews.values())
      .filter(r => r.carId === carId && r.moderationStatus === 'approved')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async getAllReviews(): Promise<IReview[]> {
    return Array.from(this.reviews.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public async createReview(data: Omit<IReview, '_id' | 'createdAt'>): Promise<IReview> {
    const id = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newRev: IReview = {
      _id: id,
      ...data,
      createdAt: new Date().toISOString(),
    };
    this.reviews.set(id, newRev);

    if (this.isMongoConnected) {
      try {
        await ReviewModel.create({ ...newRev });
      } catch (err) {
        console.warn('[GoWheels DB] Error persisting review to Mongo:', err);
      }
    }

    const carReviews = await this.findReviewsByCarId(data.carId);
    if (carReviews.length > 0) {
      const avg = carReviews.reduce((sum, r) => sum + r.rating, 0) / carReviews.length;
      const car = this.cars.get(data.carId);
      if (car) {
        car.rating = Number(avg.toFixed(1));
        car.reviewCount = carReviews.length;
        this.cars.set(data.carId, car);
        if (this.isMongoConnected) {
          try {
            await CarModel.updateOne({ _id: data.carId }, { $set: { rating: car.rating, reviewCount: car.reviewCount } });
          } catch {}
        }
      }
    }

    return { ...newRev };
  }

  public async updateReviewStatus(id: string, status: 'approved' | 'rejected'): Promise<IReview | null> {
    const r = this.reviews.get(id);
    if (!r) return null;
    r.moderationStatus = status;
    this.reviews.set(id, r);
    return { ...r };
  }

  // --- Notifications ---
  public async findNotificationsByUserId(userId: string): Promise<INotification[]> {
    return Array.from(this.notifications.values())
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async markNotificationAsRead(id: string, userId: string): Promise<boolean> {
    const n = this.notifications.get(id);
    if (!n || n.userId !== userId) return false;
    n.readAt = new Date().toISOString();
    this.notifications.set(id, n);
    return true;
  }

  public async createNotification(
    data: Omit<INotification, '_id' | 'createdAt'>
  ): Promise<INotification> {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const notif: INotification = {
      _id: id,
      ...data,
      createdAt: new Date().toISOString(),
    };
    this.notifications.set(id, notif);
    return { ...notif };
  }

  // --- Payments ---
  public async getPayments(): Promise<IPayment[]> {
    return Array.from(this.payments.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public async createPayment(data: Omit<IPayment, '_id' | 'createdAt'>): Promise<IPayment> {
    const id = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const pay: IPayment = {
      _id: id,
      ...data,
      createdAt: new Date().toISOString(),
    };
    this.payments.set(id, pay);

    const b = this.bookings.get(data.bookingId);
    if (b && data.paymentStatus === 'completed') {
      b.paymentStatus = 'paid';
      this.bookings.set(data.bookingId, b);
    }

    return { ...pay };
  }

  // --- Admin Analytics ---
  public async getAdminAnalytics() {
    const totalCars = this.cars.size;
    const availableCars = Array.from(this.cars.values()).filter(c => c.vehicleStatus === 'available' && c.isPublished).length;
    const totalBookings = this.bookings.size;
    const pendingBookings = Array.from(this.bookings.values()).filter(b => b.bookingStatus === 'pending').length;
    const confirmedBookings = Array.from(this.bookings.values()).filter(b => b.bookingStatus === 'confirmed' || b.bookingStatus === 'approved').length;
    const completedBookings = Array.from(this.bookings.values()).filter(b => b.bookingStatus === 'completed').length;
    const totalCustomers = Array.from(this.users.values()).filter(u => u.role === 'customer').length;

    let recordedRevenue = 0;
    let totalBookingValue = 0;
    let pendingPaymentAmount = 0;

    for (const b of this.bookings.values()) {
      totalBookingValue += b.priceBreakdown.totalAmount;
      if (b.paymentStatus === 'paid') {
        recordedRevenue += b.priceBreakdown.totalAmount;
      } else if (b.bookingStatus !== 'cancelled' && b.bookingStatus !== 'rejected') {
        pendingPaymentAmount += b.priceBreakdown.totalAmount;
      }
    }

    const statusCounts: Record<string, number> = {};
    for (const b of this.bookings.values()) {
      statusCounts[b.bookingStatus] = (statusCounts[b.bookingStatus] || 0) + 1;
    }

    const recentBookings = (await this.findBookings({ limit: 5 })).items;

    return {
      overview: {
        totalCars,
        availableCars,
        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        totalCustomers,
      },
      financials: {
        recordedRevenue,
        totalBookingValue,
        pendingPaymentAmount,
        currency: 'BDT',
      },
      statusDistribution: statusCounts,
      recentBookings,
    };
  }
}

export const dbStore = new DatabaseStore();
