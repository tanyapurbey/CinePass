import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { bookingService } from '../api/bookingService'
import PageHeader from '../components/layout/PageHeader'
import ErrorAlert from '../components/common/ErrorAlert'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Select from '../components/ui/Select'
import LockTimer from '../components/booking/LockTimer'
import { PAYMENT_METHODS } from '../utils/constants'
import { formatCurrency, formatDateTime, getErrorMessage } from '../utils/formatters'

export default function BookingFlow() {
  const location = useLocation()
  const navigate = useNavigate()
  const bookingState = location.state

  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0])
  const [step, setStep] = useState('review')
  const [booking, setBooking] = useState(null)
  const [lockedAt, setLockedAt] = useState(null)
  const [expired, setExpired] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!bookingState) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-sm text-slate-muted">No booking in progress.</p>
        <Button className="mt-4" onClick={() => navigate('/movies')}>
          Browse movies
        </Button>
      </div>
    )
  }

  const { showId, seatIds, show, total, userId } = bookingState

  const handleLockSeats = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await bookingService.lockSeats({
        userId,
        showId,
        seatIds,
      })
      setBooking(data)
      setLockedAt(Date.now())
      setExpired(false)
      setStep('payment')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmPayment = async () => {
    if (expired) return
    setLoading(true)
    setError('')
    try {
      const { data } = await bookingService.confirmPayment(
        booking.id,
        paymentMethod
      )
      navigate(`/bookings/${data.id}`, { state: { success: true } })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleExpire = () => {
    setExpired(true)
    setError('Your seat lock has expired. Please select seats again.')
    if (booking) {
      bookingService.cancel(booking.id).catch(() => {
        // best-effort release; the backend's own scheduler will reclaim the
        // seats within a minute even if this call fails
      })
    }
  }

  const handleBack = async () => {
    if (step !== 'payment') {
      navigate(-1)
      return
    }
    // The seats are LOCKED against this PENDING booking on the backend. Release
    // them via the existing cancel endpoint so they're AVAILABLE again instead of
    // staying held until the 5-minute scheduler sweeps them.
    if (booking && !expired) {
      try {
        await bookingService.cancel(booking.id)
      } catch {
        // best-effort release; the scheduler will reclaim the seats anyway
      }
    }
    setBooking(null)
    setLockedAt(null)
    setExpired(false)
    setStep('review')
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
      <PageHeader
        title={step === 'review' ? 'Review booking' : 'Complete payment'}
        description="Seats are locked for 5 minutes once you proceed."
        action={
          step === 'payment' && lockedAt ? (
            <LockTimer lockedAt={lockedAt} onExpire={handleExpire} />
          ) : null
        }
      />

      {error && <div className="mb-6"><ErrorAlert message={error} onDismiss={() => setError('')} /></div>}

      <Card className="mb-6 space-y-3">
        <Row label="Movie" value={show?.movie?.title} />
        <Row label="Showtime" value={formatDateTime(show?.startTime)} />
        <Row label="Theatre" value={show?.screen?.theater?.name} />
        <Row label="Screen" value={show?.screen?.name} />
        <Row
          label="Seats"
          value={
            show?.availableSeats
              ?.filter((s) => seatIds.includes(s.id))
              .map((s) => s.seat?.seatNumber)
              .join(', ') || '—'
          }
        />
        <div className="border-t border-border pt-3">
          <Row label="Total" value={formatCurrency(total)} bold />
        </div>
      </Card>

      {step === 'payment' && (
        <Card className="mb-6">
          <Select
            label="Payment method"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            disabled={expired}
          >
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m.replace('_', ' ')}
              </option>
            ))}
          </Select>
          {booking && !expired && (
            <p className="mt-3 text-xs text-amber-700">
              Booking #{booking.bookingNumber} — seats locked. Complete payment to confirm.
            </p>
          )}
          {expired && (
            <p className="mt-3 text-xs text-red-700">
              Booking #{booking?.bookingNumber} — your held seats were released. Go back and select seats again.
            </p>
          )}
        </Card>
      )}

      <div className="flex gap-3">
        <Button
          variant="secondary"
          className="flex-1"
          onClick={handleBack}
        >
          {step === 'payment' ? 'Back' : 'Cancel'}
        </Button>
        {step === 'review' ? (
          <Button className="flex-1" loading={loading} onClick={handleLockSeats}>
            Lock seats & continue
          </Button>
        ) : expired ? (
          <Button
            className="flex-1"
            onClick={() => navigate(`/shows/${showId}/seats`)}
          >
            Select seats again
          </Button>
        ) : (
          <Button className="flex-1" loading={loading} onClick={handleConfirmPayment}>
            Confirm payment
          </Button>
        )}
      </div>
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
