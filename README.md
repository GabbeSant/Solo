# Solo

Aplicação pessoal (PWA) construída com React, TypeScript e Vite, com armazenamento local via Dexie (IndexedDB) e suporte a instalação/uso offline.

## Stack

- **React 19** + **TypeScript**
- **Vite 6** (build/dev server) + **vite-plugin-pwa** (PWA/offline)
- **Tailwind CSS 4** (`@tailwindcss/vite`)
- **Dexie** + **dexie-react-hooks** (banco local no navegador via IndexedDB)
- Fontes: **Fraunces** e **Instrument Sans** (`@fontsource-variable`)
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
├── src/             # código-fonte da aplicação
├── index.html        # ponto de entrada
├── vite.config.ts    # configuração do Vite
├── tsconfig.json     # configuração do TypeScript
└── netlify.toml       # configuração de deploy (Netlify)
```

## Licença

Projeto pessoal de Gabriel ([@GabbeSant](https://github.com/GabbeSant)).
