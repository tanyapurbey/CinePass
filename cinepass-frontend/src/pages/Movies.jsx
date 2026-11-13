import { useEffect, useState } from 'react'
import { FiSearch, FiFilm, FiX } from 'react-icons/fi'
import { movieService } from '../api/movieService'
import PageHeader from '../components/layout/PageHeader'
import MovieCard from '../components/movies/MovieCard'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorAlert from '../components/common/ErrorAlert'
import EmptyState from '../components/common/EmptyState'
import Button from '../components/ui/Button'
import { isNowShowing, isUpcoming, getErrorMessage } from '../utils/formatters'

export default function Movies() {
  const [movies, setMovies] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('all')
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    movieService
      .getAll()
      .then((res) => {
        setMovies(res.data)
        setFiltered(res.data)
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let result = movies
    if (tab === 'now') result = movies.filter((m) => isNowShowing(m.releaseDate))
    if (tab === 'upcoming') result = movies.filter((m) => isUpcoming(m.releaseDate))
    setFiltered(result)
  }, [tab, movies])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!search.trim()) {
      setFiltered(movies)
      return
    }
    setSearching(true)
    setError('')
    try {
      const { data } = await movieService.search(search.trim())
      setFiltered(data)
      setTab('all')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSearching(false)
    }
  }

  const clearSearch = () => {
    setSearch('')
    setFiltered(movies)
  }

  if (loading) return <LoadingSpinner fullPage />

  const tabs = [
    { id: 'all', label: 'All Releases' },
    { id: 'now', label: 'Now Showing' },
    { id: 'upcoming', label: 'Upcoming' },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <PageHeader
        title="Movies & Releases"
        description="Search across genres and languages, explore showtimes, and book tickets."
      />

      {error && <div className="mb-6"><ErrorAlert message={error} onDismiss={() => setError('')} /></div>}

      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <form onSubmit={handleSearch} className="flex flex-1 max-w-lg gap-2">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary-text" size={17} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search movie by title, genre..."
              className="w-full rounded-xl border border-border bg-card-bg py-2.5 pl-10 pr-9 text-sm text-primary-text placeholder:text-secondary-text/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-2xs"
            />
            {search && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-text hover:text-primary-text"
              >
                <FiX size={15} />
              </button>
            )}
          </div>
          <Button type="submit" size="md" loading={searching} className="shrink-0 shadow-xs">
            Search
          </Button>
        </form>

        {/* Tab Filters */}
        <div className="inline-flex rounded-xl border border-border bg-card-bg p-1 shadow-2xs">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-lg px-4 py-2 text-xs font-bold transition-all duration-150 ${
                tab === t.id
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-secondary-text hover:text-primary-text'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Movies Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={FiFilm}
          title="No movies found"
          description="Try modifying your search query or switch between Now Showing and Upcoming tabs."
          action={
            search && (
              <Button variant="secondary" size="sm" onClick={clearSearch}>
                Clear Search Filter
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              badge={
                isUpcoming(movie.releaseDate)
                  ? 'Upcoming'
                  : isNowShowing(movie.releaseDate)
                    ? 'Now'
                    : null
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}
