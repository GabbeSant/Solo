import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { addRoutineBlock, deleteRoutineBlock, getAllRoutineBlocks } from '../../data/db'
import { todayKey, WEEKDAY_LABELS, weekdayOf, type RoutineBlock } from '../../domain/types'
import {
  BotaoAcao,
  BotaoExcluir,
  EstadoVazio,
  estiloCampo,
  estiloRotuloSecao,
  estiloSelect,
} from '../design/Primitivas'

/** Campo de horário: irmão do estiloSelect, com dígitos tabulares e picker escuro. */
const estiloHora =
  'rounded-lg border border-linha bg-humus px-2 py-1.5 text-xs tabular-nums text-areia outline-none transition-colors focus:border-pedra/70 [color-scheme:dark]'

export function Rotina() {
  const blocks = useLiveQuery(() => getAllRoutineBlocks(), [])
  if (!blocks) return null
  const hoje = weekdayOf(todayKey())

  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col gap-9 px-5 pb-28 pt-12 text-areia lg:max-w-2xl lg:pb-12 lg:pt-16">
      <header className="flex flex-col gap-1">
        <p className="text-sm font-medium text-pedra">A estrutura da sua semana</p>
        <h1 className="font-voz text-[28px] font-medium tracking-tight">Rotina</h1>
      </header>

      <FormNovoBloco />

      {blocks.length === 0 ? (
        <EstadoVazio>
          Sua semana ainda não tem estrutura. Comece pelo que já é fixo — aula, trabalho,
          sono — e a janela livre aparece sozinha.
        </EstadoVazio>
      ) : (
        <div className="flex flex-col gap-7">
          {WEEKDAY_LABELS.map((rotulo, dia) => (
            <DiaDaRotina
              key={rotulo}
              rotulo={rotulo}
              blocos={blocks.filter((b) => b.weekday === dia)}
              ehHoje={dia === hoje}
            />
          ))}
        </div>
      )}
    </main>
  )
}

function FormNovoBloco() {
  const [dia, setDia] = useState(() => weekdayOf(todayKey()))
  const [inicio, setInicio] = useState('')
  const [fim, setFim] = useState('')
  const [atividade, setAtividade] = useState('')
  const valido = atividade.trim().length > 0 && inicio !== '' && fim !== '' && inicio < fim

  const adicionar = async () => {
    if (!valido) return
    await addRoutineBlock(dia, inicio, fim, atividade)
    setAtividade('')
    // Encadeia: o próximo bloco costuma começar onde este terminou.
    setInicio(fim)
    setFim('')
  }

  return (
    <div className="flex flex-col gap-2.5">
      <input
        value={atividade}
        onChange={(e) => setAtividade(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') adicionar()
        }}
        placeholder="O que acontece nesse horário?"
        className={estiloCampo}
      />
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={dia}
          onChange={(e) => setDia(Number(e.target.value))}
          className={estiloSelect}
          aria-label="Dia da semana"
        >
          {WEEKDAY_LABELS.map((rotulo, i) => (
            <option key={rotulo} value={i}>
              {rotulo}
            </option>
          ))}
        </select>
        <input
          type="time"
          value={inicio}
          onChange={(e) => setInicio(e.target.value)}
          className={estiloHora}
          aria-label="Início"
        />
        <span className="text-xs text-pedra/60">até</span>
        <input
          type="time"
          value={fim}
          onChange={(e) => setFim(e.target.value)}
          className={estiloHora}
          aria-label="Fim"
        />
        <span className="ml-auto">
          <BotaoAcao onClick={adicionar}>Adicionar bloco</BotaoAcao>
        </span>
      </div>
    </div>
  )
}

function DiaDaRotina({
  rotulo,
  blocos,
  ehHoje,
}: {
  rotulo: string
  blocos: RoutineBlock[]
  ehHoje: boolean
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className={estiloRotuloSecao}>
        {rotulo}
        {/* Âncora de "agora", como a célula de hoje no heatmap — posição, não status. */}
        {ehHoje && <span className="ml-2 text-[11px] font-normal text-pedra/60">· hoje</span>}
      </h2>
      {blocos.length === 0 ? (
        <p className="rounded-cartao border border-dashed border-linha/70 px-4 py-2.5 text-xs text-pedra/50">
          Sem blocos.
        </p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {blocos.map((b) => (
            <li
              key={b.id}
              className="flex items-center gap-3 rounded-cartao border border-linha bg-humus px-4 py-2.5 text-sm"
            >
              <span className="shrink-0 text-xs tabular-nums text-pedra">
                {b.start}–{b.end}
              </span>
              <span className="min-w-0 flex-1 text-areia">{b.activity}</span>
              <BotaoExcluir onClick={() => deleteRoutineBlock(b.id)} rotulo="Excluir bloco" />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
