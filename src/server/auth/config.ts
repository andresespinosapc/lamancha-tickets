import { type DefaultSession, type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { db } from "~/server/db";
import { compareSync } from "bcrypt";
import { z } from "zod";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text", placeholder: "juanito@gmail.com" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials, _req) {
        const parsedCredentials = z.object({
          email: z.string(),
          password: z.string(),
        }).parse(credentials);

        const user = await db.user.findFirst({
          where: {
            email: parsedCredentials.email,
          },
        });

        if (!user) return null;
        if (!user.password) return null;

        if (!compareSync(parsedCredentials.password, user.password)) return null;

        return user;
      }
    })
  ],
} satisfies NextAuthConfig;
