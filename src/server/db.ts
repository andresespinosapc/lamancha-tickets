import { PrismaClient } from "@prisma/client";

import { env } from "~/env";
import { HashidService } from "./services/hashid";

const createPrismaClient = () =>
  new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  }).$extends({
    result: {
      ticket: {
        hashid: {
          needs: { id: true },
          compute(ticket) {
            return new HashidService().encode(ticket.id);
          }
        },
        status: {
          needs: { redemptionCode: true },
          compute(ticket) {
            return ticket.redemptionCode ? "qr_generated" : "payed" as 'qr_generated' | 'payed' | 'revoked';
          }
        },
      },
      attendee: {
        fullName: {
          needs: { firstName: true, lastName: true },
          compute(attendee) {
            if (!attendee.firstName && !attendee.lastName) {
              return null;
            }

            return `${attendee.firstName} ${attendee.lastName}`.trim();
          }
        },
      }
    }
  });

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;
