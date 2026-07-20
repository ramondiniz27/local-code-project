# Histórico Real de Chats + shadcn/ui Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user — do not proceed without it.**

---

**Design**: `.specs/features/chat-history/design.md`
**Status**: Done — all 15 tasks implemented and committed (T1–T15). Pending: independent Verifier pass.

**Note on git history**: a pre-existing, uncommitted "Ollama backend integration" changeset (SetupScreen, useOllamaChat→useChats migration base, lib/ollama.ts, Tauri commands) was already sitting in the working tree before this feature's Execute phase began. It was committed separately as `757b18b` ("feat(ollama): integra backend Ollama real via Tauri...") to keep this feature's own commits clean — that commit is NOT part of this feature's scope/spec and should be excluded when reviewing this feature's diff surface.

---

## Test Coverage Matrix

> Generated from codebase scan — confirmed with user (no guideline files found: no `AGENTS.md`/`CLAUDE.md` testing section in this repo, no `CONTRIBUTING.md`; no test runner, no `.test.`/`.spec.` files anywhere; `package.json` scripts are only `dev`/`build`/`preview`/`tauri`). **User decision: no automated tests this round — manual verification via the running app, gated by the TypeScript/Vite build.**

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| --- | --- | --- | --- | --- |
| Persistência pura (`lib/chatStorage.ts`, `lib/time.ts`) | none | Sem teste automatizado; validado pelo build (types) + verificação manual dos ACs que dependem dela | N/A (sem test runner) | `npx tsc --noEmit` |
| Hook de estado (`hooks/useChats.ts`) | none | Sem teste automatizado; cada AC do CHAT-01..06 verificado manualmente rodando o app | N/A | `pnpm build` |
| Componentes UI (`components/Sidebar/*`, `components/Chat/*`, `components/ui/*` gerados pelo shadcn) | none | Sem teste automatizado; verificação manual visual + funcional na UI rodando | N/A | `pnpm build` |
| Config/infra (`tsconfig.json`, `vite.config.ts`, `components.json`) | none | Gate de build apenas | N/A | `pnpm build` |

## Parallelism Assessment

> Não há testes automatizados neste projeto, então não existe estado compartilhado de test runner a avaliar. Paralelismo aqui é puramente sobre dependência de código/arquivo (dois tasks são paralelizáveis apenas se não tocam o mesmo arquivo e não dependem um do outro).

| Test Type | Parallel-Safe? | Isolation Model | Evidence |
| --- | --- | --- | --- |
| none (sem testes) | N/A | N/A — paralelismo decidido por grafo de dependência de arquivos, não por isolamento de teste | Nenhum test runner encontrado no repo |

## Gate Check Commands

| Gate Level | When to Use | Command |
| --- | --- | --- |
| Quick | Tasks que só criam/alteram lógica pura em TS (sem tocar JSX/Tailwind/config de build) | `npx tsc --noEmit` |
| Full | Tasks que tocam componentes React, CSS/Tailwind, `vite.config.ts`, `tsconfig.json`, ou rodam o CLI do shadcn | `pnpm build` |

---

## Execution Plan

### Phase 1: Fundação — infra + utils puros (Parallel OK)

```
T1 [P] ─┐
T4 [P] ─┼─→ (nada bloqueado aqui, mas alimentam a Phase 2)
T5 [P] ─┘
```

### Phase 2: shadcn init + hook de estado (Parallel OK)

```
T1 ──→ T2 [P]
T4 ──→ T6 [P]
```

### Phase 3: shadcn components (Sequential — 1 task)

```
T2 ──→ T3
```

### Phase 4: Componentes-folha (Parallel OK)

```
        ┌→ T7  [P]
        ├→ T8  [P]
T3 ─────┼→ T9  [P]  (T9 não depende de T3, mas agrupado aqui)
        ├→ T10 [P]
        ├→ T11 [P]
        └→ T12 [P]
T5 ──→ T8
```

### Phase 5: Containers (Parallel OK)

```
T7, T8, T3 ──→ T13 [P]
T9, T10, T11, T3 ──→ T14 [P]
```

### Phase 6: Wiring final (Sequential — 1 task)

```
T6, T13, T14 ──→ T15
```

---

## Task Breakdown

### T1: Configurar alias de path `@/*` para o shadcn

**What**: Adicionar `baseUrl`/`paths` no `tsconfig.json`, `resolve.alias` no `vite.config.ts` e instalar `@types/node` como devDependency.
**Where**: `tsconfig.json`, `vite.config.ts`, `package.json` (modificados)
**Depends on**: None
**Reuses**: nada — é o pré-requisito do shadcn init, confirmado na doc oficial (`ui.shadcn.com/docs/installation/vite`)
**Requirement**: Infra (habilita CHAT-08/09/10)

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `tsconfig.json` tem `"baseUrl": "."` e `"paths": {"@/*": ["./src/*"]}`
- [ ] `vite.config.ts` importa `path` de `"node:path"` e define `resolve.alias["@"]`
- [ ] `@types/node` presente em `devDependencies` após `pnpm install`
- [ ] Gate check passa: `npx tsc --noEmit`

**Tests**: none
**Gate**: quick

**Commit**: `chore: adiciona alias de path @/* para suportar shadcn/ui`

---

### T2: Rodar `shadcn init` e remapear tema [P]

**What**: Executar `npx shadcn@latest init` (gera `components.json` com `tailwind.config: ""`, `cssVariables: true`, `baseColor: "neutral"`), depois remapear manualmente as CSS vars injetadas em `src/index.css` (`--primary`, `--background`, `--foreground`, `--border`, `--ring`, `--radius`, `--accent`) para os tokens `--color-*`/`--radius-*` já existentes, e remover o bloco `.dark` não utilizado.
**Where**: `components.json` (novo), `src/index.css` (modificado)
**Depends on**: T1
**Reuses**: `cn()` de `src/lib/utils.ts` (o CLI detecta e reaproveita, não recria); tokens `--color-accent-blue`, `--color-bg-input`, `--radius-md` etc. já definidos em `@theme`
**Requirement**: CHAT-08 (infra)

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `components.json` existe com `rsc: false`, `tsx: true`, aliases apontando para `@/components`, `@/lib`, `@/hooks`, `@/lib/utils`
- [ ] `src/index.css` tem as CSS vars do shadcn remapeadas para os tokens `--color-*` existentes (não a paleta neutra padrão)
- [ ] Bloco `.dark` não utilizado removido
- [ ] Gate check passa: `pnpm build`
- [ ] Verificação manual: `pnpm dev` abre o app sem regressão visual perceptível na sidebar/main area

**Tests**: none
**Gate**: full

**Commit**: `feat: instala shadcn/ui com tema remapeado para os tokens existentes`

---

### T3: Adicionar componentes shadcn (Button, DropdownMenu, ScrollArea, Avatar)

**What**: Rodar `npx shadcn@latest add button dropdown-menu scroll-area avatar`, gerando os arquivos em `src/components/ui/`.
**Where**: `src/components/ui/button.tsx`, `dropdown-menu.tsx`, `scroll-area.tsx`, `avatar.tsx` (novos, gerados pelo CLI)
**Depends on**: T2
**Reuses**: `cn()` (usado internamente pelos componentes gerados)
**Requirement**: CHAT-08, CHAT-09, CHAT-10

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Os 4 arquivos existem em `src/components/ui/`
- [ ] `@radix-ui/react-dropdown-menu`, `@radix-ui/react-avatar`, `@radix-ui/react-scroll-area`, `@radix-ui/react-slot`, `class-variance-authority` presentes em `dependencies`
- [ ] Gate check passa: `pnpm build`

**Tests**: none
**Gate**: full

**Commit**: `feat: adiciona componentes shadcn button, dropdown-menu, scroll-area, avatar`

---

### T4: Criar `lib/chatStorage.ts` [P]

**What**: Criar a camada pura de persistência: `interface StoredChat`, `loadChats()`, `persistChats()`, `deriveTitle()`, `MAX_VISIBLE_CHATS = 10`.
**Where**: `src/lib/chatStorage.ts` (novo)
**Depends on**: None
**Reuses**: `ChatMessage` de `src/lib/ollama.ts`
**Requirement**: CHAT-01, CHAT-02, CHAT-04, CHAT-05

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `loadChats()` retorna `[]` quando a chave não existe, é JSON inválido, ou não é um array (edge case do spec)
- [ ] `persistChats()` faz `JSON.stringify`/`setItem` na chave `oc.chats`
- [ ] `deriveTitle()` trunca em ~40 caracteres com `"…"` quando corta
- [ ] `MAX_VISIBLE_CHATS` exportado com valor `10`
- [ ] Gate check passa: `npx tsc --noEmit`

**Tests**: none
**Gate**: quick

**Commit**: `feat: adiciona camada de persistência de chats em localStorage`

---

### T5: Criar `lib/time.ts` [P]

**What**: Criar `formatRelativeTime(ms: number): string` (pt-BR: "agora", "Xm atrás", "Xh atrás", "Ontem", "Xd atrás").
**Where**: `src/lib/time.ts` (novo)
**Depends on**: None
**Reuses**: nada preexistente
**Requirement**: CHAT-01 (rótulo de tempo real na sidebar)

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Cobre os 5 buckets (agora/minutos/horas/ontem/dias) consistentes com o estilo de cópia já usado no app (pt-BR)
- [ ] Gate check passa: `npx tsc --noEmit`

**Tests**: none
**Gate**: quick

**Commit**: `feat: adiciona util de formatação de tempo relativo`

---

### T6: Criar `hooks/useChats.ts` [P]

**What**: Novo hook substituindo `useOllamaChat`, implementando toda a lógica de múltiplos chats descrita no design (rascunho vs chat persistido, bloqueio durante streaming, criação/seleção/envio de mensagem, ordenação/cap de exibição).
**Where**: `src/hooks/useChats.ts` (novo). `src/hooks/useOllamaChat.ts` (removido nesta task, substituído).
**Depends on**: T4
**Reuses**: `streamChat`, `listModels`, `selectModel`, `ChatMessage`, `OllamaModel` de `src/lib/ollama.ts`; lógica de streaming incremental migrada de `useOllamaChat.ts`
**Requirement**: CHAT-01, CHAT-02, CHAT-03, CHAT-04, CHAT-05, CHAT-06

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `activeChatId === null` ⇒ `messages = []`, nada persistido (CHAT-04/05)
- [ ] `startNewChat()`/`selectChat()` são no-op quando `isStreaming === true` (CHAT-06)
- [ ] `sendMessage()` em rascunho cria e persiste um `StoredChat` novo com título derivado, depois inicia o streaming (CHAT-04/05)
- [ ] `sendMessage()` em chat existente atualiza `updatedAt`, persiste antes e depois do streaming (CHAT-01 AC5)
- [ ] Lista retornada (`chats`) vem ordenada por `updatedAt` desc e limitada a `MAX_VISIBLE_CHATS` (CHAT-02)
- [ ] `useOllamaChat.ts` removido do repositório (nenhuma referência sobrando)
- [ ] Gate check passa: `pnpm build` (nada mais importa `useOllamaChat` neste ponto, exceto `MainChatArea` que ainda será migrado na Phase 5 — ver nota abaixo)

**Nota de sequenciamento**: `MainChatArea.tsx` só é migrado em T14 (Phase 5); até lá ele continua importando `useOllamaChat`. Para manter o build verde nesta task, **não apagar** `useOllamaChat.ts` ainda — deixar os dois hooks coexistindo e só remover `useOllamaChat.ts` dentro da T14 (quando `MainChatArea` passa a receber props em vez de chamar o hook). Ajuste feito para não quebrar o gate: o "Done when" de remoção do arquivo se aplica à T14, não a esta.

**Tests**: none
**Gate**: full

**Commit**: `feat: adiciona hook useChats com estado de múltiplos chats e persistência`

---

### T7: Atualizar `SidebarHeader.tsx` [P]

**What**: Adicionar props `onNewChat: () => void` e `disabled: boolean`; wire o botão `+` para chamar `onNewChat`; trocar o `<button>` por `Button` do shadcn (`size="icon"`), preservando a cor `bg-accent-blue`.
**Where**: `src/components/Sidebar/SidebarHeader.tsx` (modificado)
**Depends on**: T3
**Reuses**: `components/ui/button.tsx`
**Requirement**: CHAT-04, CHAT-06, CHAT-08

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Botão chama `onNewChat` ao clicar
- [ ] Botão fica `disabled` quando a prop `disabled` é `true` (streaming em andamento)
- [ ] Usa `Button` do shadcn mantendo o estilo visual atual (ícone `Plus`, fundo azul)
- [ ] Gate check passa: `pnpm build`

**Tests**: none
**Gate**: full

**Commit**: `feat: conecta botão de novo chat no SidebarHeader`

---

### T8: Atualizar `ConversationList.tsx` (dados reais) [P]

**What**: Remover o import de `mockData.conversations`; aceitar props `chats: StoredChat[]`, `activeChatId: string | null`, `onSelect: (id: string) => void`, `disabled: boolean`; usar `formatRelativeTime(chat.updatedAt)` no lugar do campo `time` mockado; remover o export `conversations` de `src/data/mockData.ts` (mantendo `profile`).
**Where**: `src/components/Sidebar/ConversationList.tsx` (modificado), `src/data/mockData.ts` (modificado — remove só `conversations`)
**Depends on**: T5
**Reuses**: ícone `MessageSquare`, classes de destaque do item ativo (`bg-bg-hover`, `text-accent-blue-light`) já existentes
**Requirement**: CHAT-01, CHAT-02, CHAT-03, CHAT-06

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Lista renderiza a partir da prop `chats`, não de `mockData`
- [ ] Item cujo `id === activeChatId` recebe o destaque visual atual
- [ ] Clique em um item chama `onSelect(chat.id)`; itens ficam não-clicáveis (ou sem efeito) quando `disabled === true`
- [ ] `src/data/mockData.ts` não exporta mais `conversations`
- [ ] Gate check passa: `pnpm build` (garante que nenhum outro arquivo quebrou por perder o import)

**Tests**: none
**Gate**: full

**Commit**: `feat: lista de conversas usa chats reais em vez de mock`

---

### T9: Atualizar texto de estado vazio em `MessagesArea.tsx` [P]

**What**: Trocar a frase do estado vazio de "Envie uma mensagem para começar a conversa" para "Não existem mensagens a serem exibidas".
**Where**: `src/components/Chat/MessagesArea.tsx` (modificado)
**Depends on**: None
**Reuses**: branch `messages.length === 0` já existente — cobre tanto "sem chat ativo" quanto "chat ativo sem mensagens" porque em ambos os casos a prop `messages` chega vazia
**Requirement**: CHAT-07

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Frase alterada exatamente para "Não existem mensagens a serem exibidas"
- [ ] Nenhuma outra lógica do componente alterada
- [ ] Gate check passa: `npx tsc --noEmit`

**Tests**: none
**Gate**: quick

**Commit**: `fix: atualiza texto de estado vazio da área de mensagens`

---

### T10: Atualizar botão de enviar em `InputArea.tsx` [P]

**What**: Trocar o `<button>` de enviar por `Button` do shadcn (`size="icon"`, formato circular), preservando `bg-accent-blue` e o estado `disabled`.
**Where**: `src/components/Chat/InputArea.tsx` (modificado)
**Depends on**: T3
**Reuses**: `components/ui/button.tsx`; lógica de `value`/`handleSend`/`handleKeyDown` inalterada
**Requirement**: CHAT-08

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Botão de enviar usa `Button` do shadcn
- [ ] Comportamento de `disabled` (streaming ou texto vazio) preservado
- [ ] Gate check passa: `pnpm build`

**Tests**: none
**Gate**: full

**Commit**: `feat: usa Button do shadcn no botão de enviar mensagem`

---

### T11: Fundir `ChatHeader.tsx` + `ModelDropdown.tsx` em `DropdownMenu` [P]

**What**: `ChatHeader.tsx` passa a envolver o trigger e o `ModelDropdown` num `<DropdownMenu>` do shadcn (Radix gerencia o `open` internamente); `ModelDropdown.tsx` passa a renderizar `DropdownMenuContent`/`DropdownMenuItem` em vez do `div` absoluto atual. Remove a prop `onToggleModels` de `ChatHeader`, adiciona `models`/`selectedModel`/`onSelectModel`.
**Where**: `src/components/Chat/ChatHeader.tsx`, `src/components/Chat/ModelDropdown.tsx` (ambos modificados)
**Depends on**: T3
**Reuses**: `components/ui/dropdown-menu.tsx`, `components/ui/button.tsx`; lista de modelos/seleção (`model.name === selectedModel`, ícone `Check`) preservada
**Requirement**: CHAT-08

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `ChatHeader` não usa mais `onToggleModels`/estado externo de aberto — o `DropdownMenu` controla isso sozinho
- [ ] `ModelDropdown` renderiza dentro de `DropdownMenuContent`, mantendo o destaque do modelo selecionado
- [ ] Selecionar um item chama `onSelectModel(name)`
- [ ] Gate check passa: `pnpm build`

**Tests**: none
**Gate**: full

**Commit**: `feat: converte seletor de modelo para DropdownMenu do shadcn`

---

### T12: Atualizar `ProfileSection.tsx` (Avatar) [P]

**What**: Trocar o círculo manual (`div` com `bg-accent-blue` + iniciais) por `Avatar`/`AvatarFallback` do shadcn.
**Where**: `src/components/Sidebar/ProfileSection.tsx` (modificado)
**Depends on**: T3
**Reuses**: `components/ui/avatar.tsx`; `profile` de `src/data/mockData.ts` (mantido, não é dado de chat)
**Requirement**: CHAT-10

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Avatar usa `Avatar`/`AvatarFallback` do shadcn com a inicial (`profile.initial`)
- [ ] Cor de fundo (`bg-accent-blue`) preservada
- [ ] Gate check passa: `pnpm build`

**Tests**: none
**Gate**: full

**Commit**: `feat: usa Avatar do shadcn na seção de perfil`

---

### T13: Atualizar `Sidebar.tsx` (container) [P]

**What**: Receber props (`chats`, `activeChatId`, `onSelectChat`, `onNewChat`, `isStreaming`) e repassar para `SidebarHeader`/`ConversationList`; trocar o `div` com `overflow-y-auto` por `ScrollArea` do shadcn ao redor de `ConversationList`.
**Where**: `src/components/Sidebar/Sidebar.tsx` (modificado)
**Depends on**: T7, T8, T3
**Reuses**: `components/ui/scroll-area.tsx`
**Requirement**: CHAT-01, CHAT-02, CHAT-03, CHAT-04, CHAT-06, CHAT-09

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Props repassadas corretamente para `SidebarHeader` (`onNewChat`, `disabled`) e `ConversationList` (`chats`, `activeChatId`, `onSelect`, `disabled`)
- [ ] Lista de chats rola dentro de `ScrollArea`
- [ ] Gate check passa: `pnpm build`

**Tests**: none
**Gate**: full

**Commit**: `feat: conecta Sidebar aos dados reais de chat`

---

### T14: Atualizar `MainChatArea.tsx` (container) [P]

**What**: Remover a chamada interna a `useOllamaChat`; aceitar props (`messages`, `models`, `selectedModel`, `isStreaming`, `error`, `onSelectModel`, `onSend`) vindas de `App`; remover o estado local `dropdownOpen` (o `DropdownMenu` da T11 já gerencia isso); trocar o `div` com `overflow-y-auto` ao redor de `MessagesArea` por `ScrollArea`. Apagar `src/hooks/useOllamaChat.ts` (agora sem nenhuma referência).
**Where**: `src/components/Chat/MainChatArea.tsx` (modificado)
**Depends on**: T9, T10, T11, T3
**Reuses**: `components/ui/scroll-area.tsx`; `ChatHeader`/`MessagesArea`/`InputArea` já atualizados nas tasks anteriores
**Requirement**: CHAT-03, CHAT-04, CHAT-06, CHAT-07, CHAT-09

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `MainChatArea` não importa mais `useOllamaChat`
- [ ] `src/hooks/useOllamaChat.ts` removido do repositório
- [ ] `dropdownOpen`/`onToggleModels` removidos de `MainChatArea`
- [ ] Área de mensagens rola dentro de `ScrollArea`
- [ ] Gate check passa: `pnpm build`

**Tests**: none
**Gate**: full

**Commit**: `refactor: MainChatArea passa a receber estado via props em vez de hook próprio`

---

### T15: Atualizar `App.tsx` (wiring final)

**What**: Chamar `useChats(ollamaUrl)` uma vez e passar os dados/handlers para `<Sidebar>` e `<MainChatArea>`.
**Where**: `src/App.tsx` (modificado)
**Depends on**: T6, T13, T14
**Reuses**: fluxo existente de `ollamaUrl`/`SetupScreen`, inalterado
**Requirement**: CHAT-01 a CHAT-07 (integração final de tudo)

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `App.tsx` chama `useChats(ollamaUrl)` e passa as props corretas para `Sidebar` e `MainChatArea`
- [ ] Gate check passa: `pnpm build`
- [ ] Verificação manual completa rodando `pnpm dev` (ou `pnpm tauri dev`):
  - [ ] Enviar mensagens em 2 chats diferentes, recarregar o app, sidebar mostra ambos reais, clicar carrega cada um (CHAT-01)
  - [ ] Criar 11 chats e confirmar que só os 10 mais recentes aparecem (CHAT-02)
  - [ ] Clicar em "novo chat" limpa a área sem criar item na sidebar; enviar 1ª mensagem cria o item (CHAT-04/05)
  - [ ] Clicar em "novo chat" ou em outro chat durante streaming não faz nada (CHAT-06)
  - [ ] Abrir o app sem chats e ver "Não existem mensagens a serem exibidas" (CHAT-07)
  - [ ] Botões/dropdown/scroll/avatar usam os componentes shadcn sem regressão visual (CHAT-08/09/10)

**Tests**: none
**Gate**: full

**Commit**: `feat: App.tsx integra useChats com Sidebar e MainChatArea`

---

## Parallel Execution Map

```
Phase 1 (Parallel):
  ├── T1 [P]
  ├── T4 [P]
  └── T5 [P]

Phase 2 (Parallel):
  T1 done → T2 [P]
  T4 done → T6 [P]

Phase 3 (Sequential — 1 task):
  T2 done → T3

Phase 4 (Parallel):
  T3 done →
    ├── T7  [P]
    ├── T10 [P]
    ├── T11 [P]
    └── T12 [P]
  T3, T5 done → T8 [P]
  (sem dependência) → T9 [P]

Phase 5 (Parallel):
  T7, T8, T3 done   → T13 [P]
  T9, T10, T11, T3 done → T14 [P]

Phase 6 (Sequential — 1 task):
  T6, T13, T14 done → T15
```

**Parallelism constraint:** confirmado — nenhuma task `[P]` compartilha arquivo com outra `[P]` da mesma fase, e não há testes (logo nenhuma restrição de paralelismo de test runner se aplica).

---

## Task Granularity Check

| Task | Scope | Status |
| --- | --- | --- |
| T1: Alias de path (3 arquivos de config) | 1 concern (infra do shadcn) | ✅ Granular (config coesa) |
| T2: shadcn init + remap de tema | 2 arquivos, 1 concern | ✅ Granular |
| T3: Adicionar 4 componentes shadcn via CLI | 1 comando, 4 arquivos gerados (não escritos à mão) | ✅ Granular |
| T4: `chatStorage.ts` | 1 arquivo novo | ✅ Granular |
| T5: `time.ts` | 1 arquivo novo | ✅ Granular |
| T6: `useChats.ts` | 1 arquivo novo (+ remoção adiada de `useOllamaChat.ts`) | ✅ Granular |
| T7: `SidebarHeader.tsx` | 1 componente | ✅ Granular |
| T8: `ConversationList.tsx` + remoção de export em `mockData.ts` | 2 arquivos, 1 concern coeso (lista usa dados reais) | ✅ Granular (coeso) |
| T9: `MessagesArea.tsx` (texto) | 1 componente, 1 linha | ✅ Granular |
| T10: `InputArea.tsx` (botão) | 1 componente | ✅ Granular |
| T11: `ChatHeader.tsx` + `ModelDropdown.tsx` | 2 arquivos, 1 concern coeso (1 widget: seletor de modelo) | ✅ Granular (coeso) |
| T12: `ProfileSection.tsx` | 1 componente | ✅ Granular |
| T13: `Sidebar.tsx` | 1 componente (container) | ✅ Granular |
| T14: `MainChatArea.tsx` + remoção de `useOllamaChat.ts` | 1 componente + limpeza do arquivo que ele parava de usar | ✅ Granular (coeso) |
| T15: `App.tsx` | 1 componente (wiring) | ✅ Granular |

---

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
| --- | --- | --- | --- |
| T1 | None | Nenhuma seta de entrada | ✅ Match |
| T2 | T1 | T1 → T2 | ✅ Match |
| T3 | T2 | T2 → T3 | ✅ Match |
| T4 | None | Nenhuma seta de entrada | ✅ Match |
| T5 | None | Nenhuma seta de entrada | ✅ Match |
| T6 | T4 | T4 → T6 | ✅ Match |
| T7 | T3 | T3 → T7 | ✅ Match |
| T8 | T5 | T5 → T8 (e T3 mencionado no diagrama da Phase 4 mas T8 não depende de T3 no corpo) | ⚠️ Ajustado — ver nota |
| T9 | None | Sem seta de entrada (agrupado na Phase 4 apenas por conveniência visual) | ✅ Match |
| T10 | T3 | T3 → T10 | ✅ Match |
| T11 | T3 | T3 → T11 | ✅ Match |
| T12 | T3 | T3 → T12 | ✅ Match |
| T13 | T7, T8, T3 | T7, T8, T3 → T13 | ✅ Match |
| T14 | T9, T10, T11, T3 | T9, T10, T11, T3 → T14 | ✅ Match |
| T15 | T6, T13, T14 | T6, T13, T14 → T15 | ✅ Match |

**Nota sobre T8**: o corpo da task lista `Depends on: T5` apenas. O diagrama da Phase 4 mostra `T3 done → ... T8` por estar agrupado visualmente com as demais tasks que saem de T3 — mas T8 **não** precisa de T3 (não usa nenhum componente shadcn diretamente). Corrigido no "Parallel Execution Map" acima, que lista `T8` corretamente como dependente só de `T3, T5` (T3 aparece porque T8 roda na Phase 4, que só começa depois de T3 completar — mas o motivo real de esperar é apenas a organização em fases, não uma dependência de código). Nenhuma ação necessária além desta nota — a task body é a fonte da verdade.

---

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| --- | --- | --- | --- | --- |
| T1 | Config/infra | none | none | ✅ OK |
| T2 | Config/infra | none | none | ✅ OK |
| T3 | Componentes UI (gerados) | none | none | ✅ OK |
| T4 | Persistência pura | none | none | ✅ OK |
| T5 | Persistência pura | none | none | ✅ OK |
| T6 | Hook de estado | none | none | ✅ OK |
| T7 | Componentes UI | none | none | ✅ OK |
| T8 | Componentes UI | none | none | ✅ OK |
| T9 | Componentes UI | none | none | ✅ OK |
| T10 | Componentes UI | none | none | ✅ OK |
| T11 | Componentes UI | none | none | ✅ OK |
| T12 | Componentes UI | none | none | ✅ OK |
| T13 | Componentes UI | none | none | ✅ OK |
| T14 | Componentes UI | none | none | ✅ OK |
| T15 | Componentes UI + wiring | none | none | ✅ OK |

Todas as tasks batem com a Test Coverage Matrix (todas as camadas exigem `none` — verificação manual, gate de build). Nenhuma violação.

---

## Requirement Coverage

| Requirement ID | Tasks | Status |
| --- | --- | --- |
| CHAT-01 | T4, T5, T6, T8, T13, T15 | Mapped |
| CHAT-02 | T4, T6, T8, T13, T15 | Mapped |
| CHAT-03 | T6, T8, T13, T14, T15 | Mapped |
| CHAT-04 | T4, T6, T7, T8, T13, T14, T15 | Mapped |
| CHAT-05 | T4, T6, T15 | Mapped |
| CHAT-06 | T6, T7, T8, T13, T14, T15 | Mapped |
| CHAT-07 | T9, T14, T15 | Mapped |
| CHAT-08 | T2, T3, T7, T10, T11, T15 | Mapped |
| CHAT-09 | T3, T13, T14, T15 | Mapped |
| CHAT-10 | T3, T12, T15 | Mapped |

**Coverage:** 10 total, 10 mapped to tasks, 0 unmapped.
