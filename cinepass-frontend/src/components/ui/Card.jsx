export default function Card({ children, className = '', padding = true }) {
  return (
    <div
      className={`rounded-2xl border border-border bg-card-bg shadow-[0_1px_3px_0_rgba(15,23,42,0.04),0_1px_2px_-1px_rgba(15,23,42,0.04)] transition-all duration-200 ${padding ? 'p-5 sm:p-6' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
