export default function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface px-6 py-12 text-center">
      <h3 className="text-sm font-semibold text-charcoal">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-slate-muted">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
