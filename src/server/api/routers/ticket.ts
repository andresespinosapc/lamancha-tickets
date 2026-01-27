import { z } from "zod";
import QRCode from 'qrcode';

import {
  createProtectedProcedure,
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { EmailService } from "~/server/services/email";
import { TicketService } from "~/server/services/ticket";
import { ticketQREmailTemplate } from "~/server/services/email-templates";
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

        // Generate redemption code using the created ticket data
        await tx.ticket.update({
          where: {
            id: ticket.id,
          },
          data: {
            redemptionCode: new TicketService().generateRedemptionCode({
              ticket: {
                id: ticket.id,
                createdAt: ticket.createdAt,
                attendee: {
                  firstName: ticket.attendee.firstName!,
                  lastName: ticket.attendee.lastName!,
                  email: ticket.attendee.email,
                  documentId: ticket.attendee.documentId!,
                  phone: ticket.attendee.phone,
                }
              }
            }),
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
            seller: {
              connect: {
                id: ctx.session.user.id,
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
      return new TicketService().sendBlankTicketEmail({ ticket });
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
      const existingTicket = await tx.ticket.findUniqueOrThrow({
        where: { id: ticketId },
        select: { createdAt: true },
      });
      const ticket = await tx.ticket.update({
        where: {
          id: ticketId,
        },
        data: {
          redemptionCode: new TicketService().generateRedemptionCode({
            ticket: {
              id: ticketId,
              createdAt: existingTicket.createdAt,
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
    const { html, text } = ticketQREmailTemplate({
      qrCodeDataUrl: qrCodeImage,
      attendeeName: input.attendee.firstName,
    });
    await new EmailService().sendMail({
      to: attendee.email,
      subject: `🎉 Tu entrada para ${env.EVENT_NAME} está lista`,
      html,
      text,
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
  list: createProtectedProcedure(['seller', 'admin']).query(async ({ ctx }) => {
    const tickets = await ctx.db.ticket.findMany({
      where: {
        sellerId: ctx.session.user.id,
      },
      include: {
        attendee: true,
        ticketType: true,
      }
    });

    // Add hashid to each ticket
    return tickets.map(ticket => ({
      ...ticket,
      hashid: new HashidService().encode(ticket.id),
    }));
  }),
  resendTicketEmail: createProtectedProcedure(['seller', 'admin']).input(z.object({
    ticketHashid: z.string(),
  })).mutation(async ({ ctx, input }) => {
    const ticketId = new HashidService().decode(input.ticketHashid);
    if (ticketId === undefined) throw new Error('Invalid ticket hashid');

    const ticket = await ctx.db.ticket.findUnique({
      where: {
        id: ticketId,
      },
      include: {
        attendee: true,
      }
    });
    if (ticket === null) throw new Error('Ticket not found');

    if (ticket.redemptionCode) {
      const qrCodeImage = await QRCode.toDataURL(ticket.redemptionCode);
      const { html, text } = ticketQREmailTemplate({
        qrCodeDataUrl: qrCodeImage,
        attendeeName: ticket.attendee.firstName ?? 'Asistente',
      });
      await new EmailService().sendMail({
        to: ticket.attendee.email,
        subject: `🎉 Tu entrada para ${env.EVENT_NAME} está lista`,
        html,
        text,
      });
    } else {
      await new TicketService().sendBlankTicketEmail({ ticket });
    }
  }),
});
