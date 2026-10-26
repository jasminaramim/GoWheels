import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(80),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100),
  phone: z.string().min(8, 'Please enter a valid contact phone number').max(20),
});

export const loginSchema = z.object({
  email: z.string().min(1, 'Username or email is required'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  token: z.string().min(4, 'Reset token is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  phone: z.string().min(8).max(20).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export const createBookingSchema = z.object({
  carId: z.string().min(1, 'Car ID is required'),
  pickupLocation: z.string().min(2, 'Pickup location is required'),
  returnLocation: z.string().min(2, 'Return location is required'),
  pickupAt: z.string().refine(val => !isNaN(Date.parse(val)), 'Valid pickup date is required'),
  returnAt: z.string().refine(val => !isNaN(Date.parse(val)), 'Valid return date is required'),
  customerName: z.string().min(2).optional(),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().min(8).optional(),
  customerNotes: z.string().max(500).optional(),
  paymentMethod: z.enum(['cash', 'manual_bank', 'card_gateway']).default('cash'),
});

export const cancelBookingSchema = z.object({
  reason: z.string().min(5, 'Please provide a reason for cancellation (at least 5 characters)').max(300),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum([
    'pending',
    'approved',
    'rejected',
    'confirmed',
    'active',
    'completed',
    'cancellation_requested',
    'cancelled',
  ]),
  adminNotes: z.string().max(500).optional(),
});

export const carSchema = z.object({
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.coerce.number().min(1990).max(2030),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum(['Sedan', 'SUV', 'Luxury', 'Economy', 'Van']),
  images: z.array(z.string()).min(1, 'At least one image URL is required'),
  dailyRate: z.coerce.number().min(500, 'Daily rate must be at least 500 BDT'),
  currency: z.string().default('BDT'),
  transmission: z.enum(['Automatic', 'Manual']),
  fuelType: z.enum(['Petrol', 'Octane', 'Hybrid', 'Diesel', 'Electric']),
  seats: z.coerce.number().min(1).max(20),
  luggage: z.coerce.number().min(0).max(15).default(2),
  features: z.array(z.string()).default([]),
  location: z.string().min(2, 'Location is required'),
  vehicleStatus: z.enum(['available', 'rented', 'maintenance']).default('available'),
  isPublished: z.boolean().default(true),
  plateNumber: z.string().optional(),
  mileageLimit: z.string().default('Unlimited'),
});

export const reviewSchema = z.object({
  carId: z.string().min(1, 'Car ID is required'),
  bookingId: z.string().optional(),
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().min(5, 'Review comment must be at least 5 characters').max(1000),
});
