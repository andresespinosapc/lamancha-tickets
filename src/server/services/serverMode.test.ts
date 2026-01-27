import { describe, it, expect, vi, beforeEach } from "vitest";

describe("serverMode", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  describe("isLocalMode", () => {
    it("returns true when SERVER_MODE is local", async () => {
      vi.doMock("~/env", () => ({
        env: { SERVER_MODE: "local", LOCAL_SERVER_ID: "test-1" },
      }));

      const { isLocalMode } = await import("./serverMode");
      expect(isLocalMode()).toBe(true);
    });

    it("returns false when SERVER_MODE is global", async () => {
      vi.doMock("~/env", () => ({
        env: { SERVER_MODE: "global", LOCAL_SERVER_ID: undefined },
      }));

      const { isLocalMode } = await import("./serverMode");
      expect(isLocalMode()).toBe(false);
    });
  });

  describe("isGlobalMode", () => {
    it("returns true when SERVER_MODE is global", async () => {
      vi.doMock("~/env", () => ({
        env: { SERVER_MODE: "global", LOCAL_SERVER_ID: undefined },
      }));

      const { isGlobalMode } = await import("./serverMode");
      expect(isGlobalMode()).toBe(true);
    });

    it("returns false when SERVER_MODE is local", async () => {
      vi.doMock("~/env", () => ({
        env: { SERVER_MODE: "local", LOCAL_SERVER_ID: "test-1" },
      }));

      const { isGlobalMode } = await import("./serverMode");
      expect(isGlobalMode()).toBe(false);
    });
  });

  describe("getLocalServerId", () => {
    it("returns the server ID in local mode", async () => {
      vi.doMock("~/env", () => ({
        env: { SERVER_MODE: "local", LOCAL_SERVER_ID: "entrance-main" },
      }));

      const { getLocalServerId } = await import("./serverMode");
      expect(getLocalServerId()).toBe("entrance-main");
    });

    it("returns null in global mode", async () => {
      vi.doMock("~/env", () => ({
        env: { SERVER_MODE: "global", LOCAL_SERVER_ID: "entrance-main" },
      }));

      const { getLocalServerId } = await import("./serverMode");
      expect(getLocalServerId()).toBe(null);
    });

    it("returns null when LOCAL_SERVER_ID is not set in local mode", async () => {
      vi.doMock("~/env", () => ({
        env: { SERVER_MODE: "local", LOCAL_SERVER_ID: undefined },
      }));

      const { getLocalServerId } = await import("./serverMode");
      expect(getLocalServerId()).toBe(null);
    });
  });
});
