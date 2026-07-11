import { Plus } from 'lucide-react'
import { Container } from '@/components/ui/Container'

const faqs = [
  {
    q: 'O que é permuta e redistribuição?',
    a: 'É a troca de lotação entre servidores públicos: dois profissionais de instituições diferentes trocam de local de trabalho, respeitando cargo e requisitos. O Redist encontra pares recíprocos para essa troca.',
  },
  {
    q: 'Quem pode usar o Redist?',
    a: 'No momento, servidores de universidades e institutos federais. A ideia é expandir para outros órgãos e carreiras do serviço público ao longo do tempo.',
  },
  {
    q: 'Como o match é calculado?',
    a: 'Cruzamos intenções recíprocas — quando você quer ir para onde a outra pessoa está e vice-versa — e calculamos um score de compatibilidade considerando instituição, cidade, área de conhecimento e código CBO.',
  },
  {
    q: 'Meus dados ficam públicos?',
    a: 'Não. Você controla suas intenções e seus dados não ficam expostos publicamente. O contato só faz sentido quando há um match compatível entre as duas partes.',
  },
  {
    q: 'Quanto custa?',
    a: 'Dá para usar de graça com uma intenção ativa. O plano Premium libera até três intenções simultâneas e amplia suas chances de encontrar a troca ideal.',
  },
]

export function Faq() {
  return (
    <section id="perguntas" className="bg-white py-20 lg:py-28">
      <Container className="max-w-3xl">
        <div className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-navy-900 sm:text-4xl">
            Perguntas frequentes
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            O essencial para entender como o Redist funciona.
          </p>
        </div>

        <div className="mt-12 flex flex-col gap-3">
          {faqs.map((item) => (
            <details
              key={item.q}
              className="group rounded-xl border border-slate-200 bg-white px-5 open:border-brand-200"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-[1.05rem] font-medium text-navy-900 [&::-webkit-details-marker]:hidden">
                {item.q}
                <Plus
                  size={20}
                  className="shrink-0 text-brand-600 transition-transform group-open:rotate-45"
                />
              </summary>
              <p className="pb-5 leading-relaxed text-slate-600">{item.a}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  )
}
