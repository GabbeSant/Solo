import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { addGoal, deleteGoal, getAllDailyRecords, getAllGoals, setGoalDone } from '../../data/db'
import { todayKey, type Goal } from '../../domain/types'
import { Identidade } from '../components/Identidade'

export function Metas() {
  const goals = useLiveQuery(() => getAllGoals(), [])
  const records = useLiveQuery(() => getAllDailyRecords(), [])
  const [titulo, setTitulo] = useState('')
  const [prazo, setPrazo] = useState('')

  async function cadastrar() {
    const id = await addGoal(titulo, prazo || null)
    if (id) {
      setTitulo('')
      setPrazo('')
    }
  }

  if (!goals || !records) return null

  // Dias de missão vinculados a cada meta — prova de progresso (Etapa 10b).
  const diasPorMeta = new Map<string, number>()
  for (const r of records) {
    if (r.goalId) diasPorMeta.set(r.goalId, (diasPorMeta.get(r.goalId) ?? 0) + 1)
  }

  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col gap-8 px-5 pb-24 pt-12 text-neutral-100">
      <header className="flex flex-col gap-1">
        <p className="text-sm font-medium text-neutral-500">Para onde estou indo</p>
        <h1 className="text-2xl font-semibold tracking-tight">Metas</h1>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Quem eu quero ser
        </h2>
        <Identidade />
      </section>

      <section className="flex flex-col gap-3">
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') cadastrar()
          }}
          placeholder="Uma meta que quero alcançar"
          className="w-full rounded-xl border border-neutral-800 bg-neutral-900/40 px-4 py-4 text-sm text-neutral-100 outline-none placeholder:text-neutral-600 focus:border-neutral-600"
        />
        {titulo.trim().length > 0 && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={prazo}
              onChange={(e) => setPrazo(e.target.value)}
              className="rounded-lg border border-neutral-800 bg-neutral-900/40 px-3 py-2 text-xs text-neutral-300 outline-none focus:border-neutral-600"
            />
            <button
              type="button"
              onClick={cadastrar}
              className="rounded-lg border border-orange-700 bg-orange-950/40 px-4 py-2 text-xs font-semibold text-orange-300 transition-colors hover:border-orange-500"
            >
              🎯 Criar meta
            </button>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        {goals.length === 0 ? (
          <p className="rounded-xl border border-dashed border-neutral-800 px-4 py-8 text-center text-sm text-neutral-600">
            Defina uma meta para dar direção aos seus dias. 🎯
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {goals.map((goal) => (
              <ItemMeta key={goal.id} goal={goal} dias={diasPorMeta.get(goal.id) ?? 0} />
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}

/** Prazo amigável: "venceu", "hoje", "amanhã" ou data por extenso (pt-BR). */
function rotuloPrazo(deadline: string): { texto: string; vencido: boolean } {
  const hoje = todayKey()
  const [ano, mes, dia] = deadline.split('-').map(Number)
  const texto = new Date(ano, mes - 1, dia).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
    year: deadline.slice(0, 4) === hoje.slice(0, 4) ? undefined : 'numeric',
  })
  return { texto, vencido: deadline < hoje }
}

function ItemMeta({ goal, dias }: { goal: Goal; dias: number }) {
  const prazo = goal.deadline ? rotuloPrazo(goal.deadline) : null
  return (
    <li className="flex items-start gap-3 rounded-xl border border-neutral-800 bg-neutral-900/40 px-4 py-3">
      <button
        type="button"
        onClick={() => setGoalDone(goal.id, !goal.done)}
        aria-label={goal.done ? 'Marcar como pendente' : 'Marcar como concluída'}
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs transition-colors ${
          goal.done
            ? 'border-emerald-600 bg-emerald-600/20 text-emerald-400'
            : 'border-neutral-700 text-transparent hover:border-neutral-500'
        }`}
      >
        ✓
      </button>
      <span className="flex flex-1 flex-col gap-1">
        <span className={`text-sm ${goal.done ? 'text-neutral-500 line-through' : 'text-neutral-100'}`}>
          {goal.title}
        </span>
        <span className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
          {prazo && (
            <span
              className={`text-xs ${
                goal.done
                  ? 'text-neutral-600'
                  : prazo.vencido
                    ? 'text-red-400/90'
                    : 'text-neutral-500'
              }`}
            >
              🗓 {prazo.texto}
              {!goal.done && prazo.vencido && ' · vencida'}
            </span>
          )}
          {dias > 0 && (
            <span className="text-xs text-orange-300/90">
              📌 {dias} {dias === 1 ? 'dia de missão' : 'dias de missão'}
            </span>
          )}
        </span>
      </span>
      <button
        type="button"
        onClick={() => deleteGoal(goal.id)}
        aria-label="Excluir meta"
        className="shrink-0 text-neutral-600 transition-colors hover:text-red-400"
      >
        ✕
      </button>
    </li>
  )
}
