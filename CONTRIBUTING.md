# Contribuindo para o local-code

Agradecemos o seu interesse em contribuir para o **`local-code`**! Seja corrigindo bugs, melhorando a documentação, adicionando novas funcionalidades ou otimizando a performance de LLMs locais, sua ajuda é muito bem-vinda.

---

## 📜 Código de Conduta

Este projeto adota o [Código de Conduta do Contribuinte](CODE_OF_CONDUCT.md). Ao participar, espera-se que você siga este código. Por favor, reporte comportamentos inadequados aos mantenedores do projeto.

---

## 🛠️ Configuração do Ambiente de Desenvolvimento

### Pré-requisitos

Certifique-se de ter os seguintes softwares instalados no seu ambiente local:

1. **Node.js** (v20+ recomendado) & **pnpm** (v9+)
2. **Rust Toolchain** (instalado via [rustup.rs](https://rustup.rs))
3. **Ollama** rodando localmente no seu sistema ([ollama.com](https://ollama.com))

### Como Começar

```bash
# 1. Faça o fork e clone o repositório
git clone https://github.com/seu-usuario/local-code.git
cd local-code

# 2. Instale as dependências do projeto
pnpm install

# 3. Inicie a aplicação no modo de desenvolvimento (React + Vite + backend Tauri Rust)
pnpm tauri dev
```

---

## 🌿 Estratégia de Branches e Git

- Sempre crie uma nova branch a partir da `main` (ou `master`):
  - `feat/nome-da-funcionalidade` — Novas funcionalidades ou telas
  - `fix/descricao-do-bug` — Correções de bugs
  - `docs/nome-do-topico` — Melhorias na documentação
  - `refactor/escopo` — Refatoração de código ou otimização de desempenho
  - `test/nome-do-teste` — Adição ou atualização de testes

---

## 📝 Padronização de Commits

Seguimos a convenção **[Conventional Commits](https://www.conventionalcommits.org/pt-br/)**:

- `feat: adiciona slider de parametros do modelo para temperatura e top_p`
- `fix: trata aviso de desconexão quando o serviço Ollama é interrompido`
- `docs: atualiza passos de configuracao no CONTRIBUTING.md`
- `style: ajusta espacamento das abas da barra lateral`
- `refactor: extrai componente de balao de mensagem do chat`
- `test: adiciona teste unitario para reducer do hook useChats`

---

## 🔍 Estilo de Código e Diretrizes

### Frontend em TypeScript & React (`src/`)

- Use componentes funcionais do **React 19** com o modo estrito do TypeScript habilitado.
- Evite usar `any`; defina tipos e interfaces explícitos.
- Dê preferência a classes utilitárias do **Tailwind CSS v4** e componentes Radix UI.
- Mantenha os estados locais sempre que possível ou utilize **Zustand** (`src/store/`) para configurações globais.

### Backend em Rust (`src-tauri/`)

- Formate o código usando `cargo fmt`.
- Analise o código usando `cargo clippy`.
- Mantenha os comandos Tauri (`src-tauri/src/lib.rs`) explícitos e trate erros de forma limpa com `Result<T, String>`.

---

## 🧪 Testes e Verificação

Antes de abrir um Pull Request, execute os seguintes comandos de verificação:

```bash
# Executa a suíte de testes com Vitest
pnpm test

# Executa a verificação de tipos TypeScript e o build do Vite
pnpm build
```

---

## 📬 Enviando um Pull Request (PR)

1. Certifique-se de que sua branch está atualizada com a `main`:
   ```bash
   git fetch origin
   git rebase origin/main
   ```
2. Envie sua branch para o seu fork no GitHub:
   ```bash
   git push origin feat/sua-funcionalidade
   ```
3. Abra um Pull Request direcionado à branch `main`.
4. Preencha o **Template de Pull Request** completamente.
5. Vincule issues relacionadas usando palavras-chave do GitHub (ex: `Fixes #42`).
6. Um mantenedor revisará seu PR em breve. Obrigado por contribuir!

---

## 📄 Licença

Ao contribuir para o `local-code`, você concorda que:
- Contribuições de **código-fonte** serão licenciadas sob a [Licença MIT](LICENSE).
- Contribuições de **documentação, textos e mídia** serão licenciadas sob a [Creative Commons Atribuição 4.0 Internacional (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/deed.pt-br).
