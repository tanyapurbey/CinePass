import { FiX } from 'react-icons/fi'
import Button from '../ui/Button'

export default function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy/30" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-lg border border-border bg-surface shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold text-navy">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-muted hover:text-charcoal"
            aria-label="Close"
          >
            <FiX size={18} />
          </button>
        </div>
        <div className="px-4 py-4">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-border px-4 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export function ModalActions({ onCancel, onConfirm, confirmLabel = 'Save', loading }) {
  return (
    <>
      <Button variant="secondary" onClick={onCancel}>
        Cancel
      </Button>
      <Button onClick={onConfirm} loading={loading}>
        {confirmLabel}
      </Button>
    </>
  )
}
