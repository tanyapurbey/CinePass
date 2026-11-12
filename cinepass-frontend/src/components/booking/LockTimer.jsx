import { useEffect, useState } from 'react'
import { FiClock } from 'react-icons/fi'
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
      className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium ${
        isUrgent
          ? 'border-red-200 bg-red-50 text-red-700'
          : 'border-amber-200 bg-amber-50 text-amber-700'
      }`}
    >
      <FiClock size={13} />
      <span>
        {remaining > 0 ? `Seats held for ${label}` : 'Seat lock expired'}
      </span>
    </div>
  )
}

function getRemaining(lockedAt) {
  if (!lockedAt) return LOCK_DURATION_SECONDS
  const elapsed = Math.floor((Date.now() - lockedAt) / 1000)
  return Math.max(LOCK_DURATION_SECONDS - elapsed, 0)
}
