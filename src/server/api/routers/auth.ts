import { TRPCError } from "@trpc/server";
import { compareSync } from "bcrypt";
import { z } from "zod";
import { env } from "~/env";
import jwt from "jsonwebtoken";

import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

export const authRouter = createTRPCRouter({
  login: publicProcedure.input(z.object({
    email: z.string().email(),
    password: z.string(),
  })).mutation(async ({ ctx, input }) => {
    const user = await ctx.db.user.findUnique({
      where: {
        email: input.email,
      },
    });

    if (!user?.password) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid email or password',
      });
    }

    if (!compareSync(input.password, user.password)) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid email or password',
      });
    }

    const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, { expiresIn: 60 * 60 });

    return { token };
  }),
});
