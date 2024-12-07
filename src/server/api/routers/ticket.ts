import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { TicketService } from "~/server/services/ticket";

export const ticketRouter = createTRPCRouter({
  generateTickets: publicProcedure.input(z.object({
    tickets: z.array(z.object({
      attendee: z.object({
        firstName: z.string(),
        lastName: z.string(),
        email: z.string().email(),
        documentId: z.string(),
        phone: z.string().optional(),
      }),
      ticketTypeId: z.number(),
    }))
  })).mutation(async ({ ctx, input }) => {
    await ctx.db.$transaction(async tx => {
      await Promise.all(input.tickets.map(async ticketData => {
        const ticket = await tx.ticket.create({
          data: {
            attendee: {
              create: ticketData.attendee
            },
            ticketType: {
              connect: {
                id: ticketData.ticketTypeId,
              }
            }
          },
          include: {
            attendee: true,
          }
        })
        await tx.ticket.update({
          where: {
            id: ticket.id,
          },
          data: {
            redemptionCode: new TicketService().generateRedemptionCode({ ticket }),
          }
        })
      }))
    })
  }),
});
