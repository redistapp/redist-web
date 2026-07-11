import { useNavigate } from 'react-router-dom'
import { LogOut, Sparkles } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/Button'
import { useSession } from '@/contexts/SessionContext'

export default function PainelPage() {
  const { user, logout } = useSession()
  const navigate = useNavigate()

  const firstName = user?.profile?.first_name
  const greeting = firstName ? `Olá, ${firstName}` : 'Olá'

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <Container>
          <div className="flex h-16 items-center justify-between">
            <Logo />
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut size={16} />
              Sair
            </Button>
          </div>
        </Container>
      </header>

      <Container className="py-16">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-tight text-navy-900">{greeting}</h1>
          <p className="mt-2 text-slate-600">
            Você está autenticado com segurança. Esta é a base da sua área logada —
            aqui vão entrar suas intenções de permuta, seus matches e seu perfil.
          </p>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-7">
            <span className="grid size-11 place-items-center rounded-xl bg-match-50 text-match-600">
              <Sparkles size={22} />
            </span>
            <h2 className="mt-5 text-lg font-semibold text-navy-900">Em construção</h2>
            <p className="mt-2 leading-relaxed text-slate-600">
              O dashboard com intenções e matches é o próximo passo. Sua sessão já
              funciona ponta a ponta: o token fica num cookie protegido e o app
              conversa com a API sem expor segredos.
            </p>
          </div>
        </div>
      </Container>
    </div>
  )
}
