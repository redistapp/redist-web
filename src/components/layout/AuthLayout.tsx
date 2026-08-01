import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { Logo } from '@/components/Logo'

const highlights = [
  'Match recíproco automático',
  'Cobertura nacional de instituições',
  'Aviso de permuta por e-mail',
]

/** Layout de duas colunas para login e cadastro: painel de marca + formulário. */
export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between bg-navy-900 p-12 text-white lg:flex">
        <Link to="/" aria-label="Redist — página inicial">
          <Logo tone="light" />
        </Link>
        <div>
          <h2 className="max-w-sm text-3xl font-semibold leading-tight tracking-tight">
            Encontre quem quer trocar exatamente com você.
          </h2>
          <ul className="mt-8 flex flex-col gap-3">
            {highlights.map((h) => (
              <li key={h} className="flex items-center gap-3 text-white/80">
                <span className="grid size-6 place-items-center rounded-full bg-match-500/20 text-match-200">
                  <Check size={15} />
                </span>
                {h}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-white/50">
          Permuta e redistribuição de servidores públicos.
        </p>
      </aside>

      <main className="flex flex-col justify-center px-5 py-12 sm:px-8">
        <div className="mx-auto w-full max-w-md">
          <div className="lg:hidden">
            <Link to="/" aria-label="Redist — página inicial">
              <Logo />
            </Link>
          </div>
          <h1 className="mt-8 text-2xl font-semibold tracking-tight text-navy-900 lg:mt-0">
            {title}
          </h1>
          <p className="mt-2 text-slate-600">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-8 text-center text-[0.95rem] text-slate-600">{footer}</div>
        </div>
      </main>
    </div>
  )
}
