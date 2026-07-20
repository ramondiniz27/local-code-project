# STATE

## Decisions

### AD-001
- **Decision**: Local persistence for app-level data (chats, settings) uses a dedicated `lib/*Storage.ts` module wrapping `localStorage` directly — no Tauri store/SQL plugin, no backend involvement.
- **Reason**: No store/SQL plugin is installed in `src-tauri` (only `tauri-plugin-opener`); the app already used `localStorage` for `ollamaUrl` before this feature, so this keeps a single consistent persistence pattern.
- **Trade-off**: No cross-device sync, no query capability, unbounded growth needs manual pruning if ever required (accepted debt for chat history — see feature's design.md Risks).
- **Scope**: Any future feature needing local persistence in this app (chat history, settings, drafts, etc.).
- **Date**: 2026-07-19
- **Status**: active

### AD-002
- **Decision**: shadcn/ui components are installed with the Radix UI backend (`-b radix`) and the CSS variables shadcn injects into `src/index.css` (`--primary`, `--background`, `--foreground`, `--border`, `--ring`, `--accent`, `--muted`, `--popover`, etc.) are remapped to reference the app's existing `--color-*` design tokens — never left at shadcn's default neutral `oklch` palette.
- **Reason**: The app has a pre-existing custom dark/light hybrid theme (dark sidebar, light main area) defined via `--color-*` tokens in `src/index.css`'s `@theme` block. Leaving shadcn's defaults would introduce a visually inconsistent neutral-gray palette wherever a component isn't explicitly overridden via `className`. The shadcn CLI (as of this session) defaults to a "Base UI" backend with opinionated design "presets" (Nova/Vega/Maia/etc.) — Radix was chosen explicitly to match this app's existing usage of granular, explicitly-styled primitives.
- **Trade-off**: Every future `shadcn add <component>` requires a manual pass to check/remap any new CSS variables the component introduces, plus removing unwanted preset extras (this session removed an injected Geist font import and conflicting `--radius-sm/md/lg` overrides).
- **Scope**: Any future shadcn/ui component addition in this app.
- **Date**: 2026-07-19
- **Status**: active

## Handoff

- **Feature**: Histórico Real de Chats + shadcn/ui — `.specs/features/chat-history/`
- **Phase / Task**: Execute — complete. All 15 tasks (T1–T15) implemented, committed, and verified.
- **Completed**: T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, T12, T13, T14, T15 + 3 post-Verifier fix commits (dead mockData export, setSelectedModel persistence, shadcn CSS-var remap gap)
- **In-progress**: none
- **Next step**: User-facing manual QA in the running app (browser automation tooling was unavailable this session — no live click-through was performed). Suggested checks: multi-chat create/switch/reload flow, streaming-lock on sidebar/new-chat, empty-state copy, visual pass on shadcn components (button/dropdown/scrollbar/avatar) against the dark sidebar / light main area.
- **Blockers**: none
- **Uncommitted files**: none (only `.specs/` tracking files were touched by the Verifier and this handoff write)
- **Branch**: master
