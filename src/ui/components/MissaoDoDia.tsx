import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { getAllGoals, getDailyRecord, saveMission, setMissionGoal } from '../../data/db'
import { todayKey, type Goal } from '../../domain/types'
import { estiloSelect } from '../design/Primitivas'
import { IconeAlvo } from '../design/Icone'

export function MissaoDoDia() {
  const date = todayKey()
  const record = useLiveQuery(() => getDailyRecord(date), [date])
  const goals = useLiveQuery(() => getAllGoals(), [])

  const [texto, setTexto] = useState('')
  const [editando, setEditando] = useState(false)

  // Sincroniza o rascunho local com o que veio do banco (enquanto não editando).
  useEffect(() => {
    if (record && !editando) setTexto(record.mission)
  }, [record, editando])

  if (!record || !goals) return null // ainda carregando

  const definida = record.mission.trim().length > 0

  async function salvar() {
    await saveMission(date, texto.trim())
    setEditando(false)
  }

  function cancelar() {
    setTexto(record?.mission ?? '')
    setEditando(false)
  }

  // A missão é a frase central do dia: fala na voz serifada, não em campo de formulário.
  const editor =
    editando || !definida ? (
      <input
        autoFocus={editando}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onFocus={() => setEditando(true)}
        onBlur={salvar}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur()
          if (e.key === 'Escape') cancelar()
        }}
        placeholder="O que eu vou construir hoje?"
        className="w-full rounded-cartao border border-linha bg-humus px-4 py-4 font-voz text-lg text-areia outline-none transition-colors placeholder:text-pedra/60 focus:border-pedra/70"
      />
    ) : (
      <button
        type="button"
        onClick={() => setEditando(true)}
        className="rounded-cartao border border-linha bg-humus px-4 py-4 text-left font-voz text-lg leading-snug text-areia transition-colors hover:border-pedra/50"
      >
        {record.mission}
      </button>
    )

  return (
    <div className="flex flex-col gap-2">
      {editor}
      <SeletorMetaMissao date={date} goalId={record.goalId} goals={goals} />
    </div>
  )
}

/** Liga a missão de hoje a uma meta. Some se não há metas elegíveis. */
function SeletorMetaMissao({
  date,
  goalId,
  goals,
}: {
  date: string
  goalId?: string | null
  goals: Goal[]
}) {
  // Metas pendentes + a já vinculada (mesmo se concluída, para não sumir).
  const opcoes = goals.filter((g) => !g.done || g.id === goalId)
  if (opcoes.length === 0) return null
  return (
    <label className="flex items-center gap-2 px-1 text-xs text-pedra">
      <span className="flex items-center gap-1.5">
        <IconeAlvo tamanho={13} />
        meta
      </span>
      <select
        value={goalId ?? ''}
        onChange={(e) => setMissionGoal(date, e.target.value || null)}
        className={`flex-1 ${estiloSelect}`}
      >
        <option value="">—</option>
        {opcoes.map((goal) => (
          <option key={goal.id} value={goal.id}>
            {goal.title}
          </option>
        ))}
      </select>
    </label>
  )
}
