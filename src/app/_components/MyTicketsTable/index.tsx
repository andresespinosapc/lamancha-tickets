'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { cn } from "~/lib/utils";
import { Card, CardContent, CardFooter } from "~/components/ui/card";
import { api } from "~/trpc/react";
import { ResendBlankTicketEmailButton } from "./ResendBlankTicketEmailButton";

export function StatusLabel({ status }: { status: string }) {
  const getColor = (status: string) => {
    switch (status) {
      case 'qr_generated':
        return 'bg-green-100 text-green-800';
      case 'payed':
        return 'bg-yellow-100 text-yellow-800';
      case 'revoked':
        return 'bg-red-100 text-red-800';
      default:
        throw new Error(`Invalid status: ${status}`);
    }
  };

  const getLabel = (status: string) => {
    switch (status) {
      case 'qr_generated':
        return 'QR generado';
      case 'payed':
        return 'Link generado';
      case 'revoked':
        return 'Anulado';
      default:
        throw new Error(`Invalid status: ${status}`);
    }
  };

  return (
    <span className={cn(
      "px-2 py-1 rounded-full text-xs font-semibold shrink-0",
      getColor(status)
    )}>
      {getLabel(status)}
    </span>
  );
}


export default function MyTicketsTable() {
  const [tickets] = api.ticket.list.useSuspenseQuery();

  return (
    <div className="w-full">
      {/* Vista de escritorio */}
      <div className="hidden md:block overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre completo</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>RUT</TableHead>
              <TableHead>status</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell>{ticket.attendee.fullName}</TableCell>
                <TableCell>{ticket.attendee.email}</TableCell>
                <TableCell>{ticket.attendee.phone}</TableCell>
                <TableCell>{ticket.attendee.documentId}</TableCell>
                <TableCell><StatusLabel status={ticket.status} /></TableCell>
                <TableCell>${ticket.ticketType.price.toLocaleString('es-CL')}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <ResendBlankTicketEmailButton ticket={ticket} />
                    {/* <RevokeDialog ticket={ticket} onRevoke={handleAnularTicket} /> */}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Vista de móvil */}
      <div className="md:hidden space-y-4">
        {tickets.map((ticket) => (
          <Card key={ticket.id}>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-semibold">Nombre:</span>
                  <span>{ticket.attendee.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Email:</span>
                  <span>{ticket.attendee.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Teléfono:</span>
                  <span>{ticket.attendee.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">RUT:</span>
                  <span>{ticket.attendee.documentId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">status:</span>
                  <StatusLabel status={ticket.status} />
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Precio:</span>
                  <span>${ticket.ticketType.price.toLocaleString('es-CL')}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <ResendBlankTicketEmailButton ticket={ticket} />
              {/* <RevokeDialog ticket={ticket} onRevoke={handleAnularTicket} /> */}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

// TODO: RevokeDialog functionality has been temporarily disabled
// Will be re-enabled when ticket revocation feature is implemented

