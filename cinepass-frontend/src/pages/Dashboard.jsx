import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiCalendar, FiFilm, FiBookmark, FiPlus } from 'react-icons/fi'
import { movieService } from '../api/movieService'
import { bookingService } from '../api/bookingService'
import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/layout/PageHeader'
import MovieCard from '../components/movies/MovieCard'
import BookingCard from '../components/booking/BookingCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorAlert from '../components/common/ErrorAlert'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { isNowShowing, isUpcoming, getErrorMessage } from '../utils/formatters'

export default function Dashboard() {
  const { user } = useAuth()
  const [movies, setMovies] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [moviesRes, bookingsRes] = await Promise.all([
          movieService.getAll(),
          bookingService.getByUser(user.id),
        ])
        setMovies(moviesRes.data)
        setBookings(bookingsRes.data.slice(0, 3))
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user.id])

  if (loading) return <LoadingSpinner fullPage />

  const nowShowing = movies.filter((m) => isNowShowing(m.releaseDate))
  const upcoming = movies.filter((m) => isUpcoming(m.releaseDate))

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      <PageHeader
        title="Dashboard"
        description="Explore currently running blockbusters and manage your seat bookings."
        action={
          <Link to="/movies">
            <Button size="md" className="shadow-xs">
              <FiPlus size={16} />
              Browse Shows
            </Button>
          </Link>
        }
      />

      {error && <div className="mb-6"><ErrorAlert message={error} /></div>}

      {/* Metrics Section */}
      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard
          icon={FiFilm}
          label="Now Showing"
          value={nowShowing.length}
          subtext="In active theatres"
        />
        <StatCard
          icon={FiCalendar}
          label="Upcoming Releases"
          value={upcoming.length}
          subtext="Scheduled premieres"
        />
        <StatCard
          icon={FiBookmark}
          label="Your Bookings"
          value={bookings.length}
          subtext="Confirmed & active"
        />
      </div>

      {/* Now Showing Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-border/80 pb-3">
          <div>
            <h2 className="font-heading text-lg font-bold text-primary-text">Now Showing</h2>
            <p className="text-xs text-secondary-text">Grab your seats for today's hottest films</p>
          </div>
          <Link to="/movies" className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1">
            View All <FiArrowRight size={13} />
          </Link>
        </div>

        {nowShowing.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card-bg/40 p-8 text-center text-sm text-secondary-text">
            No movies currently showing.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {nowShowing.slice(0, 5).map((movie) => (
              <MovieCard key={movie.id} movie={movie} badge="Now" />
            ))}
          </div>
        )}
      </section>

      {/* Recent Bookings Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-border/80 pb-3">
          <div>
            <h2 className="font-heading text-lg font-bold text-primary-text">Recent Reservations</h2>
            <p className="text-xs text-secondary-text">Your latest movie ticket purchases</p>
          </div>
          <Link to="/bookings" className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1">
            View All Bookings <FiArrowRight size={13} />
          </Link>
        </div>

        {bookings.length === 0 ? (
          <Card className="text-center py-10">
            <p className="text-sm text-secondary-text">You haven't booked any movie tickets yet.</p>
            <div className="mt-4">
              <Link to="/movies">
                <Button size="sm">Book Your First Ticket</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, subtext }) {
  return (
    <Card className="flex items-center gap-4 hover:border-slate-300 transition-colors">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-primary shadow-2xs">
        <Icon size={22} />
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-secondary-text">{label}</p>
        <p className="font-heading text-2xl font-black text-primary-text mt-0.5">{value}</p>
        {subtext && <p className="text-[11px] text-secondary-text/80">{subtext}</p>}
      </div>
    </Card>
  )
}
