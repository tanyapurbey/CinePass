import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiCalendar, FiFilm, FiMapPin, FiUsers, FiClipboard } from 'react-icons/fi'
import { movieService } from '../../api/movieService'
import { theaterService } from '../../api/theaterService'
import { showService } from '../../api/showService'
import { userService } from '../../api/userService'
import { bookingService } from '../../api/bookingService'
import PageHeader from '../../components/layout/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorAlert from '../../components/common/ErrorAlert'
import Badge from '../../components/ui/Badge'
import { formatCurrency, formatDateTime, getErrorMessage } from '../../utils/formatters'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    movies: 0,
    theaters: 0,
    shows: 0,
    users: 0,
    bookings: 0,
  })
  const [recentBookings, setRecentBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [movies, theaters, shows, users] = await Promise.all([
          movieService.getAll(),
          theaterService.getAll(),
          showService.getAll(),
          userService.getAll(),
        ])

        const allBookings = []
        for (const u of users.data) {
          try {
            const { data } = await bookingService.getByUser(u.id)
            allBookings.push(...data)
          } catch {
            // skip users with no access
          }
        }

        allBookings.sort(
          (a, b) => new Date(b.bookingTime) - new Date(a.bookingTime)
        )

        setStats({
          movies: movies.data.length,
          theaters: theaters.data.length,
          shows: shows.data.length,
          users: users.data.length,
          bookings: allBookings.length,
        })
        setRecentBookings(allBookings.slice(0, 5))
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <LoadingSpinner fullPage />

  const statCards = [
    { label: 'Movies', value: stats.movies, icon: FiFilm, to: '/admin/movies' },
    { label: 'Theatres', value: stats.theaters, icon: FiMapPin, to: '/admin/theaters' },
    { label: 'Shows', value: stats.shows, icon: FiCalendar, to: '/admin/shows' },
    { label: 'Users', value: stats.users, icon: FiUsers, to: '/admin/users' },
    { label: 'Bookings', value: stats.bookings, icon: FiClipboard, to: '/admin/bookings' },
  ]

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your CinePass platform."
        action={
          <Link to="/admin/movies">
            <Button size="sm">Add Movie</Button>
          </Link>
        }
      />

      {error && <div className="mb-6"><ErrorAlert message={error} /></div>}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((stat) => (
          <Link key={stat.label} to={stat.to}>
            <Card className="transition-shadow hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-50">
                  <stat.icon className="text-accent" size={14} />
                </div>
                <div>
                  <p className="text-xs text-slate-muted">{stat.label}</p>
                  <p className="text-lg font-semibold text-navy">{stat.value}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-navy">Recent bookings</h2>
          <Link to="/admin/bookings" className="text-xs font-medium text-accent">
            View all
          </Link>
        </div>
        {recentBookings.length === 0 ? (
          <p className="text-sm text-slate-muted">No bookings yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-slate-muted">
                  <th className="pb-2 pr-4 font-medium">Booking</th>
                  <th className="pb-2 pr-4 font-medium">Movie</th>
                  <th className="pb-2 pr-4 font-medium">User</th>
                  <th className="pb-2 pr-4 font-medium">Amount</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b) => (
                  <tr key={b.id} className="border-b border-border last:border-0">
                    <td className="py-2.5 pr-4">
                      <p className="font-medium text-charcoal">{b.bookingNumber}</p>
                      <p className="text-xs text-slate-muted">
                        {formatDateTime(b.bookingTime)}
                      </p>
                    </td>
                    <td className="py-2.5 pr-4 text-charcoal">
                      {b.show?.movie?.title || '—'}
                    </td>
                    <td className="py-2.5 pr-4 text-charcoal">
                      {b.user?.email || '—'}
                    </td>
                    <td className="py-2.5 pr-4 text-charcoal">
                      {formatCurrency(b.totalAmount)}
                    </td>
                    <td className="py-2.5">
                      <Badge status={b.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
