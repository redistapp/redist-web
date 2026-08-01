import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Building2, Flag, LogOut, ShieldCheck, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Logo } from '@/components/Logo'
import { useSession } from '@/contexts/SessionContext'
import { cn } from '@/lib/cn'

const nav: { to: string; label: string; icon: LucideIcon; end?: boolean }[] = [
  { to: '/admin/instituicoes', label: 'Instituições', icon: Building2, end: true },
  { to: '/admin/denuncias', label: 'Denúncias', icon: Flag },
  { to: '/admin/usuarios', label: 'Usuários', icon: Users },
]

/** Layout compartilhado do painel administrativo: nav + logout + <Outlet/>. */
export function AdminShell() {
  const { logout } = useSession()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <Container>
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Logo />
              <span className="flex items-center gap-1 rounded-full bg-navy-50 px-2.5 py-1 text-xs font-semibold text-navy-700">
                <ShieldCheck size={13} />
                Admin
              </span>
            </div>

            <nav className="flex items-center gap-1">
              {nav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-navy-900',
                    )
                  }
                >
                  <item.icon size={17} />
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-navy-900"
            >
              <LogOut size={17} />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </Container>
      </header>

      <main className="flex-1">
        <Container className="py-10">
          <Outlet />
        </Container>
      </main>
    </div>
  )
}
