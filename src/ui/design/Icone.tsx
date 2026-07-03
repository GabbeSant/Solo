/**
 * Ícones do Design System — traço fino, 24×24, herdam cor via currentColor.
 * Substituem os emojis: consistência visual e controle de cor pelos tokens.
 */

type IconeProps = {
  /** Tamanho em px (largura = altura). Padrão 16. */
  tamanho?: number
  className?: string
}

function Svg({
  tamanho = 16,
  className,
  children,
}: IconeProps & { children: React.ReactNode }) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  )
}

/** Sol — a manhã, a tela Hoje. */
export function IconeSol(p: IconeProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </Svg>
  )
}

/** Broto — crescimento: progresso, habilidades. */
export function IconeBroto(p: IconeProps) {
  return (
    <Svg {...p}>
      <path d="M12 21v-8" />
      <path d="M12 13C12 9.7 9.3 7 6 7c0 3.3 2.7 6 6 6z" />
      <path d="M12 13c0-2.5 2-4.5 4.5-4.5 0 2.5-2 4.5-4.5 4.5z" />
    </Svg>
  )
}

/** Alvo — metas, direção. */
export function IconeAlvo(p: IconeProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="0.75" fill="currentColor" />
    </Svg>
  )
}

/** Chama — a brasa da consistência: streaks. */
export function IconeChama(p: IconeProps) {
  return (
    <Svg {...p}>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </Svg>
  )
}

/** Lua — o ritual da noite. */
export function IconeLua(p: IconeProps) {
  return (
    <Svg {...p}>
      <path d="M20.8 13.2A8.5 8.5 0 1 1 10.8 3.2a6.8 6.8 0 0 0 10 10z" />
    </Svg>
  )
}

/** Faísca — identidade, e a voz do Sistema. */
export function IconeFaisca(p: IconeProps) {
  return (
    <Svg {...p}>
      <path d="M12 3.5l1.9 5.6 5.6 1.9-5.6 1.9L12 18.5l-1.9-5.6-5.6-1.9 5.6-1.9z" />
    </Svg>
  )
}

/** Estrela — vitórias registradas. */
export function IconeEstrela(p: IconeProps) {
  return (
    <Svg {...p}>
      <path d="M12 3.8l2.5 5 5.5.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.5-.8z" />
    </Svg>
  )
}

/** Calendário — prazos e datas. */
export function IconeCalendario(p: IconeProps) {
  return (
    <Svg {...p}>
      <rect x="4" y="5" width="16" height="16" rx="2.5" />
      <path d="M8 3v4M16 3v4M4 10h16" />
    </Svg>
  )
}

/** Check — feito. */
export function IconeCheck(p: IconeProps) {
  return (
    <Svg {...p}>
      <path d="M5 12.5l4.5 4.5L19 7" />
    </Svg>
  )
}

/** X — remover. */
export function IconeX(p: IconeProps) {
  return (
    <Svg {...p}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Svg>
  )
}

/** Ramo — pertencimento na hierarquia (sub-meta → meta). */
export function IconeRamo(p: IconeProps) {
  return (
    <Svg {...p}>
      <path d="M6 4v9a4 4 0 0 0 4 4h8" />
      <path d="M15 13l4 4-4 4" />
    </Svg>
  )
}
