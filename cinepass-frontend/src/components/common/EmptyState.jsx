import { FiFilm } from 'react-icons/fi'

export default function EmptyState({ title, description, action, icon: Icon = FiFilm }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card-bg/60 px-6 py-14 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-primary">
        <Icon size={24} />
      </div>
      <h3 className="font-heading text-base font-bold text-primary-text">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-secondary-text">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
