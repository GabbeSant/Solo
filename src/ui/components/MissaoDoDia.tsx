import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { getAllGoals, getDailyRecord, saveMission, setMissionGoal } from '../../data/db'
import { todayKey, type Goal } from '../../domain/types'

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
        className="w-full rounded-xl border border-neutral-800 bg-neutral-900/40 px-4 py-4 text-sm text-neutral-100 outline-none placeholder:text-neutral-600 focus:border-neutral-600"
      />
    ) : (
      <button
        type="button"
        onClick={() => setEditando(true)}
        className="rounded-xl border border-neutral-800 bg-neutral-900/40 px-4 py-4 text-left text-sm text-neutral-100 transition-colors hover:border-neutral-700"
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
    <label className="flex items-center gap-2 px-1 text-xs text-neutral-500">
      <span>🎯 meta</span>
      <select
        value={goalId ?? ''}
        onChange={(e) => setMissionGoal(date, e.target.value || null)}
        className="flex-1 rounded-md border border-neutral-800 bg-neutral-900/60 px-2 py-1 text-xs text-neutral-300 outline-none focus:border-neutral-600"
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
