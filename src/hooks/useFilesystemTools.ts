import { readFile, writeFile, listDirectory, runScript } from "../lib/filesystem";
import { useFilesystemStore } from "../store/filesystemStore";

export interface ToolCall {
  name: "read_file" | "write_file" | "list_directory" | "run_script";
  arguments: Record<string, unknown>;
}

export interface ToolResult {
  name: string;
  result?: unknown;
  error?: string;
}

/**
 * Extracts and parses tool_call blocks from assistant message content.
 * Silently ignores blocks with malformed JSON.
 */
export function parseToolCalls(content: string): ToolCall[] {
  const regex = /<tool_call>\s*([\s\S]*?)\s*<\/tool_call>/g;
  const calls: ToolCall[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    try {
      calls.push(JSON.parse(match[1]) as ToolCall);
    } catch {
      // Malformed JSON — ignore silently
    }
  }
  return calls;
}

/**
 * Formats a tool result into a <tool_result> block for reinsertion
 * into the chat history as a user message.
 */
export function formatToolResult(call: ToolCall, result: ToolResult): string {
  if (result.error) {
    return `<tool_result name="${call.name}">\nErro: ${result.error}\n</tool_result>`;
  }
  return `<tool_result name="${call.name}">\n${JSON.stringify(result.result, null, 2)}\n</tool_result>`;
}

/**
 * Hook that provides executeToolCall, dispatching to the appropriate
 * filesystem function based on call.name.
 */
export function useFilesystemTools() {
  const { workingDirectory } = useFilesystemStore();

  async function executeToolCall(call: ToolCall): Promise<ToolResult> {
    if (!workingDirectory) {
      return { name: call.name, error: "Nenhum diretório de trabalho configurado." };
    }
    try {
      const args = call.arguments;
      switch (call.name) {
        case "read_file":
          return {
            name: call.name,
            result: await readFile(String(args.path), workingDirectory),
          };
        case "write_file":
          return {
            name: call.name,
            result: await writeFile(String(args.path), String(args.content), workingDirectory),
          };
        case "list_directory":
          return {
            name: call.name,
            result: await listDirectory(
              String(args.path ?? "."),
              workingDirectory,
              Number(args.depth ?? 2),
            ),
          };
        case "run_script":
          return {
            name: call.name,
            result: await runScript(String(args.command), workingDirectory),
          };
        default:
          return { name: (call as ToolCall).name, error: "Ferramenta desconhecida." };
      }
    } catch (err) {
      return { name: call.name, error: String(err) };
    }
  }

  return { executeToolCall };
}
