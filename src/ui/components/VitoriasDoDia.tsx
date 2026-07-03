import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { addWin, deleteWin, getAllSkills, getWinsByDate } from '../../data/db'
import { todayKey, type Win } from '../../domain/types'
import { BotaoAcao, BotaoExcluir, estiloCampo, estiloSelect } from '../design/Primitivas'
import { IconeBroto, IconeEstrela } from '../design/Icone'

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
        className={estiloCampo}
      />
      {texto.trim().length > 0 && (
        <div className="flex items-center gap-2">
          {skills.length > 0 && (
            <select
              value={skillId}
              onChange={(e) => setSkillId(e.target.value)}
              className={estiloSelect}
            >
              <option value="">Sem habilidade</option>
              {skills.map((skill) => (
                <option key={skill.id} value={skill.id}>
                  {skill.name}
                </option>
              ))}
            </select>
          )}
          <BotaoAcao onClick={registrar}>Registrar vitória</BotaoAcao>
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
    <li className="flex items-start justify-between gap-3 rounded-cartao border border-linha bg-humus px-4 py-3">
      <span className="flex flex-col gap-1 text-sm text-areia">
        <span className="flex items-start gap-2.5">
          <IconeEstrela tamanho={15} className="mt-0.5 shrink-0 text-brasa" />
          {win.description}
        </span>
        {skillNome && (
          <span className="ml-[26px] flex items-center gap-1 text-xs text-broto">
            <IconeBroto tamanho={12} />
            {skillNome}
          </span>
        )}
      </span>
      <BotaoExcluir onClick={() => deleteWin(win.id)} rotulo="Excluir vitória" />
    </li>
  )
}
