import { useState } from "react";
import { Wifi, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { testConnection, listModels, type OllamaModel } from "../../lib/ollama";
import { useSettingsStore } from "../../store/settingsStore";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface DraftModel extends OllamaModel {
  enabled: boolean;
}

function mergeModels(
  fresh: OllamaModel[],
  current: DraftModel[],
): DraftModel[] {
  const currentByName = new Map(current.map((model) => [model.name, model]));
  return fresh.map((model) => ({
    ...model,
    enabled: currentByName.get(model.name)?.enabled ?? true,
  }));
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {open && <SettingsForm onOpenChange={onOpenChange} />}
      </DialogContent>
    </Dialog>
  );
}

function SettingsForm({
  onOpenChange,
}: {
  onOpenChange: (open: boolean) => void;
}) {
  const ollamaUrl = useSettingsStore((s) => s.ollamaUrl);
  const lastKnownModels = useSettingsStore((s) => s.lastKnownModels);
  const modelPreferences = useSettingsStore((s) => s.modelPreferences);
  const setOllamaUrl = useSettingsStore((s) => s.setOllamaUrl);
  const setLastKnownModels = useSettingsStore((s) => s.setLastKnownModels);
  const setModelEnabled = useSettingsStore((s) => s.setModelEnabled);

  const [draftUrl, setDraftUrl] = useState(ollamaUrl ?? "");
  const [draftModels, setDraftModels] = useState<DraftModel[]>(() =>
    lastKnownModels.map((model) => ({
      ...model,
      enabled: modelPreferences[model.name] ?? true,
    })),
  );
  const [urlRequired, setUrlRequired] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const busy = testing || saving;

  async function handleTest() {
    const trimmed = draftUrl.trim();
    if (!trimmed) {
      setUrlRequired(true);
      return;
    }
    setUrlRequired(false);
    setSaveError(null);
    setTesting(true);
    setTestResult(null);
    try {
      await testConnection(trimmed);
      const fresh = await listModels(trimmed);
      setDraftModels((prev) => mergeModels(fresh, prev));
      setTestResult("success");
    } catch {
      setTestResult("error");
    } finally {
      setTesting(false);
    }
  }

  function toggleModel(name: string) {
    setDraftModels((prev) =>
      prev.map((model) =>
        model.name === name ? { ...model, enabled: !model.enabled } : model,
      ),
    );
  }

  async function handleSave() {
    const trimmed = draftUrl.trim();
    if (!trimmed) {
      setUrlRequired(true);
      return;
    }
    setUrlRequired(false);
    setSaving(true);
    setSaveError(null);
    try {
      await testConnection(trimmed);
      const fresh = await listModels(trimmed);
      const merged = mergeModels(fresh, draftModels);
      setOllamaUrl(trimmed);
      setLastKnownModels(fresh);
      for (const model of merged) {
        setModelEnabled(model.name, model.enabled);
      }
      onOpenChange(false);
    } catch (err) {
      setSaveError(String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Configurações do Ollama</DialogTitle>
        <DialogDescription>
          Edite a URL da API, teste a conexão e escolha quais modelos aparecem
          no chat.
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-2">
        <label className="text-[13px] font-medium text-text-primary">
          URL da API
        </label>
        <input
          type="text"
          value={draftUrl}
          onChange={(e) => {
            setDraftUrl(e.target.value);
            setUrlRequired(false);
            setTestResult(null);
            setSaveError(null);
          }}
          placeholder="http://localhost:11434"
          className="rounded-lg border border-border-light bg-bg-input px-3 py-2 text-[14px] text-text-primary outline-none placeholder:text-text-muted"
        />
        {urlRequired && (
          <p className="text-[13px] text-red-500">A URL é obrigatória.</p>
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
        {saveError && (
          <p className="text-[13px] text-red-500">
            ✗ Não foi possível salvar: {saveError}
          </p>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={handleTest}
          disabled={busy}
          className="mt-1 gap-2"
        >
          <Wifi className="h-4 w-4" />
          {testing ? "Testando..." : "Testar Conexão"}
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-medium text-text-primary">
          Modelos
        </span>
        {draftModels.length === 0 ? (
          <p className="text-[13px] text-text-muted">
            Nenhum modelo encontrado no Ollama
          </p>
        ) : (
          <ScrollArea className="max-h-[240px]">
            <div className="flex flex-col gap-1 pr-3">
              {draftModels.map((model) => (
                <div
                  key={model.name}
                  className="flex items-center justify-between gap-2 rounded-lg px-2 py-2"
                >
                  <span className="min-w-0 flex-1 truncate text-[13px] text-text-primary">
                    {model.name}
                  </span>
                  <Switch
                    checked={model.enabled}
                    onCheckedChange={() => toggleModel(model.name)}
                  />
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      <DialogFooter>
        <Button
          type="button"
          onClick={handleSave}
          disabled={busy}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </DialogFooter>
    </>
  );
}
