import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { FiArrowRight, FiArrowLeft, FiClock, FiMapPin, FiFilm } from 'react-icons/fi'
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
      setError('Please select at least one seat to proceed.')
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
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <PageHeader
        title="Choose Seats"
        description={movie?.title || 'Screening'}
        action={
          <Link to={`/movies/${movie?.id}`}>
            <Button variant="secondary" size="sm">
              <FiArrowLeft size={14} /> Back to Movie
            </Button>
          </Link>
        }
      />

      {error && <div className="mb-4"><ErrorAlert message={error} onDismiss={() => setError('')} /></div>}

      {/* Show Info Badges */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Info icon={FiClock} label="Showtime" value={formatDateTime(show?.startTime)} />
        <Info icon={FiMapPin} label="Theatre" value={theater?.name} />
        <Info icon={FiFilm} label="Screen" value={show?.screen?.name} />
      </div>

      {/* Main Seat Grid Card */}
      <Card className="py-8 shadow-md">
        <SeatGrid
          seats={seats}
          selectedIds={selectedIds}
          onToggle={toggleSeat}
        />
      </Card>

      {/* Checkout Bar */}
      <Card className="border-slate-300 shadow-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-secondary-text">Selected Seats ({selectedIds.length})</p>
            <p className="font-heading text-sm font-bold text-primary-text mt-0.5">
              {selectedIds.length === 0
                ? <span className="text-secondary-text font-normal">None selected yet</span>
                : seats
                    .filter((s) => selectedIds.includes(s.id))
                    .map((s) => s.seat?.seatNumber)
                    .join(', ')}
            </p>
            <p className="mt-1 font-heading text-2xl font-extrabold text-primary">
              {formatCurrency(total)}
            </p>
          </div>
          <Button
            size="lg"
            onClick={handleContinue}
            disabled={selectedIds.length === 0}
            className="shadow-md shadow-primary/20"
          >
            Lock Seats & Checkout
            <FiArrowRight size={17} />
          </Button>
        </div>
      </Card>
    </div>
  )
}

function Info({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card-bg px-4 py-3 shadow-2xs">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-primary">
        <Icon size={15} />
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-secondary-text">{label}</p>
        <p className="font-heading text-sm font-bold text-primary-text line-clamp-1">{value || '—'}</p>
      </div>
    </div>
  )
}
