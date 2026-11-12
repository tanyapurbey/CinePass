import { useEffect, useState } from 'react'
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi'
import { movieService } from '../../api/movieService'
import PageHeader from '../../components/layout/PageHeader'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorAlert from '../../components/common/ErrorAlert'
import EmptyState from '../../components/common/EmptyState'
import Modal, { ModalActions } from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Card from '../../components/ui/Card'
import { getErrorMessage } from '../../utils/formatters'

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
    if (!window.confirm('Delete this movie?')) return
    try {
      await movieService.delete(id)
      loadMovies()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  if (loading) return <LoadingSpinner fullPage />

  return (
    <div>
      <PageHeader
        title="Movies"
        description="Create and manage movie listings."
        action={
          <Button size="sm" onClick={openCreate}>
            <FiPlus size={14} />
            Add Movie
          </Button>
        }
      />

      {error && <div className="mb-6"><ErrorAlert message={error} onDismiss={() => setError('')} /></div>}

      {movies.length === 0 ? (
        <EmptyState
          title="No movies"
          description="Add your first movie to get started."
          action={<Button size="sm" onClick={openCreate}>Add Movie</Button>}
        />
      ) : (
        <Card padding={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-off-white text-xs text-slate-muted">
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Genre</th>
                  <th className="px-4 py-3 font-medium">Language</th>
                  <th className="px-4 py-3 font-medium">Duration</th>
                  <th className="px-4 py-3 font-medium">Release</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {movies.map((movie) => (
                  <tr key={movie.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium text-navy">{movie.title}</td>
                    <td className="px-4 py-3 text-charcoal">{movie.genre || '—'}</td>
                    <td className="px-4 py-3 text-charcoal">{movie.language || '—'}</td>
                    <td className="px-4 py-3 text-charcoal">
                      {movie.durationMins ? `${movie.durationMins} min` : '—'}
                    </td>
                    <td className="px-4 py-3 text-charcoal">{movie.releaseDate || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(movie)}>
                          <FiEdit2 size={14} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(movie.id)}>
                          <FiTrash2 size={14} />
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
        title={editing ? 'Edit movie' : 'Add movie'}
        footer={
          <ModalActions
            onCancel={() => setModalOpen(false)}
            onConfirm={handleSave}
            loading={saving}
            confirmLabel={editing ? 'Update' : 'Create'}
          />
        }
      >
        <div className="space-y-3">
          <Input label="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Genre" value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} />
            <Input label="Language" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Duration (mins)" type="number" value={form.durationMins} onChange={(e) => setForm({ ...form, durationMins: e.target.value })} />
            <Input label="Release date" type="date" value={form.releaseDate} onChange={(e) => setForm({ ...form, releaseDate: e.target.value })} />
          </div>
          <Input label="Poster URL" value={form.posterUrl} onChange={(e) => setForm({ ...form, posterUrl: e.target.value })} />
        </div>
      </Modal>
    </div>
  )
}
