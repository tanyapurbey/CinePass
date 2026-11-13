const statusStyles = {
  CONFIRMED: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  SUCCESS: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  AVAILABLE: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200/80',
  LOCKED: 'bg-amber-50 text-amber-700 border-amber-200/80',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200/80',
  EXPIRED: 'bg-slate-100 text-slate-500 border-slate-200/80',
  BOOKED: 'bg-slate-100 text-slate-600 border-slate-200/80',
  ADMIN: 'bg-rose-50 text-primary border-rose-200 font-semibold',
  USER: 'bg-slate-100 text-slate-700 border-slate-200/80',
}

export default function Badge({ status, children }) {
  const style = statusStyles[status] || 'bg-slate-100 text-slate-600 border-slate-200/80'

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide uppercase ${style}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {children || status}
    </span>
  )
}
