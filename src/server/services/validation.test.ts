import { describe, it, expect, vi, beforeEach } from "vitest";
import { ValidationService } from "./validation";

// Mock the database
vi.mock("../db", () => ({
  db: {
    ticketValidation: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}));

// Mock serverMode
vi.mock("./serverMode", () => ({
  getLocalServerId: vi.fn(),
}));

import { db } from "../db";
import { getLocalServerId } from "./serverMode";

describe("ValidationService", () => {
  let service: ValidationService;

  beforeEach(() => {
    service = new ValidationService();
    vi.clearAllMocks();
  });

  describe("validateTicket", () => {
    it("creates a validation record with ticketId and guardId", async () => {
      const mockValidation = {
        id: 1,
        ticketId: 100,
        guardId: "guard-123",
        validatedAt: new Date(),
        localServerId: null,
        ticket: { attendee: {}, ticketType: {} },
        guard: { name: "Guard Name", email: "guard@test.com" },
      };

      vi.mocked(db.ticketValidation.create).mockResolvedValue(mockValidation as never);
      vi.mocked(getLocalServerId).mockReturnValue(null);

      const result = await service.validateTicket({
        ticketId: 100,
        guardId: "guard-123",
      });

      expect(db.ticketValidation.create).toHaveBeenCalledWith({
        data: {
          ticketId: 100,
          guardId: "guard-123",
          localServerId: null,
        },
        include: {
          ticket: {
            include: {
              attendee: true,
              ticketType: true,
            },
          },
          guard: {
            select: { name: true, email: true },
          },
        },
      });
      expect(result).toEqual(mockValidation);
    });

    it("includes localServerId when in local mode", async () => {
      const mockValidation = {
        id: 1,
        ticketId: 100,
        guardId: "guard-123",
        validatedAt: new Date(),
        localServerId: "entrance-main",
        ticket: { attendee: {}, ticketType: {} },
        guard: { name: "Guard Name", email: "guard@test.com" },
      };

      vi.mocked(db.ticketValidation.create).mockResolvedValue(mockValidation as never);
      vi.mocked(getLocalServerId).mockReturnValue("entrance-main");

      await service.validateTicket({
        ticketId: 100,
        guardId: "guard-123",
      });

      expect(db.ticketValidation.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            localServerId: "entrance-main",
          }) as unknown,
        }) as unknown
      );
    });
  });

  describe("getTicketValidationHistory", () => {
    it("returns empty array if no validations exist", async () => {
      vi.mocked(db.ticketValidation.findMany).mockResolvedValue([]);

      const result = await service.getTicketValidationHistory(100);

      expect(result).toEqual([]);
      expect(db.ticketValidation.findMany).toHaveBeenCalledWith({
        where: { ticketId: 100 },
        include: {
          guard: {
            select: { name: true, email: true },
          },
        },
        orderBy: { validatedAt: "desc" },
      });
    });

    it("returns validations sorted by date descending", async () => {
      const mockValidations = [
        {
          id: 2,
          validatedAt: new Date("2024-01-02"),
          guard: { name: "Guard 2", email: "guard2@test.com" },
        },
        {
          id: 1,
          validatedAt: new Date("2024-01-01"),
          guard: { name: "Guard 1", email: "guard1@test.com" },
        },
      ];

      vi.mocked(db.ticketValidation.findMany).mockResolvedValue(
        mockValidations as never
      );

      const result = await service.getTicketValidationHistory(100);

      expect(result).toHaveLength(2);
      expect(db.ticketValidation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { validatedAt: "desc" },
        })
      );
    });

    it("includes guard data (name, email)", async () => {
      const mockValidations = [
        {
          id: 1,
          validatedAt: new Date(),
          guard: { name: "John Doe", email: "john@test.com" },
        },
      ];

      vi.mocked(db.ticketValidation.findMany).mockResolvedValue(
        mockValidations as never
      );

      const result = await service.getTicketValidationHistory(100);

      expect(result[0]?.guard).toEqual({
        name: "John Doe",
        email: "john@test.com",
      });
    });
  });

  describe("getUnsyncedValidations", () => {
    it("returns validations where syncedAt is null", async () => {
      const mockValidations = [
        { id: 1, syncedAt: null },
        { id: 2, syncedAt: null },
      ];

      vi.mocked(db.ticketValidation.findMany).mockResolvedValue(
        mockValidations as never
      );

      const result = await service.getUnsyncedValidations();

      expect(db.ticketValidation.findMany).toHaveBeenCalledWith({
        where: { syncedAt: null },
        include: {
          ticket: true,
          guard: { select: { id: true, email: true } },
        },
      });
      expect(result).toHaveLength(2);
    });
  });

  describe("markAsSynced", () => {
    it("updates validations with current timestamp", async () => {
      vi.mocked(db.ticketValidation.updateMany).mockResolvedValue({ count: 3 });

      await service.markAsSynced([1, 2, 3]);

      expect(db.ticketValidation.updateMany).toHaveBeenCalledWith({
        where: { id: { in: [1, 2, 3] } },
        data: { syncedAt: expect.any(Date) as unknown },
      });
    });
  });

  describe("listAllValidations", () => {
    it("respects limit and offset for pagination", async () => {
      vi.mocked(db.ticketValidation.findMany).mockResolvedValue([]);
      vi.mocked(db.ticketValidation.count).mockResolvedValue(0);

      await service.listAllValidations({
        limit: 10,
        offset: 20,
      });

      expect(db.ticketValidation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
          skip: 20,
        })
      );
    });

    it("applies search filter", async () => {
      vi.mocked(db.ticketValidation.findMany).mockResolvedValue([]);
      vi.mocked(db.ticketValidation.count).mockResolvedValue(0);

      await service.listAllValidations({
        limit: 10,
        offset: 0,
        search: "john",
      });

      expect(db.ticketValidation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({
                ticket: {
                  attendee: {
                    firstName: { contains: "john", mode: "insensitive" },
                  },
                },
              }) as unknown,
            ]) as unknown,
          }) as unknown,
        }) as unknown
      );
    });

    it("applies date filters", async () => {
      const dateFrom = new Date("2024-01-01");
      const dateTo = new Date("2024-12-31");

      vi.mocked(db.ticketValidation.findMany).mockResolvedValue([]);
      vi.mocked(db.ticketValidation.count).mockResolvedValue(0);

      await service.listAllValidations({
        limit: 10,
        offset: 0,
        dateFrom,
        dateTo,
      });

      expect(db.ticketValidation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            validatedAt: {
              gte: dateFrom,
              lte: dateTo,
            },
          }) as unknown,
        }) as unknown
      );
    });

    it("returns validations and total count", async () => {
      const mockValidations = [{ id: 1 }, { id: 2 }];
      vi.mocked(db.ticketValidation.findMany).mockResolvedValue(
        mockValidations as never
      );
      vi.mocked(db.ticketValidation.count).mockResolvedValue(100);

      const result = await service.listAllValidations({
        limit: 10,
        offset: 0,
      });

      expect(result).toEqual({
        validations: mockValidations,
        total: 100,
      });
    });
  });

  describe("getValidationStats", () => {
    it("counts total validations correctly", async () => {
      vi.mocked(db.ticketValidation.count).mockResolvedValue(50);
      vi.mocked(db.ticketValidation.findMany).mockResolvedValue([]);

      const result = await service.getValidationStats();

      expect(result.totalValidations).toBe(50);
    });

    it("counts unique validated tickets", async () => {
      const uniqueTickets = [{ ticketId: 1 }, { ticketId: 2 }, { ticketId: 3 }];
      vi.mocked(db.ticketValidation.count).mockResolvedValue(10);
      vi.mocked(db.ticketValidation.findMany).mockResolvedValue(
        uniqueTickets as never
      );

      const result = await service.getValidationStats();

      expect(result.uniqueTicketsValidated).toBe(3);
    });

    it("counts validations from today", async () => {
      vi.mocked(db.ticketValidation.count)
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(15); // today
      vi.mocked(db.ticketValidation.findMany).mockResolvedValue([]);

      const result = await service.getValidationStats();

      expect(result.validationsToday).toBe(15);
    });
  });
});
