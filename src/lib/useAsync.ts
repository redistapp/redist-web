import { useCallback, useEffect, useState } from 'react'

/**
 * Carrega dados de uma função assíncrona, com loading/erro e um `reload`.
 * Passe uma função estável (módulo ou useCallback) para evitar recargas em loop.
 */
export function useAsync<T>(fn: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(() => {
    let active = true
    setLoading(true)
    setError(null)
    fn()
      .then((d) => {
        if (active) setData(d)
      })
      .catch((e: unknown) => {
        if (active) setError(e instanceof Error ? e.message : 'Erro ao carregar.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [fn])

  useEffect(() => run(), [run])

  return { data, loading, error, reload: run }
}
