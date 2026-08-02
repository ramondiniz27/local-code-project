export interface ParsedToolCall {
  name: "write_file" | "read_file" | "list_directory" | "run_script";
  arguments: Record<string, any>;
}

/**
 * Extracts plan steps from model output (from <plan> block or numbered list)
 */
export function parsePlanSteps(text: string): string[] {
  const steps: string[] = [];

  // Try extracting from <plan>...</plan> block
  const planBlockMatch = text.match(/<plan>([\s\S]*?)<\/plan>/i);
  const targetText = planBlockMatch ? planBlockMatch[1] : text;

  const lines = targetText.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    // Match lines starting with 1., 2., -, *, or Step 1:
    const itemMatch = trimmed.match(/^(?:\d+[\.\)]|\-|\*|Etapa\s+\d+:?|Passo\s+\d+:?)\s+(.+)/i);
    if (itemMatch && itemMatch[1]) {
      const stepText = itemMatch[1].trim();
      if (stepText.length > 3 && !steps.includes(stepText)) {
        steps.push(stepText);
      }
    }
  }

  return steps;
}

/**
 * Extracts structured tool calls from model output (<tool_call>... or ```json...)
 */
export function parseToolCalls(text: string): ParsedToolCall[] {
  const toolCalls: ParsedToolCall[] = [];

  // 1. Match <tool_call> JSON </tool_call>
  const toolCallRegex = /<tool_call>([\s\S]*?)(?:<\/tool_call>|$)/gi;
  let match: RegExpExecArray | null;
  while ((match = toolCallRegex.exec(text)) !== null) {
    try {
      const parsed = JSON.parse(match[1].trim());
      if (parsed && parsed.name && parsed.arguments) {
        toolCalls.push(parsed as ParsedToolCall);
      }
    } catch {
      // Ignore invalid JSON inside <tool_call>
    }
  }

  if (toolCalls.length > 0) return toolCalls;

  // 2. Match markdown json code blocks ```json { "name": "...", ... } ```
  const jsonBlockRegex = /```(?:json)?\s*(\{\s*"name"[\s\S]*?\})\s*```/gi;
  while ((match = jsonBlockRegex.exec(text)) !== null) {
    try {
      const parsed = JSON.parse(match[1].trim());
      if (parsed && parsed.name && parsed.arguments) {
        toolCalls.push(parsed as ParsedToolCall);
      }
    } catch {
      // Ignore invalid JSON
    }
  }

  if (toolCalls.length > 0) return toolCalls;

  // 3. Match raw JSON objects {"name": "write_file", "arguments": {...}} in unformatted text
  const rawJsonRegex = /\{\s*"name"\s*:\s*"(?:write_file|read_file|list_directory|run_script)"\s*,\s*"arguments"\s*:\s*\{[\s\S]*?\}\s*\}/gi;
  while ((match = rawJsonRegex.exec(text)) !== null) {
    try {
      const parsed = JSON.parse(match[0].trim());
      if (parsed && parsed.name && parsed.arguments) {
        toolCalls.push(parsed as ParsedToolCall);
      }
    } catch {
      // Ignore invalid JSON
    }
  }

  return toolCalls;
}

/**
 * Fallback intent parser for local LLMs (e.g. qwen2.5-coder, llama, deepseek)
 * that generate explanations and code blocks instead of structured <tool_call> JSON.
 */
export function parseDirectIntentFallback(
  userPrompt: string,
  assistantResponseText: string
): ParsedToolCall | null {
  const promptLower = userPrompt.toLowerCase();
  const responseLower = assistantResponseText.toLowerCase();

  // Expanded file operation verbs in Portuguese and English
  const fileOpKeywords = [
    "crie", "criar", "cria",
    "modifique", "modificar", "modifica",
    "altere", "alterar", "altera",
    "edite", "editar", "edita",
    "atualize", "atualizar", "atualiza",
    "escreva", "escrever", "escreve",
    "adicione", "adicionar", "adiciona",
    "salve", "salvar", "salva",
    "insira", "inserir",
    "create", "write", "modify", "edit", "update", "change", "add", "put", "save"
  ];

  const hasFileOpIntent = fileOpKeywords.some(
    (kw) => promptLower.includes(kw) || responseLower.includes(kw)
  );

  // Extract filename with extensions (e.g. helloworld.rb, main.py, index.ts, App.tsx, teste.txt)
  const filenameRegex = /([a-zA-Z0-9_\-\/\.]+\.[a-zA-Z0-9]{1,5})/g;
  let filename: string | null = null;

  // Search for filename in user prompt first
  const promptFileMatch = userPrompt.match(filenameRegex);
  if (promptFileMatch && promptFileMatch.length > 0) {
    // Filter out generic dot patterns like "3.5" or "2.5"
    const validFiles = promptFileMatch.filter((f) => !/^\d+\.\d+$/.test(f));
    if (validFiles.length > 0) {
      filename = validFiles[0];
    }
  }

  // Search for filename in assistant response if not found in prompt
  if (!filename) {
    const responseFileMatch = assistantResponseText.match(filenameRegex);
    if (responseFileMatch && responseFileMatch.length > 0) {
      const validFiles = responseFileMatch.filter((f) => !/^\d+\.\d+$/.test(f));
      if (validFiles.length > 0) {
        filename = validFiles[0];
      }
    }
  }

  // If a file operation is intended AND a filename exists (or prompt asks about a file)
  if (hasFileOpIntent || filename) {
    const targetFile = filename || "script.txt";

    // Extract code content from assistant response code blocks
    const codeBlocks: string[] = [];
    const codeBlockRegex = /```(?:[a-zA-Z0-9_\-\/\.#]+)?\n([\s\S]*?)\n```/g;
    let blockMatch;
    while ((blockMatch = codeBlockRegex.exec(assistantResponseText)) !== null) {
      const code = blockMatch[1].trim();
      if (code) {
        codeBlocks.push(code);
      }
    }

    let content = codeBlocks.join("\n\n");

    if (!content) {
      // Fallback content if no code block was generated by model
      if (promptLower.includes("ruby") || targetFile.endsWith(".rb")) {
        content = `# ${targetFile}\nputs 'Hello from Ruby'\n`;
      } else if (promptLower.includes("python") || targetFile.endsWith(".py")) {
        content = `# ${targetFile}\nprint('Hello from Python')\n`;
      } else if (promptLower.includes("javascript") || promptLower.includes("js") || targetFile.endsWith(".js")) {
        content = `// ${targetFile}\nconsole.log('Hello World');\n`;
      } else if (targetFile.endsWith(".ts") || targetFile.endsWith(".tsx")) {
        content = `// ${targetFile}\nexport {};\n`;
      } else {
        content = assistantResponseText.trim() || "Conteúdo gerado pelo agente.\n";
      }
    }

    return {
      name: "write_file",
      arguments: {
        path: targetFile,
        content: content + "\n",
      },
    };
  }

  // Check if prompt asks to run a specific command directly
  const runMatch = userPrompt.match(/^(?:rode|execute|run)\s+([a-zA-Z0-9_\-\s\.\/]+)/i);
  if (runMatch && runMatch[1]) {
    return {
      name: "run_script",
      arguments: {
        command: runMatch[1].trim(),
      },
    };
  }

  return null;
}
