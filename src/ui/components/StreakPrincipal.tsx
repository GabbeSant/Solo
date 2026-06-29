import { useLiveQuery } from 'dexie-react-hooks'
import { getAllDailyRecords } from '../../data/db'
import { computeMainStreak } from '../../domain/streaks'

export function StreakPrincipal() {
  const records = useLiveQuery(() => getAllDailyRecords(), [])
  if (!records) return null

  const streak = computeMainStreak(records)
  if (streak === 0) return null

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-orange-950/40 px-3 py-1 text-sm font-semibold text-orange-300">
      🔥 {streak} {streak === 1 ? 'dia' : 'dias'}
    </span>
  )
}
