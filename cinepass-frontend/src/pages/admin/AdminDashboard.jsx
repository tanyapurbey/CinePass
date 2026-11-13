import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiCalendar, FiFilm, FiMapPin, FiUsers, FiClipboard, FiPlus, FiArrowRight } from 'react-icons/fi'
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
    { label: 'Movies Catalog', value: stats.movies, icon: FiFilm, to: '/admin/movies' },
    { label: 'Theatres', value: stats.theaters, icon: FiMapPin, to: '/admin/theaters' },
    { label: 'Scheduled Shows', value: stats.shows, icon: FiCalendar, to: '/admin/shows' },
    { label: 'User Accounts', value: stats.users, icon: FiUsers, to: '/admin/users' },
    { label: 'Total Bookings', value: stats.bookings, icon: FiClipboard, to: '/admin/bookings' },
  ]

  return (
    <div className="space-y-8">
      <PageHeader
        title="Admin Control Center"
        description="Monitor cinema operations, active bookings, schedules, and catalogue."
        action={
          <Link to="/admin/movies">
            <Button size="sm" className="shadow-xs">
              <FiPlus size={15} /> Add Movie
            </Button>
          </Link>
        }
      />

      {error && <div className="mb-6"><ErrorAlert message={error} /></div>}

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((stat) => (
          <Link key={stat.label} to={stat.to} className="group block">
            <Card className="hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-primary shadow-2xs group-hover:bg-primary group-hover:text-white transition-colors">
                  <stat.icon size={19} />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-secondary-text">{stat.label}</p>
                  <p className="font-heading text-xl font-extrabold text-primary-text">{stat.value}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Bookings Table */}
      <Card className="p-0 overflow-hidden shadow-sm">
        <div className="flex items-center justify-between border-b border-border/80 px-6 py-4.5 bg-slate-50/50">
          <div>
            <h2 className="font-heading text-base font-bold text-primary-text">Recent Transactions</h2>
            <p className="text-xs text-secondary-text">Live reservation audit trail</p>
          </div>
          <Link to="/admin/bookings" className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1">
            View All <FiArrowRight size={13} />
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <div className="p-8 text-center text-sm text-secondary-text">No bookings recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-secondary-text">
                  <th className="py-3 px-6">Booking Reference</th>
                  <th className="py-3 px-4">Movie</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {recentBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-6">
                      <p className="font-mono text-xs font-bold text-primary-text">#{b.bookingNumber}</p>
                      <p className="text-[11px] text-secondary-text mt-0.5">
                        {formatDateTime(b.bookingTime)}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-primary-text">
                      {b.show?.movie?.title || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-secondary-text">
                      {b.user?.email || '—'}
                    </td>
                    <td className="py-3.5 px-4 font-heading font-extrabold text-primary">
                      {formatCurrency(b.totalAmount)}
                    </td>
                    <td className="py-3.5 px-6 text-right">
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
