import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  addGoal,
  deleteGoal,
  getAllDailyRecords,
  getAllGoals,
  getAllIdentities,
  setGoalDone,
  setGoalParent,
} from '../../data/db'
import { todayKey, type Goal } from '../../domain/types'
import { Identidade } from '../components/Identidade'
import { TrechoDoFio } from '../design/Fio'
import { BotaoAcao, BotaoExcluir, EstadoVazio, estiloCampo, estiloSelect } from '../design/Primitivas'
import { IconeCalendario, IconeCheck, IconeRamo, IconeSol } from '../design/Icone'

export function Metas() {
  const goals = useLiveQuery(() => getAllGoals(), [])
  const records = useLiveQuery(() => getAllDailyRecords(), [])
  const identities = useLiveQuery(() => getAllIdentities(), [])
  const [titulo, setTitulo] = useState('')
  const [prazo, setPrazo] = useState('')
  const [paiId, setPaiId] = useState('')

  async function cadastrar() {
    const id = await addGoal(titulo, prazo || null, paiId || null)
    if (id) {
      setTitulo('')
      setPrazo('')
      setPaiId('')
    }
  }

  if (!goals || !records || !identities) return null

  // Dias de missão vinculados a cada meta — prova de progresso (Etapa 10b).
  const diasPorMeta = new Map<string, number>()
  for (const r of records) {
    if (r.goalId) diasPorMeta.set(r.goalId, (diasPorMeta.get(r.goalId) ?? 0) + 1)
  }

  // Hierarquia em 2 níveis (Etapa 12): raízes + sub-metas agrupadas por pai.
  // Pai inexistente (defensivo) = trata como raiz.
  const ids = new Set(goals.map((g) => g.id))
  const raizes = goals.filter((g) => !g.parentGoalId || !ids.has(g.parentGoalId))
  const filhasPorMeta = new Map<string, Goal[]>()
  for (const g of goals) {
    if (g.parentGoalId && ids.has(g.parentGoalId)) {
      const filhas = filhasPorMeta.get(g.parentGoalId) ?? []
      filhas.push(g)
      filhasPorMeta.set(g.parentGoalId, filhas)
    }
  }
  // Só metas-raiz pendentes podem receber sub-metas.
  const paisElegiveis = raizes.filter((g) => !g.done)

  // Trajetória: números reais para o painel lateral do desktop.
  const ativas = goals.filter((g) => !g.done).length
  const concluidas = goals.length - ativas
  const diasMissao = records.filter((r) => r.goalId).length

  return (
    <div className="mx-auto flex w-full max-w-6xl justify-center gap-12 px-5 pb-28 pt-12 lg:pb-12 lg:pt-16">
      <main className="flex w-full max-w-md flex-col text-areia">
      <header className="mb-10 flex flex-col gap-1">
        <p className="text-sm font-medium text-pedra">Para onde estou indo</p>
        <h1 className="font-voz text-[28px] font-medium tracking-tight">Metas</h1>
      </header>

      <TrechoDoFio rotulo="Quem eu quero ser" aceso={identities.length > 0}>
        <Identidade />
      </TrechoDoFio>

      <TrechoDoFio rotulo="O caminho até lá" aceso={goals.length > 0} ultimo>
        <div className="flex flex-col gap-3">
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') cadastrar()
            }}
            placeholder="Uma meta que quero alcançar"
            className={`${estiloCampo} font-voz`}
          />
          {titulo.trim().length > 0 && paisElegiveis.length > 0 && (
            <label className="flex items-center gap-2 px-1 text-xs text-pedra">
              <span className="flex items-center gap-1.5">
                <IconeRamo tamanho={13} />
                parte de
              </span>
              <select
                value={paiId}
                onChange={(e) => setPaiId(e.target.value)}
                className={`flex-1 ${estiloSelect}`}
              >
                <option value="">—</option>
                {paisElegiveis.map((goal) => (
                  <option key={goal.id} value={goal.id}>
                    {goal.title}
                  </option>
                ))}
              </select>
            </label>
          )}
          {titulo.trim().length > 0 && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={prazo}
                onChange={(e) => setPrazo(e.target.value)}
                className="rounded-lg border border-linha bg-humus px-3 py-2 text-xs text-pedra outline-none transition-colors focus:border-pedra/70"
              />
              <BotaoAcao onClick={cadastrar}>Criar meta</BotaoAcao>
            </div>
          )}

          {goals.length === 0 ? (
            <EstadoVazio>Defina uma meta para dar direção aos seus dias.</EstadoVazio>
          ) : (
            <ul className="flex flex-col gap-2">
              {raizes.map((goal) => {
                const filhas = filhasPorMeta.get(goal.id) ?? []
                return (
                  <li key={goal.id} className="flex flex-col gap-2">
                    <CardMeta
                      goal={goal}
                      dias={diasPorMeta.get(goal.id) ?? 0}
                      raizes={raizes}
                      temFilhas={filhas.length > 0}
                    />
                    {filhas.length > 0 && (
                      <ul className="ml-4 flex flex-col gap-2 border-l border-linha pl-3">
                        {filhas.map((sub) => (
                          <li key={sub.id}>
                            <CardMeta
                              goal={sub}
                              dias={diasPorMeta.get(sub.id) ?? 0}
                              raizes={raizes}
                              temFilhas={false}
                            />
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </TrechoDoFio>
      </main>

      <aside className="hidden w-72 shrink-0 xl:block">
        <div className="sticky top-16 flex flex-col gap-5">
          <span className="text-[13px] font-medium text-pedra">Sua trajetória</span>
          <LinhaStat rotulo="Metas ativas" valor={ativas} />
          <LinhaStat rotulo="Metas concluídas" valor={concluidas} />
          <LinhaStat rotulo="Dias de missão" valor={diasMissao} />
        </div>
      </aside>
    </div>
  )
}

/** Uma linha do painel de trajetória: rótulo à esquerda, número à direita. */
function LinhaStat({ rotulo, valor }: { rotulo: string; valor: number }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-linha pb-3">
      <span className="text-sm text-pedra">{rotulo}</span>
      <span className="font-voz text-2xl font-medium tabular-nums text-areia">{valor}</span>
    </div>
  )
}

/** Prazo amigável: "venceu", "hoje", "amanhã" ou data por extenso (pt-BR). */
function rotuloPrazo(deadline: string): { texto: string; vencido: boolean } {
  const hoje = todayKey()
  const [ano, mes, dia] = deadline.split('-').map(Number)
  const texto = new Date(ano, mes - 1, dia).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
    year: deadline.slice(0, 4) === hoje.slice(0, 4) ? undefined : 'numeric',
  })
  return { texto, vencido: deadline < hoje }
}

function CardMeta({
  goal,
  dias,
  raizes,
  temFilhas,
}: {
  goal: Goal
  dias: number
  raizes: Goal[]
  temFilhas: boolean
}) {
  const prazo = goal.deadline ? rotuloPrazo(goal.deadline) : null
  // Pais possíveis: raízes pendentes (+ o pai atual, mesmo concluído, para não sumir),
  // nunca ela mesma. Meta com sub-metas não pode virar sub-meta (2 níveis).
  const opcoesDePai = raizes.filter(
    (r) => r.id !== goal.id && (!r.done || r.id === goal.parentGoalId),
  )
  const mostraSeletorPai = !temFilhas && opcoesDePai.length > 0
  return (
    <div className="flex items-start gap-3 rounded-cartao border border-linha bg-humus px-4 py-3.5">
      <button
        type="button"
        onClick={() => setGoalDone(goal.id, !goal.done)}
        aria-label={goal.done ? 'Marcar como pendente' : 'Marcar como concluída'}
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
          goal.done
            ? 'border-broto bg-broto text-solo'
            : 'border-linha bg-solo hover:border-pedra/60'
        }`}
      >
        {goal.done && <IconeCheck tamanho={11} className="animate-brotar" />}
      </button>
      <span className="flex flex-1 flex-col gap-1">
        <span
          className={`font-voz text-[15px] leading-snug ${
            goal.done ? 'text-pedra line-through decoration-pedra/50' : 'text-areia'
          }`}
        >
          {goal.title}
        </span>
        <span className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
          {prazo && (
            <span
              className={`flex items-center gap-1 text-xs ${
                goal.done ? 'text-pedra/60' : prazo.vencido ? 'text-brasa' : 'text-pedra'
              }`}
            >
              <IconeCalendario tamanho={12} />
              {prazo.texto}
              {!goal.done && prazo.vencido && ' · vencida'}
            </span>
          )}
          {dias > 0 && (
            <span className="flex items-center gap-1 text-xs tabular-nums text-broto">
              <IconeSol tamanho={12} />
              {dias} {dias === 1 ? 'dia de missão' : 'dias de missão'}
            </span>
          )}
        </span>
        {mostraSeletorPai && (
          <label className="mt-1 flex items-center gap-2 text-xs text-pedra/70">
            <span className="flex items-center gap-1.5">
              <IconeRamo tamanho={13} />
              parte de
            </span>
            <select
              value={goal.parentGoalId ?? ''}
              onChange={(e) => setGoalParent(goal.id, e.target.value || null)}
              className={`flex-1 ${estiloSelect}`}
            >
              <option value="">—</option>
              {opcoesDePai.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title}
                </option>
              ))}
            </select>
          </label>
        )}
      </span>
      <BotaoExcluir onClick={() => deleteGoal(goal.id)} rotulo="Excluir meta" />
    </div>
  )
}
