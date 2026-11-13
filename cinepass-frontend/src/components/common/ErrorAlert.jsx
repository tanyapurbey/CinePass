import { FiAlertCircle, FiX } from 'react-icons/fi'

export default function ErrorAlert({ message, onDismiss }) {
  if (!message) return null

  return (
    <div className="flex items-start gap-3 rounded-xl border border-red-200/80 bg-red-50/80 px-4 py-3.5 text-sm text-red-900 shadow-2xs">
      <FiAlertCircle className="mt-0.5 shrink-0 text-error" size={18} />
      <p className="flex-1 font-medium leading-relaxed">{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-md p-0.5 text-red-500 transition-colors hover:bg-red-100 hover:text-red-800"
          aria-label="Dismiss"
        >
          <FiX size={16} />
        </button>
      )}
    </div>
  )
}
