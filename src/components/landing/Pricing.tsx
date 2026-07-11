import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { buttonClasses } from '@/components/ui/Button'
import { cn } from '@/lib/cn'

type Plan = {
  name: string
  price: string
  period?: string
  description: string
  features: string[]
  cta: string
  featured?: boolean
}

const plans: Plan[] = [
  {
    name: 'Gratuito',
    price: 'R$ 0',
    description: 'Para começar a procurar sua permuta agora mesmo.',
    features: [
      '1 intenção de permuta ativa',
      'Match recíproco automático',
      'Aviso de match por e-mail',
      'Perfil profissional completo',
    ],
    cta: 'Criar conta grátis',
  },
  {
    name: 'Premium',
    price: 'R$ 19,90',
    period: '/mês',
    description: 'Para quem quer ampliar as chances de encontrar a troca ideal.',
    features: [
      'Até 3 intenções simultâneas',
      'Tudo do plano gratuito',
      'Mais alcance de compatibilidade',
      'Prioridade no suporte',
    ],
    cta: 'Assinar Premium',
    featured: true,
  },
]

export function Pricing() {
  return (
    <section id="planos" className="bg-slate-50 py-20 lg:py-28">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-navy-900 sm:text-4xl">
            Planos simples
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Comece de graça. Faça upgrade quando quiser mais intenções ativas.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-4xl gap-6 md:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                'flex flex-col rounded-2xl bg-white p-8',
                plan.featured
                  ? 'border-2 border-match-600 shadow-lg shadow-match-600/10'
                  : 'border border-slate-200',
              )}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-navy-900">{plan.name}</h3>
                {plan.featured && (
                  <span className="rounded-full bg-match-50 px-3 py-1 text-xs font-semibold text-match-700">
                    Mais popular
                  </span>
                )}
              </div>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-semibold tracking-tight text-navy-900">
                  {plan.price}
                </span>
                {plan.period && <span className="text-slate-500">{plan.period}</span>}
              </div>
              <p className="mt-3 text-slate-600">{plan.description}</p>

              <ul className="mt-6 flex flex-1 flex-col gap-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[0.95rem] text-slate-700">
                    <Check size={20} className="mt-0.5 shrink-0 text-match-600" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                to="/cadastro"
                className={cn(
                  'mt-8',
                  buttonClasses(plan.featured ? 'match' : 'secondary', 'lg', 'w-full'),
                )}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Valores de exemplo — a definir antes do lançamento.
        </p>
      </Container>
    </section>
  )
}
