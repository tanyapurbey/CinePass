import { useEffect, useState } from 'react'
import { FiPlus } from 'react-icons/fi'
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
    <div>
      <PageHeader
        title="Shows"
        description="Schedule movie showtimes across theatres."
        action={
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <FiPlus size={14} />
            Add Show
          </Button>
        }
      />

      {error && <div className="mb-6"><ErrorAlert message={error} onDismiss={() => setError('')} /></div>}

      {shows.length === 0 ? (
        <EmptyState
          title="No shows scheduled"
          description="Create a show to enable ticket bookings."
          action={<Button size="sm" onClick={() => setModalOpen(true)}>Add Show</Button>}
        />
      ) : (
        <Card padding={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-off-white text-xs text-slate-muted">
                  <th className="px-4 py-3 font-medium">Movie</th>
                  <th className="px-4 py-3 font-medium">Theatre</th>
                  <th className="px-4 py-3 font-medium">Screen</th>
                  <th className="px-4 py-3 font-medium">Start</th>
                  <th className="px-4 py-3 font-medium">End</th>
                </tr>
              </thead>
              <tbody>
                {shows.map((show) => (
                  <tr key={show.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium text-navy">
                      {show.movie?.title || '—'}
                    </td>
                    <td className="px-4 py-3 text-charcoal">
                      {show.screen?.theater?.name || '—'}
                    </td>
                    <td className="px-4 py-3 text-charcoal">
                      {show.screen?.name || '—'}
                    </td>
                    <td className="px-4 py-3 text-charcoal">
                      {formatDateTime(show.startTime)}
                    </td>
                    <td className="px-4 py-3 text-charcoal">
                      {formatDateTime(show.endTime)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add show"
        footer={
          <ModalActions
            onCancel={() => setModalOpen(false)}
            onConfirm={handleCreate}
            loading={saving}
            confirmLabel="Create"
          />
        }
      >
        <div className="space-y-3">
          <Select
            label="Movie"
            required
            value={form.movieId}
            onChange={(e) => setForm({ ...form, movieId: e.target.value })}
          >
            <option value="">Select movie</option>
            {movies.map((m) => (
              <option key={m.id} value={m.id}>{m.title}</option>
            ))}
          </Select>
          <Select
            label="Theatre"
            required
            value={form.theaterId}
            onChange={(e) => handleTheaterChange(e.target.value)}
          >
            <option value="">Select theatre</option>
            {theaters.map((t) => (
              <option key={t.id} value={t.id}>{t.name} — {t.city}</option>
            ))}
          </Select>
          <Select
            label="Screen"
            required
            value={form.screenId}
            onChange={(e) => setForm({ ...form, screenId: e.target.value })}
            disabled={!form.theaterId}
          >
            <option value="">Select screen</option>
            {screens.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </Select>
          <Input
            label="Start time"
            type="datetime-local"
            required
            value={form.startTime}
            onChange={(e) => setForm({ ...form, startTime: e.target.value })}
          />
          <Input
            label="End time"
            type="datetime-local"
            required
            value={form.endTime}
            onChange={(e) => setForm({ ...form, endTime: e.target.value })}
          />
        </div>
      </Modal>
    </div>
  )
}
