"use client";

import { api } from "~/trpc/react";

export type TicketTypeQuantities = Record<number, number>

export function TicketTypes() {
  const [ticketTypes] = api.ticketType.list.useSuspenseQuery();

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Entradas disponibles</h1>
      <ul className="space-y-4">
        {ticketTypes.sort((a, b) => a.price - b.price).map((ticket) => (
          <li
            key={ticket.id}
            className="flex items-center justify-between p-4 bg-gray-100 rounded-md"
          >
            <div>
              <h2 className="font-semibold">{ticket.name}</h2>
              <p className="text-sm text-gray-600">${ticket.price}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
