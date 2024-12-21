"use client";

import { ChevronUp, ChevronDown } from "lucide-react";
import { api } from "~/trpc/react";

export type TicketTypeQuantities = Record<number, number>

export function TicketTypes(props: {
  ticketTypeQuantities: TicketTypeQuantities
  setTicketTypeQuantities: (quantities: TicketTypeQuantities) => void
}) {
  const [ticketTypes] = api.ticketType.list.useSuspenseQuery();

  const updateQuantity = (id: number, increment: boolean) => {
    const newTicketTypeQuantities = {
      ...props.ticketTypeQuantities,
      [id]: getQuantity(id) + (increment ? 1 : -1)
    };
    console.log(newTicketTypeQuantities);

    props.setTicketTypeQuantities(newTicketTypeQuantities);
  };

  const getQuantity = (id: number) => {
    return props.ticketTypeQuantities[id] ?? 0;
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Entradas disponibles</h1>
      <ul className="space-y-4">
        {ticketTypes.map((ticket) => (
          <li
            key={ticket.id}
            className="flex items-center justify-between p-4 bg-gray-100 rounded-md"
          >
            <div>
              <h2 className="font-semibold">{ticket.name}</h2>
              <p className="text-sm text-gray-600">${ticket.price}</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => updateQuantity(ticket.id, false)}
                className="p-1 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
                aria-label={`Decrease quantity for ${ticket.name}`}
              >
                <ChevronDown className="w-5 h-5 text-gray-600" />
              </button>
              <span className="w-8 text-center font-semibold">
                {getQuantity(ticket.id)}
              </span>
              <button
                onClick={() => updateQuantity(ticket.id, true)}
                className="p-1 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
                aria-label={`Increase quantity for ${ticket.name}`}
              >
                <ChevronUp className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-6 text-right">
        <p className="font-semibold">
          Total: $
          {ticketTypes.reduce(
            (sum, ticket) => sum + ticket.price * getQuantity(ticket.id),
            0
          )}
        </p>
      </div>
    </div>
  );
}
