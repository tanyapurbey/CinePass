import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { showService } from '../api/showService'
import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/layout/PageHeader'
import SeatGrid from '../components/booking/SeatGrid'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorAlert from '../components/common/ErrorAlert'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { formatCurrency, formatDateTime, getErrorMessage } from '../utils/formatters'

export default function SeatSelection() {
  const { showId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [show, setShow] = useState(null)
  const [selectedIds, setSelectedIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    showService
      .getById(showId)
      .then((res) => setShow(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [showId])

  const toggleSeat = (seatId) => {
    setSelectedIds((prev) =>
      prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId]
    )
  }

  const seats = show?.availableSeats || []
  const total = seats
    .filter((s) => selectedIds.includes(s.id))
    .reduce((sum, s) => sum + (s.price || 0), 0)

  const handleContinue = () => {
    if (selectedIds.length === 0) {
      setError('Please select at least one seat.')
      return
    }
    navigate(`/bookings/checkout`, {
      state: {
        showId: Number(showId),
        seatIds: selectedIds,
        show,
        total,
        userId: user.id,
      },
    })
  }

  if (loading) return <LoadingSpinner fullPage />

  const movie = show?.movie
  const theater = show?.screen?.theater

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <PageHeader
        title="Select seats"
        description={movie?.title}
        action={
          <Link to={`/movies/${movie?.id}`}>
            <Button variant="secondary" size="sm">
              Back to movie
            </Button>
          </Link>
        }
      />

      {error && <div className="mb-6"><ErrorAlert message={error} onDismiss={() => setError('')} /></div>}

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Info label="Showtime" value={formatDateTime(show?.startTime)} />
        <Info label="Theatre" value={theater?.name} />
        <Info label="Screen" value={show?.screen?.name} />
      </div>

      <Card className="mb-6">
        <SeatGrid
          seats={seats}
          selectedIds={selectedIds}
          onToggle={toggleSeat}
        />
      </Card>

      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs text-slate-muted">Selected seats</p>
            <p className="text-sm font-medium text-navy">
              {selectedIds.length === 0
                ? 'None'
                : seats
                    .filter((s) => selectedIds.includes(s.id))
                    .map((s) => s.seat?.seatNumber)
                    .join(', ')}
            </p>
            <p className="mt-1 text-lg font-semibold text-navy">
              {formatCurrency(total)}
            </p>
          </div>
          <Button onClick={handleContinue} disabled={selectedIds.length === 0}>
            Continue to payment
          </Button>
        </div>
      </Card>
    </div>
  )
}

function Info({ label, value }) {
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2">
      <p className="text-xs text-slate-muted">{label}</p>
      <p className="text-sm font-medium text-navy">{value || '—'}</p>
    </div>
  )
}
