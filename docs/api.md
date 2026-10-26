# GoWheels REST API Documentation (v1)

Base URL: `/api/v1`

All responses follow a standard envelope:
```json
{
  "success": true,
  "message": "Optional human-readable confirmation",
  "data": { ... }
}
```

## 1. Authentication & Security
- `POST /api/v1/auth/register` — Register a customer account (name, email, password, phone).
- `POST /api/v1/auth/login` — Login and receive JWT cookie & Bearer token.
- `POST /api/v1/auth/logout` — Clear session cookie.
- `GET /api/v1/auth/me` — Authenticated user profile.
- `POST /api/v1/auth/forgot-password` — Issue password recovery verification code.
- `POST /api/v1/auth/reset-password` — Reset password using verified code.

## 2. Fleet & Vehicles
- `GET /api/v1/cars` — Filter cars by search, category, fuelType, transmission, seats, minPrice, maxPrice, sort, pagination.
- `GET /api/v1/cars/:id` — Vehicle details by ID or slug.
- `GET /api/v1/cars/:id/availability?pickupAt=...&returnAt=...` — Real-time overlap check.
- `POST /api/v1/cars/:id/quote` — Recalculates duration, taxes, and service fees on server.
- `GET /api/v1/cars/:id/reviews` — Verified customer reviews for vehicle.

## 3. Booking Engine
- `POST /api/v1/bookings` — Submit rental booking. Server re-verifies availability atomically and locks dates.
- `GET /api/v1/bookings/my` — Customer list of own active and past bookings.
- `GET /api/v1/bookings/:id` — Detailed booking summary with verified price breakdown snapshot.
- `PATCH /api/v1/bookings/:id/cancel` — Customer cancellation request with reason.

## 4. User Profile & Notifications
- `GET /api/v1/users/me` — Profile details.
- `PATCH /api/v1/users/me` — Update name and phone.
- `PATCH /api/v1/users/me/password` — Change password.
- `GET /api/v1/notifications` — In-app alerts for status updates.
- `PATCH /api/v1/notifications/:id/read` — Mark alert as read.

## 5. Admin Console (Role: admin)
- `GET /api/v1/admin/analytics` — Fleet availability, pending approvals, recorded revenue, status metrics.
- `GET /api/v1/admin/cars` — Manage all vehicles (active, maintenance, unpublished).
- `POST /api/v1/admin/cars` — Add new car to fleet.
- `PATCH /api/v1/admin/cars/:id` — Edit car specifications or rates.
- `DELETE /api/v1/admin/cars/:id` — Archive vehicle safely without breaking historical bookings.
- `GET /api/v1/admin/bookings` — Filter and review all bookings.
- `PATCH /api/v1/admin/bookings/:id/status` — Approve, reject, confirm, complete, or cancel booking.
- `GET /api/v1/admin/customers` — Customer directory with account status.
- `PATCH /api/v1/admin/customers/:id/status` — Activate or suspend customer account.
- `GET /api/v1/admin/payments` — Payment ledger and transaction records.
- `GET /api/v1/admin/reports` — Financial summaries and operational metrics.
