import { create } from "zustand";
import { persist } from "zustand/middleware";
import { runScript, readFile, writeFile, listDirectory, buildSystemPrompt } from "@/lib/filesystem";
import { streamChat, listModels, selectModel, type ChatMessage, type OllamaModel } from "@/lib/ollama";
import { useFilesystemStore } from "@/store/filesystemStore";
import { useSettingsStore } from "@/store/settingsStore";
import { parsePlanSteps, parseToolCalls, parseDirectIntentFallback, type ParsedToolCall } from "@/lib/agentParser";

export type SessionStatus = "idle" | "running" | "paused" | "stopped" | "completed";
export type PlanStepStatus = "pending" | "in_progress" | "completed" | "failed";

export interface PlanStep {
  id: string;
  label: string;
  status: PlanStepStatus;
}

export type ActivityKind = "read" | "write" | "create" | "delete" | "terminal";

export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  description: string;
  timestamp: string;
}

export interface TerminalExecution {
  command: string;
  output: string;
  executionTime: string;
  statusText: string;
  isSuccess: boolean;
}

export interface PermissionRequest {
  id: string;
  command: string;
  reason: string;
  status: "pending" | "approved" | "denied";
}

export interface ChangedFile {
  name: string;
  additions: number;
  deletions: number;
  status: "modified" | "added" | "deleted" | "untracked";
}

export interface SessionMetrics {
  activeTimeSeconds: number;
  commandsExecuted: number;
  filesTouched: string[];
  tokensUsed: number;
}

interface CoworkState {
  sessionStatus: SessionStatus;
  workingDir: string;
  sessionTitle: string;
  planSteps: PlanStep[];
  activities: ActivityItem[];
  terminalExecutions: TerminalExecution[];
  pendingPermission: PermissionRequest | null;
  changedFiles: ChangedFile[];
  metrics: SessionMetrics;
  isDiffModalOpen: boolean;
  isStopModalOpen: boolean;
  isExecuting: boolean;

  // Model Selection State
  selectedModel: string;
  isModelDropdownOpen: boolean;
  availableModels: OllamaModel[];

  // Actions
  setWorkingDir: (dir: string) => void;
  setSessionStatus: (status: SessionStatus) => void;
  pauseProcess: () => void;
  resumeProcess: () => void;
  stopProcess: () => void;
  startProcess: () => void;
  finishTask: () => void;
  submitTaskPrompt: (prompt: string) => Promise<void>;
  approvePermission: () => Promise<void>;
  denyPermission: () => void;
  runTerminalCommand: (cmd: string) => Promise<void>;
  executeToolCall: (call: ParsedToolCall) => Promise<string>;
  refreshGitStatus: () => Promise<void>;
  setDiffModalOpen: (open: boolean) => void;
  setStopModalOpen: (open: boolean) => void;
  tickTimer: () => void;
  resetSession: () => void;

  // Model Selection Actions
  setSelectedModel: (modelName: string) => Promise<void>;
  setModelDropdownOpen: (open: boolean) => void;
  fetchAvailableModels: () => Promise<void>;
}

function formatTimestamp(): string {
  const now = new Date();
  return now.toTimeString().slice(0, 5);
}

function isSensitiveCommand(cmd: string): boolean {
  const lower = cmd.toLowerCase().trim();
  return (
    lower.startsWith("git push") ||
    lower.startsWith("git commit") ||
    lower.startsWith("rm -rf") ||
    lower.includes("deploy") ||
    lower.includes("drop database") ||
    lower.startsWith("sudo")
  );
}

const initialWorkingDir = useFilesystemStore.getState().workingDirectory || "";

export const useCoworkStore = create<CoworkState>()(
  persist(
    (set, get) => ({
      sessionStatus: "idle",
      workingDir: initialWorkingDir,
      sessionTitle: "",
      planSteps: [],
      activities: [],
      terminalExecutions: [],
      pendingPermission: null,
      changedFiles: [],
      metrics: {
        activeTimeSeconds: 0,
        commandsExecuted: 0,
        filesTouched: [],
        tokensUsed: 0,
      },
      isDiffModalOpen: false,
      isStopModalOpen: false,
      isExecuting: false,

      // Model Selection Defaults
      selectedModel: "Claude 3.5 Sonnet",
      isModelDropdownOpen: false,
      availableModels: [],

      setWorkingDir: (dir: string) => {
        set({ workingDir: dir });
        get().refreshGitStatus();
      },

      setSessionStatus: (status: SessionStatus) => set({ sessionStatus: status }),

      pauseProcess: () => {
        const timestamp = formatTimestamp();
        const pauseNotice: ActivityItem = {
          id: Date.now().toString(),
          kind: "write",
          description: "Processo pausado e estado salvo para continuar posteriormente",
          timestamp,
        };
        set((state) => ({
          sessionStatus: "paused",
          isExecuting: false,
          activities: [pauseNotice, ...state.activities],
        }));
      },

      resumeProcess: () => {
        const timestamp = formatTimestamp();
        const resumeNotice: ActivityItem = {
          id: Date.now().toString(),
          kind: "write",
          description: "Processo retomado a partir do estado salvo",
          timestamp,
        };
        set((state) => ({
          sessionStatus: "running",
          activities: [resumeNotice, ...state.activities],
        }));
      },

      stopProcess: () => {
        const timestamp = formatTimestamp();
        const stopNotice: ActivityItem = {
          id: Date.now().toString(),
          kind: "terminal",
          description: "Processo interrompido pelo usuário",
          timestamp,
        };
        set((state) => ({
          sessionStatus: "stopped",
          isExecuting: false,
          pendingPermission: null,
          activities: [stopNotice, ...state.activities],
        }));
      },

      startProcess: () => {
        const { sessionTitle } = get();
        const timestamp = formatTimestamp();
        const startNotice: ActivityItem = {
          id: Date.now().toString(),
          kind: "write",
          description: sessionTitle ? `Processo iniciado para: "${sessionTitle}"` : "Sessão iniciada",
          timestamp,
        };
        set((state) => ({
          sessionStatus: "running",
          activities: [startNotice, ...state.activities],
        }));
      },

      finishTask: () => {
        const timestamp = formatTimestamp();
        const finishNotice: ActivityItem = {
          id: Date.now().toString(),
          kind: "write",
          description: "Tarefa finalizada manualmente pelo usuário",
          timestamp,
        };
        set((state) => ({
          sessionStatus: "completed",
          isExecuting: false,
          planSteps: state.planSteps.map((s) => ({ ...s, status: "completed" as PlanStepStatus })),
          activities: [finishNotice, ...state.activities],
        }));
      },

      setDiffModalOpen: (open: boolean) => set({ isDiffModalOpen: open }),

      setModelDropdownOpen: (open: boolean) => set({ isModelDropdownOpen: open }),

      fetchAvailableModels: async () => {
        const url = useSettingsStore.getState().ollamaUrl;
        try {
          const models = await listModels(url);
          set({ availableModels: models });
          if (models.length > 0 && !models.some((m) => m.name === get().selectedModel)) {
            const first = models[0].name;
            await get().setSelectedModel(first);
          }
        } catch {
          set({ availableModels: [] });
        }
      },

      setSelectedModel: async (modelName: string) => {
        const url = useSettingsStore.getState().ollamaUrl;
        set({ selectedModel: modelName, isModelDropdownOpen: false });
        try {
          await selectModel(url, modelName);
        } catch {
          // Handled silently
        }
      },

      tickTimer: () => {
        const { sessionStatus, metrics } = get();
        if (sessionStatus === "running") {
          set({
            metrics: {
              ...metrics,
              activeTimeSeconds: metrics.activeTimeSeconds + 1,
            },
          });
        }
      },

      executeToolCall: async (call: ParsedToolCall): Promise<string> => {
        const { workingDir } = get();
        const timestamp = formatTimestamp();
        const activeDir = workingDir || useFilesystemStore.getState().workingDirectory || "./";

        try {
          if (call.name === "write_file") {
            const rawPath = call.arguments.path || "file.txt";
            const path = rawPath.replace(/^\.\//, "").replace(/^\//, "");
            const content = call.arguments.content || "";
            await writeFile(path, content, activeDir);

            const act: ActivityItem = {
              id: Date.now().toString(),
              kind: "write",
              description: `Criou/editou arquivo '${path}'`,
              timestamp,
            };
            set((state) => ({
              activities: [act, ...state.activities],
              metrics: {
                ...state.metrics,
                filesTouched: Array.from(new Set([...state.metrics.filesTouched, path])),
              },
            }));
            await get().refreshGitStatus();
            return `Sucesso: Arquivo '${path}' escrito com ${content.length} bytes.`;
          }

          if (call.name === "run_script") {
            const cmd = call.arguments.command || "";
            if (isSensitiveCommand(cmd)) {
              set({
                pendingPermission: {
                  id: `perm-${Date.now()}`,
                  command: cmd,
                  reason: "O agente solicita confirmação do usuário para executar:",
                  status: "pending",
                },
              });
              return `Aguardando aprovação do usuário para executar '${cmd}'...`;
            }
            await get().runTerminalCommand(cmd);
            return `Executado comando '${cmd}'.`;
          }

          if (call.name === "read_file") {
            const path = call.arguments.path || "";
            let data = "";
            if (path) {
              data = await readFile(path, activeDir);
            }
            const act: ActivityItem = {
              id: Date.now().toString(),
              kind: "read",
              description: `Leu arquivo '${path}'`,
              timestamp,
            };
            set((state) => ({ activities: [act, ...state.activities] }));
            return `Conteúdo do arquivo '${path}':\n${data.slice(0, 500)}`;
          }

          if (call.name === "list_directory") {
            const path = call.arguments.path || "";
            let listStr = "";
            const res = await listDirectory(path, activeDir, 2);
            listStr = res.entries.map((e) => `${e.kind}: ${e.path}`).join("\n");

            const act: ActivityItem = {
              id: Date.now().toString(),
              kind: "read",
              description: `Listou diretório '${path || "./"}'`,
              timestamp,
            };
            set((state) => ({ activities: [act, ...state.activities] }));
            return `Entradas do diretório:\n${listStr}`;
          }
        } catch (err: any) {
          const act: ActivityItem = {
            id: Date.now().toString(),
            kind: "write",
            description: `Erro ao executar ${call.name}: ${err.message || String(err)}`,
            timestamp,
          };
          set((state) => ({ activities: [act, ...state.activities] }));
          return `Erro: ${err.message || String(err)}`;
        }

        return "Ferramenta desconhecida.";
      },

      submitTaskPrompt: async (promptText: string) => {
        if (!promptText.trim()) return;

        let { workingDir } = get();
        if (!workingDir) {
          workingDir = useFilesystemStore.getState().workingDirectory || "./";
          get().setWorkingDir(workingDir);
        }

        const { selectedModel } = get();
        const url = useSettingsStore.getState().ollamaUrl;
        const timestamp = formatTimestamp();

        set({
          sessionTitle: promptText,
          sessionStatus: "running",
          isExecuting: true,
        });

        try {
          // Select model in backend before executing
          if (selectedModel && selectedModel !== "Claude 3.5 Sonnet") {
            try {
              await selectModel(url, selectedModel);
            } catch {
              // Handled silently
            }
          }

          const startNotice: ActivityItem = {
            id: Date.now().toString(),
            kind: "write",
            description: `Tarefa iniciada com ${selectedModel}: "${promptText}"`,
            timestamp,
          };

          set((state) => ({ activities: [startNotice, ...state.activities] }));

          // 1. Construct messages with system prompt & tool definitions
          const systemMsg = buildSystemPrompt(workingDir || "/");
          systemMsg.content += `\n\nInstruções Importantes para o Agente Cowork:\n1. Primeiro forneça um plano simples com 3 a 5 etapas em um bloco <plan>:\n<plan>\n1. Analisar instrução\n2. Criar ou modificar arquivo no disco\n3. Validar resultado\n</plan>\n\n2. REGRA DE OURO: Para QUALQUER pedido de criar, modificar, editar, atualizar ou salvar arquivos no projeto, você DEVE gerar obrigatoriamente um bloco <tool_call> contendo a ferramenta write_file com o caminho e o conteúdo completo:\n<tool_call>\n{"name": "write_file", "arguments": {"path": "nome_do_arquivo.ext", "content": "conteúdo completo do arquivo aqui"}}\n</tool_call>\n<tool_call>\n{"name": "run_script", "arguments": {"command": "ruby nome_do_arquivo.rb"}}\n</tool_call>`;

          const messages: ChatMessage[] = [
            systemMsg as ChatMessage,
            { role: "user", content: promptText },
          ];

          let fullAssistantOutput = "";

          try {
            // Stream LLM chat response (with 45s safety timeout)
            await streamChat(messages, (chunk) => {
              fullAssistantOutput += chunk;
              set((state) => ({
                metrics: {
                  ...state.metrics,
                  tokensUsed: state.metrics.tokensUsed + Math.ceil(chunk.length / 4),
                },
              }));
            });
          } catch {
            // LLM stream fallback if Ollama server is offline
          }

          // 2. Extract dynamic plan steps from LLM output
          const extractedSteps = parsePlanSteps(fullAssistantOutput);
          const activeSteps: PlanStep[] =
            extractedSteps.length > 0
              ? extractedSteps.map((label, idx) => ({
                  id: `step-${idx + 1}`,
                  label,
                  status: idx === 0 ? "in_progress" : "pending",
                }))
              : [
                  { id: "step-1", label: "Analisar instrução e estrutura do repositório", status: "in_progress" },
                  { id: "step-2", label: `Executar tarefa: "${promptText.slice(0, 45)}"`, status: "pending" },
                  { id: "step-3", label: "Validar alterações no disco e finalizar", status: "pending" },
                ];

          set({ planSteps: activeSteps });

          // 3. Extract tool calls (or direct intent fallback for file creation)
          let toolCalls = parseToolCalls(fullAssistantOutput);
          if (toolCalls.length === 0) {
            const fallbackCall = parseDirectIntentFallback(promptText, fullAssistantOutput);
            if (fallbackCall) {
              toolCalls.push(fallbackCall);
            }
          }

          // 4. Execute all tool calls
          for (let i = 0; i < toolCalls.length; i++) {
            const call = toolCalls[i];
            await get().executeToolCall(call);

            // Update step progress
            set((state) => {
              const updated = state.planSteps.map((s, idx) => {
                if (idx <= i) return { ...s, status: "completed" as PlanStepStatus };
                if (idx === i + 1) return { ...s, status: "in_progress" as PlanStepStatus };
                return s;
              });
              return { planSteps: updated };
            });
          }

          // 5. Mark all steps completed and update session status to "completed"
          const finishNotice: ActivityItem = {
            id: Date.now().toString(),
            kind: "write",
            description: `Tarefa concluída com sucesso: "${promptText}"`,
            timestamp: formatTimestamp(),
          };

          set((state) => ({
            planSteps: state.planSteps.map((s) => ({ ...s, status: "completed" as PlanStepStatus })),
            sessionStatus: "completed",
            activities: [finishNotice, ...state.activities],
          }));

          await get().refreshGitStatus();
        } catch (err: any) {
          const errNotice: ActivityItem = {
            id: Date.now().toString(),
            kind: "write",
            description: `Ocorreu um erro no processamento da tarefa: ${err.message || String(err)}`,
            timestamp: formatTimestamp(),
          };
          set((state) => ({
            sessionStatus: "stopped",
            activities: [errNotice, ...state.activities],
          }));
        } finally {
          set({ isExecuting: false });
        }
      },

      approvePermission: async () => {
        const { pendingPermission, workingDir } = get();
        if (!pendingPermission) return;

        const cmd = pendingPermission.command;
        set({
          pendingPermission: null,
          activities: [
            {
              id: Date.now().toString(),
              kind: "terminal",
              description: `Permissão concedida para: ${cmd}`,
              timestamp: formatTimestamp(),
            },
            ...get().activities,
          ],
        });

        if (workingDir) {
          await get().runTerminalCommand(cmd);
        }
      },

      denyPermission: () => {
        const { pendingPermission } = get();
        if (!pendingPermission) return;

        const cmd = pendingPermission.command;
        set({
          pendingPermission: null,
          activities: [
            {
              id: Date.now().toString(),
              kind: "terminal",
              description: `Permissão negada para: ${cmd}`,
              timestamp: formatTimestamp(),
            },
            ...get().activities,
          ],
        });
      },

      runTerminalCommand: async (cmd: string) => {
        const { workingDir, metrics, terminalExecutions } = get();
        if (!workingDir) return;

        const startTime = Date.now();

        try {
          const res = await runScript(cmd, workingDir);
          const duration = ((Date.now() - startTime) / 1000).toFixed(2);
          const outputText = res.stdout.trim() || res.stderr.trim() || "Comando concluído com retorno 0.";

          const newExec: TerminalExecution = {
            command: `$ ${cmd}`,
            output: outputText,
            executionTime: `${duration}s`,
            statusText: res.exitCode === 0 ? `Sucesso em ${duration}s` : `Erro (code ${res.exitCode})`,
            isSuccess: res.exitCode === 0,
          };

          const newActivity: ActivityItem = {
            id: Date.now().toString(),
            kind: "terminal",
            description: `Executou comando: ${cmd}`,
            timestamp: formatTimestamp(),
          };

          set({
            terminalExecutions: [newExec, ...terminalExecutions],
            activities: [newActivity, ...get().activities],
            metrics: {
              ...metrics,
              commandsExecuted: metrics.commandsExecuted + 1,
            },
          });

          await get().refreshGitStatus();
        } catch (err: any) {
          const duration = ((Date.now() - startTime) / 1000).toFixed(2);
          const newExec: TerminalExecution = {
            command: `$ ${cmd}`,
            output: String(err.message || err),
            executionTime: `${duration}s`,
            statusText: "Erro na execução",
            isSuccess: false,
          };

          set({
            terminalExecutions: [newExec, ...terminalExecutions],
            metrics: {
              ...metrics,
              commandsExecuted: metrics.commandsExecuted + 1,
            },
          });
        }
      },

      refreshGitStatus: async () => {
        const { workingDir } = get();
        if (!workingDir) return;

        try {
          const res = await runScript("git diff --numstat && echo '---' && git status --porcelain", workingDir);

          if (res.exitCode === 0 && res.stdout.trim()) {
            const parts = res.stdout.split("---");
            const diffOutput = parts[0] || "";
            const statusOutput = parts[1] || "";

            const list: ChangedFile[] = [];

            // Parse git diff --numstat
            const diffLines = diffOutput.trim().split("\n");
            for (const line of diffLines) {
              const tokens = line.trim().split(/\s+/);
              if (tokens.length >= 3) {
                const additions = parseInt(tokens[0], 10) || 0;
                const deletions = parseInt(tokens[1], 10) || 0;
                const name = tokens.slice(2).join(" ");
                list.push({
                  name,
                  additions,
                  deletions,
                  status: "modified",
                });
              }
            }

            // Parse git status --porcelain for untracked files
            const statusLines = statusOutput.trim().split("\n");
            for (const line of statusLines) {
              if (line.startsWith("??")) {
                const name = line.slice(3).trim();
                if (name && !list.some((f) => f.name === name)) {
                  list.push({
                    name,
                    additions: 1,
                    deletions: 0,
                    status: "untracked",
                  });
                }
              }
            }

            set({ changedFiles: list });
          } else {
            set({ changedFiles: [] });
          }
        } catch {
          set({ changedFiles: [] });
        }
      },

      setStopModalOpen: (open: boolean) => set({ isStopModalOpen: open }),

      resetSession: () => {
        set({
          sessionStatus: "idle",
          sessionTitle: "",
          planSteps: [],
          activities: [],
          terminalExecutions: [],
          pendingPermission: null,
          changedFiles: [],
          isStopModalOpen: false,
          isExecuting: false,
          metrics: {
            activeTimeSeconds: 0,
            commandsExecuted: 0,
            filesTouched: [],
            tokensUsed: 0,
          },
        });
      },
    }),
    {
      name: "oc.cowork-session",
      partialize: (state) => ({
        sessionStatus: state.sessionStatus,
        workingDir: state.workingDir,
        sessionTitle: state.sessionTitle,
        planSteps: state.planSteps,
        activities: state.activities,
        terminalExecutions: state.terminalExecutions,
        changedFiles: state.changedFiles,
        metrics: state.metrics,
        selectedModel: state.selectedModel,
      }),
    }
  )
);
