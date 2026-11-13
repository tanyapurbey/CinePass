import { useEffect, useState } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { FiCheckCircle, FiClock, FiMapPin, FiArrowLeft, FiFilm, FiCreditCard } from 'react-icons/fi'
import { bookingService } from '../api/bookingService'
import PageHeader from '../components/layout/PageHeader'
import SeatGrid from '../components/booking/SeatGrid'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorAlert from '../components/common/ErrorAlert'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { formatCurrency, formatDateTime, getErrorMessage } from '../utils/formatters'

export default function BookingDetail() {
  const { id } = useParams()
  const location = useLocation()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [error, setError] = useState('')
  const success = location.state?.success

  useEffect(() => {
    bookingService
      .getById(id)
      .then((res) => setBooking(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [id])

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return
    setCancelling(true)
    try {
      const { data } = await bookingService.cancel(id)
      setBooking(data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setCancelling(false)
    }
  }

  if (loading) return <LoadingSpinner fullPage />
  if (!booking) return <p className="p-8 text-center text-sm text-secondary-text">Booking reference not found.</p>

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <Link to="/bookings" className="inline-flex items-center gap-1.5 text-xs font-bold text-secondary-text hover:text-primary transition-colors">
        <FiArrowLeft size={14} /> Back to My Bookings
      </Link>

      <PageHeader
        title="Digital Ticket"
        description={`Booking Reference: #${booking.bookingNumber}`}
        action={<Badge status={booking.status} />}
      />

      {success && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-900 shadow-2xs">
          <FiCheckCircle size={20} className="text-emerald-600 shrink-0" />
          <span>Congratulations! Your reservation is confirmed. Show this digital pass at the cinema entrance.</span>
        </div>
      )}

      {error && <div className="mb-6"><ErrorAlert message={error} /></div>}

      {/* Ticket Card */}
      <div className="overflow-hidden rounded-3xl border border-border bg-card-bg shadow-lg shadow-slate-900/5">
        {/* Ticket Header */}
        <div className="border-b border-border/80 bg-slate-50/70 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white">
              <FiFilm size={14} />
            </div>
            <span className="font-heading text-sm font-extrabold text-primary-text">CinePass E-Ticket</span>
          </div>
          <span className="font-mono text-xs font-bold text-secondary-text">#{booking.bookingNumber}</span>
        </div>

        {/* Ticket Body */}
        <div className="p-6 space-y-4">
          <Row label="Movie Title" value={booking.show?.movie?.title} bold />
          <Row label="Showtime" value={formatDateTime(booking.show?.startTime)} />
          <Row label="Cinema Hall" value={booking.show?.screen?.theater?.name} />
          <Row label="Screen" value={booking.show?.screen?.name} />
          <Row label="Reserved Date" value={formatDateTime(booking.bookingTime)} />
          <div className="border-t border-border/80 pt-3">
            <Row label="Amount Paid" value={formatCurrency(booking.totalAmount)} highlight />
          </div>

          {booking.payment && (
            <div className="rounded-2xl border border-border bg-slate-50/50 p-4 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-primary-text">
                <FiCreditCard size={14} className="text-primary" />
                <span>Payment Verification</span>
              </div>
              <Row label="Method" value={booking.payment.paymentMethod} />
              <Row label="Txn ID" value={booking.payment.transactionId} />
            </div>
          )}
        </div>
      </div>

      {/* Seat Allocation Preview */}
      {booking.seats?.length > 0 && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h3 className="font-heading text-sm font-bold text-primary-text">Assigned Seat Locations</h3>
            <span className="rounded-md bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-primary">
              {booking.seats.map((s) => s.seat?.seatNumber).filter(Boolean).join(', ')}
            </span>
          </div>
          <SeatGrid
            seats={booking.seats}
            selectedIds={booking.seats.map((s) => s.id)}
            onToggle={() => {}}
            readOnly
          />
        </Card>
      )}

      {/* Cancellation Action */}
      {(booking.status === 'CONFIRMED' || booking.status === 'PENDING') && (
        <div className="pt-2">
          <Button variant="danger" size="md" loading={cancelling} onClick={handleCancel}>
            Cancel This Reservation
          </Button>
        </div>
      )}
    </div>
  )
}

function Row({ label, value, bold, highlight }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-secondary-text text-xs uppercase font-semibold tracking-wider">{label}</span>
      <span className={`${bold ? 'font-heading font-extrabold text-base text-primary-text' : 'font-medium text-primary-text'} ${highlight ? 'font-heading text-xl font-black text-primary' : ''}`}>
        {value || '—'}
      </span>
    </div>
  )
}
