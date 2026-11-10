import { AlertCircle, CheckCircle2, Info } from 'lucide-react'

export function Toast({ toast }) {
  if (!toast) return <div className="toast-region" aria-live="polite" aria-atomic="true" />
  const Icon = toast.type === 'error' ? AlertCircle : toast.type === 'success' ? CheckCircle2 : Info
  return (
    <div className="toast-region" aria-live="polite" aria-atomic="true">
      <div className={`toast toast--${toast.type || 'info'}`}>
        <Icon size={18} aria-hidden="true" />
        <span>{toast.message}</span>
      </div>
    </div>
  )
}
