// Adaptador de persistência local (IndexedDB via Dexie).
// Trocável sem tocar no domínio — ver src/domain/types.ts.
import Dexie, { type Table } from 'dexie'
import type { Area, AreaId, DailyRecord, DateKey, Goal, Habit, HabitCheckInStatus, HabitId, Identity, Skill, Win } from '../domain/types'
import { todayKey } from '../domain/types'

class SoloDB extends Dexie {
  dailyRecords!: Table<DailyRecord, DateKey>
  areas!: Table<Area, string>
  habits!: Table<Habit, HabitId>
  wins!: Table<Win, string>
  skills!: Table<Skill, string>
  goals!: Table<Goal, string>
  identities!: Table<Identity, string>

  constructor() {
    super('solo')
    // v1: só registros diários (Etapa 2).
    this.version(1).stores({
      dailyRecords: 'date',
    })
    // v2: áreas e hábitos pré-configurados (Etapa 3).
    this.version(2).stores({
      dailyRecords: 'date',
      areas: 'id',
      habits: 'id, areaId',
    })
    // v3: Habit.createdAt para o contador de hábito restritivo (Etapa 4b).
    this.version(3)
      .stores({ dailyRecords: 'date', areas: 'id', habits: 'id, areaId' })
      .upgrade(async (tx) => {
        const hoje = todayKey()
        await tx
          .table('habits')
          .toCollection()
          .modify((h: Habit) => {
            if (!h.createdAt) h.createdAt = hoje
          })
      })
    // v4: vitórias (Win) — primeiro agregado da Fase 2 (Etapa 7a). Tabela nova, sem migração.
    this.version(4).stores({
      dailyRecords: 'date',
      areas: 'id',
      habits: 'id, areaId',
      wins: 'id, date',
    })
    // v5: habilidades (Skill) — capacidade desenvolvida pela prática (Etapa 8a). Tabela nova, sem migração.
    this.version(5).stores({
      dailyRecords: 'date',
      areas: 'id',
      habits: 'id, areaId',
      wins: 'id, date',
      skills: 'id, areaId',
    })
    // v6: metas (Goal) — intenção com prazo (Etapa 10a). Tabela nova, sem migração.
    this.version(6).stores({
      dailyRecords: 'date',
      areas: 'id',
      habits: 'id, areaId',
      wins: 'id, date',
      skills: 'id, areaId',
      goals: 'id',
    })
    // v7: declarações de identidade (Identity) — quem o usuário está se tornando (Etapa 11). Tabela nova, sem migração.
    this.version(7).stores({
      dailyRecords: 'date',
      areas: 'id',
      habits: 'id, areaId',
      wins: 'id, date',
      skills: 'id, areaId',
      goals: 'id',
      identities: 'id',
    })
  }
}

export const db = new SoloDB()

// --- Registros diários -----------------------------------------------------

/** Lê o registro do dia, criando um vazio em memória se ainda não existe. */
export async function getDailyRecord(date: DateKey): Promise<DailyRecord> {
  const existing = await db.dailyRecords.get(date)
  if (!existing) return { date, mission: '', habitCheckIns: {} }
  // Normaliza registros antigos (Etapa 2) que não tinham habitCheckIns.
  return { ...existing, habitCheckIns: existing.habitCheckIns ?? {} }
}

/** Lê todo o histórico, normalizando registros antigos sem `habitCheckIns`. */
export async function getAllDailyRecords(): Promise<DailyRecord[]> {
  const all = await db.dailyRecords.toArray()
  return all.map((r) => ({ ...r, habitCheckIns: r.habitCheckIns ?? {} }))
}

/** Persiste a missão do dia (cria o registro se necessário). */
export async function saveMission(date: DateKey, mission: string): Promise<void> {
  const record = await getDailyRecord(date)
  await db.dailyRecords.put({ ...record, mission })
}

/** Define (ou limpa, com `null`) o status de check-in de um hábito no dia. */
export async function setHabitCheckIn(
  date: DateKey,
  habitId: HabitId,
  status: HabitCheckInStatus | null,
): Promise<void> {
  const record = await getDailyRecord(date)
  const habitCheckIns = { ...record.habitCheckIns }
  if (status === null) delete habitCheckIns[habitId]
  else habitCheckIns[habitId] = status
  await db.dailyRecords.put({ ...record, habitCheckIns })
}

/** Define (ou limpa, com `null`) a habilidade que um hábito desenvolve. */
export async function setHabitSkill(habitId: HabitId, skillId: string | null): Promise<void> {
  await db.habits.update(habitId, { skillId })
}

/** Alterna o check-in de um hábito construtivo no dia (COMPLETED / desmarca). */
export async function toggleHabitCheckIn(date: DateKey, habitId: HabitId): Promise<void> {
  const record = await getDailyRecord(date)
  const atual = record.habitCheckIns[habitId]
  await setHabitCheckIn(date, habitId, atual === 'COMPLETED' ? null : 'COMPLETED')
}

/** Vincula (ou desvincula, com `null`) a missão do dia a uma meta. */
export async function setMissionGoal(date: DateKey, goalId: string | null): Promise<void> {
  const record = await getDailyRecord(date)
  const next = { ...record }
  if (goalId) next.goalId = goalId
  else delete next.goalId
  await db.dailyRecords.put(next)
}

// --- Ritual noturno (reflexão + nota + missão cumprida) --------------------

/** Grava (ou limpa, se vazia) a resposta de uma pergunta da reflexão. */
export async function setReflectionAnswer(
  date: DateKey,
  questionId: string,
  text: string,
): Promise<void> {
  const record = await getDailyRecord(date)
  const answers = { ...(record.reflection?.answers ?? {}) }
  const limpo = text.trim()
  if (limpo) answers[questionId] = limpo
  else delete answers[questionId]
  await db.dailyRecords.put({ ...record, reflection: { ...record.reflection, answers } })
}

/** Define (ou limpa, com `null`) a nota do dia (1–5). */
export async function setDayRating(date: DateKey, rating: number | null): Promise<void> {
  const record = await getDailyRecord(date)
  const reflection = { answers: record.reflection?.answers ?? {}, ...record.reflection }
  if (rating === null) delete reflection.dayRating
  else reflection.dayRating = rating
  await db.dailyRecords.put({ ...record, reflection })
}

/** Define (ou limpa, com `null`) se a missão de hoje foi cumprida. Fecha o loop. */
export async function setMissionAccomplished(
  date: DateKey,
  value: boolean | null,
): Promise<void> {
  const record = await getDailyRecord(date)
  const next = { ...record }
  if (value === null) delete next.missionAccomplished
  else next.missionAccomplished = value
  await db.dailyRecords.put(next)
}

// --- Vitórias (Win) --------------------------------------------------------

/** Registra uma nova vitória no dia. Ignora descrição vazia. Devolve o id criado (ou null). */
export async function addWin(
  date: DateKey,
  description: string,
  skillId?: string | null,
): Promise<string | null> {
  const limpo = description.trim()
  if (!limpo) return null
  const win: Win = {
    id: crypto.randomUUID(),
    date,
    description: limpo,
    skillId: skillId ?? null,
    createdAt: new Date().toISOString(),
  }
  await db.wins.add(win)
  return win.id
}

/** Vitórias de um dia, mais recentes primeiro. */
export async function getWinsByDate(date: DateKey): Promise<Win[]> {
  const wins = await db.wins.where('date').equals(date).toArray()
  return wins.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

/** Todas as vitórias do histórico, mais recentes primeiro. */
export async function getAllWins(): Promise<Win[]> {
  const wins = await db.wins.toArray()
  return wins.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

/** Remove uma vitória pelo id. */
export async function deleteWin(id: string): Promise<void> {
  await db.wins.delete(id)
}

// --- Habilidades (Skill) ---------------------------------------------------

/** Cadastra uma habilidade. Ignora nome vazio. Devolve o id criado (ou null). */
export async function addSkill(name: string, areaId?: AreaId | null): Promise<string | null> {
  const limpo = name.trim()
  if (!limpo) return null
  const skill: Skill = {
    id: crypto.randomUUID(),
    name: limpo,
    areaId: areaId ?? null,
    createdAt: new Date().toISOString(),
  }
  await db.skills.add(skill)
  return skill.id
}

/** Todas as habilidades, mais recentes primeiro. */
export async function getAllSkills(): Promise<Skill[]> {
  const skills = await db.skills.toArray()
  return skills.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

/** Remove uma habilidade pelo id. */
export async function deleteSkill(id: string): Promise<void> {
  await db.skills.delete(id)
}

// --- Metas (Goal) ----------------------------------------------------------

/** Cadastra uma meta (opcionalmente como sub-meta). Ignora título vazio. Devolve o id criado (ou null). */
export async function addGoal(
  title: string,
  deadline?: DateKey | null,
  parentGoalId?: string | null,
): Promise<string | null> {
  const limpo = title.trim()
  if (!limpo) return null
  const goal: Goal = {
    id: crypto.randomUUID(),
    title: limpo,
    deadline: deadline || null,
    done: false,
    parentGoalId: parentGoalId ?? null,
    createdAt: new Date().toISOString(),
  }
  await db.goals.add(goal)
  return goal.id
}

/**
 * Todas as metas. Pendentes primeiro (por prazo mais próximo; sem prazo ao fim),
 * depois as concluídas (mais recentes primeiro).
 */
export async function getAllGoals(): Promise<Goal[]> {
  const goals = await db.goals.toArray()
  return goals.sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1
    if (!a.done) {
      // Pendentes: prazo mais próximo primeiro; sem prazo vai para o fim.
      if (a.deadline && b.deadline) return a.deadline.localeCompare(b.deadline)
      if (a.deadline) return -1
      if (b.deadline) return 1
    }
    return b.createdAt.localeCompare(a.createdAt)
  })
}

/** Marca uma meta como concluída ou pendente. */
export async function setGoalDone(id: string, done: boolean): Promise<void> {
  await db.goals.update(id, { done })
}

/** Vincula (ou desvincula, com `null`) uma meta a uma meta-pai. */
export async function setGoalParent(id: string, parentGoalId: string | null): Promise<void> {
  await db.goals.update(id, { parentGoalId })
}

/** Remove uma meta pelo id. Sub-metas dela viram metas-raiz (não somem). */
export async function deleteGoal(id: string): Promise<void> {
  await db.transaction('rw', db.goals, async () => {
    await db.goals.filter((g) => g.parentGoalId === id).modify({ parentGoalId: null })
    await db.goals.delete(id)
  })
}

// --- Identidade (Identity) -------------------------------------------------

/** Declara uma identidade. Ignora frase vazia. Devolve o id criado (ou null). */
export async function addIdentity(statement: string): Promise<string | null> {
  const limpo = statement.trim()
  if (!limpo) return null
  const identity: Identity = { id: crypto.randomUUID(), statement: limpo, createdAt: new Date().toISOString() }
  await db.identities.add(identity)
  return identity.id
}

/** Todas as declarações de identidade, mais antigas primeiro (ordem de declaração). */
export async function getAllIdentities(): Promise<Identity[]> {
  const identities = await db.identities.toArray()
  return identities.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

/** Remove uma declaração de identidade pelo id. */
export async function deleteIdentity(id: string): Promise<void> {
  await db.identities.delete(id)
}

// --- Seed (áreas + hábitos) ------------------------------------------------

const SEED_AREAS: Area[] = [
  { id: 'caracter', name: 'Caráter & Disciplina' },
  { id: 'saude', name: 'Saúde' },
  { id: 'carreira', name: 'Carreira & Tech' },
  { id: 'fe', name: 'Fé' },
]

type HabitSeed = Omit<Habit, 'createdAt'>

// Hábitos-exemplo de uma instalação nova. Cada usuário ajusta os seus na prática
// (os dados reais ficam no IndexedDB local, nunca no código).
const SEED_HABITS: HabitSeed[] = [
  { id: 'sem-rede-social', name: 'Sem rede social', areaId: 'caracter', type: 'restrictive' },
  { id: 'treinar', name: 'Treinar', areaId: 'saude', type: 'constructive' },
  { id: 'estudar-tech', name: 'Estudar tech (30min)', areaId: 'carreira', type: 'constructive' },
  { id: 'oracao', name: 'Oração / leitura', areaId: 'fe', type: 'constructive' },
]

/** Popula áreas/hábitos na primeira execução. Idempotente. */
export async function ensureSeed(): Promise<void> {
  if ((await db.areas.count()) > 0) return
  const hoje = todayKey()
  const habits: Habit[] = SEED_HABITS.map((h) => ({ ...h, createdAt: hoje }))
  await db.transaction('rw', db.areas, db.habits, async () => {
    await db.areas.bulkPut(SEED_AREAS)
    await db.habits.bulkPut(habits)
  })
}
