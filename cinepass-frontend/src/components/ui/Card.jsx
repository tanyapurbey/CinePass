export default function Card({ children, className = '', padding = true }) {
  return (
    <div
      className={`rounded-lg border border-border bg-surface shadow-sm ${padding ? 'p-4' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
