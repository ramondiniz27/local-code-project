import { useState } from "react";
import { Link, Wifi, Save } from "lucide-react";
import { testConnection } from "../lib/ollama";

interface SetupScreenProps {
  onSave: (url: string) => void;
}

export function SetupScreen({ onSave }: SetupScreenProps) {
  const [url, setUrl] = useState("");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | "empty" | null>(
    null,
  );

  async function handleTest() {
    const trimmed = url.trim();
    if (!trimmed) {
      setTestResult("empty");
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      await testConnection(trimmed);
      setTestResult("success");
    } catch {
      setTestResult("error");
    } finally {
      setTesting(false);
    }
  }

  function handleSave() {
    const trimmed = url.trim();
    if (!trimmed) {
      setTestResult("empty");
      return;
    }
    localStorage.setItem("ollamaUrl", trimmed);
    onSave(trimmed);
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-[#1a1a2e]">
      <div className="flex w-[480px] flex-col gap-8 rounded-[16px] bg-white p-[48px_40px] shadow-[0px_8px_32px_0px_#0000000d]">
        {/* Logo */}
        <div className="flex justify-center items-center">
          <span className="text-[36px] font-extrabold leading-none text-[#3b82f6]">
            LOCAL
          </span>
          <span className="text-[36px] font-extrabold leading-none text-[#6b7280]">
            CODE
          </span>
        </div>

        {/* Subtitle */}
        <p className="w-full text-center text-[14px] text-[#9ca3af]">
          Configure a URL da API do Ollama para começar
        </p>

        {/* Form Group */}
        <div className="flex w-full flex-col gap-2">
          <label className="text-[13px] font-medium text-[#1f2937]">
            URL da API
          </label>
          <div className="flex w-full items-center gap-2 rounded-[8px] border border-[#e5e7eb] bg-white px-[14px] py-[12px]">
            <Link size={16} className="shrink-0 text-[#9ca3af]" />
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setTestResult(null);
              }}
              placeholder="http://localhost:11434"
              className="flex-1 border-none bg-transparent text-[14px] text-[#1f2937] outline-none placeholder:text-[#9ca3af]"
            />
          </div>
          {testResult === "empty" && (
            <p className="text-[13px] text-amber-500">
              Por favor, informe a URL do seu servidor Ollama (ex: http://localhost:11434)
            </p>
          )}
          {testResult === "success" && (
            <p className="text-[13px] text-green-600">
              ✓ Conexão estabelecida com sucesso
            </p>
          )}
          {testResult === "error" && (
            <p className="text-[13px] text-red-500">
              ✗ Não foi possível conectar. Verifique a URL e se o Ollama está
              rodando
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex w-full gap-3">
          <button
            onClick={handleTest}
            disabled={testing}
            className="flex h-[44px] flex-1 cursor-pointer items-center justify-center gap-2 rounded-[8px] border-[1.5px] border-[#3b82f6] bg-white text-[14px] font-medium text-[#3b82f6] transition-opacity disabled:opacity-60"
          >
            <Wifi size={16} />
            {testing ? "Testando..." : "Testar Conexão"}
          </button>
          <button
            onClick={handleSave}
            className="flex h-[44px] flex-1 cursor-pointer items-center justify-center gap-2 rounded-[8px] bg-[#3b82f6] text-[14px] font-medium text-white transition-opacity hover:opacity-90"
          >
            <Save size={16} />
            Salvar URL
          </button>
        </div>
      </div>
    </div>
  );
}
