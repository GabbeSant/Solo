import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  getDailyRecord,
  setDayRating,
  setMissionAccomplished,
  setReflectionAnswer,
} from '../../data/db'
import { REFLECTION_QUESTIONS, todayKey, type DailyRecord } from '../../domain/types'
import { focarCampoVitoria } from './VitoriasDoDia'

export function RitualNoturno() {
  const date = todayKey()
  const record = useLiveQuery(() => getDailyRecord(date), [date])
  const [aberto, setAberto] = useState(false)

  if (!record) return null

  // Dia "fechado" = nota do dia registrada (último ato do ritual).
  const fechado = record.reflection?.dayRating !== undefined

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-neutral-800 bg-neutral-900/40 px-4 py-3 text-left transition-colors hover:border-neutral-700"
      >
        <span className="flex items-center gap-2 text-sm text-neutral-100">
          <span className="text-base">🌙</span>
          Ritual da noite
        </span>
        <span className="text-xs font-medium text-neutral-500">
          {fechado ? (
            <span className="text-emerald-400">Dia fechado ✓</span>
          ) : aberto ? (
            'Fechar'
          ) : (
            'Abrir'
          )}
        </span>
      </button>

      {aberto && (
        <div className="flex flex-col gap-5 rounded-xl border border-neutral-800 bg-neutral-900/40 px-4 py-5">
          <MissaoCumprida record={record} date={date} />

          <div className="flex flex-col gap-4">
            {REFLECTION_QUESTIONS.map((q) => (
              <div key={q.id} className="flex flex-col gap-1.5">
                <CampoReflexao
                  prompt={q.prompt}
                  value={record.reflection?.answers?.[q.id] ?? ''}
                  onSave={(texto) => setReflectionAnswer(date, q.id, texto)}
                />
                {q.id === 'valeu' && (
                  <button
                    type="button"
                    onClick={focarCampoVitoria}
                    className="self-start text-xs font-medium text-orange-400/80 transition-colors hover:text-orange-300"
                  >
                    ↑ Registrar como vitória
                  </button>
                )}
              </div>
            ))}
          </div>

          <NotaDoDia record={record} date={date} />
        </div>
      )}
    </div>
  )
}

type BlocoProps = { record: DailyRecord; date: string }

function MissaoCumprida({ record, date }: BlocoProps) {
  const temMissao = record.mission.trim().length > 0
  const resposta = record.missionAccomplished

  if (!temMissao) {
    return (
      <p className="text-xs text-neutral-600">Nenhuma missão definida hoje.</p>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium text-neutral-500">Cumpri minha missão?</p>
      <p className="text-sm text-neutral-300">{record.mission}</p>
      <div className="flex gap-2">
        <BotaoSimNao
          ativo={resposta === true}
          ativoClasse="border-emerald-600 bg-emerald-950/40 text-emerald-300"
          onClick={() => setMissionAccomplished(date, resposta === true ? null : true)}
        >
          ✓ Sim
        </BotaoSimNao>
        <BotaoSimNao
          ativo={resposta === false}
          ativoClasse="border-neutral-600 bg-neutral-800/60 text-neutral-200"
          onClick={() => setMissionAccomplished(date, resposta === false ? null : false)}
        >
          ✗ Ainda não
        </BotaoSimNao>
      </div>
    </div>
  )
}

function BotaoSimNao({
  ativo,
  ativoClasse,
  onClick,
  children,
}: {
  ativo: boolean
  ativoClasse: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
        ativo ? ativoClasse : 'border-neutral-700 text-neutral-400 hover:border-neutral-500'
      }`}
    >
      {children}
    </button>
  )
}

function CampoReflexao({
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
      <span className="text-xs font-medium text-neutral-500">{prompt}</span>
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
        className="w-full resize-none rounded-lg border border-neutral-800 bg-neutral-950/40 px-3 py-2 text-sm text-neutral-100 outline-none placeholder:text-neutral-700 focus:border-neutral-600"
      />
    </label>
  )
}

function NotaDoDia({ record, date }: BlocoProps) {
  const nota = record.reflection?.dayRating
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium text-neutral-500">Nota do dia</p>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => {
          const ativo = nota === n
          return (
            <button
              key={n}
              type="button"
              onClick={() => setDayRating(date, ativo ? null : n)}
              className={`flex h-10 flex-1 items-center justify-center rounded-lg border text-sm font-semibold transition-colors ${
                ativo
                  ? 'border-orange-500 bg-orange-950/40 text-orange-300'
                  : 'border-neutral-800 text-neutral-500 hover:border-neutral-600'
              }`}
            >
              {n}
            </button>
          )
        })}
      </div>
    </div>
  )
}
