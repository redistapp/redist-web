import { Link } from 'react-router-dom'
import { Container } from '@/components/ui/Container'
import { Logo } from '@/components/Logo'

const columns = [
  {
    title: 'Produto',
    links: [
      { href: '#como-funciona', label: 'Como funciona' },
      { href: '#recursos', label: 'Recursos' },
      { href: '#planos', label: 'Planos' },
      { href: '#perguntas', label: 'Perguntas' },
    ],
  },
  {
    title: 'Conta',
    links: [
      { href: '/login', label: 'Entrar' },
      { href: '/cadastro', label: 'Criar conta' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <Container className="py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-[0.95rem] leading-relaxed text-slate-600">
              Permuta e redistribuição de servidores públicos, sem burocracia.
              Cadastre sua intenção e receba matches recíprocos automaticamente.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-navy-900">{col.title}</h3>
              <ul className="mt-4 flex flex-col gap-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    {l.href.startsWith('/') ? (
                      <Link
                        to={l.href}
                        className="text-[0.95rem] text-slate-600 transition-colors hover:text-brand-700"
                      >
                        {l.label}
                      </Link>
                    ) : (
                      <a
                        href={l.href}
                        className="text-[0.95rem] text-slate-600 transition-colors hover:text-brand-700"
                      >
                        {l.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-slate-200 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Redist. Todos os direitos reservados.</p>
          <p>Feito para servidores públicos do Brasil.</p>
        </div>
      </Container>
    </footer>
  )
}
