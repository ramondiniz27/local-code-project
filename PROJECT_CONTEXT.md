# local-code — Contexto do Projeto

## Visão Geral

App desktop **Tauri 2 + React 19 + TypeScript + Vite 7**. Atualmente no estado de template inicial.

## Stack Tecnológica

- **Frontend**: React 19.1, TypeScript 5.8, Vite 7.0
- **Backend**: Rust (Tauri 2), serde, serde_json, tauri-plugin-opener
- **Package Manager**: pnpm 11.3
- **Node**: v24.16.0 (via nvm)
- **Rust/Cargo**: Não instalado no ambiente

## Estrutura de Diretórios

```
local-code/
├── .devin/workflows/init.md       (vazio)
├── .gitignore
├── .vscode/extensions.json        (recomenda tauri-vscode + rust-analyzer)
├── README.md
├── index.html                     (entry point Vite)
├── package.json
├── tsconfig.json                  (strict, ES2020, bundler resolution)
├── tsconfig.node.json
├── vite.config.ts                 (porta 1420 fixa, ignora src-tauri no watch)
├── public/
│   ├── tauri.svg
│   └── vite.svg
├── src/
│   ├── App.tsx                    (componente template com greet via invoke)
│   ├── App.css                    (estilos template, suporta dark mode)
│   ├── main.tsx                   (ReactDOM.createRoot, StrictMode)
│   ├── vite-env.d.ts
│   └── assets/react.svg
└── src-tauri/
    ├── .gitignore                 (/target/, /gen/schemas)
    ├── Cargo.toml                 (name: local-code, lib: local_code_lib)
    ├── build.rs
    ├── tauri.conf.json            (productName: local-code, identifier: com.ramon.local-code)
    ├── capabilities/default.json  (core:default, opener:default)
    ├── icons/                     (ícones padrão Tauri)
    └── src/
        ├── main.rs                (entry point, chama local_code_lib::run())
        └── lib.rs                 (comando greet, plugin opener, tauri::Builder)
```

## Configurações Importantes

- **tauri.conf.json**: identifier `com.ramon.local-code`, janela 800x600, CSP desabilitado, bundle targets "all"
- **Vite**: porta 1420 (strictPort), HMR na 1421 quando TAURI_DEV_HOST setado
- **TypeScript**: strict mode, noUnusedLocals, noUnusedParameters
- **Tauri capabilities**: core:default, opener:default

## Scripts (package.json)

| Script   | Comando            | Descrição                    |
| -------- | ------------------ | ---------------------------- |
| `dev`    | `vite`             | Frontend only                |
| `build`  | `tsc && vite build`| Build frontend               |
| `preview`| `vite preview`     | Preview do build             |
| `tauri`  | `tauri`            | CLI Tauri (dev/build/...)    |

## Comandos Tauri Rust (src-tauri/src/lib.rs)

- `greet(name: &str) -> String` — retorna `"Hello, {name}! You've been greeted from Rust!"`

## Estado Atual

- Sem commits git (repo vazio, branch master)
- `node_modules` não instalado — rodar `pnpm install`
- Rust toolchain não instalado — necessário para `tauri dev` / `tauri build`
- Sem lock file (pnpm-lock.yaml)
- `.devin/workflows/init.md` está vazio

## Como Começar

```bash
# 1. Instalar dependências do frontend
pnpm install

# 2. Instalar Rust toolchain (se não tiver)
#    Via rustup: https://rustup.rs

# 3. Rodar em desenvolvimento (frontend + backend)
pnpm tauri dev

# 4. Build de produção
pnpm tauri build
```
