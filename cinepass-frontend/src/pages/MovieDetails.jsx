import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FiClock, FiMapPin, FiCalendar, FiArrowLeft, FiFilm } from 'react-icons/fi'
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <Link to="/movies" className="inline-flex items-center gap-1.5 text-xs font-bold text-secondary-text hover:text-primary transition-colors">
        <FiArrowLeft size={14} /> Back to Movies Catalog
      </Link>

      {error && <div className="mb-6"><ErrorAlert message={error} onDismiss={() => setError('')} /></div>}

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <div className="mx-auto w-full max-w-[260px] lg:max-w-none">
          <div className="aspect-[2/3] overflow-hidden rounded-2xl border border-border bg-slate-900 shadow-xl shadow-slate-900/10">
            {movie.posterUrl ? (
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-500">
                <FiFilm size={36} />
                <span className="text-xs font-medium">No Poster Available</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="font-heading text-3xl font-extrabold text-primary-text sm:text-4xl">
              {movie.title}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold">
              {movie.genre && (
                <span className="rounded-lg bg-slate-100 px-3 py-1 text-slate-700">
                  {movie.genre}
                </span>
              )}
              {movie.language && (
                <span className="rounded-lg bg-rose-50 px-3 py-1 font-bold text-primary">
                  {movie.language}
                </span>
              )}
              {movie.durationMins && (
                <span className="flex items-center gap-1.5 rounded-lg border border-border bg-card-bg px-3 py-1 text-secondary-text">
                  <FiClock size={13} className="text-primary" /> {movie.durationMins} min
                </span>
              )}
              {movie.releaseDate && (
                <span className="flex items-center gap-1.5 rounded-lg border border-border bg-card-bg px-3 py-1 text-secondary-text">
                  <FiCalendar size={13} /> {formatDate(movie.releaseDate)}
                </span>
              )}
            </div>
          </div>

          {movie.description && (
            <p className="text-sm font-normal leading-relaxed text-secondary-text">
              {movie.description}
            </p>
          )}

          <div className="border-t border-border/80 pt-6 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-heading text-lg font-bold text-primary-text">Available Theatres & Showtimes</h2>
                <p className="text-xs text-secondary-text">Select your preferred slot to pick seats</p>
              </div>

              {cities.length > 0 && (
                <div className="w-full sm:w-52">
                  <Select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                  >
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        📍 {city}
                      </option>
                    ))}
                  </Select>
                </div>
              )}
            </div>

            {shows.length === 0 ? (
              <EmptyState
                icon={FiCalendar}
                title="No showtimes found"
                description="There are currently no scheduled screenings in the chosen city."
              />
            ) : (
              <div className="space-y-4 pt-2">
                {Object.entries(groupedShows).map(([theater, theaterShows]) => (
                  <Card key={theater} className="space-y-3.5 hover:border-slate-300 transition-colors">
                    <div className="flex items-center justify-between border-b border-border/60 pb-3">
                      <div className="flex items-center gap-2">
                        <FiMapPin className="text-primary" size={16} />
                        <h3 className="font-heading text-base font-bold text-primary-text">{theater}</h3>
                      </div>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                        {theaterShows[0]?.screen?.name || 'Screen 1'}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                      {theaterShows.map((show) => (
                        <Link key={show.id} to={`/shows/${show.id}/seats`}>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="hover:border-primary hover:text-primary transition-all font-semibold"
                          >
                            <FiClock size={12} className="text-primary" />
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
    </div>
  )
}
