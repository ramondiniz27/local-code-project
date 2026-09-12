# ⚡ local-code

> **Workspace de IA 100% Local e Focado em Privacidade** para desktop powered por **Tauri 2**, **React 19** e **Ollama**.

[![Tauri 2.0](https://img.shields.io/badge/Tauri-v2.0-blue.svg?style=flat-square&logo=tauri)](https://tauri.app)
[![React 19](https://img.shields.io/badge/React-19.1-61dafb.svg?style=flat-square&logo=react)](https://react.dev)
[![TypeScript 5.8](https://img.shields.io/badge/TypeScript-5.8-3178c6.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Ollama](https://img.shields.io/badge/Ollama-Local_LLM-black.svg?style=flat-square&logo=ollama)](https://ollama.com)
[![macOS Download](https://img.shields.io/badge/macOS-Apple_Silicon_%7C_Intel-black.svg?style=flat-square&logo=apple)](https://github.com/your-username/local-code/releases/latest)
[![Windows Download](https://img.shields.io/badge/Windows-EXE_%7C_MSI-blue.svg?style=flat-square&logo=windows)](https://github.com/your-username/local-code/releases/latest)
[![Linux Download](https://img.shields.io/badge/Linux-AppImage_%7C_deb-orange.svg?style=flat-square&logo=linux)](https://github.com/your-username/local-code/releases/latest)
[![Licença Código: MIT](https://img.shields.io/badge/Código-MIT-yellow.svg?style=flat-square)](LICENSE)
[![Licença Docs: CC BY 4.0](https://img.shields.io/badge/Docs-CC_BY_4.0-lightgrey.svg?style=flat-square&logo=creativecommons)](LICENSE)

---

## 📥 Download dos Executáveis Oficiais

Você pode baixar os instaladores e executáveis pré-compilados diretamente da nossa **[Central de Downloads na GitHub Pages](https://your-username.github.io/local-code/#downloads)** ou pela aba de **[Releases no GitHub](https://github.com/your-username/local-code/releases/latest)**:

| Plataforma | Arquitetura | Formatos Disponíveis |
| :--- | :--- | :--- |
| 🍏 **macOS** | Apple Silicon (M1/M2/M3/M4) / Intel | `.dmg` |
| 🪟 **Windows** | 64-bit (x64) | `.exe` (NSIS Installer), `.msi` |
| 🐧 **Linux** | 64-bit (x64) | `.AppImage` (Universal), `.deb` |

---

## 🌟 Visão Geral

O **`local-code`** é um aplicativo desktop de alta performance desenvolvido para programadores e usuários exigentes que desejam um ambiente de inteligência artificial rodando 100% em seu próprio hardware—sem assinaturas, sem telemetria e com zero envio de dados para servidores externos.

Conectando-se diretamente à sua instância local do [Ollama](https://ollama.com), o `local-code` oferece acesso instantâneo a modelos open-source como `llama3.3`, `deepseek-r1`, `qwen2.5-coder`, `mistral` e muitos outros distribuídos em três modos especializados.

🌐 **Website / Demonstração:** [Acesse a Landing Page do GitHub Pages](https://pages.github.com) *(Veja em `docs/index.html`)*

---

## ✨ Funcionalidades e Modos

### 💬 Modo Chat
- **Suporte Multi-Modelo**: Alterne instantaneamente entre qualquer modelo instalado no Ollama.
- **Streaming de Respostas**: Transmissão em tempo real de tokens com latência mínima local.
- **Renderização Rica**: Suporte completo a Markdown com blocos de código destacados e GFM.
- **Histórico de Sessões**: Gerencie, renomeie ou limpe suas conversas armazenadas localmente.

### 🤝 Modo Cowork
- **Assistente de Fluxo de Trabalho**: Workspace colaborativo projetado para prompts em múltiplas etapas e divisão de tarefas.
- **Contexto Estruturado**: Configure regras de fundo e contexto de sistema sob medida.

### 💻 Modo Code
- **Copilot de Programação**: Modo dedicado a geração de código, refatoração e depuração.
- **Interface Otimizada**: Layout sob medida para inspecionar trechos de código e lógica de execução.

---

## 🛠️ Stack Tecnológica

- **Core Desktop**: [Tauri v2](https://tauri.app/) (Wrapper nativo em Rust com consumo mínimo de memória RAM e inicialização ultrarrápida)
- **Framework Frontend**: [React 19](https://react.dev/) + [TypeScript 5.8](https://www.typescriptlang.org/)
- **Empacotador**: [Vite 7](https://vitejs.dev/)
- **Estilização**: [Tailwind CSS v4](https://tailwindcss.com/) + [Radix UI](https://www.radix-ui.com/) + [Lucide React](https://lucide.dev/)
- **Gerenciamento de Estado**: [Zustand](https://github.com/pmndrs/zustand)
- **Provedor de IA Local**: [Ollama](https://ollama.com) via API REST HTTP local (`http://127.0.0.1:11434`)

---

## 🚀 Início Rápido

### Pré-requisitos

1. **Node.js** (v20+) & **pnpm** (v9+)
2. **Rust Toolchain** (instalado via [rustup.rs](https://rustup.rs))
3. **Ollama** instalado e rodando em seu sistema ([ollama.com](https://ollama.com))

```bash
# Verifique se o Ollama está rodando e instale seu modelo preferido
ollama run llama3.2
```

### Instalação e Desenvolvimento

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/local-code.git
cd local-code

# 2. Instale as dependências
pnpm install

# 3. Inicie o aplicativo em modo de desenvolvimento (Frontend + Desktop Tauri)
pnpm tauri dev
```

### Build de Produção Local
 
```bash
# Gerar instaladores executáveis nativos no seu computador (dmg, msi, deb, appimage)
pnpm tauri build
```

Os binários compilados localmente serão gerados em `src-tauri/target/release/bundle/`.

### 🚀 Publicando Novas Versões Automaticamente (GitHub Actions)

O repositório possui uma esteira automatizada em [`.github/workflows/release.yml`](.github/workflows/release.yml) que compila e disponibiliza os binários para **macOS**, **Windows** e **Linux** em paralelo:

```bash
# Para gerar uma nova release com instaladores para todos os sistemas operacionais:
git tag v0.1.0
git push origin v0.1.0
```

Assim que a tag for enviada, a ação do GitHub compilará todas as versões e criará a Release com os arquivos de download automaticamente!

---

## 📂 Estrutura do Projeto

```
local-code/
├── docs/                     # Landing Page do GitHub Pages (index.html)
├── src/                      # App Frontend em React 19
│   ├── components/           # Componentes UI (Sidebar, Chat, Cowork, Code, Setup)
│   ├── hooks/                # Hooks personalizados (useChats, useOllamaErrorToast)
│   ├── store/                # Stores Zustand (settingsStore)
│   ├── lib/                  # Utilitários e helpers
│   ├── App.tsx               # Entrada principal da aplicação
│   └── main.tsx              # Root do ReactDOM
├── src-tauri/                # Backend Tauri 2 (Rust)
│   ├── Cargo.toml            # Dependências Rust e configuração da lib
│   ├── tauri.conf.json       # Configuração de janela e empacotamento
│   └── src/                  # Código fonte em Rust (main.rs, lib.rs)
├── CONTRIBUTING.md           # Guia de contribuição para o projeto
├── CODE_OF_CONDUCT.md        # Código de Conduta do Contribuinte
├── LICENSE                   # Licença MIT do projeto
├── package.json
└── README.md
```

---

## 🤝 Contribuição

Contribuições são super bem-vindas! Consulte o guia em [CONTRIBUTING.md](CONTRIBUTING.md) para saber como enviar bugs, melhorias ou novos recursos.

---

## 📄 Licença

Este projeto adota um modelo de **Licenciamento Duplo**:
- **Código-Fonte**: Licença [MIT](LICENSE).
- **Documentação, Assets & Landing Page**: Licença [Creative Commons Atribuição 4.0 Internacional (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/deed.pt-br).

Veja o arquivo [LICENSE](LICENSE) para o texto completo dos termos.
