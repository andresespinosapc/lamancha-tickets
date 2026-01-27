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
import { ResendTicketEmailButton } from "./ResendTicketEmailButton";

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

  const getFullName = (attendee: typeof tickets[number]['attendee']) => {
    if (attendee.firstName && attendee.lastName) {
      return `${attendee.firstName} ${attendee.lastName}`;
    }
    return 'Pendiente';
  };

  const getStatus = (ticket: typeof tickets[number]) => {
    return ticket.redemptionCode ? 'qr_generated' : 'payed';
  };

  const formatDateTime = (date: Date) => {
    const d = new Date(date);
    const datePart = d.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const timePart = d.toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${datePart} ${timePart}`;
  };

  const totalAmount = tickets.reduce((sum, ticket) => sum + ticket.ticketType.price, 0);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Mis Tickets</h2>
        {tickets.length > 0 && (
          <span className="text-lg font-semibold">
            Total: ${totalAmount.toLocaleString('es-CL')}
          </span>
        )}
      </div>

      {tickets.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No has vendido tickets aún</p>
      ) : (
        <>
          {/* Vista de escritorio */}
          <div className="hidden md:block overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Nombre completo</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>RUT</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell>{formatDateTime(ticket.createdAt)}</TableCell>
                    <TableCell>{getFullName(ticket.attendee)}</TableCell>
                    <TableCell>{ticket.attendee.email}</TableCell>
                    <TableCell>{ticket.attendee.phone ?? '-'}</TableCell>
                    <TableCell>{ticket.attendee.documentId ?? '-'}</TableCell>
                    <TableCell><StatusLabel status={getStatus(ticket)} /></TableCell>
                    <TableCell>{ticket.ticketType.name}</TableCell>
                    <TableCell>${ticket.ticketType.price.toLocaleString('es-CL')}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <ResendTicketEmailButton ticket={ticket} />
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
                      <span className="font-semibold">Fecha:</span>
                      <span>{formatDateTime(ticket.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Nombre:</span>
                      <span>{getFullName(ticket.attendee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Email:</span>
                      <span className="text-sm">{ticket.attendee.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Teléfono:</span>
                      <span>{ticket.attendee.phone ?? '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">RUT:</span>
                      <span>{ticket.attendee.documentId ?? '-'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Estado:</span>
                      <StatusLabel status={getStatus(ticket)} />
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Tipo:</span>
                      <span>{ticket.ticketType.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Precio:</span>
                      <span>${ticket.ticketType.price.toLocaleString('es-CL')}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <ResendTicketEmailButton ticket={ticket} />
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// TODO: RevokeDialog functionality has been temporarily disabled
// Will be re-enabled when ticket revocation feature is implemented

