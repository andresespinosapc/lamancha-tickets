'use client';

import { TicketTypes } from "~/app/_components/TicketTypes";
import { type Session } from "next-auth";
import { PaymentMethods } from "./PaymentMethods";
import NavBar from "./NavBar";

export function Home(props: {
  session: Session | null;
}) {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      {/* Main content */}
      <main className="relative bg-background py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-6">
          {/* Section intro */}
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4">
              Consigue tu entrada
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Elige tu entrada y contacta a uno de nuestros embajadores para coordinar el pago.
            </p>
          </div>

          {/* Two column layout */}
          <div className="grid md:grid-cols-2 gap-12 md:gap-16">
            <div className="animate-fade-in delay-2">
              <TicketTypes />
            </div>
            <div className="animate-fade-in delay-3">
              <PaymentMethods />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card py-12 border-t border-border">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="font-serif text-2xl text-foreground mb-2">La Mancha</p>
          <p className="text-sm text-muted-foreground">
            Música · Arte · Comunidad
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
