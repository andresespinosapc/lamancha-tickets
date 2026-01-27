import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createProtectedProcedure, createTRPCRouter } from "~/server/api/trpc";
import { TicketService } from "~/server/services/ticket";
import { ValidationService } from "~/server/services/validation";
import { isLocalMode } from "~/server/services/serverMode";

const validationService = new ValidationService();
const ticketService = new TicketService();

export const validationRouter = createTRPCRouter({
  validateTicket: createProtectedProcedure(["guard", "admin"])
    .input(
      z.object({
        redemptionCode: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!isLocalMode()) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "La validación solo está disponible en el servidor local",
        });
      }

      const decrypted = ticketService.decryptRedemptionCode(input.redemptionCode);

      const existingValidations =
        await validationService.getTicketValidationHistory(decrypted.ticketId);

      const validation = await validationService.validateTicket({
        ticketId: decrypted.ticketId,
        guardId: ctx.session.user.id,
      });

      return {
        isFirstValidation: existingValidations.length === 0,
        previousValidations: existingValidations,
        currentValidation: validation,
        attendee: decrypted.attendee,
        ticketId: decrypted.ticketId,
      };
    }),

  getTicketValidationHistory: createProtectedProcedure(["guard", "admin"])
    .input(
      z.object({
        ticketId: z.number(),
      })
    )
    .query(async ({ input }) => {
      return validationService.getTicketValidationHistory(input.ticketId);
    }),

  listAllValidations: createProtectedProcedure(["admin"])
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        search: z.string().optional(),
        dateFrom: z.date().optional(),
        dateTo: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      return validationService.listAllValidations({
        limit: input.limit,
        offset: input.offset,
        search: input.search,
        dateFrom: input.dateFrom,
        dateTo: input.dateTo,
      });
    }),

  getValidationStats: createProtectedProcedure(["admin"]).query(async () => {
    return validationService.getValidationStats();
  }),
});
