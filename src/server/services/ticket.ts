import { EncryptionService } from "./encryption";
import { env } from "~/env";

export class TicketService {
  generateRedemptionCode(options: {
    ticket: {
      id: number;
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
      attendee: {
        firstName: options.ticket.attendee.firstName,
        lastName: options.ticket.attendee.lastName,
        email: options.ticket.attendee.email,
        documentId: options.ticket.attendee.documentId,
        phone: options.ticket.attendee.phone,
      }
    })

    return new EncryptionService().encrypt(dataToEncrypt, env.REDEMPTION_CODE_PRIVATE_KEY);
  }
}
