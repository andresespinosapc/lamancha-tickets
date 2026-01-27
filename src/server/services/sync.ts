import { env } from "~/env";
import { ValidationService } from "./validation";
import { isLocalMode } from "./serverMode";
import { db } from "../db";

export class SyncService {
  private validationService = new ValidationService();

  async syncValidationsToGlobal() {
    if (!isLocalMode()) {
      throw new Error("La sincronización solo está disponible en modo local");
    }

    if (!env.GLOBAL_SERVER_URL || !env.GLOBAL_SERVER_SYNC_API_KEY) {
      throw new Error(
        "Se requieren GLOBAL_SERVER_URL y GLOBAL_SERVER_SYNC_API_KEY para sincronizar"
      );
    }

    const unsyncedValidations =
      await this.validationService.getUnsyncedValidations();

    if (unsyncedValidations.length === 0) {
      return { synced: 0 };
    }

    const response = await fetch(
      `${env.GLOBAL_SERVER_URL}/api/sync/validations`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Sync-API-Key": env.GLOBAL_SERVER_SYNC_API_KEY,
          "X-Local-Server-ID": env.LOCAL_SERVER_ID ?? "unknown",
        },
        body: JSON.stringify({
          validations: unsyncedValidations.map((v) => ({
            ticketId: v.ticketId,
            guardEmail: v.guard.email,
            validatedAt: v.validatedAt.toISOString(),
            localServerId: v.localServerId,
          })),
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Error de sincronización: ${response.statusText}`);
    }

    await this.validationService.markAsSynced(
      unsyncedValidations.map((v) => v.id)
    );

    return { synced: unsyncedValidations.length };
  }

  async getSyncStatus() {
    const [unsynced, lastSynced] = await Promise.all([
      db.ticketValidation.count({ where: { syncedAt: null } }),
      db.ticketValidation.findFirst({
        where: { syncedAt: { not: null } },
        orderBy: { syncedAt: "desc" },
        select: { syncedAt: true },
      }),
    ]);

    return {
      unsyncedCount: unsynced,
      lastSyncedAt: lastSynced?.syncedAt ?? null,
    };
  }
}
