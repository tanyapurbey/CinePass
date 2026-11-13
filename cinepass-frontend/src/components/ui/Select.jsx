export default function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className="space-y-1.5 text-left">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-secondary-text">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={`w-full appearance-none rounded-xl border border-border bg-card-bg px-3.5 py-2.5 pr-9 text-sm text-primary-text transition-all duration-150 focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-slate-50 ${error ? 'border-error/80' : ''} ${className}`}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-secondary-text">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && <p className="text-xs font-medium text-error">{error}</p>}
    </div>
  )
}
