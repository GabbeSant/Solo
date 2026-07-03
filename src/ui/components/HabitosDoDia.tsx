import { useLiveQuery } from 'dexie-react-hooks'
import { db, getAllDailyRecords, getDailyRecord, setHabitCheckIn, toggleHabitCheckIn } from '../../data/db'
import { todayKey, type DailyRecord, type Habit } from '../../domain/types'
import { computeHabitStreak, computeRestrictiveStreak } from '../../domain/streaks'
import { EstadoVazio } from '../design/Primitivas'
import { IconeChama, IconeCheck } from '../design/Icone'

export function HabitosDoDia() {
  const date = todayKey()
  const habits = useLiveQuery(() => db.habits.toArray(), [])
  const record = useLiveQuery(() => getDailyRecord(date), [date])
  const records = useLiveQuery(() => getAllDailyRecords(), [])

  if (!habits || !record || !records) return null

  if (habits.length === 0) {
    return <EstadoVazio>Nenhum hábito ainda</EstadoVazio>
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
      className={`flex w-full items-center gap-3 rounded-cartao border px-4 py-3.5 text-left text-sm transition-colors ${
        feito
          ? 'border-broto/40 bg-broto/10 text-pedra'
          : 'border-linha bg-humus text-areia hover:border-pedra/50'
      }`}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
          feito ? 'border-broto bg-broto text-solo' : 'border-linha bg-solo'
        }`}
      >
        {feito && <IconeCheck tamanho={12} className="animate-brotar" />}
      </span>
      <span className={`flex-1 ${feito ? 'line-through decoration-pedra/50' : ''}`}>
        {habit.name}
      </span>
      {streak > 0 && (
        <span className="flex shrink-0 items-center gap-1 text-xs font-medium tabular-nums text-brasa">
          <IconeChama tamanho={12} />
          {streak}
        </span>
      )}
    </button>
  )
}

function HabitoRestritivo({ habit, record, records, date }: ItemProps) {
  const quebradoHoje = record.habitCheckIns[habit.id] === 'CONFIRMED_BROKEN'
  const dias = computeRestrictiveStreak(records, habit)

  return (
    <div
      className={`flex items-center gap-3 rounded-cartao border px-4 py-3.5 text-sm ${
        quebradoHoje
          ? 'border-linha bg-humus text-pedra'
          : 'border-brasa/25 bg-brasa/5 text-areia'
      }`}
    >
      <div className="flex-1">
        <p>{habit.name}</p>
        {quebradoHoje ? (
          <p className="text-xs text-pedra">Quebrado hoje — recomeça amanhã</p>
        ) : (
          <p className="flex items-center gap-1 text-xs font-medium tabular-nums text-brasa">
            <IconeChama tamanho={12} />
            {dias} {dias === 1 ? 'dia' : 'dias'} sem quebrar
          </p>
        )}
      </div>
      {quebradoHoje ? (
        <button
          type="button"
          onClick={() => setHabitCheckIn(date, habit.id, null)}
          className="shrink-0 rounded-full border border-linha px-3 py-1.5 text-xs font-medium text-pedra transition-colors hover:border-pedra/60 hover:text-areia"
        >
          Desfazer
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setHabitCheckIn(date, habit.id, 'CONFIRMED_BROKEN')}
          className="shrink-0 rounded-full border border-linha px-3 py-1.5 text-xs font-medium text-pedra transition-colors hover:border-pedra/60 hover:text-areia"
        >
          Quebrei
        </button>
      )}
    </div>
  )
}
