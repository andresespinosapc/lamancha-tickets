"use client";

import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";

export function SyncStatus() {
  const { data: status, refetch } = api.sync.getSyncStatus.useQuery(undefined, {
    retry: false,
  });
  const triggerSync = api.sync.triggerSync.useMutation({
    onSuccess: () => void refetch(),
  });

  if (!status) return null;

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
      <h3 className="mb-4 text-lg font-semibold">Estado de Sincronización</h3>
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-400">Pendientes de sincronizar</p>
          <p className="text-2xl font-bold">{status.unsyncedCount}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Última sincronización</p>
          <p className="text-sm">
            {status.lastSyncedAt
              ? new Date(status.lastSyncedAt).toLocaleString("es-CL")
              : "Nunca"}
          </p>
        </div>
      </div>
      <Button
        onClick={() => triggerSync.mutate()}
        disabled={triggerSync.isPending || status.unsyncedCount === 0}
        className="w-full"
      >
        {triggerSync.isPending ? "Sincronizando..." : "Sincronizar ahora"}
      </Button>
    </div>
  );
}
