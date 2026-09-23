# Solo

Aplicação pessoal (PWA) para acompanhamento de rotina, hábitos e metas — construída com React, TypeScript e Vite, com armazenamento local via Dexie (IndexedDB) e uso offline.

## Funcionalidades

O app é organizado em 4 seções principais, navegáveis por uma barra lateral (desktop) ou barra inferior (mobile):

- **Hoje** — visão do dia atual
- **Rotina** — hábitos e tarefas recorrentes
- **Progresso** — acompanhamento da evolução ao longo do tempo
- **Metas** — objetivos de longo prazo

Todos os dados são salvos localmente no dispositivo (IndexedDB via Dexie), sem depender de backend/servidor.

## Stack

- **React 19** + **TypeScript**
- **Vite 6** (build/dev server) + **vite-plugin-pwa** (PWA/offline)
- **Tailwind CSS 4** (`@tailwindcss/vite`)
- **Dexie** + **dexie-react-hooks** (banco local no navegador via IndexedDB)
- Fontes: **Fraunces** e **Instrument Sans** (`@fontsource-variable`)
- Identidade visual com tema de cores próprio (solo, areia, pedra, humus, brasa, broto) e ícones customizados
- Deploy configurado para **Netlify** (`netlify.toml`)

## Pré-requisitos

- Node.js 18+
- npm

## Instalação

```bash
npm install
```

## Scripts disponíveis

```bash
npm run dev       # ambiente de desenvolvimento (Vite)
npm run build     # build de produção (tsc + vite build)
npm run preview   # pré-visualização do build de produção
```

## Estrutura do projeto

```
Solo/
├── public/          # assets estáticos
├── src/
│   ├── data/         # camada de dados (Dexie/IndexedDB, seed)
│   └── ui/
│       ├── screens/   # telas: Hoje, Rotina, Progresso, Metas
│       └── design/    # componentes visuais e ícones
├── index.html         # ponto de entrada
├── vite.config.ts      # configuração do Vite
├── tsconfig.json       # configuração do TypeScript
└── netlify.toml          # configuração de deploy (Netlify)
```

## Licença

Projeto pessoal de Gabriel ([@GabbeSant](https://github.com/GabbeSant)).
