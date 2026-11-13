import { useEffect, useState } from 'react'
import { FiClock, FiAlertTriangle } from 'react-icons/fi'
import { SEAT_LOCK_DURATION_MINUTES } from '../../utils/constants'

const LOCK_DURATION_SECONDS = SEAT_LOCK_DURATION_MINUTES * 60

export default function LockTimer({ lockedAt, onExpire }) {
  const [remaining, setRemaining] = useState(() =>
    getRemaining(lockedAt)
  )

  useEffect(() => {
    setRemaining(getRemaining(lockedAt))

    const interval = setInterval(() => {
      setRemaining(getRemaining(lockedAt))
    }, 1000)

    return () => clearInterval(interval)
  }, [lockedAt])

  useEffect(() => {
    if (remaining === 0) {
      onExpire?.()
    }
  }, [remaining, onExpire])

  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60
  const label = `${minutes}:${seconds.toString().padStart(2, '0')}`
  const isUrgent = remaining <= 60

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all shadow-2xs ${
        isUrgent
          ? 'border-red-300 bg-red-50 text-error animate-pulse'
          : 'border-amber-300/80 bg-amber-50 text-amber-800'
      }`}
    >
      {isUrgent ? (
        <FiAlertTriangle size={15} className="shrink-0 text-error" />
      ) : (
        <FiClock size={15} className="shrink-0 text-amber-600 animate-spin-slow" />
      )}
      <span>
        {remaining > 0 ? (
          <>
            Seats locked for <span className="font-mono text-sm underline decoration-2">{label}</span>
          </>
        ) : (
          'Seat lock session expired'
        )}
      </span>
    </div>
  )
}

function getRemaining(lockedAt) {
  if (!lockedAt) return LOCK_DURATION_SECONDS
  const elapsed = Math.floor((Date.now() - lockedAt) / 1000)
  return Math.max(LOCK_DURATION_SECONDS - elapsed, 0)
}
