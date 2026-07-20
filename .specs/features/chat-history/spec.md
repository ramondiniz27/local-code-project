# Histórico Real de Chats + shadcn/ui Specification

## Problem Statement

A sidebar hoje lista 8 conversas fixas vindas de `src/data/mockData.ts` — dados falsos que nunca mudam, independente do que o usuário realmente conversa. Não existe conceito de "múltiplos chats": `useOllamaChat` guarda um único array de mensagens em memória, o botão "novo chat" não tem handler, e nada é persistido além da URL do Ollama. O usuário quer que a sidebar reflita o histórico real de conversas, que "novo chat" realmente inicie uma conversa em branco (sem herdar/mockar nada), que a ausência de mensagens tenha um texto claro, e que a interface fique mais polida usando shadcn/ui.

## Goals

- [ ] Sidebar exibe as conversas reais do usuário (mais recentes primeiro), não dados mockados
- [ ] "Novo chat" inicia uma conversa vazia de verdade; nada é mockado
- [ ] Estado vazio (sem chat ativo / sem mensagens) mostra uma frase clara de "sem mensagens"
- [ ] shadcn/ui instalado e aplicado aos primitivos interativos principais, mantendo o tema escuro atual

## Out of Scope

Explicitamente excluído. Documentado para prevenir scope creep.

| Feature | Reason |
| --- | --- |
| Renomear ou apagar chats | Não solicitado pelo usuário; fica para uma iteração futura |
| Busca funcional (filtrar chats pela `SearchBar`) | Não solicitado; `SearchBar` permanece visual/cosmética nesta rodada |
| Sincronização entre dispositivos / backend remoto | Persistência é local (localStorage), sem servidor envolvido |
| Refatorar o backend Rust para suportar streaming concorrente por chat | Decisão do usuário: bloquear troca de chat durante streaming em vez de reescrever `lib.rs` |
| Paginação/"ver mais" além do limite da sidebar | Fora do pedido original; lista mostra só os N mais recentes |
| Redesign amplo de toda a UI para o tema padrão do shadcn | Usuário escolheu escopo "primitivos-chave", mantendo a paleta de cores atual |

---

## Assumptions & Open Questions

Every ambiguity is resolved or recorded here — nothing is left silently unclear.

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Troca de chat durante streaming | Bloquear "novo chat" e itens da lista lateral enquanto `isStreaming === true` | Escolha do usuário via pergunta de esclarecimento; backend Rust não distingue chats no streaming | y |
| Chat vazio (rascunho) antes da 1ª mensagem | Não persiste nem aparece na sidebar; só vira entrada real ao enviar a 1ª mensagem | Escolha do usuário via pergunta de esclarecimento | y |
| Escopo do shadcn/ui | Instalar shadcn/ui e trocar por componentes shadcn: botão "novo chat", botão enviar, dropdown de modelo, scroll area (lista de chats e mensagens), avatar do perfil — mantendo tokens de cor atuais (`bg-sidebar`, `accent-blue`, etc.) | Escolha do usuário via pergunta de esclarecimento | y |
| Quantidade de chats exibidos na sidebar | 10 mais recentes (cap rígido, sem "ver mais") | Usuário pediu para eu escolher 5 ou 10 "sem quebrar o layout"; `ConversationList` já tem `overflow-y-auto`, então 10 itens cabem com scroll suave sem exigir paginação | y |
| Onde persistir os chats | `localStorage`, chave própria (ex.: `oc.chats`), sem mudanças no backend Rust | Não há plugin Tauri de store/SQL instalado (`Cargo.toml` só tem `tauri-plugin-opener`); app já usa `localStorage` para `ollamaUrl` — mesmo padrão | y |
| Geração do título do chat | Derivado da primeira mensagem do usuário (truncada em ~40 caracteres, com "…" se cortar), fixado após a criação (não muda com mensagens seguintes) | Padrão comum em apps de chat (ChatGPT/Claude Desktop); evita exigir input manual de título | n — assunção não confirmada explicitamente, mas de baixo risco/reversível |
| Timestamp exibido na sidebar (`time`) | Renderizado como relativo (ex.: "2m atrás", "Ontem") a partir de um `updatedAt` real (epoch ms), recalculado na renderização | Mantém a UX atual (`ConversationList` já mostra um campo `time`), agora com dado real | n — mesma razão acima |
| Ordenação da lista | Por `updatedAt` desc (chat mais recentemente ativo primeiro, não por criação) | Comportamento padrão esperado de "últimos chats" | y (implícito no pedido do usuário) |
| Modelo selecionado por chat | Cada chat guarda o `selectedModel` usado; ao trocar de chat, o dropdown reflete o modelo daquele chat (fallback: modelo padrão/primeiro da lista se o chat não tiver um) | Consequência natural de "múltiplos chats reais"; sem isso, trocar de chat teria comportamento inconsistente de modelo | y (implícito) |

**Open questions:** none — todas resolvidas ou registradas acima.

---

## User Stories

### P1: Sidebar mostra o histórico real de chats ⭐ MVP

**User Story**: Como usuário do app, quero ver na sidebar os chats que eu realmente tive (não uma lista fixa de exemplos), para conseguir voltar a uma conversa anterior.

**Why P1**: É o núcleo do pedido — sem isso a feature não existe.

**Acceptance Criteria**:

1. WHEN o app carrega com um ou mais chats salvos no `localStorage` THEN o sistema SHALL exibir na sidebar até 10 chats reais, ordenados do mais recentemente atualizado para o mais antigo, e nenhum dado de `mockData.ts` SHALL aparecer.
2. WHEN existem mais de 10 chats salvos THEN a sidebar SHALL exibir apenas os 10 mais recentes (os demais não aparecem, sem erro).
3. WHEN o app carrega sem nenhum chat salvo (primeira execução) THEN a sidebar SHALL exibir a lista vazia (sem itens mockados) e a área de mensagens SHALL exibir o estado vazio (ver P3).
4. WHEN o usuário clica em um chat da sidebar THEN o sistema SHALL carregar as mensagens e o modelo daquele chat na área principal, e destacar visualmente aquele item como ativo.
5. WHEN o usuário envia uma mensagem em um chat existente THEN o `updatedAt` daquele chat SHALL ser atualizado e a lista SHALL reordenar (esse chat sobe para o topo).

**Independent Test**: Enviar mensagens em 2 chats diferentes, recarregar o app, confirmar que a sidebar mostra ambos com títulos/horários reais e que clicar em cada um restaura as mensagens corretas.

---

### P1: "Novo chat" cria uma conversa em branco de verdade ⭐ MVP

**User Story**: Como usuário, quero que "novo chat" comece uma conversa vazia de verdade, sem mensagens ou histórico mockado aparecendo.

**Why P1**: Segunda metade do núcleo do pedido — hoje não há handler nenhum no botão.

**Acceptance Criteria**:

1. WHEN o usuário clica no botão "novo chat" (ícone `+` no `SidebarHeader`) THEN o sistema SHALL limpar a área de mensagens para o estado vazio e desmarcar qualquer item ativo na sidebar — nenhuma mensagem mockada SHALL aparecer.
2. WHEN o chat novo ainda não recebeu nenhuma mensagem THEN o sistema SHALL NÃO criar uma entrada na sidebar nem salvar nada em `localStorage` (rascunho não persistido).
3. WHEN o usuário envia a primeira mensagem nesse chat novo THEN o sistema SHALL criar uma entrada real (id, título derivado da 1ª mensagem, `createdAt`/`updatedAt`) e persisti-la, fazendo-a aparecer no topo da sidebar.
4. WHEN o usuário clica em "novo chat" enquanto uma resposta está sendo transmitida (`isStreaming === true`) THEN o sistema SHALL ignorar o clique (botão desabilitado/sem efeito) — a troca não deve interromper o streaming em andamento.

**Independent Test**: Clicar em "novo chat" e verificar que a área fica vazia e a sidebar não ganhou item novo; digitar e enviar uma mensagem e verificar que agora aparece um item novo no topo da sidebar.

---

### P1: Estado vazio de mensagens com texto claro ⭐ MVP

**User Story**: Como usuário, quando não há chat ativo ou não há mensagens, quero ver uma frase clara em vez de uma tela confusa ou mockada.

**Why P1**: Pedido explícito do usuário; comportamento hoje já mostra um placeholder ("Envie uma mensagem para começar a conversa") mas precisa cobrir também o caso "nenhum chat ativo" (ex. após deletar/nunca ter criado nenhum) com texto equivalente ao pedido.

**Acceptance Criteria**:

1. WHEN não há chat ativo selecionado (nenhum id ativo) THEN a área de mensagens SHALL exibir a frase "Não existem mensagens a serem exibidas" centralizada, sem input de mensagens mockado.
2. WHEN há um chat ativo mas ele não tem nenhuma mensagem (chat novo/rascunho) THEN a área de mensagens SHALL exibir a mesma frase de estado vazio.
3. WHEN há um chat ativo com pelo menos 1 mensagem THEN a área de mensagens SHALL exibir as mensagens reais daquele chat (sem alterar o comportamento já existente de renderização de mensagens).

**Independent Test**: Abrir o app pela primeira vez (sem chats) e ver a frase de vazio; enviar uma mensagem e ver que ela substitui a frase pela conversa real.

---

### P2: shadcn/ui aplicado aos primitivos-chave

**User Story**: Como usuário, quero que os elementos interativos principais (botões, scroll, avatar) tenham a qualidade visual/comportamental do shadcn/ui, mantendo o tema escuro atual.

**Why P2**: Importante para "melhorar o visual", mas não bloqueia a funcionalidade central de histórico real — pode ser entregue logo depois do P1 sem risco funcional.

**Acceptance Criteria**:

1. WHEN o projeto é buildado após a integração THEN `components.json` do shadcn SHALL existir e `npx shadcn` SHALL funcionar para adicionar novos componentes no futuro.
2. WHEN o usuário vê o botão "novo chat", o botão de enviar mensagem e o dropdown de modelo THEN esses SHALL ser implementados com os componentes `Button` (e `DropdownMenu`, quando aplicável) do shadcn/ui, preservando as cores/tokens atuais (`accent-blue`, `bg-hover`, etc. via Tailwind).
3. WHEN o usuário rola a lista de chats na sidebar ou a lista de mensagens THEN a rolagem SHALL usar o componente `ScrollArea` do shadcn/ui.
4. WHEN o usuário vê o avatar de perfil (`ProfileSection`) THEN ele SHALL usar o componente `Avatar` do shadcn/ui.
5. WHEN os componentes shadcn são aplicados THEN nenhuma funcionalidade do P1 (novo chat, listagem real, estado vazio) SHALL regressar.

**Independent Test**: Rodar o app, comparar visualmente antes/depois — botões, dropdown, scroll e avatar usam os componentes shadcn, cores do tema dark preservadas, e o fluxo de criar/listar/abrir chats continua funcionando.

---

## Edge Cases

- WHEN o `localStorage` contém JSON corrompido/inválido para a chave de chats THEN o sistema SHALL tratar como "sem chats" (lista vazia) em vez de quebrar o app.
- WHEN o usuário está no meio de um streaming e clica em outro chat da sidebar THEN o clique SHALL ser ignorado (mesma regra do "novo chat": itens da lista desabilitados durante streaming).
- WHEN o título derivado da 1ª mensagem é vazio/só espaços (não deve ocorrer, pois `sendMessage` já ignora conteúdo vazio) THEN não se aplica — coberto pela validação existente em `useOllamaChat.sendMessage`.
- WHEN há exatamente 10 chats e o usuário cria um 11º (envia a 1ª mensagem de um novo chat) THEN o 11º SHALL aparecer no topo e o chat menos recentemente atualizado SHALL sair da lista visível (continua salvo no `localStorage`, apenas não exibido — não há requisito de exclusão de dados antigos).
- WHEN o usuário troca de modelo (`ModelDropdown`) dentro de um chat THEN essa escolha SHALL ser salva como o modelo daquele chat especificamente (não global).

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| CHAT-01 | P1: Sidebar mostra histórico real | Tasks | ✅ Verified |
| CHAT-02 | P1: Sidebar mostra histórico real (cap 10 + ordenação) | Tasks | ✅ Verified |
| CHAT-03 | P1: Sidebar mostra histórico real (carregar ao clicar) | Tasks | ✅ Verified |
| CHAT-04 | P1: Novo chat em branco | Tasks | ✅ Verified |
| CHAT-05 | P1: Novo chat só persiste após 1ª mensagem | Tasks | ✅ Verified |
| CHAT-06 | P1: Novo chat bloqueado durante streaming | Tasks | ✅ Verified |
| CHAT-07 | P1: Estado vazio "Não existem mensagens a serem exibidas" | Tasks | ✅ Verified |
| CHAT-08 | P2: shadcn init + Button + DropdownMenu | Tasks | ✅ Verified (CSS-var remap gap fixed post-Verifier) |
| CHAT-09 | P2: shadcn ScrollArea (sidebar + mensagens) | Tasks | ✅ Verified (scrollbar-thumb color remap fixed post-Verifier) |
| CHAT-10 | P2: shadcn Avatar (perfil) | Tasks | ✅ Verified |

**ID format:** `CHAT-NN`

**Status values:** Pending → In Design → In Tasks → Implementing → Verified

**Coverage:** 10 total, 10 mapped to tasks (see `tasks.md` Requirement Coverage), 0 unmapped

---

## Success Criteria

- [ ] Reiniciar o app preserva e exibe corretamente os chats criados anteriormente (persistência real via localStorage)
- [ ] Nenhuma referência a `src/data/mockData.ts` permanece no fluxo de chats (arquivo removido ou esvaziado dessa responsabilidade)
- [ ] "Novo chat" nunca mostra conteúdo de outro chat nem dados mockados
- [ ] Zero regressão no fluxo de streaming do Ollama (envio/recebimento de mensagens continua funcionando)
- [ ] `npx shadcn add <componente>` funciona sem erro após a integração
