import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { addIdentity, deleteIdentity, getAllIdentities } from '../../data/db'
import { BotaoAcao, BotaoExcluir, estiloCampo, EstadoVazio } from '../design/Primitivas'
import { IconeFaisca } from '../design/Icone'

/** Afirmação discreta na tela Hoje: lembra quem o usuário está se tornando. */
export function AfirmacaoIdentidade() {
  const identities = useLiveQuery(() => getAllIdentities(), [])
  if (!identities || identities.length === 0) return null
  return (
    <p className="font-voz text-sm italic leading-relaxed text-pedra">
      {identities.map((i) => i.statement).join(' · ')}
    </p>
  )
}

export function Identidade() {
  const identities = useLiveQuery(() => getAllIdentities(), [])
  const [texto, setTexto] = useState('')

  async function declarar() {
    const id = await addIdentity(texto)
    if (id) setTexto('')
  }

  if (!identities) return null

  return (
    <div className="flex flex-col gap-3">
      <input
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') declarar()
        }}
        placeholder="Eu sou alguém que..."
        className={`${estiloCampo} font-voz`}
      />
      {texto.trim().length > 0 && (
        <div className="self-start">
          <BotaoAcao onClick={declarar}>Declarar identidade</BotaoAcao>
        </div>
      )}

      {identities.length === 0 ? (
        <EstadoVazio>
          Declare quem você está se tornando. As metas abaixo são o caminho.
        </EstadoVazio>
      ) : (
        <ul className="flex flex-col gap-2">
          {identities.map((identity) => (
            <li
              key={identity.id}
              className="flex items-start justify-between gap-3 rounded-cartao border border-linha bg-humus px-4 py-3.5"
            >
              <span className="flex items-start gap-2.5 font-voz text-[15px] leading-snug text-areia">
                <IconeFaisca tamanho={15} className="mt-0.5 shrink-0 text-sistema" />
                {identity.statement}
              </span>
              <BotaoExcluir onClick={() => deleteIdentity(identity.id)} rotulo="Excluir declaração" />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
