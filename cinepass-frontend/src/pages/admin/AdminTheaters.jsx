import { useEffect, useState } from 'react'
import { FiEdit2, FiPlus, FiTrash2, FiMonitor } from 'react-icons/fi'
import { theaterService } from '../../api/theaterService'
import { screenService } from '../../api/screenService'
import { seatService } from '../../api/seatService'
import PageHeader from '../../components/layout/PageHeader'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorAlert from '../../components/common/ErrorAlert'
import EmptyState from '../../components/common/EmptyState'
import Modal, { ModalActions } from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Card from '../../components/ui/Card'
import { getErrorMessage } from '../../utils/formatters'

const emptyTheater = { name: '', address: '', city: '', totalScreens: '' }
const emptyScreen = { name: '', totalSeats: '' }
const emptySeat = { seatNumber: '', seatType: 'REGULAR', basePrice: '' }

export default function AdminTheaters() {
  const [theaters, setTheaters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [theaterModal, setTheaterModal] = useState(false)
  const [screenModal, setScreenModal] = useState(false)
  const [seatModal, setSeatModal] = useState(false)
  const [editingTheater, setEditingTheater] = useState(null)
  const [selectedTheater, setSelectedTheater] = useState(null)
  const [selectedScreen, setSelectedScreen] = useState(null)
  const [screens, setScreens] = useState([])
  const [seats, setSeats] = useState([])
  const [theaterForm, setTheaterForm] = useState(emptyTheater)
  const [screenForm, setScreenForm] = useState(emptyScreen)
  const [seatForm, setSeatForm] = useState(emptySeat)
  const [saving, setSaving] = useState(false)

  const loadTheaters = () => {
    setLoading(true)
    theaterService
      .getAll()
      .then((res) => setTheaters(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadTheaters()
  }, [])

  const loadScreens = async (theaterId) => {
    try {
      const { data } = await screenService.getByTheater(theaterId)
      setScreens(data)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const loadSeats = async (screenId) => {
    try {
      const { data } = await seatService.getByScreen(screenId)
      setSeats(data)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const openCreateTheater = () => {
    setEditingTheater(null)
    setTheaterForm(emptyTheater)
    setTheaterModal(true)
  }

  const openEditTheater = (theater) => {
    setEditingTheater(theater)
    setTheaterForm({
      name: theater.name || '',
      address: theater.address || '',
      city: theater.city || '',
      totalScreens: theater.totalScreens?.toString() || '',
    })
    setTheaterModal(true)
  }

  const saveTheater = async () => {
    setSaving(true)
    const payload = {
      ...theaterForm,
      totalScreens: theaterForm.totalScreens
        ? Number(theaterForm.totalScreens)
        : null,
    }
    try {
      if (editingTheater) {
        await theaterService.update(editingTheater.id, {
          ...payload,
          id: editingTheater.id,
        })
      } else {
        await theaterService.create(payload)
      }
      setTheaterModal(false)
      loadTheaters()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const deleteTheater = async (id) => {
    if (!window.confirm('Delete this theatre?')) return
    try {
      await theaterService.delete(id)
      if (selectedTheater?.id === id) {
        setSelectedTheater(null)
        setScreens([])
      }
      loadTheaters()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const selectTheater = (theater) => {
    setSelectedTheater(theater)
    setSelectedScreen(null)
    setSeats([])
    loadScreens(theater.id)
  }

  const openCreateScreen = () => {
    setScreenForm(emptyScreen)
    setScreenModal(true)
  }

  const saveScreen = async () => {
    setSaving(true)
    try {
      await screenService.create(selectedTheater.id, {
        ...screenForm,
        totalSeats: screenForm.totalSeats
          ? Number(screenForm.totalSeats)
          : null,
      })
      setScreenModal(false)
      loadScreens(selectedTheater.id)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const selectScreen = (screen) => {
    setSelectedScreen(screen)
    loadSeats(screen.id)
  }

  const openCreateSeat = () => {
    setSeatForm(emptySeat)
    setSeatModal(true)
  }

  const saveSeat = async () => {
    setSaving(true)
    try {
      await seatService.create(selectedScreen.id, {
        ...seatForm,
        basePrice: Number(seatForm.basePrice),
      })
      setSeatModal(false)
      loadSeats(selectedScreen.id)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const deleteSeat = async (seatId) => {
    if (!window.confirm('Delete this seat?')) return
    try {
      await seatService.delete(selectedScreen.id, seatId)
      loadSeats(selectedScreen.id)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  if (loading) return <LoadingSpinner fullPage />

  return (
    <div>
      <PageHeader
        title="Theatres"
        description="Manage theatres, screens, and seats."
        action={
          <Button size="sm" onClick={openCreateTheater}>
            <FiPlus size={14} />
            Add Theatre
          </Button>
        }
      />

      {error && <div className="mb-6"><ErrorAlert message={error} onDismiss={() => setError('')} /></div>}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card padding={false}>
          <div className="border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold text-navy">All theatres</h3>
          </div>
          {theaters.length === 0 ? (
            <p className="p-4 text-sm text-slate-muted">No theatres yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {theaters.map((t) => (
                <div
                  key={t.id}
                  className={`flex cursor-pointer items-center justify-between px-4 py-3 transition-colors hover:bg-off-white ${
                    selectedTheater?.id === t.id ? 'bg-indigo-50' : ''
                  }`}
                  onClick={() => selectTheater(t)}
                >
                  <div>
                    <p className="text-sm font-medium text-navy">{t.name}</p>
                    <p className="text-xs text-slate-muted">{t.city}</p>
                  </div>
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" onClick={() => openEditTheater(t)}>
                      <FiEdit2 size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteTheater(t.id)}>
                      <FiTrash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="space-y-4">
          {selectedTheater ? (
            <>
              <Card>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-navy">
                    Screens — {selectedTheater.name}
                  </h3>
                  <Button size="sm" variant="secondary" onClick={openCreateScreen}>
                    <FiPlus size={14} />
                    Add Screen
                  </Button>
                </div>
                {screens.length === 0 ? (
                  <p className="text-sm text-slate-muted">No screens yet.</p>
                ) : (
                  <div className="space-y-2">
                    {screens.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => selectScreen(s)}
                        className={`flex w-full items-center gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                          selectedScreen?.id === s.id
                            ? 'border-accent bg-indigo-50'
                            : 'border-border hover:bg-off-white'
                        }`}
                      >
                        <FiMonitor size={14} className="text-accent" />
                        <span className="font-medium text-charcoal">{s.name}</span>
                        <span className="text-xs text-slate-muted">
                          {s.totalSeats} seats
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </Card>

              {selectedScreen && (
                <Card>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-navy">
                      Seats — {selectedScreen.name}
                    </h3>
                    <Button size="sm" variant="secondary" onClick={openCreateSeat}>
                      <FiPlus size={14} />
                      Add Seat
                    </Button>
                  </div>
                  {seats.length === 0 ? (
                    <p className="text-sm text-slate-muted">No seats yet.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {seats.map((seat) => (
                        <div
                          key={seat.id}
                          className="flex items-center gap-1 rounded border border-border px-2 py-1 text-xs"
                        >
                          <span className="font-medium">{seat.seatNumber}</span>
                          <span className="text-slate-muted">{seat.seatType}</span>
                          <button
                            type="button"
                            onClick={() => deleteSeat(seat.id)}
                            className="ml-1 text-red-500 hover:text-red-700"
                          >
                            <FiTrash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              )}
            </>
          ) : (
            <EmptyState
              title="Select a theatre"
              description="Choose a theatre to manage its screens and seats."
            />
          )}
        </div>
      </div>

      <Modal
        open={theaterModal}
        onClose={() => setTheaterModal(false)}
        title={editingTheater ? 'Edit theatre' : 'Add theatre'}
        footer={
          <ModalActions
            onCancel={() => setTheaterModal(false)}
            onConfirm={saveTheater}
            loading={saving}
          />
        }
      >
        <div className="space-y-3">
          <Input label="Name" required value={theaterForm.name} onChange={(e) => setTheaterForm({ ...theaterForm, name: e.target.value })} />
          <Input label="City" required value={theaterForm.city} onChange={(e) => setTheaterForm({ ...theaterForm, city: e.target.value })} />
          <Input label="Address" value={theaterForm.address} onChange={(e) => setTheaterForm({ ...theaterForm, address: e.target.value })} />
          <Input label="Total screens" type="number" value={theaterForm.totalScreens} onChange={(e) => setTheaterForm({ ...theaterForm, totalScreens: e.target.value })} />
        </div>
      </Modal>

      <Modal
        open={screenModal}
        onClose={() => setScreenModal(false)}
        title="Add screen"
        footer={
          <ModalActions onCancel={() => setScreenModal(false)} onConfirm={saveScreen} loading={saving} />
        }
      >
        <div className="space-y-3">
          <Input label="Name" required value={screenForm.name} onChange={(e) => setScreenForm({ ...screenForm, name: e.target.value })} />
          <Input label="Total seats" type="number" value={screenForm.totalSeats} onChange={(e) => setScreenForm({ ...screenForm, totalSeats: e.target.value })} />
        </div>
      </Modal>

      <Modal
        open={seatModal}
        onClose={() => setSeatModal(false)}
        title="Add seat"
        footer={
          <ModalActions onCancel={() => setSeatModal(false)} onConfirm={saveSeat} loading={saving} />
        }
      >
        <div className="space-y-3">
          <Input label="Seat number" required value={seatForm.seatNumber} onChange={(e) => setSeatForm({ ...seatForm, seatNumber: e.target.value })} />
          <Input label="Seat type" required value={seatForm.seatType} onChange={(e) => setSeatForm({ ...seatForm, seatType: e.target.value })} />
          <Input label="Base price" type="number" required value={seatForm.basePrice} onChange={(e) => setSeatForm({ ...seatForm, basePrice: e.target.value })} />
        </div>
      </Modal>
    </div>
  )
}
