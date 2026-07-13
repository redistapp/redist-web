import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ArrowLeftRight, Sparkles, User, Crown, LogOut, MessageCircleWarning } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Logo } from '@/components/Logo'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { ErrorState } from '@/components/ui/States'
import { useSession } from '@/contexts/SessionContext'
import { sendFeedback } from '@/lib/resources'
import { cn } from '@/lib/cn'

const nav: { to: string; label: string; icon: LucideIcon; end?: boolean }[] = [
  { to: '/painel', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/painel/intencoes', label: 'Intenções', icon: ArrowLeftRight },
  { to: '/painel/matches', label: 'Matches', icon: Sparkles },
  { to: '/painel/perfil', label: 'Perfil', icon: User },
  { to: '/painel/premium', label: 'Premium', icon: Crown },
]

function FeedbackModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function handleClose() {
    if (sending) return
    setText('')
    setError(null)
    setSuccess(false)
    onClose()
  }

  async function handleSend() {
    if (text.trim().length < 5) {
      setError('Descreva com um pouco mais de detalhe.')
      return
    }
    setSending(true)
    setError(null)
    try {
      await sendFeedback(text.trim())
      setSuccess(true)
      setText('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível enviar.')
    } finally {
      setSending(false)
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Reportar um problema">
      <div className="flex flex-col gap-4">
        {error && <ErrorState message={error} />}
        {success ? (
          <div className="rounded-lg border border-match-200 bg-match-50 px-4 py-3 text-sm text-match-700">
            Recebemos seu relato. Obrigado por ajudar a melhorar o Redist!
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="feedback-text" className="text-sm font-medium text-navy-900">
              O que aconteceu?
            </label>
            <textarea
              id="feedback-text"
              rows={5}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Descreva o problema ou sugestão…"
              className="rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-[0.95rem] text-navy-900 placeholder:text-slate-400 hover:border-slate-400 focus-visible:border-brand-600 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-600/40"
            />
          </div>
        )}
        <div className="mt-2 flex justify-end gap-2">
          <Button variant="secondary" onClick={handleClose}>
            {success ? 'Fechar' : 'Cancelar'}
          </Button>
          {!success && (
            <Button variant="match" onClick={handleSend} disabled={sending || text.trim().length < 5}>
              {sending ? 'Enviando…' : 'Enviar'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}

/** Layout compartilhado das páginas autenticadas: nav + logout + <Outlet/>. */
export function AppShell() {
  const { logout } = useSession()
  const navigate = useNavigate()
  const [feedbackOpen, setFeedbackOpen] = useState(false)

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <Container>
          <div className="flex h-16 items-center justify-between gap-4">
            <NavLink to="/painel" aria-label="Redist — dashboard">
              <Logo />
            </NavLink>

            <nav className="hidden items-center gap-1 md:flex">
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

          <nav className="flex items-center gap-1 overflow-x-auto pb-2 md:hidden">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-600 hover:bg-slate-100',
                  )
                }
              >
                <item.icon size={17} />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </Container>
      </header>

      <main className="flex-1">
        <Container className="py-10">
          <Outlet />
        </Container>
      </main>

      <footer className="border-t border-slate-200 bg-white py-4">
        <Container className="flex justify-center">
          <button
            type="button"
            onClick={() => setFeedbackOpen(true)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-navy-900"
          >
            <MessageCircleWarning size={16} />
            Reportar um problema
          </button>
        </Container>
      </footer>

      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </div>
  )
}
