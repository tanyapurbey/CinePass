import { Link } from 'react-router-dom'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import { formatCurrency, formatDateTime } from '../../utils/formatters'

export default function BookingCard({ booking, onCancel, cancelling }) {
  const movieTitle = booking.show?.movie?.title || 'Movie'
  const theater = booking.show?.screen?.theater?.name
  const screen = booking.show?.screen?.name

  return (
    <Card>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-navy">{movieTitle}</h3>
            <Badge status={booking.status} />
          </div>
          <p className="text-xs text-slate-muted">
            Booking #{booking.bookingNumber}
          </p>
          {theater && (
            <p className="text-sm text-charcoal">
              {theater} · {screen}
            </p>
          )}
          <p className="text-xs text-slate-muted">
            {formatDateTime(booking.bookingTime)}
          </p>
          {booking.seats?.length > 0 && (
            <p className="text-xs text-slate-muted">
              Seats:{' '}
              {booking.seats
                .map((s) => s.seat?.seatNumber)
                .filter(Boolean)
                .join(', ')}
            </p>
          )}
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <p className="text-sm font-semibold text-navy">
            {formatCurrency(booking.totalAmount)}
          </p>
          <div className="flex gap-2">
            <Link to={`/bookings/${booking.id}`}>
              <Button variant="secondary" size="sm">
                Details
              </Button>
            </Link>
            {(booking.status === 'CONFIRMED' || booking.status === 'PENDING') && onCancel && (
              <Button
                variant="danger"
                size="sm"
                loading={cancelling}
                onClick={() => onCancel(booking.id)}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
