import { useEffect, useState } from 'react'
import { Hoje } from './ui/screens/Hoje'
import { Progresso } from './ui/screens/Progresso'
import { Metas } from './ui/screens/Metas'
import { ensureSeed } from './data/db'

type Tela = 'hoje' | 'progresso' | 'metas'

export function App() {
  const [tela, setTela] = useState<Tela>('hoje')

  useEffect(() => {
    ensureSeed()
  }, [])

  return (
    <div className="min-h-dvh bg-neutral-950">
      {tela === 'hoje' ? <Hoje /> : tela === 'progresso' ? <Progresso /> : <Metas />}
      <NavInferior tela={tela} onNavigate={setTela} />
    </div>
  )
}

function NavInferior({ tela, onNavigate }: { tela: Tela; onNavigate: (t: Tela) => void }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 border-t border-neutral-800 bg-neutral-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-md">
        <BotaoNav rotulo="Hoje" icone="☀️" ativo={tela === 'hoje'} onClick={() => onNavigate('hoje')} />
        <BotaoNav
          rotulo="Progresso"
          icone="📈"
          ativo={tela === 'progresso'}
          onClick={() => onNavigate('progresso')}
        />
        <BotaoNav
          rotulo="Metas"
          icone="🎯"
          ativo={tela === 'metas'}
          onClick={() => onNavigate('metas')}
        />
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
  icone: string
  ativo: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 flex-col items-center gap-0.5 py-3 text-xs font-medium transition-colors ${
        ativo ? 'text-orange-300' : 'text-neutral-500 hover:text-neutral-300'
      }`}
    >
      <span className="text-base">{icone}</span>
      {rotulo}
    </button>
  )
}
