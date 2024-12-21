'use client';

import Link from "next/link";

import { type TicketTypeQuantities, TicketTypes } from "~/app/_components/TicketTypes";
import { AttendeeForm, type AttendeeFormValues } from "~/app/_components/AttendeeForm";
import { type Session } from "next-auth";
import { api } from "~/trpc/react";
import { useState } from "react";
import { PaymentMethods } from "./PaymentMethods";

export function Home(props: {
  session: Session | null;
}) {
  const createTickets = api.ticket.generateTickets.useMutation();

  function onSubmit(attendeeFormValues: AttendeeFormValues) {
    createTickets.mutate({
      tickets: Object.entries(ticketTypeQuantities).flatMap(([ticketTypeId, quantity]) => {
        return Array.from({ length: quantity }, () => ({
          ticketTypeId: +ticketTypeId,
          attendee: attendeeFormValues,
        }));
      }),
    });
  }

  return (
    <div>
      <div className="flex justify-end mr-3">
        <p className="text-center text-2xl text-white">
          {props.session && <span>Logged in as {props.session.user?.name}</span>}
        </p>
        <Link
          href={props.session ? "/api/auth/signout" : "/api/auth/signin"}
          className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
        >
          {props.session ? "Sign out" : "Sign in"}
        </Link>
      </div>
      <div className="pt-12">
        <TicketTypes/>
      </div>
      <div>
        <PaymentMethods />
      </div>
      <div className="pt-12" />
      <div className="bg-gray-100 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <AttendeeForm
            onSubmit={onSubmit}
            isSubmitting={createTickets.isPending}
          />
        </div>
      </div>
    </div>
  );
}
