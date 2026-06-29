import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { addIdentity, deleteIdentity, getAllIdentities } from '../../data/db'

/** Afirmação discreta na tela Hoje: lembra quem o usuário está se tornando. */
export function AfirmacaoIdentidade() {
  const identities = useLiveQuery(() => getAllIdentities(), [])
  if (!identities || identities.length === 0) return null
  return (
    <p className="text-xs leading-relaxed text-neutral-500">
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
        className="w-full rounded-xl border border-neutral-800 bg-neutral-900/40 px-4 py-4 text-sm text-neutral-100 outline-none placeholder:text-neutral-600 focus:border-neutral-600"
      />
      {texto.trim().length > 0 && (
        <button
          type="button"
          onClick={declarar}
          className="self-start rounded-lg border border-orange-700 bg-orange-950/40 px-4 py-2 text-xs font-semibold text-orange-300 transition-colors hover:border-orange-500"
        >
          ✨ Declarar identidade
        </button>
      )}

      {identities.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-800 px-4 py-6 text-center text-sm text-neutral-600">
          Declare quem você está se tornando. As metas abaixo são o caminho. ✨
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {identities.map((identity) => (
            <li
              key={identity.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-neutral-800 bg-neutral-900/40 px-4 py-3"
            >
              <span className="flex items-start gap-2 text-sm text-neutral-100">
                <span className="mt-0.5 text-base leading-none">✨</span>
                {identity.statement}
              </span>
              <button
                type="button"
                onClick={() => deleteIdentity(identity.id)}
                aria-label="Excluir declaração"
                className="shrink-0 text-neutral-600 transition-colors hover:text-red-400"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
