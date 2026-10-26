export type UserRole = 'customer' | 'admin';
export type AccountStatus = 'active' | 'suspended';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  phone: string;
  role: UserRole;
  accountStatus: AccountStatus;
  createdAt: string;
  updatedAt: string;
}

export type CarCategory = 'Sedan' | 'SUV' | 'Luxury' | 'Economy' | 'Van';
export type VehicleStatus = 'available' | 'rented' | 'maintenance';
export type Transmission = 'Automatic' | 'Manual';
export type FuelType = 'Petrol' | 'Octane' | 'Hybrid' | 'Diesel' | 'Electric';

export interface ICar {
  _id: string;
  slug: string;
  brand: string;
  model: string;
  year: number;
  description: string;
  category: CarCategory;
  images: string[];
  dailyRate: number; // in BDT (৳)
  currency: string; // 'BDT'
  transmission: Transmission;
  fuelType: FuelType;
  seats: number;
  luggage: number;
  features: string[];
  location: string;
  vehicleStatus: VehicleStatus;
  isPublished: boolean;
  plateNumber?: string;
  mileageLimit?: string;
  rating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

export type BookingStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'confirmed'
  | 'active'
  | 'completed'
  | 'cancellation_requested'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export interface IPriceBreakdown {
  dailyRate: number;
  days: number;
  baseTotal: number;
  deliveryFee: number;
  serviceFee: number;
  discount: number;
  tax: number;
  totalAmount: number;
  currency: string;
}

export interface ICancellationDetails {
  reason: string;
  requestedAt: string;
  processedAt?: string;
  processedBy?: string;
  refundAmount?: number;
}

export interface IBooking {
  _id: string;
  bookingNumber: string;
  userId: string;
  carId: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  pickupLocation: string;
  returnLocation: string;
  pickupAt: string;
  returnAt: string;
  rentalDuration: number; // in days
  priceBreakdown: IPriceBreakdown;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: 'cash' | 'manual_bank' | 'card_gateway';
  customerNotes?: string;
  adminNotes?: string;
  cancellationDetails?: ICancellationDetails;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IPayment {
  _id: string;
  bookingId: string;
  userId: string;
  provider: 'cash' | 'manual_bank' | 'card_gateway';
  amount: number;
  currency: string;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionReference: string;
  paidAt?: string;
  notes?: string;
  createdAt: string;
}

export interface IReview {
  _id: string;
  userId: string;
  userName: string;
  carId: string;
  bookingId?: string;
  rating: number; // 1 to 5
  comment: string;
  moderationStatus: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface INotification {
  _id: string;
  userId: string;
  type: 'booking_status' | 'payment' | 'account' | 'system';
  title: string;
  message: string;
  readAt?: string;
  link?: string;
  createdAt: string;
}
