import { MissaoDoDia } from '../components/MissaoDoDia'
import { HabitosDoDia } from '../components/HabitosDoDia'
import { StreakPrincipal } from '../components/StreakPrincipal'
import { VitoriasDoDia } from '../components/VitoriasDoDia'
import { RitualNoturno } from '../components/RitualNoturno'
import { AfirmacaoIdentidade } from '../components/Identidade'

const dataDeHoje = new Date().toLocaleDateString('pt-BR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

export function Hoje() {
  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col gap-8 px-5 pb-24 pt-12 text-neutral-100">
      <header className="flex flex-col gap-1">
        <p className="text-sm font-medium capitalize text-neutral-500">
          {dataDeHoje}
        </p>
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">Hoje</h1>
          <StreakPrincipal />
        </div>
        <AfirmacaoIdentidade />
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Missão do dia
        </h2>
        <MissaoDoDia />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Hábitos
        </h2>
        <HabitosDoDia />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Vitórias
        </h2>
        <VitoriasDoDia />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Noite
        </h2>
        <RitualNoturno />
      </section>
    </main>
  )
}
