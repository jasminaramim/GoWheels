import mongoose, { Schema } from 'mongoose';

// User Schema
export const UserSchema = new Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, required: true, trim: true },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer', index: true },
    accountStatus: { type: String, enum: ['active', 'suspended'], default: 'active', index: true },
  },
  { timestamps: true }
);

// Car Schema
export const CarSchema = new Schema(
  {
    _id: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    brand: { type: String, required: true, index: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['Sedan', 'SUV', 'Luxury', 'Economy', 'Van'],
      required: true,
      index: true,
    },
    images: [{ type: String }],
    dailyRate: { type: Number, required: true, min: 0, index: true },
    currency: { type: String, default: 'BDT' },
    transmission: { type: String, enum: ['Automatic', 'Manual'], required: true, index: true },
    fuelType: {
      type: String,
      enum: ['Petrol', 'Octane', 'Hybrid', 'Diesel', 'Electric'],
      required: true,
      index: true,
    },
    seats: { type: Number, required: true, min: 1, max: 20 },
    luggage: { type: Number, default: 2 },
    features: [{ type: String }],
    location: { type: String, required: true, index: true },
    vehicleStatus: {
      type: String,
      enum: ['available', 'rented', 'maintenance'],
      default: 'available',
      index: true,
    },
    isPublished: { type: Boolean, default: true, index: true },
    plateNumber: { type: String },
    mileageLimit: { type: String, default: 'Unlimited' },
    rating: { type: Number, default: 4.8 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Booking Schema
export const BookingSchema = new Schema(
  {
    _id: { type: String, required: true },
    bookingNumber: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    carId: { type: String, required: true, index: true },
    customerName: { type: String },
    customerEmail: { type: String },
    customerPhone: { type: String },
    pickupLocation: { type: String, required: true },
    returnLocation: { type: String, required: true },
    pickupAt: { type: String, required: true, index: true },
    returnAt: { type: String, required: true, index: true },
    rentalDuration: { type: Number, required: true, min: 1 },
    priceBreakdown: {
      dailyRate: { type: Number, required: true },
      days: { type: Number, required: true },
      baseTotal: { type: Number, required: true },
      deliveryFee: { type: Number, default: 0 },
      serviceFee: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      totalAmount: { type: Number, required: true },
      currency: { type: String, default: 'BDT' },
    },
    bookingStatus: {
      type: String,
      enum: [
        'pending',
        'approved',
        'rejected',
        'confirmed',
        'active',
        'completed',
        'cancellation_requested',
        'cancelled',
      ],
      default: 'pending',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
      index: true,
    },
    paymentMethod: { type: String, enum: ['cash', 'manual_bank', 'card_gateway'], default: 'cash' },
    customerNotes: { type: String },
    adminNotes: { type: String },
    cancellationDetails: {
      reason: { type: String },
      requestedAt: { type: String },
      processedAt: { type: String },
      processedBy: { type: String },
      refundAmount: { type: Number },
    },
    approvedBy: { type: String },
  },
  { timestamps: true }
);

// Payment Schema
export const PaymentSchema = new Schema(
  {
    _id: { type: String, required: true },
    bookingId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    provider: { type: String, enum: ['cash', 'manual_bank', 'card_gateway'], required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'BDT' },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    transactionReference: { type: String, required: true, unique: true, index: true },
    paidAt: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

// Review Schema
export const ReviewSchema = new Schema(
  {
    _id: { type: String, required: true },
    userId: { type: String, required: true, index: true },
    userName: { type: String, required: true },
    carId: { type: String, required: true, index: true },
    bookingId: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    moderationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved',
      index: true,
    },
  },
  { timestamps: true }
);

// Notification Schema
export const NotificationSchema = new Schema(
  {
    _id: { type: String, required: true },
    userId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ['booking_status', 'payment', 'account', 'system'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    readAt: { type: String },
    link: { type: String },
  },
  { timestamps: true }
);
