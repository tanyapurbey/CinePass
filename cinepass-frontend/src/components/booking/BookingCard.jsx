import { Link } from 'react-router-dom'
import { FiFilm, FiCalendar, FiMapPin, FiClock } from 'react-icons/fi'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import { formatCurrency, formatDateTime } from '../../utils/formatters'

export default function BookingCard({ booking, onCancel, cancelling }) {
  const movieTitle = booking.show?.movie?.title || 'Movie'
  const theater = booking.show?.screen?.theater?.name
  const screen = booking.show?.screen?.name

  return (
    <Card className="hover:border-slate-300 transition-colors">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="font-heading text-lg font-bold text-primary-text">{movieTitle}</h3>
            <Badge status={booking.status} />
          </div>

          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-secondary-text">
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-slate-700">
              #{booking.bookingNumber}
            </span>
            <span>·</span>
            <span>{formatDateTime(booking.bookingTime)}</span>
          </div>

          {theater && (
            <div className="flex items-center gap-1.5 text-sm font-medium text-primary-text">
              <FiMapPin size={14} className="text-primary shrink-0" />
              <span>{theater}</span>
              <span className="text-secondary-text">({screen})</span>
            </div>
          )}

          {booking.seats?.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-secondary-text">
              <span className="font-semibold text-primary-text">Seats:</span>
              <span className="rounded-md bg-rose-50 px-2 py-0.5 font-semibold text-primary">
                {booking.seats
                  .map((s) => s.seat?.seatNumber)
                  .filter(Boolean)
                  .join(', ')}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col items-start gap-3 sm:items-end border-t border-border/60 pt-3 sm:border-0 sm:pt-0">
          <div className="text-left sm:text-right">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-secondary-text">Total Paid</p>
            <p className="font-heading text-xl font-extrabold text-primary">
              {formatCurrency(booking.totalAmount)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link to={`/bookings/${booking.id}`}>
              <Button variant="secondary" size="sm">
                View Ticket
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
