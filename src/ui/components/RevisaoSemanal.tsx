import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  getAllDailyRecords,
  getAllWeeklyReviews,
  getAllWins,
  getWeeklyReview,
  setWeeklyReviewAnswer,
  setWeeklyReviewClosed,
} from '../../data/db'
import { dayQualifiesMain } from '../../domain/streaks'
import {
  WEEKLY_REVIEW_QUESTIONS,
  weekDateKeys,
  weekKey,
  type WeeklyReview,
  type WeekKey,
} from '../../domain/types'
import { BotaoAcao, BotaoQuieto } from '../design/Primitivas'
import { IconeBroto, IconeCalendario, IconeCheck, IconeEstrela, IconeFaisca } from '../design/Icone'

export function RevisaoSemanal() {
  const week = weekKey()
  const review = useLiveQuery(() => getWeeklyReview(week), [week])
  const [aberto, setAberto] = useState(false)

  if (!review) return null

  const fechado = review.closedAt !== undefined

  return (
    <section className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className={`flex w-full items-center justify-between gap-3 rounded-cartao border px-4 py-3.5 text-left transition-colors ${
          fechado
            ? 'border-sistema/25 bg-sistema/5 hover:border-sistema/40'
            : 'border-linha bg-humus hover:border-pedra/50'
        }`}
      >
        <span className="flex flex-col gap-0.5">
          <span className="flex items-center gap-2.5 text-sm text-areia">
            <IconeCalendario tamanho={16} className={fechado ? 'text-sistema' : 'text-pedra'} />
            Revisão da semana
          </span>
          <span className="ml-[26px] text-xs text-pedra/80">{rotuloSemana(week)}</span>
        </span>
        <span className="text-xs font-medium text-pedra">
          {fechado ? (
            <span className="flex items-center gap-1.5 text-sistema">
              <IconeFaisca tamanho={13} className="animate-cintilar" />
              Semana fechada
            </span>
          ) : aberto ? (
            'Fechar'
          ) : (
            'Abrir'
          )}
        </span>
      </button>

      {aberto && (
        <div className="flex animate-surgir flex-col gap-5 rounded-cartao border border-linha bg-humus px-4 py-5">
          <ResumoDaSemana week={week} />

          <div className="flex flex-col gap-4">
            {WEEKLY_REVIEW_QUESTIONS.map((q) => (
              <CampoRevisao
                key={q.id}
                prompt={q.prompt}
                value={review.answers?.[q.id] ?? ''}
                onSave={(texto) => setWeeklyReviewAnswer(week, q.id, texto)}
              />
            ))}
          </div>

          {fechado ? (
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 font-voz text-sm italic text-sistema">
                <IconeFaisca tamanho={13} />
                Semana concluída.
              </span>
              <BotaoQuieto onClick={() => setWeeklyReviewClosed(week, false)}>
                Reabrir
              </BotaoQuieto>
            </div>
          ) : (
            <div className="flex justify-end">
              <BotaoAcao onClick={() => setWeeklyReviewClosed(week, true)}>
                Concluir semana
              </BotaoAcao>
            </div>
          )}
        </div>
      )}

      <HistoricoSemanas semanaAtual={week} />
    </section>
  )
}

/** Números da semana, derivados do histórico — a revisão não depende de memória. */
function ResumoDaSemana({ week }: { week: WeekKey }) {
  const records = useLiveQuery(() => getAllDailyRecords(), [])
  const wins = useLiveQuery(() => getAllWins(), [])
  if (!records || !wins) return null

  const dias = weekDateKeys(week)
  const inicio = dias[0]
  const fim = dias[6]
  // Comparação lexicográfica de YYYY-MM-DD == ordem cronológica.
  const daSemana = records.filter((r) => r.date >= inicio && r.date <= fim)
  const diasAtivos = daSemana.filter(dayQualifiesMain).length
  const missoes = daSemana.filter((r) => r.missionAccomplished === true).length
  const vitorias = wins.filter((w) => w.date >= inicio && w.date <= fim).length

  const stats = [
    {
      valor: diasAtivos,
      rotulo: diasAtivos === 1 ? 'dia ativo' : 'dias ativos',
      Icone: IconeBroto,
      cor: 'text-broto',
    },
    {
      valor: missoes,
      rotulo: missoes === 1 ? 'missão cumprida' : 'missões cumpridas',
      Icone: IconeCheck,
      cor: 'text-broto',
    },
    {
      valor: vitorias,
      rotulo: vitorias === 1 ? 'vitória' : 'vitórias',
      Icone: IconeEstrela,
      cor: 'text-brasa',
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-2">
      {stats.map(({ valor, rotulo, Icone, cor }) => (
        <div
          key={rotulo}
          className="flex flex-col items-center gap-1 rounded-xl border border-linha bg-solo/60 px-2 py-3"
        >
          <span className="flex items-center gap-1.5 font-voz text-xl font-medium tabular-nums text-areia">
            <Icone tamanho={14} className={cor} />
            {valor}
          </span>
          <span className="text-center text-[11px] leading-tight text-pedra">{rotulo}</span>
        </div>
      ))}
    </div>
  )
}

/** Semanas anteriores com registro — o que já foi colhido não se perde. */
function HistoricoSemanas({ semanaAtual }: { semanaAtual: WeekKey }) {
  const reviews = useLiveQuery(() => getAllWeeklyReviews(), [])
  if (!reviews) return null

  const passadas = reviews.filter(
    (r) =>
      r.weekKey !== semanaAtual &&
      (r.closedAt !== undefined || Object.keys(r.answers).length > 0),
  )
  if (passadas.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium text-pedra/80">Semanas anteriores</p>
      <ul className="flex flex-col gap-2">
        {passadas.map((review) => (
          <li key={review.weekKey}>
            <SemanaPassada review={review} />
          </li>
        ))}
      </ul>
    </div>
  )
}

function SemanaPassada({ review }: { review: WeeklyReview }) {
  const [aberto, setAberto] = useState(false)
  const fechada = review.closedAt !== undefined
  const respondidas = WEEKLY_REVIEW_QUESTIONS.filter((q) => review.answers[q.id])

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="flex w-full items-center justify-between gap-3 rounded-cartao border border-linha bg-humus px-4 py-2.5 text-left transition-colors hover:border-pedra/50"
      >
        <span className="flex items-center gap-2 text-xs text-areia">
          <IconeCalendario tamanho={13} className={fechada ? 'text-sistema' : 'text-pedra'} />
          {rotuloSemana(review.weekKey)}
        </span>
        {fechada && (
          <span className="flex items-center gap-1 text-[11px] font-medium text-sistema">
            <IconeFaisca tamanho={11} />
            fechada
          </span>
        )}
      </button>

      {aberto && (
        <div className="flex animate-surgir flex-col gap-4 rounded-cartao border border-linha bg-humus px-4 py-4">
          <ResumoDaSemana week={review.weekKey} />
          {respondidas.length > 0 ? (
            <div className="flex flex-col gap-3">
              {respondidas.map((q) => (
                <div key={q.id} className="flex flex-col gap-0.5">
                  <p className="font-voz text-xs italic text-pedra">{q.prompt}</p>
                  <p className="text-sm text-areia">{review.answers[q.id]}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-pedra/70">Semana fechada sem anotações.</p>
          )}
        </div>
      )}
    </div>
  )
}

/** Intervalo da semana por extenso: "30 jun – 6 jul". */
function rotuloSemana(week: string): string {
  const [ano, mes, dia] = week.split('-').map(Number)
  const segunda = new Date(ano, mes - 1, dia)
  const domingo = new Date(ano, mes - 1, dia + 6)
  const fmt = (d: Date) =>
    d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }).replace('.', '')
  return `${fmt(segunda)} – ${fmt(domingo)}`
}

function CampoRevisao({
  prompt,
  value,
  onSave,
}: {
  prompt: string
  value: string
  onSave: (texto: string) => void
}) {
  const [texto, setTexto] = useState(value)
  const [editando, setEditando] = useState(false)

  // Sincroniza o rascunho com o banco enquanto não estiver editando.
  useEffect(() => {
    if (!editando) setTexto(value)
  }, [value, editando])

  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-voz text-sm italic text-pedra">{prompt}</span>
      <textarea
        value={texto}
        rows={2}
        onChange={(e) => setTexto(e.target.value)}
        onFocus={() => setEditando(true)}
        onBlur={() => {
          setEditando(false)
          if (texto.trim() !== value.trim()) onSave(texto)
        }}
        placeholder="…"
        className="w-full resize-none rounded-xl border border-linha bg-solo/60 px-3 py-2 text-sm text-areia outline-none transition-colors placeholder:text-pedra/40 focus:border-pedra/60"
      />
    </label>
  )
}
