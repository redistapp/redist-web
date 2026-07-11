import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Logo } from '@/components/Logo'
import { buttonClasses } from '@/components/ui/Button'
import { cn } from '@/lib/cn'

const links = [
  { href: '#como-funciona', label: 'Como funciona' },
  { href: '#recursos', label: 'Recursos' },
  { href: '#planos', label: 'Planos' },
  { href: '#perguntas', label: 'Perguntas' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <Container>
        <nav className="flex h-16 items-center justify-between gap-4">
          <Link to="/" aria-label="Redist — página inicial">
            <Logo />
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-navy-900"
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <Link to="/login" className={buttonClasses('ghost', 'sm')}>
              Entrar
            </Link>
            <Link to="/cadastro" className={buttonClasses('match', 'sm')}>
              Criar conta
            </Link>
          </div>

          <button
            type="button"
            className="grid size-10 place-items-center rounded-lg text-navy-900 hover:bg-slate-100 md:hidden"
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>
      </Container>

      <div className={cn('border-t border-slate-200 md:hidden', open ? 'block' : 'hidden')}>
        <Container className="flex flex-col gap-1 py-4">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2.5 text-[0.95rem] font-medium text-slate-700 hover:bg-slate-100"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <div className="mt-2 flex flex-col gap-2">
            <Link to="/login" className={buttonClasses('secondary', 'md')}>
              Entrar
            </Link>
            <Link to="/cadastro" className={buttonClasses('match', 'md')}>
              Criar conta
            </Link>
          </div>
        </Container>
      </div>
    </header>
  )
}
