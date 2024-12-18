import { z } from "zod";
import QRCode from 'qrcode';

import {
  createProtectedProcedure,
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { EmailService } from "~/server/services/email";
import { TicketService } from "~/server/services/ticket";
import { env } from "~/env";
import { HashidService } from "~/server/services/hashid";

export const ticketRouter = createTRPCRouter({
  generateTickets: createProtectedProcedure(['admin']).input(z.object({
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
  generateBlankTickets: createProtectedProcedure(['seller', 'admin']).input(z.object({
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
            },
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
  completeBlankTicket: publicProcedure.input(z.object({
    ticketHashid: z.string(),
    attendee: z.object({
      firstName: z.string(),
      lastName: z.string(),
      documentId: z.string(),
      phone: z.string().optional(),
    }),
  })).mutation(async ({ ctx, input }) => {
    const ticketId = new HashidService().decode(input.ticketHashid);
    if (ticketId === undefined) throw new Error('Invalid ticket hashid');

    const { attendee, ticket } = await ctx.db.$transaction(async tx => {
      const attendee = await tx.attendee.update({
        where: {
          id: ticketId,
        },
        data: input.attendee,
      });
      const ticket = await tx.ticket.update({
        where: {
          id: ticketId,
        },
        data: {
          redemptionCode: new TicketService().generateRedemptionCode({
            ticket: {
              id: ticketId,
              attendee: {
                ...input.attendee,
                phone: input.attendee.phone ?? null,
                email: attendee.email,
              },
            }
          }),
        }
      });

      return { attendee, ticket };
    });
    if (ticket.redemptionCode === null) throw new Error('Failed to generate redemption code');

    const qrCodeImage = await QRCode.toDataURL(ticket.redemptionCode);
    await new EmailService().sendMail({
      to: attendee.email,
      subject: 'Tu ticket',
      html: `Acá está tu QR para ingresar al evento </br> <img src="${qrCodeImage}">`
    });
  }),
  isTicketComplete: publicProcedure.input(z.object({
    ticketHashid: z.string(),
  })).query(async ({ ctx, input }) => {
    const ticketId = new HashidService().decode(input.ticketHashid);
    if (ticketId === undefined) throw new Error('Invalid ticket hashid');

    const ticket = await ctx.db.ticket.findUnique({
      where: {
        id: ticketId,
      },
      select: {
        redemptionCode: true,
      }
    });
    if (ticket === null) throw new Error('Ticket not found');

    return ticket.redemptionCode !== null;
  }),
  decryptRedemptionCode: publicProcedure.input(z.object({
    redemptionCode: z.string(),
  })).mutation(async ({ input }) => {
    return new TicketService().decryptRedemptionCode(input.redemptionCode);
  }),
});
