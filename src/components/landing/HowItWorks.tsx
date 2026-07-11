import { UserPlus, MapPinned, BellRing } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Container } from '@/components/ui/Container'

const steps: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: UserPlus,
    title: 'Crie seu perfil',
    text: 'Informe seu cargo, instituição e área de atuação. Leva poucos minutos.',
  },
  {
    icon: MapPinned,
    title: 'Cadastre sua intenção',
    text: 'Diga para qual instituição ou cidade você quer ir. Você está no controle.',
  },
  {
    icon: BellRing,
    title: 'Receba seus matches',
    text: 'Cruzamos intenções recíprocas e avisamos você por e-mail quando há permuta.',
  },
]

export function HowItWorks() {
  return (
    <section id="como-funciona" className="bg-slate-50 py-20 lg:py-28">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-navy-900 sm:text-4xl">
            Como funciona
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Três passos para encontrar quem quer trocar exatamente na direção contrária à sua.
          </p>
        </div>

        <ol className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <li
              key={step.title}
              className="relative rounded-2xl border border-slate-200 bg-white p-7"
            >
              <span className="absolute right-6 top-6 text-5xl font-semibold text-slate-100">
                {i + 1}
              </span>
              <span className="grid size-12 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <step.icon size={24} />
              </span>
              <h3 className="mt-5 text-xl font-semibold text-navy-900">{step.title}</h3>
              <p className="mt-2 leading-relaxed text-slate-600">{step.text}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}
