import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { addSkill, db, deleteSkill, getAllSkills, getAllWins } from '../../data/db'
import type { Skill } from '../../domain/types'
import { BotaoAcao, BotaoExcluir, estiloCampo, estiloSelect, EstadoVazio } from '../design/Primitivas'
import { IconeBroto, IconeEstrela } from '../design/Icone'

export function Habilidades() {
  const skills = useLiveQuery(() => getAllSkills(), [])
  const areas = useLiveQuery(() => db.areas.toArray(), [])
  const wins = useLiveQuery(() => getAllWins(), [])
  const habits = useLiveQuery(() => db.habits.toArray(), [])
  const [nome, setNome] = useState('')
  const [areaId, setAreaId] = useState('')

  async function cadastrar() {
    const id = await addSkill(nome, areaId || null)
    if (id) {
      setNome('')
      setAreaId('')
    }
  }

  if (!skills || !areas || !wins || !habits) return null // ainda carregando

  const nomeArea = new Map(areas.map((a) => [a.id, a.name]))
  // Vitórias por habilidade — a "prova" de crescimento (Etapa 8b).
  const vitoriasPorSkill = new Map<string, number>()
  for (const win of wins) {
    if (win.skillId) vitoriasPorSkill.set(win.skillId, (vitoriasPorSkill.get(win.skillId) ?? 0) + 1)
  }
  // Hábitos que alimentam cada habilidade — o "esforço" do loop (Etapa 9).
  const habitosPorSkill = new Map<string, string[]>()
  for (const habit of habits) {
    if (habit.skillId) {
      const lista = habitosPorSkill.get(habit.skillId) ?? []
      lista.push(habit.name)
      habitosPorSkill.set(habit.skillId, lista)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') cadastrar()
          }}
          placeholder="Uma habilidade que estou desenvolvendo"
          className={estiloCampo}
        />
        {nome.trim().length > 0 && (
          <div className="flex items-center gap-2">
            <select
              value={areaId}
              onChange={(e) => setAreaId(e.target.value)}
              className={estiloSelect}
            >
              <option value="">Sem área</option>
              {areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </select>
            <BotaoAcao onClick={cadastrar}>Cadastrar habilidade</BotaoAcao>
          </div>
        )}
      </div>

      {skills.length === 0 ? (
        <EstadoVazio>Cadastre uma capacidade que você está desenvolvendo.</EstadoVazio>
      ) : (
        <ul className="flex flex-col gap-2">
          {skills.map((skill) => (
            <ItemHabilidade
              key={skill.id}
              skill={skill}
              nomeArea={nomeArea}
              vitorias={vitoriasPorSkill.get(skill.id) ?? 0}
              habitos={habitosPorSkill.get(skill.id) ?? []}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

function ItemHabilidade({
  skill,
  nomeArea,
  vitorias,
  habitos,
}: {
  skill: Skill
  nomeArea: Map<string, string>
  vitorias: number
  habitos: string[]
}) {
  const area = skill.areaId ? nomeArea.get(skill.areaId) : undefined
  return (
    <li className="flex flex-col gap-1.5 rounded-cartao border border-linha bg-humus px-4 py-3.5">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2.5 text-sm text-areia">
          <IconeBroto tamanho={15} className="shrink-0 text-broto" />
          {skill.name}
          {area && <span className="text-xs text-pedra">· {area}</span>}
        </span>
        <span className="flex items-center gap-3">
          {vitorias > 0 && (
            <span className="flex items-center gap-1 text-xs font-medium tabular-nums text-brasa">
              <IconeEstrela tamanho={12} />
              {vitorias} {vitorias === 1 ? 'vitória' : 'vitórias'}
            </span>
          )}
          <BotaoExcluir onClick={() => deleteSkill(skill.id)} rotulo="Excluir habilidade" />
        </span>
      </div>
      {habitos.length > 0 && (
        <span className="text-xs text-pedra">alimentada por: {habitos.join(', ')}</span>
      )}
    </li>
  )
}
