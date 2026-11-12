import { useEffect, useState } from 'react'
import { bookingService } from '../api/bookingService'
import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/layout/PageHeader'
import BookingCard from '../components/booking/BookingCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorAlert from '../components/common/ErrorAlert'
import EmptyState from '../components/common/EmptyState'
import Button from '../components/ui/Button'
import { Link } from 'react-router-dom'
import { getErrorMessage } from '../utils/formatters'

export default function BookingHistory() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancellingId, setCancellingId] = useState(null)

  const loadBookings = () => {
    setLoading(true)
    bookingService
      .getByUser(user.id)
      .then((res) => setBookings(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadBookings()
  }, [user.id])

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Cancel this booking?')) return
    setCancellingId(bookingId)
    try {
      await bookingService.cancel(bookingId)
      loadBookings()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setCancellingId(null)
    }
  }

  if (loading) return <LoadingSpinner fullPage />

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <PageHeader
        title="Booking history"
        description="View and manage your past and upcoming bookings."
      />

      {error && <div className="mb-6"><ErrorAlert message={error} onDismiss={() => setError('')} /></div>}

      {bookings.length === 0 ? (
        <EmptyState
          title="No bookings yet"
          description="Book your first movie ticket to see it here."
          action={
            <Link to="/movies">
              <Button size="sm">Browse movies</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onCancel={handleCancel}
              cancelling={cancellingId === booking.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}
