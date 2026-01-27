import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

export const ticketTypeRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.ticketType.findMany({
      orderBy: {
        price: 'asc',
      },
    });
  }),
  getDefaultTicketType: publicProcedure.query(async ({ ctx }) => {
    // Return the first (cheapest) ticket type as default
    return ctx.db.ticketType.findFirst({
      orderBy: {
        price: 'asc',
      },
    });
  }),
});
