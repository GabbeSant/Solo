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
import { IconeFaisca, IconeLua } from '../design/Icone'

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
        className={`flex w-full items-center justify-between gap-3 rounded-cartao border px-4 py-3.5 text-left transition-colors ${
          fechado
            ? 'border-sistema/25 bg-sistema/5 hover:border-sistema/40'
            : 'border-linha bg-humus hover:border-pedra/50'
        }`}
      >
        <span className="flex items-center gap-2.5 text-sm text-areia">
          <IconeLua tamanho={16} className={fechado ? 'text-sistema' : 'text-pedra'} />
          Ritual da noite
        </span>
        <span className="text-xs font-medium text-pedra">
          {fechado ? (
            <span className="flex items-center gap-1.5 text-sistema">
              <IconeFaisca tamanho={13} className="animate-cintilar" />
              Dia fechado
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
                    className="self-start text-xs font-medium text-brasa/80 transition-colors hover:text-brasa"
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
    return <p className="text-xs text-pedra/70">Nenhuma missão definida hoje.</p>
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="font-voz text-sm italic text-pedra">Cumpri minha missão?</p>
      <p className="font-voz text-[15px] leading-snug text-areia">{record.mission}</p>
      <div className="flex gap-2">
        <BotaoSimNao
          ativo={resposta === true}
          ativoClasse="border-broto/60 bg-broto/10 text-broto"
          onClick={() => setMissionAccomplished(date, resposta === true ? null : true)}
        >
          Sim
        </BotaoSimNao>
        <BotaoSimNao
          ativo={resposta === false}
          ativoClasse="border-pedra/50 bg-relevo text-areia"
          onClick={() => setMissionAccomplished(date, resposta === false ? null : false)}
        >
          Ainda não
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
      className={`flex-1 rounded-full border px-3 py-2 text-xs font-medium transition-colors ${
        ativo ? ativoClasse : 'border-linha text-pedra hover:border-pedra/60 hover:text-areia'
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

function NotaDoDia({ record, date }: BlocoProps) {
  const nota = record.reflection?.dayRating
  return (
    <div className="flex flex-col gap-2">
      <p className="font-voz text-sm italic text-pedra">Nota do dia</p>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => {
          const ativo = nota === n
          return (
            <button
              key={n}
              type="button"
              onClick={() => setDayRating(date, ativo ? null : n)}
              className={`flex h-11 flex-1 items-center justify-center rounded-xl border text-sm font-semibold tabular-nums transition-colors ${
                ativo
                  ? 'border-brasa/60 bg-brasa/10 text-brasa'
                  : 'border-linha text-pedra hover:border-pedra/60 hover:text-areia'
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
