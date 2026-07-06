import { useLiveQuery } from 'dexie-react-hooks'
import { getAllRoutineBlocks } from '../../data/db'
import { todayKey, weekdayOf } from '../../domain/types'
import { estiloRotuloSecao } from '../design/Primitivas'
import { IconeRelogio } from '../design/Icone'

/**
 * Os blocos da rotina que valem para hoje, na tela Hoje — a estrutura do dia
 * junto do loop diário, não um documento parado na aba Rotina. Some se o dia
 * não tem blocos. O bloco em curso agora acende em brasa (manter o ritmo).
 */
export function RotinaDeHoje() {
  const blocks = useLiveQuery(() => getAllRoutineBlocks(), [])
  if (!blocks) return null

  const doDia = blocks.filter((b) => b.weekday === weekdayOf(todayKey()))
  if (doDia.length === 0) return null

  // "Agora" avaliado na renderização — suficiente: a tela re-renderiza a cada registro.
  const agora = new Date().toTimeString().slice(0, 5)

  return (
    <section className="mb-10 flex flex-col gap-2">
      <span className={estiloRotuloSecao}>Rotina de hoje</span>
      <ul className="flex flex-col gap-1.5">
        {doDia.map((b) => {
          const emCurso = b.start <= agora && agora < b.end
          return (
            <li
              key={b.id}
              className={`flex items-center gap-3 rounded-cartao border px-3.5 py-2 text-sm ${
                emCurso ? 'border-brasa/35 bg-brasa/5' : 'border-linha bg-humus'
              }`}
            >
              <span
                className={`shrink-0 text-xs tabular-nums ${emCurso ? 'text-brasa' : 'text-pedra'}`}
              >
                {b.start}–{b.end}
              </span>
              <span className="min-w-0 flex-1 text-areia">{b.activity}</span>
              {emCurso && <IconeRelogio tamanho={13} className="shrink-0 text-brasa" />}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
