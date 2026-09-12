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

### AD-003
- **Decision**: Adopt a Dual-Licensing structure: Source Code is licensed under MIT, while Documentation, Specifications (`.specs/`), Guides, Assets, and Landing Page (`docs/`) are licensed under Creative Commons Attribution 4.0 International (CC BY 4.0).
- **Reason**: Creative Commons officially recommends against CC licenses for software source code (lack of patent terms, object/source distinction). MIT is ideal for TypeScript/Rust software code, while CC BY 4.0 provides a clear, globally-recognized attribution license for technical documentation, design assets, and landing page content.
- **Trade-off**: Requires maintaining explicit dual-license notices in `LICENSE`, `README.md`, `CONTRIBUTING.md`, and `docs/index.html`.
- **Scope**: All existing and future code, assets, documentation, and specs in the project.
- **Date**: 2026-08-26
### AD-004
- **Decision**: Multi-Platform binary distribution utilizes GitHub Actions CI/CD matrix compiling native bundles (.dmg for macOS ARM64/x64, .msi/.exe for Windows x64, .AppImage/.deb for Linux x64) uploaded directly to GitHub Releases. The GitHub Pages website (`docs/index.html`) serves as an OS-aware download hub with client-side platform detection and direct download links.
- **Reason**: GitHub Pages enforces strict limits (100MB per file, 1GB total repo size). Storing multi-platform binary bundles in Git history is an anti-pattern. GitHub Releases provides free unlimited CDN bandwidth for asset delivery, while GitHub Pages provides an optimal UI/UX for end users.
- **Trade-off**: Requires maintainers to tag releases with `v*` to trigger automated builds, and end users on macOS/Windows without paid certificates must follow simple unnotarized app guidance.
- **Scope**: All release workflows, automated distribution, and GitHub Pages download portals for local-code.
- **Date**: 2026-08-26
- **Status**: active

## Handoff

- **Feature**: Multi-Platform Executable Build & GitHub Pages Distribution — `.specs/features/multiplatform-release-distribution/`
- **Phase / Task**: All Phases (Phase 1, 2, 3) — Completed and Verified.
- **Completed**:
  - `.github/workflows/release.yml` (multi-platform matrix build for macOS ARM64/Intel, Windows x64, Linux x64 with pnpm & Rust)
  - `.github/workflows/pages.yml` (automated GitHub Pages continuous deployment for `docs/`)
  - `docs/index.html` (OS detection, `#downloads` hub with platform cards, direct release asset links, and first-time installation guide)
  - `README.md` (platform download badges, download matrix table, and automated release guide)
  - Validation report (`.specs/features/multiplatform-release-distribution/validation.md`) with PASS verdict.
- **In-progress**: none
- **Next step**: User can push code and tag a release (e.g. `git tag v0.1.0 && git push origin v0.1.0`) to trigger the multi-platform build workflow on GitHub Actions.
- **Blockers**: none
- **Branch**: master
