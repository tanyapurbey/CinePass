const statusStyles = {
  CONFIRMED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  LOCKED: 'bg-amber-50 text-amber-700 border-amber-200',
  EXPIRED: 'bg-slate-100 text-slate-500 border-slate-200',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200',
  SUCCESS: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  AVAILABLE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  BOOKED: 'bg-slate-100 text-slate-600 border-slate-200',
  ADMIN: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  USER: 'bg-slate-100 text-slate-600 border-slate-200',
}

export default function Badge({ status, children }) {
  const style = statusStyles[status] || 'bg-slate-100 text-slate-600 border-slate-200'

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${style}`}
    >
      {children || status}
    </span>
  )
}
