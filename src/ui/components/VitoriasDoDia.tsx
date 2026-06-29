import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { addWin, deleteWin, getAllSkills, getWinsByDate } from '../../data/db'
import { todayKey, type Win } from '../../domain/types'

/** Id do campo de registro — o atalho do ritual da noite usa para focar/rolar até aqui. */
export const CAMPO_VITORIA_ID = 'registrar-vitoria'

/** Foca o campo de registro de vitória, rolando até ele. Usado pelo ritual da noite. */
export function focarCampoVitoria() {
  const el = document.getElementById(CAMPO_VITORIA_ID) as HTMLInputElement | null
  el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  el?.focus()
}

export function VitoriasDoDia() {
  const date = todayKey()
  const wins = useLiveQuery(() => getWinsByDate(date), [date])
  const skills = useLiveQuery(() => getAllSkills(), [])
  const [texto, setTexto] = useState('')
  const [skillId, setSkillId] = useState('')

  async function registrar() {
    const id = await addWin(date, texto, skillId || null)
    if (id) {
      setTexto('')
      setSkillId('')
    }
  }

  if (!wins || !skills) return null // ainda carregando

  const nomeSkill = new Map(skills.map((s) => [s.id, s.name]))

  return (
    <div className="flex flex-col gap-3">
      <input
        id={CAMPO_VITORIA_ID}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') registrar()
        }}
        placeholder="Uma vitória de hoje, por menor que pareça"
        className="w-full rounded-xl border border-neutral-800 bg-neutral-900/40 px-4 py-4 text-sm text-neutral-100 outline-none placeholder:text-neutral-600 focus:border-neutral-600"
      />
      {texto.trim().length > 0 && (
        <div className="flex items-center gap-2">
          {skills.length > 0 && (
            <select
              value={skillId}
              onChange={(e) => setSkillId(e.target.value)}
              className="rounded-lg border border-neutral-800 bg-neutral-900/40 px-3 py-2 text-xs text-neutral-300 outline-none focus:border-neutral-600"
            >
              <option value="">Sem habilidade</option>
              {skills.map((skill) => (
                <option key={skill.id} value={skill.id}>
                  {skill.name}
                </option>
              ))}
            </select>
          )}
          <button
            type="button"
            onClick={registrar}
            className="rounded-lg border border-orange-700 bg-orange-950/40 px-4 py-2 text-xs font-semibold text-orange-300 transition-colors hover:border-orange-500"
          >
            🏆 Registrar vitória
          </button>
        </div>
      )}

      {wins.length > 0 && (
        <ul className="flex flex-col gap-2">
          {wins.map((win) => (
            <ItemVitoria key={win.id} win={win} skillNome={win.skillId ? nomeSkill.get(win.skillId) : undefined} />
          ))}
        </ul>
      )}
    </div>
  )
}

function ItemVitoria({ win, skillNome }: { win: Win; skillNome?: string }) {
  return (
    <li className="group flex items-start justify-between gap-3 rounded-xl border border-neutral-800 bg-neutral-900/40 px-4 py-3">
      <span className="flex flex-col gap-1 text-sm text-neutral-100">
        <span className="flex items-start gap-2">
          <span className="mt-0.5 text-base leading-none">🏆</span>
          {win.description}
        </span>
        {skillNome && (
          <span className="ml-7 text-xs text-emerald-400/90">🌱 {skillNome}</span>
        )}
      </span>
      <button
        type="button"
        onClick={() => deleteWin(win.id)}
        aria-label="Excluir vitória"
        className="shrink-0 text-neutral-600 transition-colors hover:text-red-400"
      >
        ✕
      </button>
    </li>
  )
}
