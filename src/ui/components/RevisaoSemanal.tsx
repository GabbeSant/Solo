import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  getWeeklyReview,
  setWeeklyReviewAnswer,
  setWeeklyReviewClosed,
} from '../../data/db'
import { WEEKLY_REVIEW_QUESTIONS, weekKey } from '../../domain/types'
import { BotaoAcao, BotaoQuieto } from '../design/Primitivas'
import { IconeCalendario, IconeFaisca } from '../design/Icone'

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
    </section>
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
