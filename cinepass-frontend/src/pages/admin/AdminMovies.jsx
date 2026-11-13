import { useEffect, useState } from 'react'
import { FiEdit2, FiPlus, FiTrash2, FiFilm, FiClock, FiCalendar } from 'react-icons/fi'
import { movieService } from '../../api/movieService'
import PageHeader from '../../components/layout/PageHeader'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorAlert from '../../components/common/ErrorAlert'
import EmptyState from '../../components/common/EmptyState'
import Modal, { ModalActions } from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Card from '../../components/ui/Card'
import { getErrorMessage, formatDate } from '../../utils/formatters'

const emptyForm = {
  title: '',
  description: '',
  language: '',
  genre: '',
  durationMins: '',
  releaseDate: '',
  posterUrl: '',
}

export default function AdminMovies() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const loadMovies = () => {
    setLoading(true)
    movieService
      .getAll()
      .then((res) => setMovies(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadMovies()
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (movie) => {
    setEditing(movie)
    setForm({
      title: movie.title || '',
      description: movie.description || '',
      language: movie.language || '',
      genre: movie.genre || '',
      durationMins: movie.durationMins?.toString() || '',
      releaseDate: movie.releaseDate || '',
      posterUrl: movie.posterUrl || '',
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    const payload = {
      ...form,
      durationMins: form.durationMins ? Number(form.durationMins) : null,
    }
    try {
      if (editing) {
        await movieService.update(editing.id, { ...payload, id: editing.id })
      } else {
        await movieService.create(payload)
      }
      setModalOpen(false)
      loadMovies()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this movie record?')) return
    try {
      await movieService.delete(id)
      loadMovies()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  if (loading) return <LoadingSpinner fullPage />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Movies Catalog"
        description="Add, edit, and organize films available for show scheduling."
        action={
          <Button size="sm" onClick={openCreate} className="shadow-xs">
            <FiPlus size={15} />
            Add New Movie
          </Button>
        }
      />

      {error && <div className="mb-6"><ErrorAlert message={error} onDismiss={() => setError('')} /></div>}

      {movies.length === 0 ? (
        <EmptyState
          icon={FiFilm}
          title="No movies found"
          description="Start building your catalogue by adding your first movie."
          action={<Button size="sm" onClick={openCreate}>Add Movie</Button>}
        />
      ) : (
        <Card padding={false} className="overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-secondary-text">
                  <th className="px-6 py-3.5">Movie Info</th>
                  <th className="px-4 py-3.5">Genre</th>
                  <th className="px-4 py-3.5">Language</th>
                  <th className="px-4 py-3.5">Duration</th>
                  <th className="px-4 py-3.5">Release Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {movies.map((movie) => (
                  <tr key={movie.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-8.5 shrink-0 overflow-hidden rounded-lg bg-slate-800 shadow-2xs">
                          {movie.posterUrl ? (
                            <img src={movie.posterUrl} alt={movie.title} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-slate-500">
                              <FiFilm size={12} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-heading font-bold text-primary-text">{movie.title}</p>
                          {movie.description && (
                            <p className="text-xs text-secondary-text line-clamp-1 max-w-xs">{movie.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        {movie.genre || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="rounded-md bg-rose-50 px-2.5 py-1 text-xs font-bold text-primary">
                        {movie.language || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs font-medium text-secondary-text">
                      {movie.durationMins ? `${movie.durationMins} min` : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-secondary-text">
                      {movie.releaseDate ? formatDate(movie.releaseDate) : '—'}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(movie)} title="Edit Movie">
                          <FiEdit2 size={14} className="text-secondary-text hover:text-primary-text" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(movie.id)} title="Delete Movie">
                          <FiTrash2 size={14} className="text-red-500 hover:text-error" />
                        </Button>
                      </div>
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
        title={editing ? 'Edit Movie Details' : 'Add New Movie to Catalogue'}
        footer={
          <ModalActions
            onCancel={() => setModalOpen(false)}
            onConfirm={handleSave}
            loading={saving}
            confirmLabel={editing ? 'Update Movie' : 'Create Listing'}
          />
        }
      >
        <div className="space-y-4">
          <Input label="Movie Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Inception" />
          <Input label="Synopsis / Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief summary of the plot..." />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Genre" value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} placeholder="Action, Sci-Fi" />
            <Input label="Language" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} placeholder="English, Hindi" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Duration (Minutes)" type="number" value={form.durationMins} onChange={(e) => setForm({ ...form, durationMins: e.target.value })} placeholder="148" />
            <Input label="Release Date" type="date" value={form.releaseDate} onChange={(e) => setForm({ ...form, releaseDate: e.target.value })} />
          </div>
          <Input label="Poster Image URL" value={form.posterUrl} onChange={(e) => setForm({ ...form, posterUrl: e.target.value })} placeholder="https://..." />
        </div>
      </Modal>
    </div>
  )
}
