# GoWheels Database Architecture

GoWheels utilizes MongoDB with Mongoose schemas, indexes, and referential integrity enforced in business logic.

## Collections & Schemas

### 1. `users`
- `_id`: String / ObjectId
- `name`: String
- `email`: String (Unique, Indexed, Lowercase)
- `passwordHash`: String (Argon2 / Bcrypt)
- `phone`: String
- `role`: Enum ('customer', 'admin') (Indexed)
- `accountStatus`: Enum ('active', 'suspended')
- `createdAt`, `updatedAt`: Timestamps

### 2. `cars`
- `_id`: String / ObjectId
- `slug`: String (Unique, Indexed)
- `brand`: String (Indexed)
- `model`: String
- `year`: Number
- `description`: String
- `category`: Enum ('Sedan', 'SUV', 'Luxury', 'Economy', 'Van') (Indexed)
- `images`: Array of Strings
- `dailyRate`: Number (Indexed)
- `currency`: String ('BDT')
- `transmission`: Enum ('Automatic', 'Manual')
- `fuelType`: Enum ('Petrol', 'Octane', 'Hybrid', 'Diesel', 'Electric')
- `seats`: Number
- `luggage`: Number
- `features`: Array of Strings
- `location`: String (Indexed)
- `vehicleStatus`: Enum ('available', 'rented', 'maintenance') (Indexed)
- `isPublished`: Boolean (Indexed)
- `plateNumber`: String
- `rating`: Number
- `reviewCount`: Number

### 3. `bookings`
- `_id`: String / ObjectId
- `bookingNumber`: String (Unique, Indexed, format: GW-2026-XXXX)
- `userId`: String (Foreign key -> users, Indexed)
- `carId`: String (Foreign key -> cars, Indexed)
- `pickupLocation`: String
- `returnLocation`: String
- `pickupAt`: ISO String (Indexed)
- `returnAt`: ISO String (Indexed)
- `rentalDuration`: Number (Days)
- `priceBreakdown`: Sub-document (dailyRate, days, baseTotal, deliveryFee, serviceFee, discount, tax, totalAmount, currency)
- `bookingStatus`: Enum ('pending', 'approved', 'rejected', 'confirmed', 'active', 'completed', 'cancellation_requested', 'cancelled') (Indexed)
- `paymentStatus`: Enum ('pending', 'paid', 'refunded')
- `paymentMethod`: Enum ('cash', 'manual_bank', 'card_gateway')
- `cancellationDetails`: Sub-document (reason, requestedAt, processedAt, refundAmount)
- `approvedBy`: String (Admin ID)

### 4. Overlap & Double-Booking Prevention Rule
Two bookings overlap if and only if:
```
existing.pickupAt < new.returnAt && existing.returnAt > new.pickupAt
```
The GoWheels booking engine executes an atomic reservation lock. During approval, the date range is re-verified to prevent race conditions.
