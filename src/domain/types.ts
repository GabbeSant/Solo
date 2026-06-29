// Modelo de domínio em TypeScript puro — sem dependências de React ou Dexie.
// Portável para qualquer UI / adaptador de persistência (ver PROJECT_CONTEXT.md).

/** Data no formato `YYYY-MM-DD` (chave do registro diário). */
export type DateKey = string

export type AreaId = string
export type HabitId = string

/** Dimensão da vida que o sistema rastreia. Pré-configurada no MVP. */
export interface Area {
  id: AreaId
  name: string
}

/** `constructive` = cultivar (treinar); `restrictive` = evitar (ex.: sem rede social). */
export type HabitType = 'constructive' | 'restrictive'

/** Comportamento recorrente. */
export interface Habit {
  id: HabitId
  name: string
  areaId: AreaId
  type: HabitType
  /** Data de criação (`YYYY-MM-DD`) — âncora do contador de hábito restritivo. */
  createdAt: DateKey
  /** Nullable, sem UI no MVP — previne migração na Fase 2 (decisão arquitetural). */
  skillId?: string | null
}

/**
 * Status do check-in de um hábito no dia.
 * - `COMPLETED`: hábito construtivo cumprido (decisão ativa).
 * - `CONFIRMED_BROKEN`: hábito restritivo quebrado (decisão #6 — único gatilho de reset).
 * Ausência da chave = PENDING. Para o restritivo, PENDING preserva a streak.
 */
export type HabitCheckInStatus = 'COMPLETED' | 'CONFIRMED_BROKEN'

/** Pergunta fixa do ritual noturno. */
export interface ReflectionQuestion {
  id: string
  prompt: string
}

/**
 * Perguntas fixas da reflexão noturna (VISION.md §7). Constantes no MVP
 * (inconsistência #8 resolvida: fixas, não configuráveis).
 */
export const REFLECTION_QUESTIONS: ReflectionQuestion[] = [
  { id: 'valeu', prompt: 'O que fiz hoje que valeu a pena?' },
  { id: 'aprendi', prompt: 'O que aprendi?' },
  { id: 'melhor', prompt: 'O que poderia ter feito melhor?' },
  { id: 'sentindo', prompt: 'Como estou me sentindo?' },
  { id: 'amanha', prompt: 'Uma coisa que quero fazer diferente amanhã.' },
]

/** Reflexão noturna: fechamento do dia. */
export interface Reflection {
  /** Respostas indexadas pelo id da pergunta. Ausência = não respondida. */
  answers: Record<string, string>
  /** Nota do dia (1–5). Ausente = ainda não avaliado. */
  dayRating?: number
}

/**
 * Registro diário. Um documento por data, que vai acumulando o loop do dia
 * (missão, hábitos, reflexão).
 */
export interface DailyRecord {
  /** Data do registro, `YYYY-MM-DD`. Chave primária. */
  date: DateKey
  /** Missão do dia: foco central definido pela manhã. Vazia = ainda não definida. */
  mission: string
  /** Check-ins de hábitos do dia. Ausência da chave = ainda não marcado (PENDING). */
  habitCheckIns: Record<HabitId, HabitCheckInStatus>
  /** Reflexão noturna. Ausente = ritual da noite ainda não iniciado. */
  reflection?: Reflection
  /** Cumpri a missão de hoje? Fecha o loop manhã→noite. Ausente = não respondido. */
  missionAccomplished?: boolean
  /** Meta que a missão de hoje serve (Etapa 10b). Ausente = missão sem meta vinculada. */
  goalId?: string | null
}

/**
 * Vitória: evidência concreta de crescimento num dia ("Resolvi o bug sozinho").
 * Diferente de Reflection (processamento emocional) e HabitCheckIn (presença).
 * Primeiro agregado da Fase 2 — antídoto à síndrome do impostor (VISION #7).
 * `skillId?` liga a vitória à habilidade que ela desenvolveu (Etapa 8b) —
 * a "prova" por capacidade. `projectId`/`areaId` ainda não existem.
 */
export interface Win {
  /** Identificador único. */
  id: string
  /** Dia a que a vitória pertence, `YYYY-MM-DD`. */
  date: DateKey
  /** O que aconteceu, em linguagem do usuário. */
  description: string
  /** Habilidade que esta vitória desenvolveu (opcional). */
  skillId?: string | null
  /** Momento exato do registro (ISO) — ordena vitórias do mesmo dia. */
  createdAt: string
}

/**
 * Habilidade: capacidade que o usuário está desenvolvendo pela prática
 * ("React", "Disciplina matinal", "Inglês"). Liga o esforço diário (Habit)
 * à evidência de crescimento (Win) — fecha o loop de crescimento (DOMAIN_REVIEW).
 * Corte mínimo da Fase 2: sem `level` nem `description` (campos sem comportamento
 * ficam de fora, como foi com Win). `areaId` opcional só agrupa.
 */
export interface Skill {
  /** Identificador único. */
  id: string
  /** Nome da habilidade, em linguagem do usuário. */
  name: string
  /** Área da vida a que pertence (opcional — só agrupa). */
  areaId?: AreaId | null
  /** Momento do cadastro (ISO) — ordena a lista. */
  createdAt: string
}

/**
 * Meta: intenção com prazo. Conecta a ação diária à direção de longo prazo
 * (diagnóstico central do Discovery: dar direção a uma rotina reativa).
 * Corte mínimo da Fase 2: sem `parentGoalId` (hierarquia), `areaId` nem enum de
 * status — `done` booleano basta. Vínculo com a missão do dia vem depois.
 */
export interface Goal {
  /** Identificador único. */
  id: string
  /** O que se quer alcançar, em linguagem do usuário. */
  title: string
  /** Prazo opcional (`YYYY-MM-DD`). Ausente = sem data definida. */
  deadline?: DateKey | null
  /** Concluída? */
  done: boolean
  /** Momento do cadastro (ISO) — ordena metas. */
  createdAt: string
}

/**
 * Declaração de identidade: quem o usuário está se tornando ("Eu sou alguém
 * disciplinado"). É o topo da hierarquia da visão (identidade → metas → dias)
 * e materializa o Aprendizado #3 do Discovery: conectar ação diária → identidade
 * futura, não só tarefa → conclusão. Corte mínimo: só a frase.
 */
export interface Identity {
  /** Identificador único. */
  id: string
  /** A afirmação, em primeira pessoa ("Eu sou..."). */
  statement: string
  /** Momento da declaração (ISO) — ordena. */
  createdAt: string
}

/** Devolve a `DateKey` local de hoje (sem fuso UTC trocando o dia). */
export function todayKey(d: Date = new Date()): DateKey {
  const ano = d.getFullYear()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

/** `DateKey` do dia anterior. Opera em data local (sem fuso UTC trocando o dia). */
export function previousDateKey(key: DateKey): DateKey {
  const [ano, mes, dia] = key.split('-').map(Number)
  return todayKey(new Date(ano, mes - 1, dia - 1))
}
