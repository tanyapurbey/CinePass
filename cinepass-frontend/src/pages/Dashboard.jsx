import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiCalendar, FiFilm } from 'react-icons/fi'
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <PageHeader
        title={`Welcome back`}
        description="Browse movies, book tickets, and manage your reservations."
        action={
          <Link to="/movies">
            <Button>
              Browse Movies
              <FiArrowRight size={14} />
            </Button>
          </Link>
        }
      />

      {error && <div className="mb-6"><ErrorAlert message={error} /></div>}

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard icon={FiFilm} label="Now Showing" value={nowShowing.length} />
        <StatCard icon={FiCalendar} label="Upcoming" value={upcoming.length} />
        <StatCard icon={FiCalendar} label="Your Bookings" value={bookings.length} />
      </div>

      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-navy">Now Showing</h2>
          <Link to="/movies" className="text-xs font-medium text-accent hover:text-accent-hover">
            View all
          </Link>
        </div>
        {nowShowing.length === 0 ? (
          <p className="text-sm text-slate-muted">No movies currently showing.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {nowShowing.slice(0, 5).map((movie) => (
              <MovieCard key={movie.id} movie={movie} badge="Now" />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-navy">Recent Bookings</h2>
          <Link to="/bookings" className="text-xs font-medium text-accent hover:text-accent-hover">
            View all
          </Link>
        </div>
        {bookings.length === 0 ? (
          <Card>
            <p className="text-sm text-slate-muted">No bookings yet.</p>
            <Link to="/movies" className="mt-3 inline-block">
              <Button size="sm">Book a ticket</Button>
            </Link>
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

function StatCard({ icon: Icon, label, value }) {
  return (
    <Card>
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-indigo-50">
          <Icon className="text-accent" size={16} />
        </div>
        <div>
          <p className="text-xs text-slate-muted">{label}</p>
          <p className="text-lg font-semibold text-navy">{value}</p>
        </div>
      </div>
    </Card>
  )
}
