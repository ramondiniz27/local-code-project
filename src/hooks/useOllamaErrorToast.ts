import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useSettingsStore } from "../store/settingsStore";

/**
 * Displays a single error toast when the Ollama server is unreachable.
 *
 * Dedup rules:
 *  - Only one active error toast at a time (tracked by toastIdRef).
 *  - If the error clears, the active toast is dismissed automatically.
 *  - After the toast is dismissed (by user or auto-dismiss), the ref is
 *    cleared so the next polling failure can show a new toast.
 */
export function useOllamaErrorToast(error: string | null, ollamaUrl: string) {
  const toastIdRef = useRef<string | number | null>(null);
  const setIsSettingsOpen = useSettingsStore((s) => s.setIsSettingsOpen);

  useEffect(() => {
    if (error) {
      // Dedup: if a toast is already active, do not create another one.
      if (toastIdRef.current !== null) return;

      const id = toast.error("Ollama inacessível", {
        description: `Verifique se o servidor está rodando em ${ollamaUrl}`,
        duration: 6000,
        action: {
          label: "Configurar",
          onClick: () => setIsSettingsOpen(true),
        },
        onDismiss: () => {
          // User dismissed — clear the ref so the next failure can re-toast
          toastIdRef.current = null;
        },
        onAutoClose: () => {
          // Auto-dismissed — clear the ref so the next failure can re-toast
          toastIdRef.current = null;
        },
      });

      toastIdRef.current = id;
    } else {
      // Connection recovered — dismiss the active error toast if any
      if (toastIdRef.current !== null) {
        toast.dismiss(toastIdRef.current);
        toastIdRef.current = null;
      }
    }
  }, [error, ollamaUrl]);
}
