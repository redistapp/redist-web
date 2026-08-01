import { Link } from 'react-router-dom'
import { Flag, MessageCircleWarning } from 'lucide-react'
import { Spinner } from '@/components/ui/Spinner'
import { PageHeader, EmptyState, ErrorState } from '@/components/ui/States'
import { useAsync } from '@/lib/useAsync'
import { getReports, getUserReports } from '@/lib/adminResources'
import type { FeedbackReport, UserReportItem } from '@/types'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR')
}

function FeedbackList({ items }: { items: FeedbackReport[] }) {
  if (items.length === 0) {
    return <EmptyState title="Nenhum feedback recebido ainda." />
  }
  return (
    <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {items.map((r) => (
        <li key={r.id} className="flex flex-col gap-2 px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-navy-900">
              {r.user ? `${r.user.name} · ${r.user.email}` : 'Usuário removido'}
            </p>
            <p className="shrink-0 text-xs text-slate-500">{formatDate(r.created_at)}</p>
          </div>
          <p className="text-sm text-slate-700">{r.report}</p>
        </li>
      ))}
    </ul>
  )
}

function UserReportsList({ items }: { items: UserReportItem[] }) {
  if (items.length === 0) {
    return <EmptyState title="Nenhuma denúncia de usuário recebida ainda." />
  }
  return (
    <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {items.map((r) => (
        <li key={r.id} className="flex flex-col gap-2 px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-navy-900">
              {r.whistleblower ? r.whistleblower.name : 'Usuário removido'}
              <span className="font-normal text-slate-500"> denunciou </span>
              {r.reported ? (
                <Link
                  to={`/admin/usuarios?search=${encodeURIComponent(r.reported.email)}`}
                  className="text-brand-700 hover:underline"
                >
                  {r.reported.name}
                </Link>
              ) : (
                'usuário removido'
              )}
            </p>
            <p className="shrink-0 text-xs text-slate-500">{formatDate(r.created_at)}</p>
          </div>
          <p className="text-sm text-slate-700">
            <span className="font-medium">{r.reason}</span>
            {r.observation && ` — ${r.observation}`}
          </p>
        </li>
      ))}
    </ul>
  )
}

export default function ReportsPage() {
  const feedback = useAsync(getReports)
  const userReports = useAsync(getUserReports)

  return (
    <div className="flex flex-col gap-10">
      <PageHeader title="Denúncias" subtitle="Feedback livre e denúncias de usuário recebidos pelo site." />

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-navy-900">
          <MessageCircleWarning size={18} className="text-slate-400" />
          Feedback / relatos de problema
        </h2>
        {feedback.loading && <Spinner />}
        {feedback.error && <ErrorState message={feedback.error} />}
        {feedback.data && <FeedbackList items={feedback.data} />}
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-navy-900">
          <Flag size={18} className="text-slate-400" />
          Denúncias de usuário
        </h2>
        {userReports.loading && <Spinner />}
        {userReports.error && <ErrorState message={userReports.error} />}
        {userReports.data && <UserReportsList items={userReports.data} />}
      </section>
    </div>
  )
}
