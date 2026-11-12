import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FiClock, FiMapPin } from 'react-icons/fi'
import { movieService } from '../api/movieService'
import { showService } from '../api/showService'
import { theaterService } from '../api/theaterService'
import PageHeader from '../components/layout/PageHeader'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorAlert from '../components/common/ErrorAlert'
import EmptyState from '../components/common/EmptyState'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Select from '../components/ui/Select'
import { formatDate, formatDateTime, getErrorMessage } from '../utils/formatters'

export default function MovieDetails() {
  const { id } = useParams()
  const [movie, setMovie] = useState(null)
  const [shows, setShows] = useState([])
  const [cities, setCities] = useState([])
  const [selectedCity, setSelectedCity] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [movieRes, showsRes, theatersRes] = await Promise.all([
          movieService.getById(id),
          showService.getByMovie(id),
          theaterService.getAll(),
        ])
        setMovie(movieRes.data)
        setShows(showsRes.data)
        const uniqueCities = [
          ...new Set(theatersRes.data.map((t) => t.city).filter(Boolean)),
        ]
        setCities(uniqueCities)
        if (uniqueCities.length) setSelectedCity(uniqueCities[0])
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  useEffect(() => {
    if (!selectedCity) return
    showService
      .getByMovieAndCity(id, selectedCity)
      .then((res) => setShows(res.data))
      .catch((err) => setError(getErrorMessage(err)))
  }, [selectedCity, id])

  if (loading) return <LoadingSpinner fullPage />
  if (!movie) return <EmptyState title="Movie not found" />

  const groupedShows = shows.reduce((acc, show) => {
    const theaterName = show.screen?.theater?.name || 'Unknown Theatre'
    if (!acc[theaterName]) acc[theaterName] = []
    acc[theaterName].push(show)
    return acc
  }, {})

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {error && <div className="mb-6"><ErrorAlert message={error} onDismiss={() => setError('')} /></div>}

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <div className="mx-auto w-full max-w-[200px] lg:max-w-none">
          <div className="aspect-[2/3] overflow-hidden rounded-lg border border-border bg-off-white">
            {movie.posterUrl ? (
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-muted">
                No poster
              </div>
            )}
          </div>
        </div>

        <div>
          <PageHeader title={movie.title} />
          <div className="mb-6 flex flex-wrap gap-3 text-sm text-slate-muted">
            {movie.genre && <span>{movie.genre}</span>}
            {movie.language && <span>· {movie.language}</span>}
            {movie.durationMins && (
              <span className="flex items-center gap-1">
                · <FiClock size={14} /> {movie.durationMins} min
              </span>
            )}
            {movie.releaseDate && <span>· {formatDate(movie.releaseDate)}</span>}
          </div>
          {movie.description && (
            <p className="mb-8 text-sm leading-relaxed text-charcoal">
              {movie.description}
            </p>
          )}

          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-semibold text-navy">Select a show</h2>
            {cities.length > 0 && (
              <Select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full sm:w-48"
              >
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </Select>
            )}
          </div>

          {shows.length === 0 ? (
            <EmptyState
              title="No shows available"
              description="No showtimes found for this movie in the selected city."
            />
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedShows).map(([theater, theaterShows]) => (
                <Card key={theater}>
                  <div className="mb-3 flex items-center gap-2">
                    <FiMapPin className="text-accent" size={14} />
                    <h3 className="text-sm font-semibold text-navy">{theater}</h3>
                    <span className="text-xs text-slate-muted">
                      {theaterShows[0]?.screen?.name}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {theaterShows.map((show) => (
                      <Link key={show.id} to={`/shows/${show.id}/seats`}>
                        <Button variant="secondary" size="sm">
                          {formatDateTime(show.startTime)}
                        </Button>
                      </Link>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
