'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { cn } from "~/lib/utils";
import { Card, CardContent, CardFooter } from "~/components/ui/card";
import { api, type RouterOutputs } from "~/trpc/react";
import { useToast } from "~/hooks/use-toast";
import { Ticket } from "@prisma/client";
import { useEffect } from "react";
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

  const getFullName = (attendee: typeof tickets[number]['attendee']) => {
    if (attendee.firstName && attendee.lastName) {
      return `${attendee.firstName} ${attendee.lastName}`;
    }
    return 'Pendiente';
  };

  const getStatus = (ticket: typeof tickets[number]) => {
    return ticket.redemptionCode ? 'qr_generated' : 'payed';
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-4">Mis Tickets</h2>

      {tickets.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No has vendido tickets aún</p>
      ) : (
        <>
          {/* Vista de escritorio */}
          <div className="hidden md:block overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
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
                    <TableCell>{getFullName(ticket.attendee)}</TableCell>
                    <TableCell>{ticket.attendee.email}</TableCell>
                    <TableCell>{ticket.attendee.phone || '-'}</TableCell>
                    <TableCell>{ticket.attendee.documentId || '-'}</TableCell>
                    <TableCell><StatusLabel status={getStatus(ticket)} /></TableCell>
                    <TableCell>{ticket.ticketType.name}</TableCell>
                    <TableCell>${ticket.ticketType.price.toLocaleString('es-CL')}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <ResendBlankTicketEmailButton ticket={ticket} />
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
                      <span>{getFullName(ticket.attendee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Email:</span>
                      <span className="text-sm">{ticket.attendee.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Teléfono:</span>
                      <span>{ticket.attendee.phone || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">RUT:</span>
                      <span>{ticket.attendee.documentId || '-'}</span>
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
                  <ResendBlankTicketEmailButton ticket={ticket} />
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

type RevokeDialogProps = {
  ticket: RouterOutputs['ticket']['list'][number],
  onRevoke: (id: number) => void
}

function RevokeDialog({ ticket, onRevoke }: RevokeDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          disabled={ticket.status === 'revoked'}
        >
          Anular
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Estás seguro?</DialogTitle>
          <DialogDescription>
            Esta acción anulará el ticket de {ticket.attendee.fullName}. No se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => {}}>Cancelar</Button>
          <Button variant="destructive" onClick={() => onRevoke(ticket.id)}>
            Sí, anular ticket
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

