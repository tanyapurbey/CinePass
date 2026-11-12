export default function LoadingSpinner({ fullPage = false, size = 'md' }) {
  const sizeClass = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-10 w-10' : 'h-6 w-6'

  const spinner = (
    <div
      className={`${sizeClass} animate-spin rounded-full border-2 border-border border-t-accent`}
      role="status"
      aria-label="Loading"
    />
  )

  if (fullPage) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        {spinner}
      </div>
    )
  }

  return spinner
}
