# Solo

Seu ritmo. Seu próprio caminho.

O Solo é um app pessoal para organizar a rotina, acompanhar hábitos e conectar as ações de hoje às metas de longo prazo. A proposta é tornar o progresso visível: definir uma missão, colocar o dia em movimento, guardar uma conquista e refletir sobre o que aconteceu.

Funciona no navegador e pode ser instalado como **PWA**. Os registros ficam no próprio dispositivo, em IndexedDB, e o app pode ser usado offline após o primeiro carregamento da versão de produção.

O projeto está em evolução, com ajustes orientados pela experiência de uso.

## Funcionalidades

A navegação usa uma barra lateral no desktop e uma barra inferior no celular.

### Hoje

- **Jornada diária:** quatro paradas conectadas — missão, hábitos, vitória e noite — com indicação dos registros concluídos e da próxima ação sugerida. Todas podem ser acessadas em qualquer ordem.
- **Missão do dia:** um foco central, com opção de vincular a uma meta. Salva pelo botão, por Enter ou ao sair do campo.
- **Hábitos:** check-in dos hábitos construtivos e registro de quebra dos hábitos restritivos, com opção de desfazer.
- **Vitórias:** registro de conquistas do dia, com vínculo opcional a uma habilidade.
- **Ritual noturno:** confirmação da missão cumprida, cinco perguntas de reflexão e nota do dia de 1 a 5.
- **Rotina de hoje:** exibe os blocos de horário do dia e destaca o bloco em curso quando a tela é renderizada.
- **Identidade:** apresenta as declarações cadastradas sobre quem você quer se tornar.

### Rotina

- Grade semanal recorrente, de segunda a domingo.
- Cadastro de blocos com atividade, dia da semana, horário de início e fim.
- Listagem ordenada por dia e horário, com opção de excluir blocos.

### Progresso

- Sequência principal e sequências por hábito.
- Faixa de atividade dos últimos 35 dias.
- Acompanhamento dos hábitos na semana.
- Mural de vitórias agrupadas por data.
- Cadastro de habilidades e vínculos entre hábitos, habilidades e vitórias.
- Revisão semanal com três perguntas, resumo de dias ativos, missões cumpridas e vitórias.
- Histórico das revisões de semanas anteriores.

### Metas

- Declarações de identidade, como “Eu sou alguém que…”.
- Metas com prazo opcional e marcação de conclusão.
- Hierarquia em dois níveis: metas e submetas.
- Contagem dos dias com missão vinculada a cada meta.

## Como o progresso é contado

### Sequência de dias

Um dia conta para a sequência principal quando tem **uma missão definida e pelo menos um hábito marcado como concluído**. Não é necessário completar as quatro paradas da jornada para esse dia contar.

O dia atual ainda pendente não interrompe a sequência enquanto o dia anterior tiver contado. As sequências são calculadas a partir do histórico; não há um contador persistido separado dos registros.

Para hábitos construtivos, a sequência considera os check-ins concluídos em dias consecutivos. Para hábitos restritivos, o contador começa na data de criação: a ausência de registro preserva a contagem, e somente **“Quebrei”** a interrompe.

### Dias explorados e capítulos

Os dias explorados usam o mesmo critério de dia ativo, mas são **acumulados**, sem exigir dias consecutivos. Uma pausa não apaga esse progresso.

| Dias ativos acumulados | Capítulo |
| --- | --- |
| 0 a 2 | Vale dos primeiros passos |
| 3 a 6 | Bosque das descobertas |
| 7 a 13 | Travessia das cascatas |
| 14 ou mais | Caminho das alturas |

Os capítulos aparecem como marcos de progresso na interface, sem imagens de cenário.

## Tecnologias

| Tecnologia | Uso |
| --- | --- |
| React 19 e TypeScript | Interface e tipagem |
| Vite 6 | Desenvolvimento e build |
| Tailwind CSS 4 e CSS próprio | Estilos, tokens visuais e layout responsivo |
| Dexie 4 | Persistência em IndexedDB e evolução do schema |
| dexie-react-hooks | Atualização da interface conforme os dados locais mudam |
| vite-plugin-pwa | Manifest, service worker e cache offline |
| Instrument Sans | Tipografia carregada pelo próprio app |

O app é uma SPA. A troca entre abas usa estado do React, sem biblioteca de roteamento. O funcionamento atual não exige backend, autenticação, chaves de API ou arquivo `.env`.

## Executar localmente

### Pré-requisitos

- Node.js 22 ou superior como ambiente recomendado.
- npm.
- Git, caso você ainda precise clonar o repositório.
- Navegador com suporte a IndexedDB.

### Instalação e desenvolvimento

```bash
git clone https://github.com/GabbeSant/Solo.git
cd Solo
npm ci
npm run dev
```

Se você já tem o projeto, execute os comandos a partir da pasta dele. `npm ci` instala as dependências conforme o `package-lock.json`; só é necessário na preparação do ambiente ou quando as dependências mudarem.

Abra o endereço indicado no terminal, normalmente **http://localhost:5173**. Se essa porta estiver ocupada, o Vite pode escolher outra. Mantenha o terminal aberto enquanto usa o app e pressione **Ctrl + C** para encerrar.

Na primeira execução, o banco é inicializado com quatro áreas e hábitos de exemplo. O seed fica em [src/data/db.ts](src/data/db.ts) e não substitui os registros de uma instalação já inicializada.

### Comandos disponíveis

| Comando | Resultado |
| --- | --- |
| `npm ci` | Instala as dependências a partir do lockfile |
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Verifica os tipos com TypeScript e gera a versão de produção em `dist/` |
| `npm run preview` | Serve o build localmente, normalmente em `http://localhost:4173` |

Para conferir a versão de produção, execute:

```bash
npm run build
npm run preview
```

O projeto ainda não possui comandos de lint ou uma suíte de testes configurados no `package.json`. O build é a verificação disponível para tipos e empacotamento; o comportamento deve ser conferido também no navegador.

## PWA e uso offline

O manifest e o service worker são gerados durante o build. Para testar a instalação e o funcionamento offline, use `npm run preview` após gerar o build, ou uma publicação com HTTPS. O servidor de desenvolvimento não habilita o service worker na configuração atual.

1. Abra o app com conexão e aguarde o carregamento inicial e a instalação do service worker.
2. Use a opção de instalar o app ou adicionar à tela inicial, conforme o navegador.
3. Após o cache estar pronto, abra novamente sem conexão.

As fontes e os arquivos da interface são servidos pelo próprio app. O service worker usa atualização automática. A opção de instalação depende do navegador e do sistema operacional. No acesso pelo celular, use HTTPS; um endereço HTTP da rede local não equivale a `localhost` para os requisitos da PWA.

## Armazenamento e dados

Os dados ficam no banco IndexedDB chamado `solo`, separado por origem do site e perfil do navegador. Fechar e reabrir a página mantém os registros, desde que o armazenamento do site seja preservado.

Isso tem algumas consequências práticas:

- `localhost:5173`, `localhost:4173` e o domínio publicado têm bancos separados. Usar outra porta pode fazer o app parecer vazio.
- Outro navegador, perfil ou dispositivo também terá seus próprios registros.
- Limpar os dados do site remove o histórico local. A navegação privada não deve ser usada para guardar registros duradouros.
- Não há sincronização em nuvem, backup automático ou exportação/importação pela interface na versão atual.

Os registros de uso não são enviados a um backend pelo app. Os arquivos de planejamento pessoal são ignorados pelo Git e não fazem parte da documentação pública necessária para executar o projeto.

## Estrutura do projeto

```text
Solo/
├── public/                      # Favicon e recursos estáticos da PWA
├── src/
│   ├── domain/
│   │   ├── types.ts             # Entidades e funções de datas
│   │   └── streaks.ts           # Regras de dias ativos e sequências
│   ├── data/
│   │   └── db.ts                # Schema, migrações, operações e seed do Dexie
│   ├── ui/
│   │   ├── components/          # Missão, jornada, hábitos, revisões e outros blocos
│   │   ├── design/              # Primitivas e ícones SVG
│   │   └── screens/             # Hoje, Rotina, Progresso e Metas
│   ├── App.tsx                  # Navegação e inicialização do seed
│   ├── main.tsx                 # Entrada do React e importação de estilos
│   ├── index.css                # Tokens e estilos globais
│   └── journey.css              # Jornada diária e estilos da navegação
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts               # React, Tailwind e configuração da PWA
└── netlify.toml                 # Build, publicação e fallback da SPA
```

O domínio usa TypeScript puro, sem dependências de React ou Dexie. A camada de dados concentra a persistência, enquanto a interface consome essas operações e acompanha as alterações com `useLiveQuery`.

O schema local está na versão 9 e contém as tabelas `dailyRecords`, `areas`, `habits`, `wins`, `skills`, `goals`, `identities`, `weeklyReviews` e `routineBlocks`.

## Publicação

O repositório tem configuração para Netlify em [netlify.toml](netlify.toml):

- **Comando de build:** `npm run build`.
- **Diretório publicado:** `dist`.
- **Fallback da SPA:** caminhos sem um arquivo correspondente são direcionados a `index.html`.

Também é possível servir o conteúdo de `dist/` em outra hospedagem estática com HTTPS. A publicação não transfere os registros salvos em uma origem local para o domínio hospedado.

## Limitações atuais

- Uso pessoal, sem contas ou colaboração entre usuários.
- Áreas e hábitos iniciais definidos no seed; ainda não existe uma tela para cadastrar ou editar hábitos e áreas.
- Rotina com blocos recorrentes de início e fim no mesmo dia, sem suporte a blocos que atravessam a meia-noite.
- Sem notificações ou lembretes automáticos.
- Sem sincronização e ferramentas de backup pela interface.

## Autoria e licença

Desenvolvido por Gabriel — [@GabbeSant](https://github.com/GabbeSant).

O repositório ainda não possui um arquivo `LICENSE`.
