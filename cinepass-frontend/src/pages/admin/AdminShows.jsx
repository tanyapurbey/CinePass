import { useEffect, useState } from 'react'
import { FiPlus, FiCalendar, FiClock, FiMapPin, FiFilm } from 'react-icons/fi'
import { showService } from '../../api/showService'
import { movieService } from '../../api/movieService'
import { screenService } from '../../api/screenService'
import { theaterService } from '../../api/theaterService'
import PageHeader from '../../components/layout/PageHeader'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorAlert from '../../components/common/ErrorAlert'
import EmptyState from '../../components/common/EmptyState'
import Modal, { ModalActions } from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import Select from '../../components/ui/Select'
import Input from '../../components/ui/Input'
import Card from '../../components/ui/Card'
import { formatDateTime, getErrorMessage } from '../../utils/formatters'

export default function AdminShows() {
  const [shows, setShows] = useState([])
  const [movies, setMovies] = useState([])
  const [theaters, setTheaters] = useState([])
  const [screens, setScreens] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    movieId: '',
    theaterId: '',
    screenId: '',
    startTime: '',
    endTime: '',
  })

  const loadShows = () => {
    setLoading(true)
    showService
      .getAll()
      .then((res) => setShows(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    Promise.all([
      movieService.getAll(),
      theaterService.getAll(),
      showService.getAll(),
    ])
      .then(([moviesRes, theatersRes, showsRes]) => {
        setMovies(moviesRes.data)
        setTheaters(theatersRes.data)
        setShows(showsRes.data)
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  const handleTheaterChange = async (theaterId) => {
    setForm({ ...form, theaterId, screenId: '' })
    if (theaterId) {
      try {
        const { data } = await screenService.getByTheater(theaterId)
        setScreens(data)
      } catch (err) {
        setError(getErrorMessage(err))
      }
    } else {
      setScreens([])
    }
  }

  const handleCreate = async () => {
    setSaving(true)
    setError('')
    try {
      const movie = movies.find((m) => m.id === Number(form.movieId))
      const screen = screens.find((s) => s.id === Number(form.screenId))
      await showService.create({
        startTime: form.startTime.includes(':') && form.startTime.length === 16
          ? `${form.startTime}:00`
          : form.startTime,
        endTime: form.endTime.includes(':') && form.endTime.length === 16
          ? `${form.endTime}:00`
          : form.endTime,
        movie,
        screen,
      })
      setModalOpen(false)
      setForm({ movieId: '', theaterId: '', screenId: '', startTime: '', endTime: '' })
      loadShows()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner fullPage />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Show Schedules"
        description="Schedule screening slots for movies across cinema screens."
        action={
          <Button size="sm" onClick={() => setModalOpen(true)} className="shadow-xs">
            <FiPlus size={15} />
            Schedule New Show
          </Button>
        }
      />

      {error && <div className="mb-6"><ErrorAlert message={error} onDismiss={() => setError('')} /></div>}

      {shows.length === 0 ? (
        <EmptyState
          icon={FiCalendar}
          title="No scheduled shows found"
          description="Schedule a screening for any movie in your active theatres."
          action={<Button size="sm" onClick={() => setModalOpen(true)}>Schedule Show</Button>}
        />
      ) : (
        <Card padding={false} className="overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-secondary-text">
                  <th className="px-6 py-3.5">Movie</th>
                  <th className="px-4 py-3.5">Cinema Property</th>
                  <th className="px-4 py-3.5">Auditorium Screen</th>
                  <th className="px-4 py-3.5">Start Showtime</th>
                  <th className="px-6 py-3.5">End Showtime</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {shows.map((show) => (
                  <tr key={show.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2.5 font-heading font-bold text-primary-text">
                        <FiFilm className="text-primary shrink-0" size={15} />
                        <span>{show.movie?.title || '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-primary-text">
                      <div className="flex items-center gap-1.5 text-xs">
                        <FiMapPin className="text-secondary-text" size={13} />
                        <span>{show.screen?.theater?.name || '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                        {show.screen?.name || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs font-semibold text-emerald-700">
                      {formatDateTime(show.startTime)}
                    </td>
                    <td className="px-6 py-3.5 text-xs font-medium text-secondary-text">
                      {formatDateTime(show.endTime)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Schedule Show Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Schedule Movie Show"
        footer={
          <ModalActions
            onCancel={() => setModalOpen(false)}
            onConfirm={handleCreate}
            loading={saving}
            confirmLabel="Confirm Schedule"
          />
        }
      >
        <div className="space-y-4">
          <Select
            label="Movie Selection"
            required
            value={form.movieId}
            onChange={(e) => setForm({ ...form, movieId: e.target.value })}
          >
            <option value="">Choose movie...</option>
            {movies.map((m) => (
              <option key={m.id} value={m.id}>{m.title}</option>
            ))}
          </Select>

          <Select
            label="Cinema Theatre"
            required
            value={form.theaterId}
            onChange={(e) => handleTheaterChange(e.target.value)}
          >
            <option value="">Choose cinema...</option>
            {theaters.map((t) => (
              <option key={t.id} value={t.id}>{t.name} ({t.city})</option>
            ))}
          </Select>

          <Select
            label="Auditorium Screen"
            required
            value={form.screenId}
            onChange={(e) => setForm({ ...form, screenId: e.target.value })}
            disabled={!form.theaterId}
          >
            <option value="">{form.theaterId ? 'Choose screen...' : 'Select a theatre first'}</option>
            {screens.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.totalSeats} seats)</option>
            ))}
          </Select>

          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Start Showtime"
              type="datetime-local"
              required
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            />
            <Input
              label="End Showtime"
              type="datetime-local"
              required
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}
