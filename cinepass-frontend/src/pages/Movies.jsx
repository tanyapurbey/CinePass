import { useEffect, useState } from 'react'
import { FiSearch } from 'react-icons/fi'
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

  if (loading) return <LoadingSpinner fullPage />

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'now', label: 'Now Showing' },
    { id: 'upcoming', label: 'Upcoming' },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <PageHeader
        title="Movies"
        description="Search and browse current and upcoming releases."
      />

      {error && <div className="mb-6"><ErrorAlert message={error} onDismiss={() => setError('')} /></div>}

      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-muted" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title..."
            className="w-full rounded-md border border-border bg-surface py-2 pl-9 pr-3 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <Button type="submit" loading={searching}>
          Search
        </Button>
      </form>

      <div className="mb-6 flex gap-1 rounded-lg border border-border bg-surface p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              tab === t.id
                ? 'bg-navy text-white'
                : 'text-slate-muted hover:text-charcoal'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No movies found"
          description="Try a different search or check back later."
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
