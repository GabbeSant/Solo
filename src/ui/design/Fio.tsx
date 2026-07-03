import { estiloRotuloSecao } from './Primitivas'

/**
 * O Fio — a assinatura visual do Solo: a linha que conecta as coisas no tempo.
 * Na tela Hoje liga manhã → noite; na tela Metas liga identidade → caminho.
 * O nó acende em verde quando o trecho recebe um registro; a linha até o
 * próximo trecho acompanha, tornando o avanço visível sem barra de progresso.
 */
export function TrechoDoFio({
  rotulo,
  aceso,
  ultimo = false,
  children,
}: {
  rotulo: string
  aceso: boolean
  ultimo?: boolean
  children: React.ReactNode
}) {
  return (
    <section className="flex gap-4">
      <div aria-hidden="true" className="flex w-2.5 shrink-0 flex-col items-center pt-1">
        <span
          className={`h-2.5 w-2.5 shrink-0 rounded-full border transition-colors duration-500 ${
            aceso
              ? 'border-broto bg-broto shadow-[0_0_8px_rgba(157,184,122,0.5)]'
              : 'border-linha bg-humus'
          }`}
        />
        {!ultimo && (
          <span
            className={`w-px flex-1 transition-colors duration-500 ${
              aceso ? 'bg-broto/40' : 'bg-linha'
            }`}
          />
        )}
      </div>
      <div className={`flex min-w-0 flex-1 flex-col gap-3 ${ultimo ? '' : 'pb-9'}`}>
        <h2 className={`${estiloRotuloSecao} leading-none`}>{rotulo}</h2>
        {children}
      </div>
    </section>
  )
}
