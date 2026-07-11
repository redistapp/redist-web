import { Link } from 'react-router-dom'
import { ArrowLeftRight, ArrowRight, ShieldCheck } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { buttonClasses } from '@/components/ui/Button'

function MatchCard() {
  return (
    <div className="w-full max-w-md rounded-2xl bg-navy-900 p-6 text-white shadow-xl shadow-navy-900/20 ring-1 ring-white/10">
      <div className="flex items-center gap-2 text-sm font-medium text-match-200">
        <span className="size-2 rounded-full bg-match-500" />
        Permuta encontrada
      </div>

      <div className="mt-5 flex flex-col gap-3">
        <PersonRow
          initials="VC"
          name="Você"
          from="IFRS · Porto Alegre"
          to="quer ir para Florianópolis"
        />
        <div className="flex items-center justify-center">
          <span className="grid size-8 place-items-center rounded-full bg-white/10 text-match-200">
            <ArrowLeftRight size={16} />
          </span>
        </div>
        <PersonRow
          initials="AS"
          name="Ana S."
          from="IFSC · Florianópolis"
          to="quer ir para Porto Alegre"
        />
      </div>

      <div className="mt-6 rounded-xl bg-white/5 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/70">Compatibilidade</span>
          <span className="font-semibold text-match-200">92%</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-[92%] rounded-full bg-match-500" />
        </div>
      </div>
    </div>
  )
}

function PersonRow({
  initials,
  name,
  from,
  to,
}: {
  initials: string
  name: string
  from: string
  to: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-500/30 text-sm font-semibold text-white">
        {initials}
      </span>
      <div className="min-w-0">
        <p className="truncate text-[0.95rem] font-medium">
          {name} <span className="font-normal text-white/60">· {from}</span>
        </p>
        <p className="truncate text-sm text-white/60">{to}</p>
      </div>
    </div>
  )
}

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-brand-50/60 to-white">
      <Container className="grid items-center gap-14 py-16 lg:grid-cols-2 lg:py-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3.5 py-1.5 text-sm font-medium text-brand-700">
            <ShieldCheck size={16} />
            Permuta e redistribuição de servidores públicos
          </span>

          <h1 className="mt-6 text-4xl font-semibold leading-[1.08] tracking-tight text-navy-900 sm:text-5xl lg:text-[3.4rem]">
            Sua permuta,
            <br />
            <span className="text-brand-600">sem burocracia</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
            O Redist conecta servidores públicos que querem trocar de lotação.
            Cadastre para onde você quer ir e receba{' '}
            <span className="font-medium text-navy-900">matches recíprocos</span>{' '}
            automaticamente.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/cadastro" className={buttonClasses('match', 'lg')}>
              Criar conta grátis
              <ArrowRight size={18} />
            </Link>
            <a href="#como-funciona" className={buttonClasses('secondary', 'lg')}>
              Ver como funciona
            </a>
          </div>

          <p className="mt-6 text-sm text-slate-500">
            Servidores de universidades e institutos federais de todo o Brasil.
          </p>
        </div>

        <div className="flex justify-center lg:justify-end">
          <MatchCard />
        </div>
      </Container>
    </section>
  )
}
