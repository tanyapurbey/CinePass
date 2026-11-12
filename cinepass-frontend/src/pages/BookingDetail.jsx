import { useEffect, useState } from 'react'
import { useParams, useLocation } from 'react-router-dom'
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
    if (!window.confirm('Cancel this booking?')) return
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
  if (!booking) return <p className="p-8 text-center text-sm text-slate-muted">Booking not found.</p>

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <PageHeader
        title="Booking details"
        description={`#${booking.bookingNumber}`}
        action={<Badge status={booking.status} />}
      />

      {success && (
        <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Booking confirmed successfully.
        </div>
      )}

      {error && <div className="mb-6"><ErrorAlert message={error} /></div>}

      <Card className="mb-6 space-y-3">
        <Row label="Movie" value={booking.show?.movie?.title} />
        <Row label="Showtime" value={formatDateTime(booking.show?.startTime)} />
        <Row label="Theatre" value={booking.show?.screen?.theater?.name} />
        <Row label="Screen" value={booking.show?.screen?.name} />
        <Row label="Booked on" value={formatDateTime(booking.bookingTime)} />
        <Row label="Amount" value={formatCurrency(booking.totalAmount)} bold />
        {booking.payment && (
          <>
            <Row label="Payment" value={booking.payment.paymentMethod} />
            <Row label="Transaction" value={booking.payment.transactionId} />
          </>
        )}
      </Card>

      {booking.seats?.length > 0 && (
        <Card className="mb-6">
          <h3 className="mb-4 text-sm font-semibold text-navy">Your seats</h3>
          <SeatGrid
            seats={booking.seats}
            selectedIds={booking.seats.map((s) => s.id)}
            onToggle={() => {}}
            readOnly
          />
        </Card>
      )}

      {(booking.status === 'CONFIRMED' || booking.status === 'PENDING') && (
        <Button variant="danger" loading={cancelling} onClick={handleCancel}>
          Cancel booking
        </Button>
      )}
    </div>
  )
}

function Row({ label, value, bold }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-slate-muted">{label}</span>
      <span className={bold ? 'font-semibold text-navy' : 'text-charcoal'}>
        {value || '—'}
      </span>
    </div>
  )
}
