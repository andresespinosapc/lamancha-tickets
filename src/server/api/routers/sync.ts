import { TRPCError } from "@trpc/server";
import { createProtectedProcedure, createTRPCRouter } from "~/server/api/trpc";
import { SyncService } from "~/server/services/sync";
import { isLocalMode } from "~/server/services/serverMode";

const syncService = new SyncService();

export const syncRouter = createTRPCRouter({
  triggerSync: createProtectedProcedure(["admin"]).mutation(async () => {
    if (!isLocalMode()) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Sync is only available on local server",
      });
    }
    return syncService.syncValidationsToGlobal();
  }),

  getSyncStatus: createProtectedProcedure(["admin"]).query(async () => {
    if (!isLocalMode()) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Sync status is only available on local server",
      });
    }
    return syncService.getSyncStatus();
  }),
});
