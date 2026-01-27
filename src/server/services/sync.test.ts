import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock functions to be shared
const mockGetUnsyncedValidations = vi.fn();
const mockMarkAsSynced = vi.fn();

// Mock dependencies before importing
vi.mock("~/env", () => ({
  env: {
    SERVER_MODE: "local",
    LOCAL_SERVER_ID: "test-server",
    GLOBAL_SERVER_URL: "https://global.example.com",
    GLOBAL_SERVER_SYNC_API_KEY: "test-api-key",
  },
}));

vi.mock("../db", () => ({
  db: {
    ticketValidation: {
      count: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}));

vi.mock("./serverMode", () => ({
  isLocalMode: vi.fn(),
}));

// Use a proper class mock
vi.mock("./validation", () => ({
  ValidationService: class MockValidationService {
    getUnsyncedValidations = mockGetUnsyncedValidations;
    markAsSynced = mockMarkAsSynced;
  },
}));

import { SyncService } from "./sync";
import { db } from "../db";
import { isLocalMode } from "./serverMode";

describe("SyncService", () => {
  let service: SyncService;

  beforeEach(() => {
    service = new SyncService();
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe("syncValidationsToGlobal", () => {
    it("throws error if not in local mode", async () => {
      vi.mocked(isLocalMode).mockReturnValue(false);

      await expect(service.syncValidationsToGlobal()).rejects.toThrow(
        "Sync only available in local mode"
      );
    });

    it("returns synced: 0 if no pending validations", async () => {
      vi.mocked(isLocalMode).mockReturnValue(true);
      mockGetUnsyncedValidations.mockResolvedValue([]);

      const result = await service.syncValidationsToGlobal();

      expect(result).toEqual({ synced: 0 });
    });

    it("sends validations to global server", async () => {
      vi.mocked(isLocalMode).mockReturnValue(true);

      const mockValidations = [
        {
          id: 1,
          ticketId: 100,
          validatedAt: new Date("2024-01-01"),
          localServerId: "test-server",
          guard: { email: "guard@test.com" },
        },
      ];

      mockGetUnsyncedValidations.mockResolvedValue(mockValidations);
      mockMarkAsSynced.mockResolvedValue({ count: 1 });

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response);

      await service.syncValidationsToGlobal();

      expect(global.fetch).toHaveBeenCalledWith(
        "https://global.example.com/api/sync/validations",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            "X-Sync-API-Key": "test-api-key",
            "X-Local-Server-ID": "test-server",
          }),
        })
      );
    });

    it("marks validations as synced after success", async () => {
      vi.mocked(isLocalMode).mockReturnValue(true);

      const mockValidations = [
        {
          id: 1,
          ticketId: 100,
          validatedAt: new Date(),
          localServerId: "test-server",
          guard: { email: "guard@test.com" },
        },
        {
          id: 2,
          ticketId: 101,
          validatedAt: new Date(),
          localServerId: "test-server",
          guard: { email: "guard@test.com" },
        },
      ];

      mockGetUnsyncedValidations.mockResolvedValue(mockValidations);
      mockMarkAsSynced.mockResolvedValue({ count: 2 });

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response);

      const result = await service.syncValidationsToGlobal();

      expect(mockMarkAsSynced).toHaveBeenCalledWith([1, 2]);
      expect(result).toEqual({ synced: 2 });
    });

    it("throws error when sync request fails", async () => {
      vi.mocked(isLocalMode).mockReturnValue(true);

      const mockValidations = [
        {
          id: 1,
          ticketId: 100,
          validatedAt: new Date(),
          localServerId: "test-server",
          guard: { email: "guard@test.com" },
        },
      ];

      mockGetUnsyncedValidations.mockResolvedValue(mockValidations);

      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        statusText: "Internal Server Error",
      } as Response);

      await expect(service.syncValidationsToGlobal()).rejects.toThrow(
        "Sync failed: Internal Server Error"
      );
    });
  });

  describe("getSyncStatus", () => {
    it("returns count of unsynced validations", async () => {
      vi.mocked(db.ticketValidation.count).mockResolvedValue(5);
      vi.mocked(db.ticketValidation.findFirst).mockResolvedValue(null);

      const result = await service.getSyncStatus();

      expect(result.unsyncedCount).toBe(5);
      expect(db.ticketValidation.count).toHaveBeenCalledWith({
        where: { syncedAt: null },
      });
    });

    it("returns null if never synced", async () => {
      vi.mocked(db.ticketValidation.count).mockResolvedValue(10);
      vi.mocked(db.ticketValidation.findFirst).mockResolvedValue(null);

      const result = await service.getSyncStatus();

      expect(result.lastSyncedAt).toBe(null);
    });

    it("returns last sync date", async () => {
      const lastSyncDate = new Date("2024-01-15");
      vi.mocked(db.ticketValidation.count).mockResolvedValue(0);
      vi.mocked(db.ticketValidation.findFirst).mockResolvedValue({
        syncedAt: lastSyncDate,
      } as never);

      const result = await service.getSyncStatus();

      expect(result.lastSyncedAt).toEqual(lastSyncDate);
    });
  });
});
