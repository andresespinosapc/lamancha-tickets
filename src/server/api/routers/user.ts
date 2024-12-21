import { env } from "~/env";
import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  me: publicProcedure.query(async ({ ctx }) => {
    return ctx.session.user;
  }),
  listSellerInfos: publicProcedure.query(async ({ ctx }) => {
    const groupedTickets = await ctx.db.ticket.groupBy({
      by: ['sellerId'],
      _count: {
        id: true
      },
    });
    const userIdsToList = groupedTickets.filter(ticket => ticket._count.id <= env.MAX_TICKETS_PER_SELLER)
      .map(ticket => ticket.sellerId)
      .filter(sellerId => sellerId !== null);

    return ctx.db.sellerInfo.findMany({
      where: {
        user: {
          id: {
            in: userIdsToList,
          }
        }
      },
      include: {
        user: {
          select: {
            name: true,
          }
        }
      }
    });
  }),
});
