# Skills Globais Disponíveis

## Mapeamento

| Skill | Trigger | Descrição |
|-------|---------|-----------|
| **cavecrew** | "delegate to subagent", "use cavecrew", "spawn investigator/builder/reviewer", "save context", "compressed agent output" | Guia de decisão para delegar a subagentes caveman-style: `cavecrew-investigator`, `cavecrew-builder`, `cavecrew-reviewer` |
| **caveman** | `/caveman`, "caveman mode", "talk like caveman", "use caveman", "less tokens", "be brief" | Modo de comunicação ultra-comprimido (caveman) |
| **caveman-commit** | `/caveman-commit`, "write a commit", "commit message", "generate commit" | Gerador de mensagens de commit curtas em Conventional Commits |
| **caveman-compress** | `/caveman-compress <file>`, "compress memory file" | Comprime arquivos `.md` para formato caveman |
| **caveman-help** | `/caveman-help`, "caveman help", "what caveman commands" | Cartão de referência dos comandos caveman |
| **caveman-review** | `/caveman-review`, "review this PR", "code review", "review the diff" | Comentários de code review ultra-comprimidos |
| **caveman-stats** | `/caveman-stats` | Mostra uso real de tokens e economia estimada |

## Modos Caveman

| Modo | Trigger | Característica |
|------|---------|----------------|
| **Lite** | `/caveman lite` | Menos enchimento, mantém estrutura de frases |
| **Full** | `/caveman` | Padrão. Remove artigos, enchimento, cortesias. Fragmentos OK |
| **Ultra** | `/caveman ultra` | Compressão extrema. Fragmentos mínimos |
| **Wenyan-Lite** | `/caveman wenyan-lite` | Estilo chinês clássico, compressão leve |
| **Wenyan-Full** | `/caveman wenyan` | 文言文 completo |
| **Wenyan-Ultra** | `/caveman wenyan-ultra` | Extremo, máxima brevidade clássica |

## Subagentes Cavecrew

| Subagente | Quando usar | Função |
|-----------|-------------|--------|
| **cavecrew-investigator** | Localizar código | Busca no codebase com output comprimido |
| **cavecrew-builder** | 1-2 arquivos para editar | Faz edições focadas |
| **cavecrew-reviewer** | Revisar diff | Review comprimido de código |

## Desativação

Diga "stop caveman" ou "normal mode" para voltar ao modo normal.

## Configuração

Variável de ambiente: `CAVEMAN_DEFAULT_MODE=ultra`

Ou arquivo `~/.config/caveman/config.json`:
```json
{ "defaultMode": "lite" }
```

Use `"off"` para desativar ativação automática.

## Documentação

- Caveman: https://github.com/JuliusBrussee/caveman
