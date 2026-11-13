import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FiCheckCircle, FiClock, FiCreditCard, FiArrowLeft, FiShield } from 'react-icons/fi'
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
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-base text-secondary-text">No active booking session found.</p>
        <Button className="mt-5" onClick={() => navigate('/movies')}>
          Browse Movies Catalog
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
    setError('Your 5-minute seat lock duration has expired. Please select seats again.')
    if (booking) {
      bookingService.cancel(booking.id).catch(() => {

      })
    }
  }

  const handleBack = async () => {
    if (step !== 'payment') {
      navigate(-1)
      return
    }
    if (booking && !expired) {
      try {
        await bookingService.cancel(booking.id)
      } catch {

      }
    }
    setBooking(null)
    setLockedAt(null)
    setExpired(false)
    setStep('review')
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex items-center justify-center gap-2 text-xs font-bold text-secondary-text">
        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${step === 'review' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-700'}`}>
          1. Review
        </span>
        <span>→</span>
        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${step === 'payment' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-700'}`}>
          2. Payment
        </span>
      </div>

      <PageHeader
        title={step === 'review' ? 'Order Summary' : 'Complete Payment'}
        description={step === 'review' ? 'Review selected screening & seats before locking' : '5-minute lock in progress. Finalize transaction'}
        action={
          step === 'payment' && lockedAt ? (
            <LockTimer lockedAt={lockedAt} onExpire={handleExpire} />
          ) : null
        }
      />

      {error && <div className="mb-4"><ErrorAlert message={error} onDismiss={() => setError('')} /></div>}

      <Card className="space-y-3.5 shadow-sm border-slate-300">
        <div className="flex items-center justify-between border-b border-border/80 pb-3">
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-secondary-text">Screening Details</span>
          <span className="rounded-md bg-rose-50 px-2 py-0.5 text-xs font-bold text-primary">CinePass Ticket</span>
        </div>

        <Row label="Movie" value={show?.movie?.title} bold />
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
          highlight
        />

        <div className="border-t border-border/80 pt-3">
          <div className="flex justify-between items-center text-base">
            <span className="font-bold text-primary-text">Total Payable</span>
            <span className="font-heading text-2xl font-extrabold text-primary">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </Card>

      {step === 'payment' && (
        <Card className="space-y-4 shadow-sm border-slate-300">
          <div className="flex items-center gap-2 border-b border-border/80 pb-3">
            <FiCreditCard className="text-primary" size={17} />
            <h3 className="font-heading text-sm font-bold text-primary-text">Select Payment Method</h3>
          </div>

          <Select
            label="Payment Provider"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            disabled={expired}
          >
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                💳 {m.replace('_', ' ')}
              </option>
            ))}
          </Select>

          {booking && !expired && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-xs font-medium text-amber-900 flex items-start gap-2">
              <FiShield className="shrink-0 mt-0.5 text-amber-600" size={14} />
              <span>
                Seats held under Booking <strong>#{booking.bookingNumber}</strong>. Click "Confirm Payment" below to finalize.
              </span>
            </div>
          )}

          {expired && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-error">
              Booking #{booking?.bookingNumber} expired. Your held seats have been released back to other cinema guests.
            </div>
          )}
        </Card>
      )}

      <div className="flex gap-3 pt-2">
        <Button
          variant="secondary"
          size="lg"
          className="flex-1"
          onClick={handleBack}
        >
          <FiArrowLeft size={16} />
          {step === 'payment' ? 'Release & Back' : 'Cancel'}
        </Button>

        {step === 'review' ? (
          <Button
            size="lg"
            className="flex-1 shadow-md shadow-primary/20"
            loading={loading}
            onClick={handleLockSeats}
          >
            Lock Seats & Pay
          </Button>
        ) : expired ? (
          <Button
            size="lg"
            className="flex-1 shadow-md shadow-primary/20"
            onClick={() => navigate(`/shows/${showId}/seats`)}
          >
            Re-select Seats
          </Button>
        ) : (
          <Button
            size="lg"
            className="flex-1 shadow-md shadow-primary/20"
            loading={loading}
            onClick={handleConfirmPayment}
          >
            Confirm & Pay {formatCurrency(total)}
          </Button>
        )}
      </div>
    </div>
  )
}

function Row({ label, value, bold, highlight }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-secondary-text text-xs uppercase font-semibold tracking-wider">{label}</span>
      <span className={`${bold ? 'font-bold text-primary-text' : 'text-primary-text font-medium'} ${highlight ? 'rounded-md bg-rose-50 px-2 py-0.5 font-bold text-primary text-xs' : ''}`}>
        {value || '—'}
      </span>
    </div>
  )
}
