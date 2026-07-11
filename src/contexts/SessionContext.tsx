import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { SessionUser } from '@/lib/api'
import { loginRequest, logoutRequest, meRequest } from '@/lib/api'

type Status = 'loading' | 'authed' | 'guest'

type SessionValue = {
  user: SessionUser | null
  status: Status
  login: (cpf: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const SessionContext = createContext<SessionValue | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [status, setStatus] = useState<Status>('loading')

  useEffect(() => {
    let active = true
    meRequest()
      .then((u) => {
        if (!active) return
        setUser(u)
        setStatus(u ? 'authed' : 'guest')
      })
      .catch(() => active && setStatus('guest'))
    return () => {
      active = false
    }
  }, [])

  const login = async (cpf: string, password: string) => {
    const u = await loginRequest(cpf, password)
    setUser(u)
    setStatus('authed')
  }

  const logout = async () => {
    await logoutRequest()
    setUser(null)
    setStatus('guest')
  }

  return (
    <SessionContext.Provider value={{ user, status, login, logout }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession(): SessionValue {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession precisa estar dentro de <SessionProvider>')
  return ctx
}
