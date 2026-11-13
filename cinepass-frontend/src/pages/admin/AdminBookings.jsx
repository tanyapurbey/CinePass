import { useEffect, useState } from 'react'
import { FiSearch, FiClipboard, FiX } from 'react-icons/fi'
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
    if (!window.confirm('Cancel this customer booking?')) return
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
    <div className="space-y-6">
      <PageHeader
        title="All System Bookings"
        description="Audit all customer reservations, filter by booking reference number, and manage cancellations."
      />

      {error && <div className="mb-6"><ErrorAlert message={error} onDismiss={() => setError('')} /></div>}

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex max-w-md gap-2">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary-text" size={16} />
          <input
            type="text"
            value={searchNumber}
            onChange={(e) => setSearchNumber(e.target.value)}
            placeholder="Search by booking reference #..."
            className="w-full rounded-xl border border-border bg-card-bg py-2.5 pl-10 pr-9 text-sm text-primary-text placeholder:text-secondary-text/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-2xs"
          />
          {searchNumber && (
            <button
              type="button"
              onClick={() => {
                setSearchNumber('')
                loadAllBookings()
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-text hover:text-primary-text"
            >
              <FiX size={15} />
            </button>
          )}
        </div>
        <Button type="submit" size="md" loading={searching} className="shrink-0 shadow-xs">
          Search
        </Button>
        <Button type="button" variant="secondary" size="md" onClick={loadAllBookings} className="shrink-0">
          Reset
        </Button>
      </form>

      {/* Bookings Table */}
      {bookings.length === 0 ? (
        <EmptyState
          icon={FiClipboard}
          title="No bookings found"
          description="There are currently no reservations matching your search criteria."
        />
      ) : (
        <Card padding={false} className="overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-secondary-text">
                  <th className="px-6 py-3.5">Booking Ref</th>
                  <th className="px-4 py-3.5">Customer Email</th>
                  <th className="px-4 py-3.5">Movie</th>
                  <th className="px-4 py-3.5">Showtime</th>
                  <th className="px-4 py-3.5">Total Amount</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3.5">
                      <p className="font-mono text-xs font-bold text-primary-text">#{b.bookingNumber}</p>
                      <p className="text-[11px] text-secondary-text mt-0.5">
                        {formatDateTime(b.bookingTime)}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 text-xs font-medium text-secondary-text">
                      {b.user?.email || '—'}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-primary-text">
                      {b.show?.movie?.title || '—'}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-secondary-text">
                      {formatDateTime(b.show?.startTime)}
                    </td>
                    <td className="px-4 py-3.5 font-heading font-extrabold text-primary">
                      {formatCurrency(b.totalAmount)}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge status={b.status} />
                    </td>
                    <td className="px-6 py-3.5 text-right">
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
