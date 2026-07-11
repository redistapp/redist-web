import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { buttonClasses } from '@/components/ui/Button'

export function CtaBanner() {
  return (
    <section className="bg-white pb-20 lg:pb-28">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-navy-900 px-8 py-14 text-center sm:px-16 sm:py-20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-brand-500/20 blur-2xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-16 -left-16 size-64 rounded-full bg-match-500/20 blur-2xl"
          />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Pronto para encontrar sua permuta?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/70">
              Crie sua conta gratuita e cadastre sua primeira intenção hoje mesmo.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/cadastro" className={buttonClasses('match', 'lg')}>
                Criar conta grátis
                <ArrowRight size={18} />
              </Link>
              <Link to="/login" className={buttonClasses('onDark', 'lg')}>
                Já tenho conta
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
