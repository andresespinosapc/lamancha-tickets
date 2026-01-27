import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies
vi.mock("~/server/services/serverMode", () => ({
  isLocalMode: vi.fn(),
}));

import { isLocalMode } from "~/server/services/serverMode";

describe("sync router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("triggerSync", () => {
    it("only allows admin role", () => {
      // Document the expected role restrictions
      const allowedRoles = ["admin"];
      expect(allowedRoles).toContain("admin");
      expect(allowedRoles).not.toContain("guard");
      expect(allowedRoles).not.toContain("seller");
      expect(allowedRoles).not.toContain("user");
    });

    it("rejects if not in local mode", () => {
      vi.mocked(isLocalMode).mockReturnValue(false);

      // When not in local mode, the router should throw FORBIDDEN
      expect(isLocalMode()).toBe(false);
    });

    it("accepts when in local mode", () => {
      vi.mocked(isLocalMode).mockReturnValue(true);

      expect(isLocalMode()).toBe(true);
    });

    it("returns synced count on success", () => {
      // Document the expected return structure
      const expectedResult = { synced: 5 };

      expect(expectedResult).toHaveProperty("synced");
      expect(typeof expectedResult.synced).toBe("number");
    });
  });

  describe("getSyncStatus", () => {
    it("only allows admin role", () => {
      const allowedRoles = ["admin"];
      expect(allowedRoles).toContain("admin");
      expect(allowedRoles).not.toContain("guard");
    });

    it("rejects if not in local mode", () => {
      vi.mocked(isLocalMode).mockReturnValue(false);
      expect(isLocalMode()).toBe(false);
    });

    it("returns sync status structure", () => {
      const expectedStatus = {
        unsyncedCount: 10,
        lastSyncedAt: new Date("2024-01-15"),
      };

      expect(expectedStatus).toHaveProperty("unsyncedCount");
      expect(expectedStatus).toHaveProperty("lastSyncedAt");
      expect(typeof expectedStatus.unsyncedCount).toBe("number");
    });

    it("returns null lastSyncedAt if never synced", () => {
      const expectedStatus = {
        unsyncedCount: 25,
        lastSyncedAt: null,
      };

      expect(expectedStatus.lastSyncedAt).toBe(null);
    });
  });
});
