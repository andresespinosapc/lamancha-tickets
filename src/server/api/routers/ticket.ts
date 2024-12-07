import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { EmailService } from "~/server/services/email";
import { TicketService } from "~/server/services/ticket";
import { env } from "~/env";
import { HashidService } from "~/server/services/hashid";

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
        });
        await tx.ticket.update({
          where: {
            id: ticket.id,
          },
          data: {
            redemptionCode: new TicketService().generateRedemptionCode({ ticket }),
          }
        });
      }));
    });
  }),
  generateBlankTickets: publicProcedure.input(z.object({
    tickets: z.array(z.object({
      ticketTypeId: z.number(),
      attendee: z.object({
        email: z.string().email(),
      }),
    }))
  })).mutation(async ({ ctx, input }) => {
    const newTickets = await ctx.db.$transaction(async tx => {
      return Promise.all(input.tickets.map(async ticketData => {
        return tx.ticket.create({
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
        });
      }));
    });
    await Promise.all(newTickets.map(async ticket => {
      const completeTicketUrl = `${env.FRONTEND_BASE_URL}/tickets/${ticket.hashid}/complete`;
      return new EmailService().sendMail({
        to: ticket.attendee.email,
        subject: 'Completa tus datos',
        text: `Hola, por favor completa tus datos en el siguiente link para generar tu ticket: ${completeTicketUrl}`,
      });
    }));
  }),
});
