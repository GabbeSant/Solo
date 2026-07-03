import { useLiveQuery } from 'dexie-react-hooks'
import { getAllDailyRecords } from '../../data/db'
import { computeMainStreak } from '../../domain/streaks'
import { IconeChama } from '../design/Icone'

export function StreakPrincipal() {
  const records = useLiveQuery(() => getAllDailyRecords(), [])
  if (!records) return null

  const streak = computeMainStreak(records)
  if (streak === 0) return null

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-brasa/30 bg-brasa/10 px-3 py-1 text-sm font-semibold tabular-nums text-brasa">
      <IconeChama tamanho={14} />
      {streak} {streak === 1 ? 'dia' : 'dias'}
    </span>
  )
}
