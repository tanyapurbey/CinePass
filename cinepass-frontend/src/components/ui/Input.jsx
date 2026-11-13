export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className="space-y-1.5 text-left">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-secondary-text">
          {label}
        </label>
      )}
      <input
        className={`w-full rounded-xl border border-border bg-card-bg px-3.5 py-2.5 text-sm text-primary-text placeholder:text-secondary-text/50 transition-all duration-150 focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-secondary-text ${error ? 'border-error/80 focus:border-error focus:ring-error/15' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs font-medium text-error">{error}</p>}
    </div>
  )
}
