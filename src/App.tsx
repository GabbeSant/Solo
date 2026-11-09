import { useEffect, useState } from 'react'
import { Hoje } from './ui/screens/Hoje'
import { Rotina } from './ui/screens/Rotina'
import { Progresso } from './ui/screens/Progresso'
import { Metas } from './ui/screens/Metas'
import { ensureSeed } from './data/db'
import { IconeAlvo, IconeBroto, IconeRelogio, IconeSol } from './ui/design/Icone'

type Tela = 'hoje' | 'rotina' | 'progresso' | 'metas'

const ABAS = [
  { id: 'hoje', rotulo: 'Hoje', Icone: IconeSol },
  { id: 'rotina', rotulo: 'Rotina', Icone: IconeRelogio },
  { id: 'progresso', rotulo: 'Progresso', Icone: IconeBroto },
  { id: 'metas', rotulo: 'Metas', Icone: IconeAlvo },
] as const

export function App() {
  const [tela, setTela] = useState<Tela>('hoje')

  useEffect(() => {
    ensureSeed()
  }, [])

  return (
    <div className="min-h-dvh bg-solo lg:flex">
      <BarraLateral tela={tela} onNavigate={setTela} />
      <div className="min-w-0 flex-1">
        {tela === 'hoje' ? (
          <Hoje />
        ) : tela === 'rotina' ? (
          <Rotina />
        ) : tela === 'progresso' ? (
          <Progresso />
        ) : (
          <Metas />
        )}
      </div>
      <NavInferior tela={tela} onNavigate={setTela} />
    </div>
  )
}

/** Navegação do desktop: uma coluna lateral fixa que também assina o produto. */
function BarraLateral({ tela, onNavigate }: { tela: Tela; onNavigate: (t: Tela) => void }) {
  return (
    <aside className="solo-sidebar sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-linha bg-solo px-4 py-8 lg:flex">
      <div className="solo-brand">
        <span aria-hidden="true" className="solo-brand-mark">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 1C13.2 8.3 15.7 10.8 23 12C15.7 13.2 13.2 15.7 12 23C10.8 15.7 8.3 13.2 1 12C8.3 10.8 10.8 8.3 12 1Z" />
          </svg>
        </span>
        <span className="solo-brand-name">Solo</span>
      </div>
      <nav className="flex flex-col gap-1" aria-label="Navegação principal">
        {ABAS.map(({ id, rotulo, Icone }) => {
          const ativo = tela === id
          return (
            <button
              key={id}
              type="button"
              aria-current={ativo ? 'page' : undefined}
              onClick={() => onNavigate(id)}
              className={`flex items-center gap-3 rounded-cartao px-3 py-2.5 text-sm font-medium transition-colors ${
                ativo ? 'bg-humus text-areia' : 'text-pedra hover:bg-humus/50 hover:text-areia'
              }`}
            >
              <span className={ativo ? 'text-brasa' : ''}>
                <Icone tamanho={18} />
              </span>
              {rotulo}
            </button>
          )
        })}
      </nav>
      <div className="solo-sidebar-note">
        <p>Seu ritmo.<br />Seu próprio caminho.</p>
        <small>Um passo já muda o dia.</small>
      </div>
    </aside>
  )
}

/** Navegação do mobile: barra inferior. Escondida quando a lateral aparece. */
function NavInferior({ tela, onNavigate }: { tela: Tela; onNavigate: (t: Tela) => void }) {
  return (
    <nav aria-label="Navegação principal" className="solo-bottom-nav fixed inset-x-0 bottom-0 border-t border-linha bg-solo/90 backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-md">
        {ABAS.map(({ id, rotulo, Icone }) => (
          <BotaoNav
            key={id}
            rotulo={rotulo}
            icone={<Icone tamanho={18} />}
            ativo={tela === id}
            onClick={() => onNavigate(id)}
          />
        ))}
      </div>
    </nav>
  )
}

function BotaoNav({
  rotulo,
  icone,
  ativo,
  onClick,
}: {
  rotulo: string
  icone: React.ReactNode
  ativo: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-current={ativo ? 'page' : undefined}
      onClick={onClick}
      className={`relative flex flex-1 flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors ${
        ativo ? 'text-areia' : 'text-pedra/70 hover:text-pedra'
      }`}
    >
      {ativo && (
        <span
          aria-hidden="true"
          className="absolute top-0 h-0.5 w-8 rounded-full bg-brasa"
        />
      )}
      {icone}
      {rotulo}
    </button>
  )
}
