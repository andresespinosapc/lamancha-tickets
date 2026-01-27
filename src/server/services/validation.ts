import { type Prisma } from "@prisma/client";
import { db } from "../db";
import { getLocalServerId } from "./serverMode";

export class ValidationService {
  async validateTicket(options: { ticketId: number; guardId: string }) {
    const validation = await db.ticketValidation.create({
      data: {
        ticketId: options.ticketId,
        guardId: options.guardId,
        localServerId: getLocalServerId(),
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

    return validation;
  }

  async getTicketValidationHistory(ticketId: number) {
    return db.ticketValidation.findMany({
      where: { ticketId },
      include: {
        guard: {
          select: { name: true, email: true },
        },
      },
      orderBy: { validatedAt: "desc" },
    });
  }

  async getUnsyncedValidations() {
    return db.ticketValidation.findMany({
      where: { syncedAt: null },
      include: {
        ticket: true,
        guard: { select: { id: true, email: true } },
      },
    });
  }

  async markAsSynced(validationIds: number[]) {
    return db.ticketValidation.updateMany({
      where: { id: { in: validationIds } },
      data: { syncedAt: new Date() },
    });
  }

  async listAllValidations(options: {
    limit: number;
    offset: number;
    search?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }) {
    const where: Prisma.TicketValidationWhereInput = {};

    if (options.search) {
      where.OR = [
        {
          ticket: {
            attendee: {
              firstName: { contains: options.search, mode: "insensitive" },
            },
          },
        },
        {
          ticket: {
            attendee: {
              lastName: { contains: options.search, mode: "insensitive" },
            },
          },
        },
        {
          ticket: {
            attendee: {
              email: { contains: options.search, mode: "insensitive" },
            },
          },
        },
        {
          ticket: {
            attendee: {
              documentId: { contains: options.search, mode: "insensitive" },
            },
          },
        },
        { guard: { name: { contains: options.search, mode: "insensitive" } } },
      ];
    }

    if (options.dateFrom ?? options.dateTo) {
      where.validatedAt = {};
      if (options.dateFrom) where.validatedAt.gte = options.dateFrom;
      if (options.dateTo) where.validatedAt.lte = options.dateTo;
    }

    const [validations, total] = await Promise.all([
      db.ticketValidation.findMany({
        where,
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
        orderBy: { validatedAt: "desc" },
        take: options.limit,
        skip: options.offset,
      }),
      db.ticketValidation.count({ where }),
    ]);

    return { validations, total };
  }

  async getValidationStats() {
    const [totalValidations, uniqueTicketsValidated, validationsToday] =
      await Promise.all([
        db.ticketValidation.count(),
        db.ticketValidation.findMany({
          distinct: ["ticketId"],
          select: { ticketId: true },
        }),
        db.ticketValidation.count({
          where: {
            validatedAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        }),
      ]);

    return {
      totalValidations,
      uniqueTicketsValidated: uniqueTicketsValidated.length,
      validationsToday,
    };
  }
}
