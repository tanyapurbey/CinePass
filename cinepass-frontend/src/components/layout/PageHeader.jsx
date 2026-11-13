export default function PageHeader({ title, description, action }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-5">
      <div>
        <h1 className="font-heading text-2xl font-extrabold tracking-tight text-primary-text sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm font-normal text-secondary-text">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
