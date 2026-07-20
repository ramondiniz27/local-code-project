# Histórico Real de Chats + shadcn/ui Validation

**Date**: 2026-07-19
**Spec**: `.specs/features/chat-history/spec.md`
**Diff range**: `35988e6..3ceedd6` (this feature's 15 commits; `757b18b` excluded — unrelated pre-existing Ollama backend work, out of scope for this spec)
**Verifier**: independent sub-agent (author ≠ verifier)

**Adaptation note**: This project has no test runner and no automated tests exist anywhere in the repo (confirmed via search — no vitest/jest, no `.test.`/`.spec.` files). This is a documented, confirmed user decision recorded in `tasks.md`'s Test Coverage Matrix. Per the task brief, all "test" language below is replaced with **implementation evidence** — every claim is anchored to `file:line` in the real implementation, not to test assertions. The Discrimination Sensor is **code-reasoning-based** (manual fault-injection reasoning), not test-execution-based, since there is no harness to run mutated code against.

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T1 (path alias) | ✅ Done | `tsconfig.json`, `vite.config.ts`, `@types/node` all present as specified |
| T2 (shadcn init + theme remap) | ⚠️ Partial | `components.json` created correctly; **CSS var remap to `--color-*` tokens and `.dark` block removal were NOT done** — see Code Quality gap below |
| T3 (shadcn components) | ✅ Done | 4 files generated, Radix deps present |
| T4 (chatStorage.ts) | ✅ Done | All 4 functions present, edge case handled |
| T5 (time.ts) | ✅ Done | 5 buckets implemented |
| T6 (useChats.ts) | ✅ Done | All done-when items met; `useOllamaChat.ts` removal correctly deferred to T14 per the task's own sequencing note |
| T7 (SidebarHeader) | ✅ Done | Wired, disabled, shadcn Button |
| T8 (ConversationList real data) | ⚠️ Partial | List correctly uses real data; **`mockData.ts` still exports `conversations`** — explicit done-when item not met (dead code, no functional impact) |
| T9 (empty state text) | ✅ Done | Exact string match |
| T10 (InputArea Button) | ✅ Done | |
| T11 (ChatHeader + ModelDropdown → DropdownMenu) | ✅ Done | |
| T12 (ProfileSection Avatar) | ✅ Done | |
| T13 (Sidebar container) | ✅ Done | |
| T14 (MainChatArea container) | ✅ Done | `useOllamaChat.ts` removed here as planned |
| T15 (App.tsx wiring) | ✅ Done | |

---

## Spec-Anchored Acceptance Criteria

### P1: Sidebar mostra o histórico real de chats

| Criterion | Spec-defined outcome | `file:line` — evidence | Result |
| --- | --- | --- | --- |
| AC1: app carrega com chats salvos | sidebar exibe até 10 chats reais, ordenados por updatedAt desc, zero dado de mockData | `src/hooks/useChats.ts:39-42` (`visibleChats` sort desc + slice); `src/components/Sidebar/ConversationList.tsx:1-54` (renders only from `chats` prop, no `mockData` import) | ✅ PASS |
| AC2: >10 chats salvos | só os 10 mais recentes aparecem, sem erro | `src/hooks/useChats.ts:40` (`.slice(0, MAX_VISIBLE_CHATS)`); `src/lib/chatStorage.ts:15` (`MAX_VISIBLE_CHATS = 10`) | ✅ PASS |
| AC3: app carrega sem chats salvos | lista vazia + estado vazio de mensagens | `src/lib/chatStorage.ts:17-27` (`loadChats` returns `[]`); `src/components/Chat/MessagesArea.tsx:11-19` (empty-state branch) | ✅ PASS |
| AC4: clique em um chat | carrega mensagens/modelo daquele chat, destaca item ativo | `src/hooks/useChats.ts:57-63` (`selectChat`); `src/hooks/useChats.ts:44-50` (`activeChat`/`messages`/`selectedModel` derivation); `src/components/Sidebar/ConversationList.tsx:21,28-30` (active highlight class) | ✅ PASS |
| AC5: envia mensagem em chat existente | `updatedAt` atualizado, lista reordena (chat sobe ao topo) | `src/hooks/useChats.ts:107-121` (`updatedAt: Date.now()` + `persistChats`); `src/hooks/useChats.ts:39-42` (`useMemo` re-sorts every render) | ✅ PASS |

### P1: "Novo chat" cria uma conversa em branco de verdade

| Criterion | Spec-defined outcome | `file:line` — evidence | Result |
| --- | --- | --- | --- |
| AC1: clique em "novo chat" | área de mensagens vazia, item ativo desmarcado, zero mock | `src/components/Sidebar/SidebarHeader.tsx:13-22` (Button onClick); `src/hooks/useChats.ts:52-55` (`startNewChat` sets `activeChatId(null)`); `src/hooks/useChats.ts:49` (`messages = activeChat?.messages ?? []` → `[]`) | ✅ PASS |
| AC2: chat novo sem 1ª mensagem | não cria entrada na sidebar nem persiste | `src/hooks/useChats.ts:39-42` (`visibleChats` derives only from persisted `chats` state, draft never added until `sendMessage`) | ✅ PASS |
| AC3: envia 1ª mensagem no chat novo | cria entrada real (id/título/createdAt/updatedAt), persiste, aparece no topo | `src/hooks/useChats.ts:89-106` (`newChat` creation with `crypto.randomUUID()`, `deriveTitle`, `persistChats` inside the `setChats` updater) | ✅ PASS |
| AC4: clique em "novo chat"/item da lista durante streaming | ignorado, sem interromper o streaming | `src/hooks/useChats.ts:52-55` (`startNewChat` no-op guard), `:57-63` (`selectChat` no-op guard); double-guarded via `disabled` prop reaching the underlying `<button>` at `src/components/Sidebar/SidebarHeader.tsx:17` and `src/components/Sidebar/ConversationList.tsx:26` | ✅ PASS |

### P1: Estado vazio de mensagens com texto claro

| Criterion | Spec-defined outcome | `file:line` — evidence | Result |
| --- | --- | --- | --- |
| AC1: nenhum chat ativo | frase "Não existem mensagens a serem exibidas" centralizada | `src/components/Chat/MessagesArea.tsx:11-19` (exact string, `items-center justify-center`) | ✅ PASS |
| AC2: chat ativo sem mensagens (rascunho) | mesma frase de estado vazio | Same branch as AC1 — `messages.length === 0` is the single gate for both cases (`src/components/Chat/MessagesArea.tsx:11`); a `StoredChat` is only ever created already containing its first message (`src/hooks/useChats.ts:97`), so the "active chat with zero messages" case in practice only occurs through the `activeChatId === null` draft state, which is covered identically | ✅ PASS |
| AC3: chat ativo com ≥1 mensagem | mostra mensagens reais, sem alterar renderização existente | `src/components/Chat/MessagesArea.tsx:21-32` (unchanged `UserMessage`/`AIMessage` mapping) | ✅ PASS |

### P2: shadcn/ui aplicado aos primitivos-chave

| Criterion | Spec-defined outcome | `file:line` — evidence | Result |
| --- | --- | --- | --- |
| AC1: `components.json` existe, `npx shadcn` funciona | infra shadcn operacional | `components.json` (root, aliases correct: `@/components`, `@/components/ui`, `@/lib`, `@/hooks`, `@/lib/utils`); `package.json` has `shadcn: ^4.13.1` + Radix deps installed and building | ✅ PASS — ⚠️ note: `components.json`'s `style` is `"radix-nova"`, not the `"new-york"` design.md assumed; this is CLI-version drift (shadcn 4.13 ships a different default style/import shape — `@import "shadcn/tailwind.css"` — than the CLI version design.md was written against), not a functional gap |
| AC2: botão novo chat, botão enviar, dropdown de modelo usam Button/DropdownMenu preservando tokens atuais | `accent-blue` etc. preserved | `src/components/Sidebar/SidebarHeader.tsx:13-18` (`Button` + `bg-accent-blue`); `src/components/Chat/InputArea.tsx:40-45` (`Button` + `bg-accent-blue`); `src/components/Chat/ChatHeader.tsx:22-40` + `src/components/Chat/ModelDropdown.tsx:16-46` (`DropdownMenu`/`DropdownMenuContent`/`DropdownMenuItem`, selected state keeps `text-accent-blue`) | ✅ PASS on the 3 named elements (see Code Quality section for the broader unmapped-palette gap) |
| AC3: rolagem da lista de chats e mensagens usa `ScrollArea` | | `src/components/Sidebar/Sidebar.tsx:29-36`; `src/components/Chat/MainChatArea.tsx:34-36` | ✅ PASS |
| AC4: avatar de perfil usa `Avatar` | | `src/components/Sidebar/ProfileSection.tsx:7-12` (`Avatar`/`AvatarFallback`) | ✅ PASS |
| AC5: nenhuma funcionalidade do P1 regride | | All P1 evidence above still holds with shadcn components wired in; `pnpm build` and `tsc --noEmit` both pass (see Gate Check) | ✅ PASS (static evidence; not interactively UAT'd — see Summary) |

**Status**: ✅ All 10 requirement stories have their literal ACs covered by evidence. Two **Code Quality gaps** found outside the literal AC wording (see below) and one **edge-case gap** (model-per-chat persistence timing).

---

## Discrimination Sensor (code-reasoning based — no test harness exists)

No mutation was applied to the real working tree; each mutation below is a thought-experiment against the read code, not an executed test run.

| # | Mutation (hypothetical) | File:line | Reasoning | Result |
| - | --- | --- | --- | --- |
| 1 | Remove `if (isStreaming) return;` guard in `startNewChat` | `src/hooks/useChats.ts:53` | The only wired call site is `SidebarHeader`'s `Button`, which independently receives `disabled={isStreaming}` (`src/components/Sidebar/SidebarHeader.tsx:17`, threaded from `src/components/Sidebar/Sidebar.tsx:26`). A native `disabled` button blocks the click from firing at all, so this mutant would **not be observably killed through the only UI path that exists today**. | ⚠️ Survives via UI-level redundancy — the hook has no independent enforcement if the button's `disabled` attribute were ever bypassed (keyboard shortcut, programmatic call, future feature). Flag as fragile defense-in-depth, not a live bug today. |
| 2 | Remove `.slice(0, MAX_VISIBLE_CHATS)` (or set `MAX_VISIBLE_CHATS = Infinity`) | `src/hooks/useChats.ts:40` / `src/lib/chatStorage.ts:15` | This is the single point of truth for the 10-item cap — nothing else in the codebase re-applies it. With no automated tests, an accidental removal would ship silently; only a human manually creating 11+ chats and counting sidebar rows (the spec's own Independent Test) would catch it. | ❌ Would survive silently under any automated regression check (none exists); relies entirely on manual QA. |
| 3 | Remove the `chatId === null` branch in `sendMessage`, forcing every send through the "existing chat" path | `src/hooks/useChats.ts:89-106` | With `activeChatId === null`, `chats.find(chat => chat.id === targetId)` (`targetId = null`) never matches anything, so no chat receives the user's message. Worse, `streamingChatIdRef.current` becomes `null`, and the chunk handler explicitly no-ops when `id === null` (`useChats.ts:139-140`) — so the assistant's streamed reply is silently dropped too. Net effect: typing and sending a message in a fresh chat produces total silence (no sidebar entry, no reply). | ✅ Killed — this is immediately, grossly observable via the most basic manual flow (type + send in a new chat), matching the spec's own Independent Test for this story. |

**Sensor depth**: lightweight (3 targeted mutations on the highest-risk new logic — streaming lock, list cap, draft-vs-persisted branch), per the "Default (all features)" tier.
**Result**: 1/3 clearly killed by manual verification, 1/3 silently survives without manual QA (single point of failure, acceptable for MVP scope but worth naming), 1/3 survives specifically because of UI-level redundancy rather than the hook's own guard.

---

## Code Quality

| Principle | Status | Notes |
| --- | --- | --- |
| No features beyond what was asked | ✅ | No scope creep found across all 15 commits (spot-checked via `git show --stat` on every commit) |
| No abstractions for single-use code | ✅ | `useChats` is a single cohesive hook, no premature splitting |
| No unnecessary "flexibility" added | ✅ | |
| Only touched files required for task | ✅ | Each commit's diff matches its stated scope exactly |
| Didn't "improve" unrelated code | ✅ | |
| Matches existing patterns/style | ✅ | localStorage pattern reused from `ollamaUrl`; `cn()` reused as-is |
| Would senior engineer approve? | ⚠️ | Two gaps below would draw review comments |
| Documented project quality/testing guidelines followed | ✅ | tasks.md's own Test Coverage Matrix (no automated tests, manual + build gate) followed as documented |

**Gap 1 (Major — explicit task requirement not met)**: T2's own "Done when" required the shadcn-injected CSS vars (`--primary`, `--background`, `--foreground`, `--border`, `--ring`, `--accent`, `--radius`) to be remapped to the app's existing `--color-*`/`--radius-*` tokens, and the unused `.dark` block to be removed (this is also design.md's registered decision `AD-002`). Neither happened: `src/index.css` (lines ~66-183, added by commit `8e32923`) is the verbatim default shadcn `init` output — `--primary: oklch(0.205 0 0)` etc., not `var(--color-accent-blue)` — and the `.dark { ... }` block (lines ~145-183) is still present verbatim. The commit message ("tema remapeado para os tokens existentes") does not match the diff. **Practical impact is mitigated** in the 3 explicitly-targeted P2 elements (Button/DropdownMenu usages all pass explicit `className` overrides that `cn()`'s `twMerge` correctly dedupes over the defaults), but any shadcn component usage that does *not* carry an explicit color override — e.g. `ScrollBar`'s thumb (`bg-border`, `src/components/ui/scroll-area.tsx:49`), `DropdownMenuItem`'s focus/hover highlight (`focus:bg-accent`, `src/components/ui/dropdown-menu.tsx:74`), `Avatar`'s ring border (`border-border`, `src/components/ui/avatar.tsx:18`) — renders with the generic neutral oklch palette instead of the app's dark-theme tokens.
**Gap 2 (Minor — explicit task requirement not met, dead code)**: T8's "Done when" required `src/data/mockData.ts` to no longer export `conversations`. It still does (`src/data/mockData.ts:1-50`). Nothing imports it anymore (`conversations` is confirmed unreferenced via a full-repo grep), so there is no functional/regression risk — it's inert dead code left over from the task, not a `noUnusedLocals`-catchable issue since it's an exported binding.

---

## Edge Cases

- [x] JSON corrompido/inválido em `localStorage` → tratado como lista vazia — `src/lib/chatStorage.ts:21-26` (`try/catch` + `Array.isArray` check)
- [x] Streaming + clique em outro chat → ignorado, mesma regra do "novo chat" — `src/hooks/useChats.ts:57-63`
- [x] Título vazio/só espaços → não aplicável, já coberto pela validação existente de `sendMessage` — `src/hooks/useChats.ts:82` (`if (!trimmed || ...) return;`)
- [x] 11º chat quando já há 10 → aparece no topo, o menos recente sai da lista visível mas permanece salvo — `src/hooks/useChats.ts:40` caps only the *derived* `visibleChats`; `persistChats` (`:103`) always persists the full, uncapped `chats` array
- [ ] **GAP**: troca de modelo (`ModelDropdown`) dentro de um chat existente → salva no estado React imediatamente (`src/hooks/useChats.ts:70-72`, correctly scoped per-chat, not global) **but is not written to `localStorage` until the next message is sent in that chat** — `setSelectedModel` (`src/hooks/useChats.ts:65-77`) never calls `persistChats`. If the user switches a chat's model and reloads/closes the app before sending another message in that chat, the model reverts to the old value on reload. Low-severity (only visible across a reload with no follow-up message), but it is a literal gap against the spec's edge case, which says the choice "SHALL ser salva" (saved) per-chat.

---

## Gate Check

- **Gate command**: `pnpm build` (Full gate, per tasks.md's Gate Check Commands table)
- **Result**: ✅ exit 0 — `tsc && vite build` succeeded, 1917 modules transformed, no errors
- **Secondary gate**: `npx tsc --noEmit` → ✅ exit 0, no type errors
- **Test count before/after feature**: N/A — no test runner in this repo, confirmed via full search (no vitest/jest, no `.test.`/`.spec.` files); this is the user's documented, confirmed decision (tasks.md Test Coverage Matrix)
- **Skipped tests**: N/A (none exist to skip)
- **Failures**: none

---

## Requirement Traceability Update

| Requirement | Previous Status | New Status |
| --- | --- | --- |
| CHAT-01 | In Tasks | ✅ Verified |
| CHAT-02 | In Tasks | ✅ Verified |
| CHAT-03 | In Tasks | ✅ Verified |
| CHAT-04 | In Tasks | ✅ Verified |
| CHAT-05 | In Tasks | ✅ Verified |
| CHAT-06 | In Tasks | ✅ Verified |
| CHAT-07 | In Tasks | ✅ Verified |
| CHAT-08 | In Tasks | ⚠️ Verified with gap (CSS var remap / `.dark` cleanup from T2 not done; the 3 explicitly-named elements — new-chat button, send button, model dropdown — are correct) |
| CHAT-09 | In Tasks | ⚠️ Verified with gap (ScrollArea wired correctly per AC; underlying scrollbar-thumb color inherits the unmapped neutral palette rather than an app token) |
| CHAT-10 | In Tasks | ✅ Verified |

---

## Summary

**Overall**: ⚠️ Issues (non-blocking — feature is functionally complete and shippable; 3 gaps are cosmetic/task-hygiene, not user-facing breakage of any P1 flow)

**Spec-anchored check**: 17/17 literal acceptance criteria across all 4 stories matched their spec-defined outcome with direct `file:line` evidence.
**Sensor**: 3 mutations reasoned through — 1 clearly killed by basic manual testing, 2 would survive without manual QA (1 due to redundant UI-level guard, 1 as a genuine single point of failure with no test safety net — expected given the confirmed no-tests decision).
**Gate**: `pnpm build` passed, `tsc --noEmit` passed.

**What works**: Real chat persistence via `localStorage`, correct 10-item cap + desc sort, draft-vs-persisted chat lifecycle, streaming lock across new-chat/select-chat, empty-state copy, and all 4 named shadcn primitives (Button, DropdownMenu, ScrollArea, Avatar) wired with the app's existing color tokens on their explicit call sites.

**Issues found**:
1. T2's CSS var remap to `--color-*` tokens and `.dark` block removal were never done — `src/index.css` still ships shadcn's raw neutral `oklch` palette and the unused `.dark` block. Fix: remap `--primary`/`--background`/`--foreground`/`--border`/`--ring`/`--accent` to the existing `--color-*` tokens and delete the `.dark` block, per design.md's `AD-002`.
2. `src/data/mockData.ts` still exports the now-unused `conversations` array. Fix: delete the export, keep `profile`.
3. `setSelectedModel` doesn't call `persistChats` — a model switch on an existing chat is lost on reload if no further message is sent. Fix: add a `persistChats(next)` call inside the `else` branch of `setSelectedModel` (`src/hooks/useChats.ts:70-72`).

**Next steps**: These are all small, isolated fixes (no architectural change needed) — recommend a short fix pass before closing the feature, or explicit user sign-off to accept them as known debt.
