import { Link } from 'react-router-dom'
import { Building2, Flag, HeartHandshake, Repeat2, UserCheck, UserMinus, UserX, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { PageHeader, ErrorState } from '@/components/ui/States'
import { Spinner } from '@/components/ui/Spinner'
import { useAsync } from '@/lib/useAsync'
import { getMetrics } from '@/lib/adminResources'

function Numero({
  icone: Icone,
  rotulo,
  valor,
  detalhe,
  destaque,
}: {
  icone: LucideIcon
  rotulo: string
  valor: number
  detalhe?: string
  destaque?: boolean
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2 text-slate-500">
        <Icone size={16} />
        <span className="text-sm font-medium">{rotulo}</span>
      </div>
      <p
        className={
          destaque
            ? 'mt-2 text-3xl font-semibold tracking-tight text-match-700'
            : 'mt-2 text-3xl font-semibold tracking-tight text-navy-900'
        }
      >
        {valor.toLocaleString('pt-BR')}
      </p>
      {detalhe && <p className="mt-1 text-sm text-slate-500">{detalhe}</p>}
    </div>
  )
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="mt-8 first:mt-0">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{titulo}</h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
    </section>
  )
}

export default function DashboardPage() {
  const { data, loading, error } = useAsync(getMetrics)

  if (loading) {
    return (
      <div className="grid place-items-center py-20">
        <Spinner />
      </div>
    )
  }

  if (error || !data) {
    return <ErrorState message="Não foi possível carregar os números." />
  }

  return (
    <>
      <PageHeader
        title="Visão geral"
        subtitle="Números do Redist agora. Atualiza a cada visita — não há cache."
      />

      <Secao titulo="Pessoas">
        <Numero icone={UserCheck} rotulo="Usuários ativos" valor={data.usuarios.ativos} />
        <Numero
          icone={Users}
          rotulo="Novos em 30 dias"
          valor={data.usuarios.novos_30_dias}
          detalhe="Cadastros recentes"
        />
        <Numero
          icone={UserMinus}
          rotulo="Suspensos"
          valor={data.usuarios.suspensos}
          detalhe="Bloqueados pelo painel"
        />
        <Numero
          icone={UserX}
          rotulo="Contas excluídas"
          valor={data.usuarios.excluidos}
          detalhe="Anonimizadas pelo próprio usuário"
        />
      </Secao>

      <Secao titulo="Permutas">
        <Numero
          icone={Repeat2}
          rotulo="Intenções ativas"
          valor={data.intencoes.ativas}
          detalhe={`${data.intencoes.total.toLocaleString('pt-BR')} no total`}
        />
        <Numero
          icone={HeartHandshake}
          rotulo="Matches"
          valor={data.matches.total}
          detalhe={`${data.matches.novos_30_dias.toLocaleString('pt-BR')} nos últimos 30 dias`}
          destaque
        />
        <Numero
          icone={HeartHandshake}
          rotulo="Aguardando aviso"
          valor={data.matches.pendentes_notificacao}
          detalhe="E-mail ainda não enviado"
        />
        <Numero icone={Building2} rotulo="Instituições" valor={data.instituicoes} />
      </Secao>

      <Secao titulo="Moderação">
        <Numero icone={Flag} rotulo="Feedbacks recebidos" valor={data.denuncias.feedbacks} />
        <Numero icone={Flag} rotulo="Denúncias de usuário" valor={data.denuncias.usuarios} />
        <Numero icone={UserCheck} rotulo="Administradores" valor={data.usuarios.admins} />
      </Secao>

      <p className="mt-8 text-sm text-slate-500">
        Para agir sobre esses números, use{' '}
        <Link to="/admin/usuarios" className="font-medium text-brand-700 hover:underline">
          Usuários
        </Link>{' '}
        e{' '}
        <Link to="/admin/denuncias" className="font-medium text-brand-700 hover:underline">
          Denúncias
        </Link>
        .
      </p>
    </>
  )
}
