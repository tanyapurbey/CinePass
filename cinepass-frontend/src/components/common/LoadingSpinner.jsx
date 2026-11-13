export default function LoadingSpinner({ fullPage = false, size = 'md' }) {
  const sizeClass = size === 'sm' ? 'h-4 w-4 border-2' : size === 'lg' ? 'h-10 w-10 border-3' : 'h-7 w-7 border-2'

  const spinner = (
    <div
      className={`${sizeClass} animate-spin rounded-full border-slate-200 border-t-primary`}
      role="status"
      aria-label="Loading"
    />
  )

  if (fullPage) {
    return (
      <div className="flex min-h-[55vh] flex-col items-center justify-center gap-3">
        {spinner}
        <p className="text-xs font-semibold uppercase tracking-wider text-secondary-text">Loading...</p>
      </div>
    )
  }

  return spinner
}
