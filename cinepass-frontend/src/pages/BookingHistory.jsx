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
import { FiBookmark, FiPlus } from 'react-icons/fi'
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
    if (!window.confirm('Are you sure you want to cancel this booking? Held seats will be released.')) return
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
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <PageHeader
        title="My Reservations"
        description="Inspect and manage your active and past cinema ticket bookings."
        action={
          <Link to="/movies">
            <Button size="sm">
              <FiPlus size={15} /> Book Another Show
            </Button>
          </Link>
        }
      />

      {error && <div className="mb-6"><ErrorAlert message={error} onDismiss={() => setError('')} /></div>}

      {bookings.length === 0 ? (
        <EmptyState
          icon={FiBookmark}
          title="No reservations found"
          description="You haven't reserved any cinema seats yet. Browse now-showing releases to get started."
          action={
            <Link to="/movies">
              <Button size="md">Browse Movies</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
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
