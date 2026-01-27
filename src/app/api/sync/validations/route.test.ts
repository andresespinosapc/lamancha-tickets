import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

// Mock dependencies
vi.mock("~/env", () => ({
  env: {
    SERVER_MODE: "global",
    GLOBAL_SERVER_SYNC_API_KEY: "valid-api-key",
  },
}));

vi.mock("~/server/services/serverMode", () => ({
  isGlobalMode: vi.fn(),
}));

vi.mock("~/server/db", () => ({
  db: {
    user: {
      findUnique: vi.fn(),
    },
    ticketValidation: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import { POST } from "./route";
import { isGlobalMode } from "~/server/services/serverMode";
import { db } from "~/server/db";

interface SyncResponse {
  error?: string;
  success?: boolean;
  synced?: number;
  failed?: number;
}

function createMockRequest(
  body: unknown,
  headers: Record<string, string> = {}
): NextRequest {
  return {
    json: () => Promise.resolve(body),
    headers: {
      get: (name: string) => headers[name] ?? null,
    },
  } as unknown as NextRequest;
}

describe("POST /api/sync/validations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects if not in global mode", async () => {
    vi.mocked(isGlobalMode).mockReturnValue(false);

    const request = createMockRequest({}, {});
    const response = await POST(request);
    const data = (await response.json()) as SyncResponse;

    expect(response.status).toBe(403);
    expect(data.error).toBe("Sync endpoint only available on global server");
  });

  it("rejects if X-Sync-API-Key header is missing", async () => {
    vi.mocked(isGlobalMode).mockReturnValue(true);

    const request = createMockRequest({}, {});
    const response = await POST(request);
    const data = (await response.json()) as SyncResponse;

    expect(response.status).toBe(401);
    expect(data.error).toBe("Invalid API key");
  });

  it("rejects if API key is invalid", async () => {
    vi.mocked(isGlobalMode).mockReturnValue(true);

    const request = createMockRequest(
      {},
      { "X-Sync-API-Key": "wrong-api-key" }
    );
    const response = await POST(request);
    const data = (await response.json()) as SyncResponse;

    expect(response.status).toBe(401);
    expect(data.error).toBe("Invalid API key");
  });

  it("rejects if X-Local-Server-ID header is missing", async () => {
    vi.mocked(isGlobalMode).mockReturnValue(true);

    const request = createMockRequest(
      {},
      { "X-Sync-API-Key": "valid-api-key" }
    );
    const response = await POST(request);
    const data = (await response.json()) as SyncResponse;

    expect(response.status).toBe(400);
    expect(data.error).toBe("Missing local server ID");
  });

  it("validates payload with Zod schema", async () => {
    vi.mocked(isGlobalMode).mockReturnValue(true);

    const invalidPayload = {
      validations: [
        {
          ticketId: "not-a-number",
          guardEmail: "invalid-email",
        },
      ],
    };

    const request = createMockRequest(invalidPayload, {
      "X-Sync-API-Key": "valid-api-key",
      "X-Local-Server-ID": "local-1",
    });
    const response = await POST(request);
    const data = (await response.json()) as SyncResponse;

    expect(response.status).toBe(500);
    expect(data.error).toBe("Sync failed");
  });

  it("inserts new validations", async () => {
    vi.mocked(isGlobalMode).mockReturnValue(true);

    const mockGuard = { id: "guard-1", email: "guard@test.com" };
    vi.mocked(db.user.findUnique).mockResolvedValue(mockGuard as never);
    vi.mocked(db.ticketValidation.findFirst).mockResolvedValue(null);
    vi.mocked(db.ticketValidation.create).mockResolvedValue({
      id: 1,
      ticketId: 100,
      guardId: "guard-1",
      validatedAt: new Date("2024-01-15T10:00:00Z"),
      localServerId: "local-1",
      syncedAt: new Date(),
    } as never);

    const validPayload = {
      validations: [
        {
          ticketId: 100,
          guardEmail: "guard@test.com",
          validatedAt: "2024-01-15T10:00:00Z",
          localServerId: "local-1",
        },
      ],
    };

    const request = createMockRequest(validPayload, {
      "X-Sync-API-Key": "valid-api-key",
      "X-Local-Server-ID": "local-1",
    });
    const response = await POST(request);
    const data = (await response.json()) as SyncResponse;

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.synced).toBe(1);
    expect(data.failed).toBe(0);
    expect(db.ticketValidation.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        ticketId: 100,
        guardId: "guard-1",
        localServerId: "local-1",
      }) as unknown,
    });
  });

  it("does not duplicate existing validations", async () => {
    vi.mocked(isGlobalMode).mockReturnValue(true);

    const mockGuard = { id: "guard-1", email: "guard@test.com" };
    const existingValidation = {
      id: 1,
      ticketId: 100,
      guardId: "guard-1",
      validatedAt: new Date("2024-01-15T10:00:00Z"),
      localServerId: "local-1",
      syncedAt: new Date(),
    };

    vi.mocked(db.user.findUnique).mockResolvedValue(mockGuard as never);
    vi.mocked(db.ticketValidation.findFirst).mockResolvedValue(
      existingValidation as never
    );

    const validPayload = {
      validations: [
        {
          ticketId: 100,
          guardEmail: "guard@test.com",
          validatedAt: "2024-01-15T10:00:00Z",
          localServerId: "local-1",
        },
      ],
    };

    const request = createMockRequest(validPayload, {
      "X-Sync-API-Key": "valid-api-key",
      "X-Local-Server-ID": "local-1",
    });
    const response = await POST(request);
    const data = (await response.json()) as SyncResponse;

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.synced).toBe(1);
    expect(db.ticketValidation.create).not.toHaveBeenCalled();
  });

  it("returns synced and failed counts", async () => {
    vi.mocked(isGlobalMode).mockReturnValue(true);

    const mockGuard = { id: "guard-1", email: "guard@test.com" };
    vi.mocked(db.user.findUnique)
      .mockResolvedValueOnce(mockGuard as never)
      .mockResolvedValueOnce(null);
    vi.mocked(db.ticketValidation.findFirst).mockResolvedValue(null);
    vi.mocked(db.ticketValidation.create).mockResolvedValue({
      id: 1,
      ticketId: 100,
      guardId: "guard-1",
      validatedAt: new Date(),
      localServerId: "local-1",
      syncedAt: new Date(),
    } as never);

    const validPayload = {
      validations: [
        {
          ticketId: 100,
          guardEmail: "guard@test.com",
          validatedAt: "2024-01-15T10:00:00Z",
          localServerId: "local-1",
        },
        {
          ticketId: 101,
          guardEmail: "nonexistent@test.com",
          validatedAt: "2024-01-15T11:00:00Z",
          localServerId: "local-1",
        },
      ],
    };

    const request = createMockRequest(validPayload, {
      "X-Sync-API-Key": "valid-api-key",
      "X-Local-Server-ID": "local-1",
    });
    const response = await POST(request);
    const data = (await response.json()) as SyncResponse;

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.synced).toBe(1);
    expect(data.failed).toBe(1);
  });
});
