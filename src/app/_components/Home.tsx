'use client';

import { TicketTypes } from "~/app/_components/TicketTypes";
import { type Session } from "next-auth";
import { PaymentMethods } from "./PaymentMethods";
import NavBar from "./NavBar";

export function Home(props: {
  session: Session | null;
}) {
  return (
    <div>
      <NavBar />
      <div className="pt-12">
        <TicketTypes/>
      </div>
      <div>
        <PaymentMethods />
      </div>
    </div>
  );
}
