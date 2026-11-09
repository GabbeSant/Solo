import { useEffect, useRef, useState } from 'react'
import { IconeCheck, IconeBroto } from '../design/Icone'
import type { IconeAlvo } from '../design/Icone'

export interface ParadaDaJornada {
  id: string
  nome: string
  feito: boolean
  Icone: typeof IconeAlvo
}

const CAPITULOS = ['Vale dos primeiros passos', 'Bosque das descobertas', 'Travessia das cascatas', 'Caminho das alturas']
const MARCOS_DESCOBERTA = [0, 3, 7, 14]
const CONVITES = ['Escolher minha missão', 'Ir para meus hábitos', 'Guardar uma vitória', 'Fechar meu dia']
const DESCRICOES_PARADAS = ['Defina seu foco', 'Coloque o dia em movimento', 'Guarde uma conquista', 'Reflita sobre o dia']
const RESPOSTAS = ['Missão definida. Seu caminho ganhou uma direção.', 'Passo dado! Você colocou seu dia em movimento.', 'Conquista guardada. Ela faz parte da sua história.', 'Acampamento aceso. Seu dia ficou registrado.']

function irParaParada(id: string) {
  const section = document.getElementById(id)
  const movimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
  section?.scrollIntoView({ behavior: movimento, block: 'start' })
  const destino = section?.querySelector<HTMLElement>(id === 'missao' ? 'input, button' : 'h2')
  destino?.focus({ preventScroll: true })
}

/** O percurso indica registros e sugere uma próxima ação, sem bloquear outras paradas. */
export function JornadaDoDia({ paradas, diasExplorados, date }: {
  paradas: ParadaDaJornada[]
  diasExplorados: number
  date: string
}) {
  const anterior = useRef({ date, feitos: paradas.map((p) => p.feito) })
  const [resposta, setResposta] = useState('')
  const assinatura = paradas.map((p) => p.feito ? '1' : '0').join('')
  useEffect(() => {
    const feitos = assinatura.split('').map((s) => s === '1')
    const novo = anterior.current.date === date
      ? feitos.findIndex((feito, i) => feito && !anterior.current.feitos[i])
      : -1
    anterior.current = { date, feitos }
    if (novo === -1) {
      setResposta('')
      return
    }
    setResposta(RESPOSTAS[novo])
    const timer = window.setTimeout(() => setResposta(''), 5000)
    return () => window.clearTimeout(timer)
  }, [assinatura, date])

  const concluidas = paradas.filter((p) => p.feito).length
  const proxima = paradas.findIndex((p) => !p.feito)
  const capitulo = MARCOS_DESCOBERTA.filter((marco) => diasExplorados >= marco).length - 1
  const ultimoCapitulo = capitulo === CAPITULOS.length - 1
  const tamanhoTrecho = ultimoCapitulo ? 7 : MARCOS_DESCOBERTA[capitulo + 1] - MARCOS_DESCOBERTA[capitulo]
  const diasNesteTrecho = ultimoCapitulo ? tamanhoTrecho : diasExplorados - MARCOS_DESCOBERTA[capitulo]
  const faltam = tamanhoTrecho - diasNesteTrecho

  return (
    <section className="journey-world" aria-labelledby="journey-world-title">
      <div className="journey-route">
        <header className="journey-route-heading">
          <h2 id="journey-world-title">Seu caminho hoje</h2>
          <p className="journey-route-count">
            <strong>{concluidas} de {paradas.length}</strong>
            <span>paradas registradas</span>
          </p>
        </header>
        <ol className="journey-map" aria-label="Paradas do dia">
          {paradas.map(({ id, nome, feito, Icone }, i) => (
            <li key={id} className={`journey-pin ${feito ? 'is-done' : ''} ${i === proxima ? 'is-next' : ''}`}>
              <button
                type="button"
                onClick={() => irParaParada(id)}
                aria-label={`${nome}: ${feito ? 'registrado' : 'pendente'}. Ir para ${nome.toLowerCase()}.`}
                aria-describedby={i === proxima ? 'journey-next-description' : undefined}
              >
                <span className="journey-pin-symbol" aria-hidden="true">
                  {feito ? <IconeCheck tamanho={22} /> : <Icone tamanho={22} />}
                </span>
                <span className="journey-pin-copy">
                  <span className="journey-pin-name">{nome}</span>
                  <span className="journey-pin-detail">
                    {feito ? 'Registrado' : DESCRICOES_PARADAS[i]}
                  </span>
                </span>
                {i === proxima && <span className="journey-pin-current">{concluidas === 0 ? 'Comece aqui' : 'Próximo passo'}</span>}
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div className="journey-world-footer">
        <div className="journey-invitation">
          <h3>{proxima === -1 ? 'Seu dia ficou registrado.' : concluidas === 0 ? 'Comece por uma coisa possível.' : 'Você já saiu do lugar.'}</h3>
          <p id="journey-next-description">{proxima === -1 ? 'Suas quatro paradas estão completas. Você pode editar qualquer registro.' : 'Siga para a próxima parada ou escolha outra. O ritmo é seu.'}</p>
        </div>
        <button type="button" className="journey-primary" onClick={() => irParaParada(proxima === -1 ? 'vitorias' : paradas[proxima].id)}>
          {proxima === -1 ? 'Ver minhas conquistas' : CONVITES[proxima]}
        </button>
      </div>

      <div className="journey-history">
        <div className="journey-history-overview">
          <div className="journey-history-label"><IconeBroto tamanho={17} /><strong>{diasExplorados}</strong> {diasExplorados === 1 ? 'dia explorado' : 'dias explorados'}</div>
          <span className="journey-chapter-name">{CAPITULOS[capitulo]}</span>
          <small>Uma pausa não apaga o que você já construiu.</small>
        </div>
        <div className="journey-chapter-progress">
          <div className="journey-chapter-track" role="progressbar" aria-label={ultimoCapitulo ? 'Todos os capítulos alcançados' : `Progresso para ${CAPITULOS[capitulo + 1]}`} aria-valuemin={0} aria-valuemax={tamanhoTrecho} aria-valuenow={diasNesteTrecho}>
            {Array.from({ length: tamanhoTrecho }, (_, i) => <span key={i} className={i < diasNesteTrecho ? 'is-done' : ''} />)}
          </div>
          <p>{ultimoCapitulo ? 'Caminho das alturas alcançado. A jornada continua.' : `${faltam} ${faltam === 1 ? 'dia ativo até' : 'dias ativos até'} ${CAPITULOS[capitulo + 1]}.`}</p>
        </div>
      </div>
      <div className={`journey-feedback ${resposta ? 'is-visible' : ''}`} role="status" aria-live="polite" aria-atomic="true">
        {resposta && <><IconeCheck tamanho={18} /><span>{resposta}</span></>}
      </div>
    </section>
  )
}
