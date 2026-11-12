export function formatDate(dateString) {
  if (!dateString) return '—'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(dateString) {
  if (!dateString) return '—'
  const date = new Date(dateString)
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatTime(dateString) {
  if (!dateString) return '—'
  const date = new Date(dateString)
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatCurrency(amount) {
  if (amount == null) return '—'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function isUpcoming(releaseDate) {
  if (!releaseDate) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(releaseDate) > today
}

export function isNowShowing(releaseDate) {
  if (!releaseDate) return true
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(releaseDate) <= today
}

export function getErrorMessage(error) {
  const data = error?.response?.data
  if (data?.message) return data.message
  if (data?.fieldErrors && typeof data.fieldErrors === 'object') {
    const first = Object.values(data.fieldErrors)[0]
    if (first) return first
  }
  if (error?.message) return error.message
  return 'Something went wrong. Please try again.'
}
