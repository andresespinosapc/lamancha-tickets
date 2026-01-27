"use client";

import { api } from "~/trpc/react";

export type TicketTypeQuantities = Record<number, number>

export function TicketTypes() {
  const [ticketTypes] = api.ticketType.list.useSuspenseQuery();

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
        </div>
        <h3 className="font-serif text-2xl text-foreground">Entradas</h3>
      </div>

      {/* Ticket cards */}
      <div className="space-y-4">
        {ticketTypes.sort((a, b) => a.price - b.price).map((ticket) => (
          <div
            key={ticket.id}
            className="group relative bg-background border border-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-lg text-foreground group-hover:text-primary transition-colors">
                  {ticket.name}
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Entrada general al festival
                </p>
              </div>

              <div className="text-right">
                <p className="text-2xl font-serif font-bold text-primary">
                  ${ticket.price.toLocaleString('es-CL')}
                </p>
                <p className="text-xs text-muted-foreground">CLP</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {ticketTypes.length === 0 && (
        <div className="text-center py-12 bg-background rounded-2xl border border-dashed border-border">
          <p className="text-muted-foreground">No hay entradas disponibles por ahora</p>
        </div>
      )}
    </div>
  );
}
