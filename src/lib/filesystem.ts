import { invoke } from "@tauri-apps/api/core";

export interface WriteResult {
  path: string;
  bytesWritten: number;
}

export interface DirEntry {
  name: string;
  path: string; // relative to working_dir
  kind: "file" | "directory";
  size: number; // bytes; 0 for directories
}

export interface ListResult {
  entries: DirEntry[];
  truncated: boolean;
}

export interface ScriptResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export async function readFile(path: string, workingDir: string): Promise<string> {
  return invoke<string>("fs_read_file", { path, workingDir });
}

export async function writeFile(
  path: string,
  content: string,
  workingDir: string,
): Promise<WriteResult> {
  return invoke<WriteResult>("fs_write_file", { path, content, workingDir });
}

export async function listDirectory(
  path: string,
  workingDir: string,
  depth: number = 2,
): Promise<ListResult> {
  return invoke<ListResult>("fs_list_directory", { path, workingDir, depth });
}

export async function runScript(command: string, workingDir: string): Promise<ScriptResult> {
  return invoke<ScriptResult>("fs_run_script", { command, workingDir });
}

export async function openSystemTerminal(workingDir: string): Promise<void> {
  return invoke("fs_open_system_terminal", { workingDir });
}

export async function selectDirectory(): Promise<string> {
  return invoke<string>("fs_select_directory");
}

export async function verifyPermission(workingDir: string): Promise<boolean> {
  return invoke<boolean>("fs_verify_permission", { workingDir });
}

// Full tool definitions injected as system prompt when filesystem access is enabled.
// The placeholder {workingDirectory} is replaced at runtime by buildSystemPrompt().
export const TOOL_DEFINITIONS_TEMPLATE = `
Você tem acesso ao sistema de arquivos do usuário dentro do diretório de trabalho: {workingDirectory}

Para operar no filesystem, emita um bloco <tool_call> com JSON no seguinte formato:

1. Ler arquivo:
<tool_call>
{"name": "read_file", "arguments": {"path": "caminho/relativo/ao/working_dir"}}
</tool_call>

2. Escrever arquivo:
<tool_call>
{"name": "write_file", "arguments": {"path": "caminho/relativo", "content": "conteúdo completo do arquivo"}}
</tool_call>

3. Listar diretório:
<tool_call>
{"name": "list_directory", "arguments": {"path": "caminho/relativo", "depth": 2}}
</tool_call>

4. Executar script:
<tool_call>
{"name": "run_script", "arguments": {"command": "npm test"}}
</tool_call>

Após emitir um <tool_call>, aguarde o resultado antes de continuar.
Nunca use caminhos absolutos — use sempre caminhos relativos ao diretório de trabalho.
Nunca use \`..\` para sair do diretório de trabalho.
`.trim();

export function buildSystemPrompt(workingDirectory: string): { role: string; content: string } {
  return {
    role: "system",
    content: TOOL_DEFINITIONS_TEMPLATE.replace("{workingDirectory}", workingDirectory),
  };
}
