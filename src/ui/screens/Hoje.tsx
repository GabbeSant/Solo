import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { MissaoDoDia } from '../components/MissaoDoDia'
import { HabitosDoDia } from '../components/HabitosDoDia'
import { VitoriasDoDia } from '../components/VitoriasDoDia'
import { RitualNoturno } from '../components/RitualNoturno'
import { RotinaDeHoje } from '../components/RotinaDeHoje'
import { AfirmacaoIdentidade } from '../components/Identidade'
import { JornadaDoDia, type ParadaDaJornada } from '../components/JornadaDoDia'
import { getAllDailyRecords, getDailyRecord, getWinsByDate } from '../../data/db'
import { computeMainStreak, dayQualifiesMain } from '../../domain/streaks'
import { todayKey } from '../../domain/types'
import { IconeAlvo, IconeBroto, IconeChama, IconeEstrela, IconeLua } from '../design/Icone'

export function Hoje() {
  // O capítulo de hoje acompanha a virada do dia e o retorno ao app.
  const [date, setDate] = useState(todayKey)
  useEffect(() => {
    const atualizar = () => setDate(todayKey())
    const timer = window.setInterval(atualizar, 30_000)
    window.addEventListener('focus', atualizar)
    document.addEventListener('visibilitychange', atualizar)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('focus', atualizar)
      document.removeEventListener('visibilitychange', atualizar)
    }
  }, [])
  const record = useLiveQuery(() => getDailyRecord(date), [date])
  const wins = useLiveQuery(() => getWinsByDate(date), [date])
  const records = useLiveQuery(() => getAllDailyRecords(), [])

  if (!record || !wins || !records) {
    return <main className="journey-page" aria-busy="true"><p>Preparando seu caminho…</p></main>
  }

  const paradas: ParadaDaJornada[] = [
    { id: 'missao', nome: 'Missão', feito: record.mission.trim().length > 0, Icone: IconeAlvo },
    { id: 'habitos', nome: 'Hábitos', feito: Object.values(record.habitCheckIns).includes('COMPLETED'), Icone: IconeBroto },
    { id: 'vitorias', nome: 'Vitória', feito: wins.length > 0, Icone: IconeEstrela },
    { id: 'noite', nome: 'Noite', feito: record.reflection?.dayRating !== undefined, Icone: IconeLua },
  ]
  const diasExplorados = records.filter((r) => r.date <= date && dayQualifiesMain(r)).length
  const streak = computeMainStreak(records, date)
  const data = new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return (
    <main className="journey-page" key={date}>
      <header className="journey-heading">
        <div>
          <p className="journey-date">{data}</p>
          <h1>A aventura continua.</h1>
        </div>
        <div className="journey-streak" title="Missão definida e ao menos um hábito concluído por dia">
          <IconeChama tamanho={21} />
          <span><strong>{streak}</strong> {streak === 1 ? 'dia seguido' : 'dias seguidos'}</span>
        </div>
      </header>

      <JornadaDoDia paradas={paradas} diasExplorados={diasExplorados} date={date} />

      <div className="journey-content">
        <div className="journey-actions">
          <section id="missao" className="journey-mission" aria-labelledby="titulo-missao">
            <div className="journey-section-heading">
              <span className="journey-section-icon"><IconeAlvo tamanho={20} /></span>
              <h2 id="titulo-missao" tabIndex={-1}>Uma missão. Um passo adiante.</h2>
              {paradas[0].feito && <span className="journey-done-label">Definida</span>}
            </div>
            <p className="journey-help">Escolha algo possível para hoje. Pequeno também conta.</p>
            <MissaoDoDia />
          </section>

          <section id="habitos" className="journey-habits" aria-labelledby="titulo-habitos">
            <div className="journey-section-heading">
              <span className="journey-section-icon green"><IconeBroto tamanho={20} /></span>
              <h2 id="titulo-habitos" tabIndex={-1}>O que te move hoje</h2>
            </div>
            <p className="journey-help">Cada check é um pedaço do caminho.</p>
            <HabitosDoDia />
          </section>
        </div>

        <div className="journey-journal">
          <RotinaDeHoje />
          <section id="vitorias" className="journey-wins" aria-labelledby="titulo-vitorias">
            <div className="journey-section-heading">
              <span className="journey-section-icon gold"><IconeEstrela tamanho={20} /></span>
              <h2 id="titulo-vitorias" tabIndex={-1}>Vale guardar essa conquista</h2>
            </div>
            <p className="journey-help">O que aconteceu hoje que você quer lembrar?</p>
            <VitoriasDoDia />
          </section>

          <section id="noite" className="journey-night" aria-labelledby="titulo-noite">
            <div className="journey-section-heading">
              <span className="journey-section-icon sky"><IconeLua tamanho={20} /></span>
              <h2 id="titulo-noite" tabIndex={-1}>Pausa no acampamento</h2>
            </div>
            <p className="journey-help">Quando o dia terminar, guarde o que ficou.</p>
            <RitualNoturno />
          </section>
          <div className="journey-identity"><AfirmacaoIdentidade /></div>
        </div>
      </div>
    </main>
  )
}
