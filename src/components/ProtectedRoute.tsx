import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useSession } from '@/contexts/SessionContext'

/** Redireciona para /login se não houver sessão. Mostra um estado de carregamento
 *  enquanto a sessão é restaurada (chamada a /auth/me). */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { status } = useSession()

  if (status === 'loading') {
    return (
      <div className="grid min-h-screen place-items-center text-slate-500">
        Carregando…
      </div>
    )
  }

  if (status === 'guest') {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
