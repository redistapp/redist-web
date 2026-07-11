import {
  Sparkles,
  MapPin,
  Mail,
  Lock,
  ShieldAlert,
  Gauge,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Container } from '@/components/ui/Container'

const features: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: Sparkles,
    title: 'Match recíproco inteligente',
    text: 'Cruzamos por instituição, cidade, área de conhecimento e código CBO — com um score de compatibilidade.',
  },
  {
    icon: MapPin,
    title: 'Cobertura nacional',
    text: 'Universidades e institutos federais de todos os estados, com dados oficiais de cidades e instituições.',
  },
  {
    icon: Mail,
    title: 'Aviso automático',
    text: 'Assim que surge uma permuta compatível, você recebe uma notificação por e-mail. Sem ficar checando.',
  },
  {
    icon: Lock,
    title: 'Privacidade e controle',
    text: 'Você decide o que compartilhar e para onde quer ir. Seus dados não ficam expostos publicamente.',
  },
  {
    icon: ShieldAlert,
    title: 'Comunidade segura',
    text: 'Ferramentas de denúncia e moderação para manter as interações confiáveis e respeitosas.',
  },
  {
    icon: Gauge,
    title: 'Simples e rápido',
    text: 'Uma interface direta, feita para resolver: cadastrar, encontrar e combinar a sua permuta.',
  },
]

export function Features() {
  return (
    <section id="recursos" className="bg-white py-20 lg:py-28">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-navy-900 sm:text-4xl">
            Tudo o que você precisa para permutar
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Pensado para o dia a dia de quem trabalha no serviço público.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-slate-200 bg-white p-7 transition-colors hover:border-brand-200"
            >
              <span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <f.icon size={22} />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-navy-900">{f.title}</h3>
              <p className="mt-2 leading-relaxed text-slate-600">{f.text}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
