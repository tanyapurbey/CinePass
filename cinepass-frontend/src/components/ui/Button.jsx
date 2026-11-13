const variants = {
  primary:
    'bg-primary text-white hover:bg-primary-hover shadow-xs hover:shadow-sm focus-visible:ring-primary/30 active:scale-[0.98]',
  secondary:
    'bg-card-bg text-primary-text border border-border hover:bg-slate-50 hover:border-slate-300 shadow-xs focus-visible:ring-slate-300 active:scale-[0.98]',
  dark:
    'bg-sidebar text-white hover:bg-secondary-dark shadow-xs focus-visible:ring-slate-700 active:scale-[0.98]',
  danger:
    'bg-error text-white hover:bg-red-700 shadow-xs focus-visible:ring-error/30 active:scale-[0.98]',
  ghost:
    'text-secondary-text hover:text-primary-text hover:bg-slate-100/80 active:scale-[0.98]',
  outline:
    'border border-primary text-primary hover:bg-primary/5 focus-visible:ring-primary/30 active:scale-[0.98]',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs font-medium rounded-lg',
  md: 'px-4 py-2 text-sm font-semibold rounded-lg',
  lg: 'px-6 py-2.5 text-sm font-semibold rounded-xl',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled,
  ...props
}) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 font-medium tracking-tight transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant] || variants.primary} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  )
}
