import { useEffect, useState } from 'react'
import { FiSearch } from 'react-icons/fi'
import { bookingService } from '../../api/bookingService'
import { userService } from '../../api/userService'
import PageHeader from '../../components/layout/PageHeader'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorAlert from '../../components/common/ErrorAlert'
import EmptyState from '../../components/common/EmptyState'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { formatCurrency, formatDateTime, getErrorMessage } from '../../utils/formatters'

export default function AdminBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchNumber, setSearchNumber] = useState('')
  const [searching, setSearching] = useState(false)
  const [cancellingId, setCancellingId] = useState(null)

  const loadAllBookings = async () => {
    setLoading(true)
    setError('')
    try {
      const { data: users } = await userService.getAll()
      const allBookings = []
      for (const user of users) {
        try {
          const { data } = await bookingService.getByUser(user.id)
          allBookings.push(...data)
        } catch {
          // continue
        }
      }
      allBookings.sort(
        (a, b) => new Date(b.bookingTime) - new Date(a.bookingTime)
      )
      setBookings(allBookings)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAllBookings()
  }, [])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchNumber.trim()) {
      loadAllBookings()
      return
    }
    setSearching(true)
    setError('')
    try {
      const { data } = await bookingService.getByNumber(searchNumber.trim())
      setBookings([data])
    } catch (err) {
      setError(getErrorMessage(err))
      setBookings([])
    } finally {
      setSearching(false)
    }
  }

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Cancel this booking?')) return
    setCancellingId(bookingId)
    try {
      await bookingService.cancel(bookingId)
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'CANCELLED' } : b))
      )
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setCancellingId(null)
    }
  }

  if (loading) return <LoadingSpinner fullPage />

  return (
    <div>
      <PageHeader
        title="Bookings"
        description="View and search all platform bookings."
      />

      {error && <div className="mb-6"><ErrorAlert message={error} onDismiss={() => setError('')} /></div>}

      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-muted" size={16} />
          <input
            type="text"
            value={searchNumber}
            onChange={(e) => setSearchNumber(e.target.value)}
            placeholder="Search by booking number..."
            className="w-full rounded-md border border-border bg-surface py-2 pl-9 pr-3 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <Button type="submit" loading={searching}>Search</Button>
        <Button type="button" variant="secondary" onClick={loadAllBookings}>
          Reset
        </Button>
      </form>

      {bookings.length === 0 ? (
        <EmptyState title="No bookings found" description="Bookings will appear here once users start booking." />
      ) : (
        <Card padding={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-off-white text-xs text-slate-muted">
                  <th className="px-4 py-3 font-medium">Booking #</th>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Movie</th>
                  <th className="px-4 py-3 font-medium">Showtime</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium text-navy">{b.bookingNumber}</p>
                      <p className="text-xs text-slate-muted">
                        {formatDateTime(b.bookingTime)}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-charcoal">
                      {b.user?.email || '—'}
                    </td>
                    <td className="px-4 py-3 text-charcoal">
                      {b.show?.movie?.title || '—'}
                    </td>
                    <td className="px-4 py-3 text-charcoal">
                      {formatDateTime(b.show?.startTime)}
                    </td>
                    <td className="px-4 py-3 text-charcoal">
                      {formatCurrency(b.totalAmount)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={b.status} />
                    </td>
                    <td className="px-4 py-3">
                      {(b.status === 'CONFIRMED' || b.status === 'PENDING') && (
                        <Button
                          variant="danger"
                          size="sm"
                          loading={cancellingId === b.id}
                          onClick={() => handleCancel(b.id)}
                        >
                          Cancel
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
