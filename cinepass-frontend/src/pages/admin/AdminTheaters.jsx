import { useEffect, useState } from 'react'
import { FiEdit2, FiPlus, FiTrash2, FiMonitor, FiMapPin } from 'react-icons/fi'
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
    if (!window.confirm('Delete this theatre and all associated screens?')) return
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
    if (!window.confirm('Delete this seat layout item?')) return
    try {
      await seatService.delete(selectedScreen.id, seatId)
      loadSeats(selectedScreen.id)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  if (loading) return <LoadingSpinner fullPage />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Theatres & Screens"
        description="Configure cinema properties, screen auditoriums, and seat tier layouts."
        action={
          <Button size="sm" onClick={openCreateTheater} className="shadow-xs">
            <FiPlus size={15} />
            Add Theatre
          </Button>
        }
      />

      {error && <div className="mb-6"><ErrorAlert message={error} onDismiss={() => setError('')} /></div>}

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: All Theatres */}
        <div className="lg:col-span-6">
          <Card padding={false} className="overflow-hidden shadow-sm">
            <div className="border-b border-border bg-slate-50/70 px-5 py-3.5 flex items-center justify-between">
              <h3 className="font-heading text-sm font-bold text-primary-text">Cinema Properties</h3>
              <span className="text-xs font-semibold text-secondary-text">{theaters.length} Locations</span>
            </div>

            {theaters.length === 0 ? (
              <div className="p-8 text-center text-sm text-secondary-text">No theatres configured yet.</div>
            ) : (
              <div className="divide-y divide-border/60">
                {theaters.map((t) => (
                  <div
                    key={t.id}
                    className={`flex cursor-pointer items-center justify-between px-5 py-3.5 transition-colors ${
                      selectedTheater?.id === t.id
                        ? 'bg-rose-50/80 border-l-4 border-l-primary'
                        : 'hover:bg-slate-50/60'
                    }`}
                    onClick={() => selectTheater(t)}
                  >
                    <div>
                      <p className="font-heading font-bold text-primary-text">{t.name}</p>
                      <p className="text-xs font-medium text-secondary-text mt-0.5">
                        📍 {t.city} {t.address && `· ${t.address}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" onClick={() => openEditTheater(t)}>
                        <FiEdit2 size={14} className="text-secondary-text hover:text-primary-text" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteTheater(t.id)}>
                        <FiTrash2 size={14} className="text-red-500 hover:text-error" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Screens & Seats */}
        <div className="lg:col-span-6 space-y-5">
          {selectedTheater ? (
            <>
              {/* Screens Card */}
              <Card className="shadow-sm">
                <div className="mb-4 flex items-center justify-between border-b border-border/80 pb-3">
                  <div>
                    <h3 className="font-heading text-sm font-bold text-primary-text">
                      Screens at {selectedTheater.name}
                    </h3>
                    <p className="text-xs text-secondary-text">Select a screen to view or customize seating</p>
                  </div>
                  <Button size="sm" variant="secondary" onClick={openCreateScreen}>
                    <FiPlus size={14} /> Add Screen
                  </Button>
                </div>

                {screens.length === 0 ? (
                  <p className="text-xs font-medium text-secondary-text py-2">No screens created for this cinema location.</p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {screens.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => selectScreen(s)}
                        className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-left text-sm transition-all ${
                          selectedScreen?.id === s.id
                            ? 'border-primary bg-rose-50/70 ring-1 ring-primary text-primary font-bold shadow-2xs'
                            : 'border-border bg-card-bg hover:border-slate-300 text-primary-text'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <FiMonitor size={15} />
                          <span>{s.name}</span>
                        </span>
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-secondary-text">
                          {s.totalSeats} seats
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </Card>

              {/* Seats Card */}
              {selectedScreen && (
                <Card className="shadow-sm">
                  <div className="mb-4 flex items-center justify-between border-b border-border/80 pb-3">
                    <div>
                      <h3 className="font-heading text-sm font-bold text-primary-text">
                        Seats — {selectedScreen.name}
                      </h3>
                      <p className="text-xs text-secondary-text">{seats.length} total seats configured</p>
                    </div>
                    <Button size="sm" variant="secondary" onClick={openCreateSeat}>
                      <FiPlus size={14} /> Add Seat
                    </Button>
                  </div>

                  {seats.length === 0 ? (
                    <p className="text-xs font-medium text-secondary-text py-2">No seats configured yet.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto p-1">
                      {seats.map((seat) => (
                        <div
                          key={seat.id}
                          className="flex items-center gap-1.5 rounded-lg border border-border bg-slate-50 px-2.5 py-1 text-xs font-semibold"
                        >
                          <span className="text-primary-text">{seat.seatNumber}</span>
                          <span className="text-[10px] text-secondary-text">({seat.seatType})</span>
                          <button
                            type="button"
                            onClick={() => deleteSeat(seat.id)}
                            className="ml-1 text-red-500 hover:text-error transition-colors"
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
              icon={FiMapPin}
              title="Select a theatre"
              description="Click on any cinema property from the list on the left to configure its screens and seat layouts."
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <Modal
        open={theaterModal}
        onClose={() => setTheaterModal(false)}
        title={editingTheater ? 'Edit Theatre Property' : 'Add New Cinema Theatre'}
        footer={
          <ModalActions
            onCancel={() => setTheaterModal(false)}
            onConfirm={saveTheater}
            loading={saving}
            confirmLabel={editingTheater ? 'Update Property' : 'Create Theatre'}
          />
        }
      >
        <div className="space-y-4">
          <Input label="Theatre Name" required value={theaterForm.name} onChange={(e) => setTheaterForm({ ...theaterForm, name: e.target.value })} placeholder="e.g. CinePass Grand IMAX" />
          <Input label="City" required value={theaterForm.city} onChange={(e) => setTheaterForm({ ...theaterForm, city: e.target.value })} placeholder="e.g. Mumbai" />
          <Input label="Full Address" value={theaterForm.address} onChange={(e) => setTheaterForm({ ...theaterForm, address: e.target.value })} placeholder="Mall Rd, Block B" />
          <Input label="Total Screens" type="number" value={theaterForm.totalScreens} onChange={(e) => setTheaterForm({ ...theaterForm, totalScreens: e.target.value })} placeholder="4" />
        </div>
      </Modal>

      <Modal
        open={screenModal}
        onClose={() => setScreenModal(false)}
        title="Add Screen to Cinema"
        footer={
          <ModalActions onCancel={() => setScreenModal(false)} onConfirm={saveScreen} loading={saving} confirmLabel="Create Screen" />
        }
      >
        <div className="space-y-4">
          <Input label="Screen / Auditorium Name" required value={screenForm.name} onChange={(e) => setScreenForm({ ...screenForm, name: e.target.value })} placeholder="e.g. Screen 1 (Dolby Atmos)" />
          <Input label="Total Seat Capacity" type="number" value={screenForm.totalSeats} onChange={(e) => setScreenForm({ ...screenForm, totalSeats: e.target.value })} placeholder="120" />
        </div>
      </Modal>

      <Modal
        open={seatModal}
        onClose={() => setSeatModal(false)}
        title="Add Seat to Auditorium"
        footer={
          <ModalActions onCancel={() => setSeatModal(false)} onConfirm={saveSeat} loading={saving} confirmLabel="Create Seat" />
        }
      >
        <div className="space-y-4">
          <Input label="Seat Identifier" required value={seatForm.seatNumber} onChange={(e) => setSeatForm({ ...seatForm, seatNumber: e.target.value })} placeholder="e.g. A1, B5" />
          <Input label="Seat Tier (REGULAR, PREMIUM, VIP)" required value={seatForm.seatType} onChange={(e) => setSeatForm({ ...seatForm, seatType: e.target.value })} placeholder="REGULAR" />
          <Input label="Base Price (₹)" type="number" required value={seatForm.basePrice} onChange={(e) => setSeatForm({ ...seatForm, basePrice: e.target.value })} placeholder="250" />
        </div>
      </Modal>
    </div>
  )
}
