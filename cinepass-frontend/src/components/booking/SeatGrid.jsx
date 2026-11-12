import { SEAT_STATUS } from '../../utils/constants'
import { formatCurrency } from '../../utils/formatters'

export default function SeatGrid({ seats, selectedIds, onToggle, readOnly = false }) {
  if (!seats?.length) {
    return (
      <p className="text-sm text-slate-muted">No seats available for this show.</p>
    )
  }

  const getSeatClass = (seat) => {
    const isSelected = selectedIds.includes(seat.id)
    const status = seat.status

    if (readOnly) {
      return 'bg-slate-100 text-slate-500 cursor-default'
    }

    if (status === SEAT_STATUS.BOOKED || status === SEAT_STATUS.LOCKED) {
      return 'bg-slate-200 text-slate-400 cursor-not-allowed'
    }

    if (isSelected) {
      return 'bg-accent text-white border-accent'
    }

    return 'bg-surface text-charcoal border-border hover:border-accent hover:text-accent cursor-pointer'
  }

  return (
    <div className="space-y-4">
      <div className="mx-auto max-w-md rounded-t-full bg-slate-200 px-8 py-1.5 text-center text-xs font-medium text-slate-muted">
        SCREEN
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {seats.map((showSeat) => {
          const seatNumber = showSeat.seat?.seatNumber || showSeat.seatNumber
          const disabled =
            readOnly ||
            showSeat.status === SEAT_STATUS.BOOKED ||
            showSeat.status === SEAT_STATUS.LOCKED

          return (
            <button
              key={showSeat.id}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && onToggle(showSeat.id)}
              title={`${seatNumber} — ${formatCurrency(showSeat.price)} (${showSeat.status})`}
              className={`flex h-8 w-8 items-center justify-center rounded border text-[10px] font-medium transition-colors ${getSeatClass(showSeat)}`}
            >
              {seatNumber}
            </button>
          )
        })}
      </div>
      {!readOnly && (
        <div className="flex flex-wrap justify-center gap-4 text-xs text-slate-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded border border-border bg-surface" />
            Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-accent" />
            Selected
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-slate-200" />
            Unavailable
          </span>
        </div>
      )}
    </div>
  )
}
