/**
 * Primitivas do Design System — classes e componentes base que as telas consomem.
 * Toda tela deve compor a partir daqui; nada de cinzas neutros avulsos.
 */

/** Superfície padrão: card sobre o solo. */
export const estiloCartao =
  'rounded-cartao border border-linha bg-humus px-4 py-3'

/** Campo de texto / textarea. */
export const estiloCampo =
  'w-full rounded-cartao border border-linha bg-humus px-4 py-3.5 text-[15px] text-areia outline-none transition-colors placeholder:text-pedra/60 focus:border-pedra/70'

/** Select compacto (metadados). */
export const estiloSelect =
  'rounded-lg border border-linha bg-humus px-2 py-1.5 text-xs text-pedra outline-none transition-colors focus:border-pedra/70'

/** Rótulo de seção — sentence case, quieto. */
export const estiloRotuloSecao = 'text-[13px] font-medium text-pedra'

/** Ação principal do contexto — pílula em brasa. */
export function BotaoAcao({
  onClick,
  children,
}: {
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-brasa/40 bg-brasa/10 px-4 py-2 text-xs font-semibold text-brasa transition-colors hover:border-brasa/70 hover:bg-brasa/15"
    >
      {children}
    </button>
  )
}

/** Ação discreta — sem cor de acento. */
export function BotaoQuieto({
  onClick,
  children,
}: {
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-linha px-3 py-1.5 text-xs font-medium text-pedra transition-colors hover:border-pedra/60 hover:text-areia"
    >
      {children}
    </button>
  )
}

/** Botão de excluir item — presente, mas nunca gritando. */
export function BotaoExcluir({
  onClick,
  rotulo,
}: {
  onClick: () => void
  rotulo: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={rotulo}
      className="shrink-0 p-0.5 text-pedra/50 transition-colors hover:text-areia"
    >
      <svg
        width={14}
        height={14}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M6 6l12 12M18 6L6 18" />
      </svg>
    </button>
  )
}

/** Estado vazio — um convite, não um aviso. */
export function EstadoVazio({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-cartao border border-dashed border-linha px-4 py-7 text-center font-voz text-sm italic leading-relaxed text-pedra">
      {children}
    </p>
  )
}

/**
 * Janela do Sistema — o registro etéreo, reservado para quando o Sistema
 * reconhece algo: dia fechado, marcos de sequência. Frio e raro, em
 * contraste com a terra quente do dia a dia. Usar no máximo uma vez por tela.
 */
export function JanelaSistema({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-cartao border border-sistema/25 bg-sistema/5 ${className}`}
    >
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sistema/60 to-transparent"
      />
      {children}
    </div>
  )
}
