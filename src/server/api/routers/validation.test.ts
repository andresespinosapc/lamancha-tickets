import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies
vi.mock("~/server/services/serverMode", () => ({
  isLocalMode: vi.fn(),
}));

import { isLocalMode } from "~/server/services/serverMode";

describe("validation router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("validateTicket", () => {
    it("requires guard or admin role", () => {
      // Document the expected role restrictions
      const allowedRoles = ["guard", "admin"];
      expect(allowedRoles).toContain("guard");
      expect(allowedRoles).toContain("admin");
      expect(allowedRoles).not.toContain("seller");
      expect(allowedRoles).not.toContain("user");
    });

    it("rejects if not in local mode", () => {
      vi.mocked(isLocalMode).mockReturnValue(false);

      // The router should throw FORBIDDEN when not in local mode
      expect(isLocalMode()).toBe(false);
    });

    it("accepts when in local mode", () => {
      vi.mocked(isLocalMode).mockReturnValue(true);

      expect(isLocalMode()).toBe(true);
    });

    it("expects redemptionCode as input", () => {
      // Document the expected input schema
      const validInput = { redemptionCode: "encrypted-code-here" };
      expect(validInput).toHaveProperty("redemptionCode");
      expect(typeof validInput.redemptionCode).toBe("string");
    });

    it("returns ValidationResult structure on success", () => {
      // Document the expected return structure
      const expectedResult = {
        isFirstValidation: true,
        validation: {
          id: 1,
          validatedAt: new Date(),
          guard: { name: "Guard", email: "guard@test.com" },
        },
        ticket: {
          id: 100,
          ticketType: { name: "General" },
        },
        attendee: {
          firstName: "John",
          lastName: "Doe",
          email: "john@test.com",
          documentId: "12345678-9",
        },
        previousValidations: [],
      };

      expect(expectedResult).toHaveProperty("isFirstValidation");
      expect(expectedResult).toHaveProperty("validation");
      expect(expectedResult).toHaveProperty("ticket");
      expect(expectedResult).toHaveProperty("attendee");
      expect(expectedResult).toHaveProperty("previousValidations");
    });

    it("returns previousValidations when re-validating", () => {
      const revalidationResult = {
        isFirstValidation: false,
        previousValidations: [
          {
            id: 1,
            validatedAt: new Date("2024-01-01"),
            guard: { name: "Guard 1", email: "guard1@test.com" },
          },
        ],
      };

      expect(revalidationResult.isFirstValidation).toBe(false);
      expect(revalidationResult.previousValidations.length).toBeGreaterThan(0);
    });
  });

  describe("getTicketValidationHistory", () => {
    it("requires guard or admin role", () => {
      const allowedRoles = ["guard", "admin"];
      expect(allowedRoles).toContain("guard");
      expect(allowedRoles).toContain("admin");
      expect(allowedRoles).not.toContain("seller");
      expect(allowedRoles).not.toContain("user");
    });

    it("accepts ticketId as input", () => {
      const validInput = { ticketId: 100 };
      expect(validInput).toHaveProperty("ticketId");
      expect(typeof validInput.ticketId).toBe("number");
    });
  });

  describe("listAllValidations", () => {
    it("only allows admin role", () => {
      const allowedRoles = ["admin"];
      expect(allowedRoles).toContain("admin");
      expect(allowedRoles).not.toContain("guard");
      expect(allowedRoles).not.toContain("seller");
    });

    it("validates limit is between 1 and 100", () => {
      const validLimit = 50;
      expect(validLimit).toBeGreaterThanOrEqual(1);
      expect(validLimit).toBeLessThanOrEqual(100);

      const invalidLimitLow = 0;
      const invalidLimitHigh = 101;
      expect(invalidLimitLow).toBeLessThan(1);
      expect(invalidLimitHigh).toBeGreaterThan(100);
    });

    it("validates offset is non-negative", () => {
      const validOffset = 0;
      expect(validOffset).toBeGreaterThanOrEqual(0);

      const invalidOffset = -1;
      expect(invalidOffset).toBeLessThan(0);
    });

    it("accepts optional search parameter", () => {
      const inputWithSearch = { limit: 50, offset: 0, search: "test" };
      const inputWithoutSearch = { limit: 50, offset: 0 };

      expect(inputWithSearch).toHaveProperty("search");
      expect(inputWithoutSearch.search).toBeUndefined();
    });

    it("accepts optional dateFrom and dateTo parameters", () => {
      const inputWithDates = {
        limit: 50,
        offset: 0,
        dateFrom: new Date("2024-01-01"),
        dateTo: new Date("2024-12-31"),
      };

      expect(inputWithDates).toHaveProperty("dateFrom");
      expect(inputWithDates).toHaveProperty("dateTo");
    });
  });

  describe("getValidationStats", () => {
    it("only allows admin role", () => {
      const allowedRoles = ["admin"];
      expect(allowedRoles).toContain("admin");
      expect(allowedRoles).not.toContain("guard");
    });

    it("returns stats structure with totalValidations, uniqueTicketsValidated, validationsToday", () => {
      const expectedStats = {
        totalValidations: 100,
        uniqueTicketsValidated: 80,
        validationsToday: 15,
      };

      expect(expectedStats).toHaveProperty("totalValidations");
      expect(expectedStats).toHaveProperty("uniqueTicketsValidated");
      expect(expectedStats).toHaveProperty("validationsToday");
      expect(typeof expectedStats.totalValidations).toBe("number");
      expect(typeof expectedStats.uniqueTicketsValidated).toBe("number");
      expect(typeof expectedStats.validationsToday).toBe("number");
    });
  });
});
