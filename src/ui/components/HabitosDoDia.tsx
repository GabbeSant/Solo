import { useLiveQuery } from 'dexie-react-hooks'
import { db, getAllDailyRecords, getDailyRecord, setHabitCheckIn, toggleHabitCheckIn } from '../../data/db'
import { todayKey, type DailyRecord, type Habit } from '../../domain/types'
import { computeHabitStreak, computeRestrictiveStreak } from '../../domain/streaks'

export function HabitosDoDia() {
  const date = todayKey()
  const habits = useLiveQuery(() => db.habits.toArray(), [])
  const record = useLiveQuery(() => getDailyRecord(date), [date])
  const records = useLiveQuery(() => getAllDailyRecords(), [])

  if (!habits || !record || !records) return null

  if (habits.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-800 bg-neutral-900/40 px-4 py-6 text-center text-sm text-neutral-500">
        Nenhum hábito ainda
      </div>
    )
  }

  return (
    <ul className="flex flex-col gap-2">
      {habits.map((habit) => (
        <li key={habit.id}>
          {habit.type === 'restrictive' ? (
            <HabitoRestritivo habit={habit} record={record} records={records} date={date} />
          ) : (
            <HabitoConstrutivo habit={habit} record={record} records={records} date={date} />
          )}
        </li>
      ))}
    </ul>
  )
}

type ItemProps = {
  habit: Habit
  record: DailyRecord
  records: DailyRecord[]
  date: string
}

function HabitoConstrutivo({ habit, record, records, date }: ItemProps) {
  const feito = record.habitCheckIns[habit.id] === 'COMPLETED'
  const streak = computeHabitStreak(records, habit.id)
  return (
    <button
      type="button"
      onClick={() => toggleHabitCheckIn(date, habit.id)}
      className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
        feito
          ? 'border-emerald-800/60 bg-emerald-950/30 text-neutral-300'
          : 'border-neutral-800 bg-neutral-900/40 text-neutral-100 hover:border-neutral-700'
      }`}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs ${
          feito ? 'border-emerald-600 bg-emerald-600 text-neutral-950' : 'border-neutral-700'
        }`}
      >
        {feito ? '✓' : ''}
      </span>
      <span className={`flex-1 ${feito ? 'line-through decoration-neutral-600' : ''}`}>
        {habit.name}
      </span>
      {streak > 0 && (
        <span className="shrink-0 text-xs font-medium text-orange-400/90">🔥 {streak}</span>
      )}
    </button>
  )
}

function HabitoRestritivo({ habit, record, records, date }: ItemProps) {
  const quebradoHoje = record.habitCheckIns[habit.id] === 'CONFIRMED_BROKEN'
  const dias = computeRestrictiveStreak(records, habit)

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
        quebradoHoje
          ? 'border-neutral-800 bg-neutral-900/40 text-neutral-400'
          : 'border-orange-900/40 bg-orange-950/20 text-neutral-100'
      }`}
    >
      <div className="flex-1">
        <p className={quebradoHoje ? 'text-neutral-400' : ''}>{habit.name}</p>
        {quebradoHoje ? (
          <p className="text-xs text-neutral-500">Quebrado hoje — recomeça amanhã</p>
        ) : (
          <p className="text-xs font-medium text-orange-300">
            🔥 {dias} {dias === 1 ? 'dia' : 'dias'} sem quebrar
          </p>
        )}
      </div>
      {quebradoHoje ? (
        <button
          type="button"
          onClick={() => setHabitCheckIn(date, habit.id, null)}
          className="shrink-0 rounded-lg border border-neutral-700 px-3 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:border-neutral-500"
        >
          Desfazer
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setHabitCheckIn(date, habit.id, 'CONFIRMED_BROKEN')}
          className="shrink-0 rounded-lg border border-red-900/50 px-3 py-1.5 text-xs font-medium text-red-300/90 transition-colors hover:border-red-700 hover:text-red-300"
        >
          Quebrei
        </button>
      )}
    </div>
  )
}
