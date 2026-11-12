export const TOKEN_KEY = 'cinepass_token'
export const USER_KEY = 'cinepass_user'

export const ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
}

export const BOOKING_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
}

export const SEAT_STATUS = {
  AVAILABLE: 'AVAILABLE',
  LOCKED: 'LOCKED',
  BOOKED: 'BOOKED',
}

export const PAYMENT_METHODS = ['UPI', 'CARD', 'NET_BANKING', 'WALLET']

// Must match `booking.lock.duration.minutes` in the backend's application.properties.
// This is a display-only countdown; the backend enforces the actual expiry
// (BookingService.confirmPayment + SeatUnlockScheduler), so if this drifts from the
// backend value the UI clock will just be visually off, not incorrect in effect.
// If you change booking.lock.duration.minutes on the backend, update this too.
export const SEAT_LOCK_DURATION_MINUTES = 5

