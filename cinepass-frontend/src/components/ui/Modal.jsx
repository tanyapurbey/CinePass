import { FiX } from 'react-icons/fi'
import Button from '../ui/Button'

export default function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-sidebar/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card-bg shadow-2xl transition-all duration-200">
        <div className="flex items-center justify-between border-b border-border px-6 py-4.5">
          <h3 className="font-heading text-base font-bold text-primary-text">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-secondary-text transition-colors hover:bg-slate-100 hover:text-primary-text"
            aria-label="Close"
          >
            <FiX size={18} />
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2.5 border-t border-border bg-slate-50/50 px-6 py-3.5">
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
