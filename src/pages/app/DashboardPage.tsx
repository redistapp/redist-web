import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeftRight, Sparkles, User, ArrowRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Spinner } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/ui/States'
import { useAsync } from '@/lib/useAsync'
import { useSession } from '@/contexts/SessionContext'
import { getIntentions, getMatches, getPlanStatus } from '@/lib/resources'

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-navy-900">{value}</p>
    </div>
  )
}

function QuickAction({
  to,
  icon: Icon,
  title,
  text,
}: {
  to: string
  icon: LucideIcon
  title: string
  text: string
}) {
  return (
    <Link
      to={to}
      className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:border-brand-200"
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
        <Icon size={22} />
      </span>
      <div className="min-w-0">
        <p className="flex items-center gap-1 font-semibold text-navy-900">
          {title}
          <ArrowRight
            size={16}
            className="text-brand-600 opacity-0 transition-opacity group-hover:opacity-100"
          />
        </p>
        <p className="mt-1 text-sm text-slate-600">{text}</p>
      </div>
    </Link>
  )
}

export default function DashboardPage() {
  const { user } = useSession()
  const load = useCallback(
    () =>
      Promise.all([getIntentions(), getMatches(), getPlanStatus()]).then(
        ([intentions, matches, plan]) => ({ intentions, matches, plan }),
      ),
    [],
  )
  const { data, loading, error } = useAsync(load)

  const firstName = user?.profile?.first_name
  const greeting = firstName ? `Olá, ${firstName}` : 'Olá'

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-navy-900">{greeting} 👋</h1>
      <p className="mt-1 text-slate-600">Veja o resumo da sua conta e das suas permutas.</p>

      {loading && <Spinner />}
      {error && (
        <div className="mt-8">
          <ErrorState message={error} />
        </div>
      )}

      {data && (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Metric label="Intenções ativas" value={data.intentions.total} />
            <Metric label="Matches encontrados" value={data.matches.total} />
            <Metric label="Plano" value={data.plan.subscribed ? 'Premium' : 'Gratuito'} />
          </div>

          <h2 className="mt-10 text-lg font-semibold text-navy-900">Atalhos</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <QuickAction
              to="/painel/intencoes"
              icon={ArrowLeftRight}
              title="Minhas intenções"
              text="Cadastre para onde você quer ir."
            />
            <QuickAction
              to="/painel/matches"
              icon={Sparkles}
              title="Meus matches"
              text="Veja quem quer trocar com você."
            />
            <QuickAction
              to="/painel/perfil"
              icon={User}
              title="Meu perfil"
              text="Confira e atualize seus dados."
            />
          </div>
        </>
      )}
    </div>
  )
}
