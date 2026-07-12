import type { ReactNode } from 'react'
import { Inbox, TriangleAlert } from 'lucide-react'

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-navy-900">{title}</h1>
        {subtitle && <p className="mt-1 text-slate-600">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <span className="grid size-12 place-items-center rounded-xl bg-slate-100 text-slate-400">
        <Inbox size={24} />
      </span>
      <h3 className="mt-4 text-lg font-semibold text-navy-900">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-slate-600">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
      <TriangleAlert size={18} className="shrink-0" />
      <p className="text-sm">{message}</p>
    </div>
  )
}
