import { SEAT_STATUS } from '../../utils/constants'
import { formatCurrency } from '../../utils/formatters'

export default function SeatGrid({ seats, selectedIds, onToggle, readOnly = false }) {
  if (!seats?.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-slate-50/50 p-8 text-center text-sm font-medium text-secondary-text">
        No seats available for this showtime.
      </div>
    )
  }

  const getSeatClass = (seat) => {
    const isSelected = selectedIds.includes(seat.id)
    const status = seat.status

    if (readOnly) {
      return 'bg-slate-100 text-slate-400 border-slate-200 cursor-default'
    }

    if (status === SEAT_STATUS.BOOKED || status === SEAT_STATUS.LOCKED) {
      return 'bg-slate-200/90 text-slate-400 border-transparent cursor-not-allowed opacity-50'
    }

    if (isSelected) {
      return 'bg-primary text-white border-primary shadow-xs ring-2 ring-primary/30 scale-105 font-bold'
    }

    return 'bg-card-bg text-primary-text border-slate-300 hover:border-primary hover:text-primary hover:shadow-xs active:scale-95 cursor-pointer font-medium'
  }

  return (
    <div className="space-y-8">
      {/* Cinema Screen Indicator with Curve & Ambient Light */}
      <div className="relative mx-auto max-w-lg text-center pt-2">
        <div className="h-2 w-full rounded-full bg-gradient-to-r from-slate-200 via-primary/50 to-slate-200 shadow-[0_4px_16px_rgba(225,29,72,0.25)]" />
        <p className="mt-2 text-[11px] font-bold tracking-widest text-secondary-text uppercase">
          Cinema Screen
        </p>
      </div>

      {/* Seats Matrix */}
      <div className="flex flex-wrap justify-center gap-2.5 max-w-2xl mx-auto p-4 rounded-2xl bg-slate-50/60 border border-border/80">
        {seats.map((showSeat) => {
          const seatNumber = showSeat.seat?.seatNumber || showSeat.seatNumber
          const disabled =
            readOnly ||
            showSeat.status === SEAT_STATUS.BOOKED ||
            showSeat.status === SEAT_STATUS.LOCKED
          const isSelected = selectedIds.includes(showSeat.id)

          return (
            <button
              key={showSeat.id}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && onToggle(showSeat.id)}
              title={`${seatNumber} — ${formatCurrency(showSeat.price)} (${showSeat.status})`}
              className={`flex h-8.5 w-8.5 items-center justify-center rounded-lg border text-[11px] transition-all duration-150 ${getSeatClass(showSeat)}`}
            >
              {seatNumber}
            </button>
          )
        })}
      </div>

      {/* Seating Legend */}
      {!readOnly && (
        <div className="flex flex-wrap items-center justify-center gap-6 rounded-xl border border-border/80 bg-card-bg px-5 py-3 text-xs font-semibold text-secondary-text shadow-2xs">
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 rounded-md border border-slate-300 bg-card-bg shadow-2xs" />
            <span>Available</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 rounded-md bg-primary border border-primary shadow-xs" />
            <span className="text-primary font-bold">Selected</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 rounded-md bg-slate-200/90 border border-transparent opacity-60" />
            <span>Booked / Reserved</span>
          </span>
        </div>
      )}
    </div>
  )
}
