'use client';

import Link from "next/link";

import { TicketTypes } from "~/app/_components/TicketTypes";
import { type Session } from "next-auth";
import { PaymentMethods } from "./PaymentMethods";

export function Home(props: {
  session: Session | null;
}) {
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
    </div>
  );
}
