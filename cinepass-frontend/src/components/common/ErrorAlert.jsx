import { FiAlertCircle, FiX } from 'react-icons/fi'

export default function ErrorAlert({ message, onDismiss }) {
  if (!message) return null

  return (
    <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      <FiAlertCircle className="mt-0.5 shrink-0" size={16} />
      <p className="flex-1">{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 text-red-600 hover:text-red-800"
          aria-label="Dismiss"
        >
          <FiX size={16} />
        </button>
      )}
    </div>
  )
}
