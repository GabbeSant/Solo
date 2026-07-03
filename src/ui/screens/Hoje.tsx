import { useLiveQuery } from 'dexie-react-hooks'
import { MissaoDoDia } from '../components/MissaoDoDia'
import { HabitosDoDia } from '../components/HabitosDoDia'
import { StreakPrincipal } from '../components/StreakPrincipal'
import { VitoriasDoDia } from '../components/VitoriasDoDia'
import { RitualNoturno } from '../components/RitualNoturno'
import { AfirmacaoIdentidade } from '../components/Identidade'
import { getAllDailyRecords, getAllIdentities, getDailyRecord, getWinsByDate } from '../../data/db'
import { computeMainStreak } from '../../domain/streaks'
import { todayKey } from '../../domain/types'
import { TrechoDoFio } from '../design/Fio'
import { IconeFaisca } from '../design/Icone'

const dataPorExtenso = new Date().toLocaleDateString('pt-BR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})
// Só a primeira letra maiúscula: "Quarta-feira, 1 de julho".
const dataDeHoje = dataPorExtenso.charAt(0).toUpperCase() + dataPorExtenso.slice(1)

// Marcos de sequência que o Sistema reconhece (VISION: 7, 30, 100, 365).
const MARCOS = [7, 30, 100, 365]

export function Hoje() {
  const date = todayKey()
  const record = useLiveQuery(() => getDailyRecord(date), [date])
  const wins = useLiveQuery(() => getWinsByDate(date), [date])

  // O Fio: cada trecho do dia acende quando recebe um registro.
  const missaoDefinida = (record?.mission.trim().length ?? 0) > 0
  const algumHabito = record
    ? Object.values(record.habitCheckIns).some((s) => s === 'COMPLETED')
    : false
  const temVitoria = (wins?.length ?? 0) > 0
  const diaFechado = record?.reflection?.dayRating !== undefined

  return (
    <div className="mx-auto flex w-full max-w-6xl justify-center gap-12 px-5 pb-28 pt-12 lg:pb-12 lg:pt-16">
      <main className="flex w-full max-w-md flex-col text-areia">
        <header className="mb-10 flex flex-col gap-2">
          <p className="text-sm font-medium text-pedra">{dataDeHoje}</p>
          <div className="flex items-center justify-between gap-3">
            <h1 className="font-voz text-[28px] font-medium tracking-tight">Hoje</h1>
            {/* No desktop largo a sequência migra para o painel lateral. */}
            <span className="xl:hidden">
              <StreakPrincipal />
            </span>
          </div>
          <div className="xl:hidden">
            <AfirmacaoIdentidade />
          </div>
        </header>

        <TrechoDoFio rotulo="Missão do dia" aceso={missaoDefinida}>
          <MissaoDoDia />
        </TrechoDoFio>

        <TrechoDoFio rotulo="Hábitos" aceso={algumHabito}>
          <HabitosDoDia />
        </TrechoDoFio>

        <TrechoDoFio rotulo="Vitórias" aceso={temVitoria}>
          <VitoriasDoDia />
        </TrechoDoFio>

        <TrechoDoFio rotulo="Noite" aceso={diaFechado} ultimo>
          <RitualNoturno />
        </TrechoDoFio>
      </main>

      <PainelCompanheiro />
    </div>
  )
}

/**
 * Painel lateral do desktop largo: a sequência e quem o usuário está se tornando,
 * sempre à vista enquanto ele constrói o dia. Some no mobile/tablet (fica no header).
 */
function PainelCompanheiro() {
  const records = useLiveQuery(() => getAllDailyRecords(), [])
  const identities = useLiveQuery(() => getAllIdentities(), [])
  if (!records || !identities) return null

  const streak = computeMainStreak(records)

  return (
    <aside className="hidden w-72 shrink-0 xl:block">
      <div className="sticky top-16 flex flex-col gap-10">
        <div className="flex flex-col gap-3">
          <span className="text-[13px] font-medium text-pedra">Sua sequência</span>
          <div className="flex items-baseline gap-2">
            <span className="font-voz text-5xl font-medium tabular-nums leading-none text-areia">
              {streak}
            </span>
            <span className="text-sm text-pedra">{streak === 1 ? 'dia' : 'dias'}</span>
          </div>
          <div className="flex items-center gap-4">
            {MARCOS.map((marco) => {
              const alcancado = streak >= marco
              return (
                <span
                  key={marco}
                  className={`flex items-center gap-1 text-xs tabular-nums ${
                    alcancado ? 'text-sistema' : 'text-pedra/50'
                  }`}
                >
                  <IconeFaisca tamanho={11} className={alcancado ? '' : 'opacity-40'} />
                  {marco}
                </span>
              )
            })}
          </div>
        </div>

        {identities.length > 0 && (
          <div className="flex flex-col gap-3">
            <span className="text-[13px] font-medium text-pedra">Quem você está se tornando</span>
            <ul className="flex flex-col gap-2.5">
              {identities.map((identity) => (
                <li
                  key={identity.id}
                  className="font-voz text-[15px] italic leading-relaxed text-areia"
                >
                  {identity.statement}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </aside>
  )
}
