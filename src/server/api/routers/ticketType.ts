import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

export const ticketTypeRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.ticketType.findMany();
  }),
  getDefaultTicketType: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.ticketType.findFirst({
      where: {
        name: 'Entrada normal',
      },
    });
  }),
});
