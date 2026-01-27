import { zu } from "zod_utilz";
import { EncryptionService } from "./encryption";
import { env } from "~/env";
import { z } from "zod";
import { EmailService } from "./email";

const DecryptedRedemptionCodeSchema = z.object({
  ticketId: z.number(),
  createdAt: z.string().optional(),
  attendee: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    documentId: z.string(),
    phone: z.string().optional(),
  })
});
export type DecryptedRedemptionCode = z.infer<typeof DecryptedRedemptionCodeSchema>;

export class TicketService {
  generateRedemptionCode(options: {
    ticket: {
      id: number;
      createdAt: Date;
      attendee: {
        firstName: string;
        lastName: string;
        email: string;
        documentId: string;
        phone: string | null;
      }
    };
  }) {
    const dataToEncrypt = JSON.stringify({
      ticketId: options.ticket.id,
      createdAt: options.ticket.createdAt.toISOString(),
      attendee: {
        firstName: options.ticket.attendee.firstName,
        lastName: options.ticket.attendee.lastName,
        email: options.ticket.attendee.email,
        documentId: options.ticket.attendee.documentId,
        phone: options.ticket.attendee.phone,
      }
    });

    return new EncryptionService().encrypt(dataToEncrypt, env.REDEMPTION_CODE_PRIVATE_KEY);
  }
  decryptRedemptionCode(redemptionCode: string) {
    const decryptedString = new EncryptionService().decrypt(redemptionCode, env.REDEMPTION_CODE_PRIVATE_KEY);

    return zu.stringToJSON().pipe(DecryptedRedemptionCodeSchema).parse(decryptedString);
  }
  sendBlankTicketEmail(options: {
    ticket: {
      hashid: string;
      attendee: {
        email: string;
      }
    }
  }) {
    const completeTicketUrl = `${env.FRONTEND_BASE_URL}/tickets/${options.ticket.hashid}/complete`;

    return new EmailService().sendMail({
      to: options.ticket.attendee.email,
      subject: 'Completa tus datos',
      text: `Hola, por favor completa tus datos en el siguiente link para generar tu ticket: ${completeTicketUrl}`,
    });
  }
}
