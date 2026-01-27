import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { env } from "~/env";
import { isGlobalMode } from "~/server/services/serverMode";

const SyncPayloadSchema = z.object({
  validations: z.array(
    z.object({
      ticketId: z.number(),
      guardEmail: z.string().email(),
      validatedAt: z.string().datetime(),
      localServerId: z.string().nullable(),
    })
  ),
});

export async function POST(request: NextRequest) {
  if (!isGlobalMode()) {
    return NextResponse.json(
      { error: "Sync endpoint only available on global server" },
      { status: 403 }
    );
  }

  const apiKey = request.headers.get("X-Sync-API-Key");
  if (!env.GLOBAL_SERVER_SYNC_API_KEY || apiKey !== env.GLOBAL_SERVER_SYNC_API_KEY) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  const localServerId = request.headers.get("X-Local-Server-ID");
  if (!localServerId) {
    return NextResponse.json(
      { error: "Missing local server ID" },
      { status: 400 }
    );
  }

  try {
    const body: unknown = await request.json();
    const payload = SyncPayloadSchema.parse(body);

    // Fetch all guards upfront to avoid N+1 queries
    const guardEmails = [...new Set(payload.validations.map((v) => v.guardEmail))];
    const guards = await db.user.findMany({
      where: { email: { in: guardEmails } },
    });
    const guardMap = new Map(guards.map((g) => [g.email, g]));

    const results = await Promise.allSettled(
      payload.validations.map(async (v) => {
        const guard = guardMap.get(v.guardEmail);

        if (!guard) {
          throw new Error(`Guard not found: ${v.guardEmail}`);
        }

        // Use upsert to avoid race conditions - the unique constraint
        // @@unique([ticketId, guardId, validatedAt]) ensures no duplicates
        return db.ticketValidation.upsert({
          where: {
            ticketId_guardId_validatedAt: {
              ticketId: v.ticketId,
              guardId: guard.id,
              validatedAt: new Date(v.validatedAt),
            },
          },
          update: {
            // If exists, just update syncedAt
            syncedAt: new Date(),
          },
          create: {
            ticketId: v.ticketId,
            guardId: guard.id,
            validatedAt: new Date(v.validatedAt),
            localServerId: v.localServerId,
            syncedAt: new Date(),
          },
        });
      })
    );

    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    return NextResponse.json({
      success: true,
      synced: succeeded,
      failed,
    });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
