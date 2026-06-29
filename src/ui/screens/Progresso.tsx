import { useLiveQuery } from 'dexie-react-hooks'
import { db, deleteWin, getAllDailyRecords, getAllSkills, getAllWins, setHabitSkill } from '../../data/db'
import {
  computeHabitStreak,
  computeMainStreak,
  computeRestrictiveStreak,
  dayQualifiesMain,
  recentDateKeys,
} from '../../domain/streaks'
import { previousDateKey, todayKey, type DailyRecord, type Habit, type Skill, type Win } from '../../domain/types'
import { Habilidades } from '../components/Habilidades'

const DIAS_FAIXA = 35 // 5 semanas

export function Progresso() {
  const records = useLiveQuery(() => getAllDailyRecords(), [])
  const habits = useLiveQuery(() => db.habits.toArray(), [])
  const wins = useLiveQuery(() => getAllWins(), [])
  const skills = useLiveQuery(() => getAllSkills(), [])

  if (!records || !habits || !wins || !skills) return null

  const streak = computeMainStreak(records)
  const byDate = new Map(records.map((r) => [r.date, r]))
  const nomeSkill = new Map(skills.map((s) => [s.id, s.name]))

  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col gap-8 px-5 pb-24 pt-12 text-neutral-100">
      <header className="flex flex-col gap-1">
        <p className="text-sm font-medium text-neutral-500">Seu progresso</p>
        <h1 className="text-2xl font-semibold tracking-tight">Progresso</h1>
      </header>

      <section className="flex flex-col items-center gap-1 rounded-2xl border border-orange-900/40 bg-orange-950/20 py-8">
        <span className="text-5xl font-bold text-orange-300">{streak}</span>
        <span className="text-sm text-neutral-400">
          {streak === 1 ? 'dia de sequência' : 'dias de sequência'} 🔥
        </span>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Últimos {DIAS_FAIXA} dias
        </h2>
        <FaixaAtividade byDate={byDate} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Hábitos esta semana
        </h2>
        <ul className="flex flex-col gap-2">
          {habits.map((habit) => (
            <li key={habit.id}>
              <ProgressoHabito habit={habit} records={records} skills={skills} />
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Vitórias
          </h2>
          {wins.length > 0 && (
            <span className="text-xs font-medium text-orange-300">
              🏆 {wins.length} no total
            </span>
          )}
        </div>
        <MuralDeVitorias wins={wins} nomeSkill={nomeSkill} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Habilidades
        </h2>
        <Habilidades />
      </section>
    </main>
  )
}

/** Rótulo amigável de uma data: "Hoje", "Ontem" ou data por extenso (pt-BR). */
function rotuloData(date: string): string {
  const hoje = todayKey()
  if (date === hoje) return 'Hoje'
  if (date === previousDateKey(hoje)) return 'Ontem'
  const [ano, mes, dia] = date.split('-').map(Number)
  return new Date(ano, mes - 1, dia).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
  })
}

function MuralDeVitorias({
  wins,
  nomeSkill,
}: {
  wins: Win[]
  nomeSkill: Map<string, string>
}) {
  if (wins.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-neutral-800 px-4 py-6 text-center text-sm text-neutral-600">
        Suas vitórias aparecem aqui. Registre a primeira na tela Hoje. 🏆
      </p>
    )
  }

  // wins já vêm mais recentes primeiro; agrupa por data preservando a ordem.
  const grupos: { date: string; itens: Win[] }[] = []
  for (const win of wins) {
    const ultimo = grupos[grupos.length - 1]
    if (ultimo && ultimo.date === win.date) ultimo.itens.push(win)
    else grupos.push({ date: win.date, itens: [win] })
  }

  return (
    <div className="flex flex-col gap-5">
      {grupos.map((grupo) => (
        <div key={grupo.date} className="flex flex-col gap-2">
          <p className="text-xs font-medium capitalize text-neutral-500">
            {rotuloData(grupo.date)}
          </p>
          <ul className="flex flex-col gap-2">
            {grupo.itens.map((win) => (
              <li
                key={win.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-neutral-800 bg-neutral-900/40 px-4 py-3 text-sm text-neutral-100"
              >
                <span className="flex flex-col gap-1">
                  <span className="flex items-start gap-2">
                    <span className="mt-0.5 text-base leading-none">🏆</span>
                    {win.description}
                  </span>
                  {win.skillId && nomeSkill.has(win.skillId) && (
                    <span className="ml-7 text-xs text-emerald-400/90">
                      🌱 {nomeSkill.get(win.skillId)}
                    </span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => deleteWin(win.id)}
                  aria-label="Excluir vitória"
                  className="shrink-0 text-neutral-600 transition-colors hover:text-red-400"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

function FaixaAtividade({ byDate }: { byDate: Map<string, DailyRecord> }) {
  const dias = recentDateKeys(DIAS_FAIXA)
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-7 gap-1.5">
        {dias.map((date) => {
          const record = byDate.get(date)
          const qualifica = record ? dayQualifiesMain(record) : false
          // Só sinal positivo acende o dia: missão definida ou hábito COMPLETED.
          // Uma quebra (CONFIRMED_BROKEN) não conta como atividade.
          const temAlgo =
            record &&
            (record.mission.trim().length > 0 ||
              Object.values(record.habitCheckIns).some((s) => s === 'COMPLETED'))
          return (
            <div
              key={date}
              title={date}
              className={`aspect-square rounded-[4px] ${
                qualifica
                  ? 'bg-orange-500'
                  : temAlgo
                    ? 'bg-orange-900/40'
                    : 'bg-neutral-800/60'
              }`}
            />
          )
        })}
      </div>
      <div className="flex items-center justify-end gap-1.5 text-[10px] text-neutral-600">
        <span>menos</span>
        <span className="h-2.5 w-2.5 rounded-[3px] bg-neutral-800/60" />
        <span className="h-2.5 w-2.5 rounded-[3px] bg-orange-900/40" />
        <span className="h-2.5 w-2.5 rounded-[3px] bg-orange-500" />
        <span>mais</span>
      </div>
    </div>
  )
}

function ProgressoHabito({
  habit,
  records,
  skills,
}: {
  habit: Habit
  records: DailyRecord[]
  skills: Skill[]
}) {
  if (habit.type === 'restrictive') {
    const dias = computeRestrictiveStreak(records, habit)
    // dias === 0 só acontece quando foi quebrado hoje (recomeça amanhã).
    const quebradoHoje = dias === 0
    return (
      <div className="flex flex-col gap-2 rounded-xl border border-neutral-800 bg-neutral-900/40 px-4 py-3 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className={quebradoHoje ? 'text-neutral-400' : 'text-neutral-100'}>
            {habit.name}
          </span>
          {quebradoHoje ? (
            <span className="text-xs text-neutral-500">Quebrado hoje</span>
          ) : (
            <span className="text-xs font-medium text-orange-300">
              🔥 {dias} {dias === 1 ? 'dia' : 'dias'} sem quebrar
            </span>
          )}
        </div>
        <SeletorSkillHabito habit={habit} skills={skills} />
      </div>
    )
  }

  const semana = recentDateKeys(7)
  const byDate = new Map(records.map((r) => [r.date, r]))
  const feitos = semana.filter((d) => byDate.get(d)?.habitCheckIns[habit.id] === 'COMPLETED')
    .length
  const streak = computeHabitStreak(records, habit.id)

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-neutral-800 bg-neutral-900/40 px-4 py-3 text-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="text-neutral-100">{habit.name}</span>
        <span className="text-xs font-medium text-neutral-400">
          {feitos}/7
          {streak > 0 && <span className="ml-2 text-orange-400/90">🔥 {streak}</span>}
        </span>
      </div>
      <div className="flex gap-1">
        {semana.map((d) => {
          const feito = byDate.get(d)?.habitCheckIns[habit.id] === 'COMPLETED'
          return (
            <div
              key={d}
              className={`h-1.5 flex-1 rounded-full ${feito ? 'bg-emerald-500' : 'bg-neutral-800'}`}
            />
          )
        })}
      </div>
      <SeletorSkillHabito habit={habit} skills={skills} />
    </div>
  )
}

/** Seletor compacto: qual habilidade este hábito desenvolve. Some se não há skills. */
function SeletorSkillHabito({ habit, skills }: { habit: Habit; skills: Skill[] }) {
  if (skills.length === 0) return null
  return (
    <label className="flex items-center gap-2 text-xs text-neutral-500">
      <span>🌱 desenvolve</span>
      <select
        value={habit.skillId ?? ''}
        onChange={(e) => setHabitSkill(habit.id, e.target.value || null)}
        className="rounded-md border border-neutral-800 bg-neutral-900/60 px-2 py-1 text-xs text-neutral-300 outline-none focus:border-neutral-600"
      >
        <option value="">—</option>
        {skills.map((skill) => (
          <option key={skill.id} value={skill.id}>
            {skill.name}
          </option>
        ))}
      </select>
    </label>
  )
}
