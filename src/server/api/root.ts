import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { ticketTypeRouter } from "~/server/api/routers/ticketType";
import { ticketRouter } from "./routers/ticket";
import { authRouter } from "./routers/auth";
import { userRouter } from "./routers/user";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  ticketType: ticketTypeRouter,
  ticket: ticketRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
