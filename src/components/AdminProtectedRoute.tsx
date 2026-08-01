import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useSession } from '@/contexts/SessionContext'

/** Redireciona para /admin/login se não houver sessão de admin. Uma sessão de
 *  membro comum (não-admin) também é barrada — mesmo com cookie válido, o
 *  backend recusa as rotas /admin/*; aqui só evitamos mostrar a casca da
 *  tela antes de bater nesse erro. */
export function AdminProtectedRoute({ children }: { children: ReactNode }) {
  const { status, user } = useSession()

  if (status === 'loading') {
    return (
      <div className="grid min-h-screen place-items-center text-slate-500">
        Carregando…
      </div>
    )
  }

  if (status === 'guest' || !user?.is_admin) {
    return <Navigate to="/admin/login" replace />
  }

  return <>{children}</>
}
