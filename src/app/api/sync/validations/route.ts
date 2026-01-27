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

    const results = await Promise.allSettled(
      payload.validations.map(async (v) => {
        const guard = await db.user.findUnique({
          where: { email: v.guardEmail },
        });

        if (!guard) {
          throw new Error(`Guard not found: ${v.guardEmail}`);
        }

        const existingValidation = await db.ticketValidation.findFirst({
          where: {
            ticketId: v.ticketId,
            guardId: guard.id,
            validatedAt: new Date(v.validatedAt),
          },
        });

        if (existingValidation) {
          return existingValidation;
        }

        return db.ticketValidation.create({
          data: {
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
