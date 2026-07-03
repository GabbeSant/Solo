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
import { RevisaoSemanal } from '../components/RevisaoSemanal'
import { BotaoExcluir, EstadoVazio, estiloRotuloSecao, estiloSelect, JanelaSistema } from '../design/Primitivas'
import { IconeBroto, IconeChama, IconeEstrela, IconeFaisca } from '../design/Icone'

const DIAS_FAIXA = 35 // 5 semanas

// Marcos de sequência que o Sistema reconhece (VISION: 7, 30, 100, 365).
const MARCOS = [7, 30, 100, 365]

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
    <main className="mx-auto flex min-h-full max-w-md flex-col gap-9 px-5 pb-28 pt-12 text-areia lg:max-w-4xl lg:pb-12 lg:pt-16">
      <header className="flex flex-col gap-1">
        <p className="text-sm font-medium text-pedra">O que você já construiu</p>
        <h1 className="font-voz text-[28px] font-medium tracking-tight">Progresso</h1>
      </header>

      <SequenciaPrincipal streak={streak} />

      <RevisaoSemanal />

      {/* Duas colunas no desktop: à esquerda a consistência, à direita a prova de crescimento. */}
      <div className="flex flex-col gap-9 lg:flex-row lg:gap-10">
        <div className="flex flex-col gap-9 lg:flex-1">
          <section className="flex flex-col gap-3">
            <h2 className={estiloRotuloSecao}>Últimos {DIAS_FAIXA} dias</h2>
            <FaixaAtividade byDate={byDate} />
          </section>

          <section className="flex flex-col gap-3">
            <h2 className={estiloRotuloSecao}>Hábitos esta semana</h2>
            <ul className="flex flex-col gap-2">
              {habits.map((habit) => (
                <li key={habit.id}>
                  <ProgressoHabito habit={habit} records={records} skills={skills} />
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="flex flex-col gap-9 lg:flex-1">
          <section className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className={estiloRotuloSecao}>Vitórias</h2>
              {wins.length > 0 && (
                <span className="flex items-center gap-1 text-xs font-medium tabular-nums text-brasa">
                  <IconeEstrela tamanho={12} />
                  {wins.length} no total
                </span>
              )}
            </div>
            <MuralDeVitorias wins={wins} nomeSkill={nomeSkill} />
          </section>

          <section className="flex flex-col gap-3">
            <h2 className={estiloRotuloSecao}>Habilidades</h2>
            <Habilidades />
          </section>
        </div>
      </div>
    </main>
  )
}

/**
 * A janela do Sistema: a sequência principal e os marcos que ela persegue.
 * O único momento "cerimonial" da tela — todo o resto é terra quieta.
 */
function SequenciaPrincipal({ streak }: { streak: number }) {
  const proximo = MARCOS.find((m) => m > streak)
  return (
    <JanelaSistema>
      <section className="flex flex-col items-center gap-5 px-4 py-8">
        <div className="flex flex-col items-center gap-1">
          <span className="font-voz text-6xl font-medium tabular-nums leading-none text-areia">
            {streak}
          </span>
          <span className="flex items-center gap-1.5 text-sm text-pedra">
            <IconeChama tamanho={14} className="text-brasa" />
            {streak === 1 ? 'dia de sequência' : 'dias de sequência'}
          </span>
        </div>

        <div className="flex items-center gap-5">
          {MARCOS.map((marco) => {
            const alcancado = streak >= marco
            return (
              <span
                key={marco}
                className={`flex items-center gap-1 text-xs font-medium tabular-nums ${
                  alcancado ? 'text-sistema' : 'text-pedra/50'
                }`}
              >
                <IconeFaisca tamanho={11} className={alcancado ? '' : 'opacity-40'} />
                {marco}
              </span>
            )
          })}
        </div>

        {proximo !== undefined && streak > 0 && (
          <p className="text-xs text-pedra/70">
            {proximo - streak === 1
              ? 'Falta 1 dia para o próximo marco.'
              : `Faltam ${proximo - streak} dias para o próximo marco.`}
          </p>
        )}
        {streak === 0 && (
          <p className="font-voz text-xs italic text-pedra/70">
            A sequência começa com o primeiro registro de hoje.
          </p>
        )}
      </section>
    </JanelaSistema>
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
      <EstadoVazio>Suas vitórias aparecem aqui. Registre a primeira na tela Hoje.</EstadoVazio>
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
          <p className="text-xs font-medium capitalize text-pedra">
            {rotuloData(grupo.date)}
          </p>
          <ul className="flex flex-col gap-2">
            {grupo.itens.map((win) => (
              <li
                key={win.id}
                className="flex items-start justify-between gap-3 rounded-cartao border border-linha bg-humus px-4 py-3 text-sm text-areia"
              >
                <span className="flex flex-col gap-1">
                  <span className="flex items-start gap-2.5">
                    <IconeEstrela tamanho={15} className="mt-0.5 shrink-0 text-brasa" />
                    {win.description}
                  </span>
                  {win.skillId && nomeSkill.has(win.skillId) && (
                    <span className="ml-[26px] flex items-center gap-1 text-xs text-broto">
                      <IconeBroto tamanho={12} />
                      {nomeSkill.get(win.skillId)}
                    </span>
                  )}
                </span>
                <BotaoExcluir onClick={() => deleteWin(win.id)} rotulo="Excluir vitória" />
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
  const hoje = todayKey()
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
          // "Hoje" recebe um anel neutro (wayfinding, não status): dá ao grid
          // uma âncora fixa, para a faixa se ler como calendário mesmo vazia.
          const ehHoje = date === hoje
          return (
            <div
              key={date}
              title={ehHoje ? `${date} · hoje` : date}
              className={`aspect-square rounded-[4px] ${
                qualifica ? 'bg-broto' : temAlgo ? 'bg-broto/30' : 'bg-humus'
              } ${ehHoje ? 'ring-1 ring-inset ring-pedra/45' : ''}`}
            />
          )
        })}
      </div>
      <div className="flex items-center justify-end gap-1.5 text-[10px] text-pedra/70">
        <span>menos</span>
        <span className="h-2.5 w-2.5 rounded-[3px] bg-humus" />
        <span className="h-2.5 w-2.5 rounded-[3px] bg-broto/30" />
        <span className="h-2.5 w-2.5 rounded-[3px] bg-broto" />
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
      <div className="flex flex-col gap-2 rounded-cartao border border-linha bg-humus px-4 py-3 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className={quebradoHoje ? 'text-pedra' : 'text-areia'}>{habit.name}</span>
          {quebradoHoje ? (
            <span className="text-xs text-pedra">Quebrado hoje</span>
          ) : (
            <span className="flex items-center gap-1 text-xs font-medium tabular-nums text-brasa">
              <IconeChama tamanho={12} />
              {dias} {dias === 1 ? 'dia' : 'dias'} sem quebrar
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
    <div className="flex flex-col gap-2 rounded-cartao border border-linha bg-humus px-4 py-3 text-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="text-areia">{habit.name}</span>
        <span className="flex items-center gap-2 text-xs font-medium tabular-nums text-pedra">
          {feitos}/7
          {streak > 0 && (
            <span className="flex items-center gap-1 text-brasa">
              <IconeChama tamanho={12} />
              {streak}
            </span>
          )}
        </span>
      </div>
      <div className="flex gap-1">
        {semana.map((d) => {
          const feito = byDate.get(d)?.habitCheckIns[habit.id] === 'COMPLETED'
          return (
            <div
              key={d}
              className={`h-1.5 flex-1 rounded-full ${feito ? 'bg-broto' : 'bg-linha'}`}
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
    <label className="flex items-center gap-2 text-xs text-pedra">
      <span className="flex items-center gap-1.5">
        <IconeBroto tamanho={13} className="text-broto/80" />
        desenvolve
      </span>
      <select
        value={habit.skillId ?? ''}
        onChange={(e) => setHabitSkill(habit.id, e.target.value || null)}
        className={estiloSelect}
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
