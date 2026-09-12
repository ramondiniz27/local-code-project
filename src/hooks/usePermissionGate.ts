import { useEffect, useState } from "react";
import { useFilesystemStore } from "../store/filesystemStore";
import { verifyPermission } from "../lib/filesystem";

export type PermissionStatus = "checking" | "granted" | "denied";

export function usePermissionGate(): PermissionStatus {
  const { fsPermissionGranted, workingDirectory, setFsPermissionGranted } =
    useFilesystemStore();
  const [status, setStatus] = useState<PermissionStatus>("checking");

  useEffect(() => {
    // Re-verifica contra o OS a cada inicialização (não confia só no cache)
    const check = async () => {
      if (!fsPermissionGranted || !workingDirectory) {
        setStatus("denied");
        return;
      }
      try {
        const ok = await verifyPermission(workingDirectory);
        if (ok) {
          setStatus("granted");
        } else {
          setFsPermissionGranted(false);
          setStatus("denied");
        }
      } catch {
        // Falha na verificação → trata como negado (Req 2.5)
        setFsPermissionGranted(false);
        setStatus("denied");
      }
    };
    check();
  }, []); // Roda uma única vez na montagem

  return status;
}
