import { cn } from '@/lib/cn'

type LogoProps = {
  /** "dark" = wordmark navy (fundo claro); "light" = wordmark branco (fundo escuro). */
  tone?: 'dark' | 'light'
  className?: string
  showWordmark?: boolean
}

/**
 * Marca do Redist: um selo com duas setas de permuta + wordmark.
 * O selo mantém as cores da marca em qualquer fundo; só o texto muda de tom.
 */
export function Logo({ tone = 'dark', className, showWordmark = true }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span
        aria-hidden="true"
        className="grid size-9 place-items-center rounded-xl bg-brand-600 text-white"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 9h11l-2.5-2.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M20 15H9l2.5 2.5"
            stroke="#90dabc"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {showWordmark && (
        <span
          className={cn(
            'text-[1.35rem] font-semibold tracking-tight',
            tone === 'light' ? 'text-white' : 'text-navy-900',
          )}
        >
          Redist
        </span>
      )}
    </span>
  )
}
