// Cálculo de streaks a partir do histórico de DailyRecord — funções puras.
// "Computar, não declarar": nenhum contador é armazenado; o estado é derivado.
import type { DailyRecord, DateKey, Habit, HabitId } from './types'
import { previousDateKey, todayKey } from './types'

/**
 * Conta dias consecutivos que "qualificam", terminando em hoje OU ontem.
 * Hoje ainda não cumprido não zera a streak (igual Duolingo) — só zera quando
 * nem ontem qualifica.
 */
function streakAteHoje(qualifica: Set<DateKey>, hoje: DateKey): number {
  let cursor = qualifica.has(hoje) ? hoje : previousDateKey(hoje)
  let count = 0
  while (qualifica.has(cursor)) {
    count++
    cursor = previousDateKey(cursor)
  }
  return count
}

/** Um hábito qualifica num dia se foi marcado COMPLETED. */
export function computeHabitStreak(
  records: DailyRecord[],
  habitId: HabitId,
  hoje: DateKey = todayKey(),
): number {
  const qualifica = new Set<DateKey>()
  for (const r of records) {
    if (r.habitCheckIns[habitId] === 'COMPLETED') qualifica.add(r.date)
  }
  return streakAteHoje(qualifica, hoje)
}

/**
 * Streak de hábito restritivo (decisão #6): conta dias desde a criação do hábito
 * até hoje, tratando o silêncio (PENDING) como "mantido". Só um dia marcado
 * `CONFIRMED_BROKEN` interrompe a contagem. Se hoje foi quebrado, a streak é 0.
 */
export function computeRestrictiveStreak(
  records: DailyRecord[],
  habit: Habit,
  hoje: DateKey = todayKey(),
): number {
  const status = new Map<DateKey, HabitCheckInStatusOf>()
  for (const r of records) {
    const s = r.habitCheckIns[habit.id]
    if (s) status.set(r.date, s)
  }
  let cursor = hoje
  let count = 0
  // Comparação lexicográfica de YYYY-MM-DD == ordem cronológica.
  while (cursor >= habit.createdAt) {
    if (status.get(cursor) === 'CONFIRMED_BROKEN') break
    count++
    cursor = previousDateKey(cursor)
  }
  return count
}

type HabitCheckInStatusOf = DailyRecord['habitCheckIns'][string]

/**
 * Regra de qualificação da streak principal (decisão #3): o dia qualifica se a
 * missão foi definida E pelo menos um hábito foi marcado COMPLETED.
 */
export function dayQualifiesMain(record: DailyRecord): boolean {
  const temMissao = record.mission.trim().length > 0
  const temHabito = Object.values(record.habitCheckIns).some((s) => s === 'COMPLETED')
  return temMissao && temHabito
}

/** Streak principal do sistema (decisão #3). */
export function computeMainStreak(
  records: DailyRecord[],
  hoje: DateKey = todayKey(),
): number {
  const qualifica = new Set<DateKey>()
  for (const r of records) {
    if (dayQualifiesMain(r)) qualifica.add(r.date)
  }
  return streakAteHoje(qualifica, hoje)
}

/** Lista as últimas `n` `DateKey`s em ordem cronológica (mais antiga → hoje). */
export function recentDateKeys(n: number, hoje: DateKey = todayKey()): DateKey[] {
  const dias: DateKey[] = []
  let cursor = hoje
  for (let i = 0; i < n; i++) {
    dias.push(cursor)
    cursor = previousDateKey(cursor)
  }
  return dias.reverse()
}
